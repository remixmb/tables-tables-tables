import Papa from 'papaparse';
import type { TableData, ParseOptions } from '../types';
import { applyFilterEmptyData } from './utils';

export function parseCsvTable(csvString: string, options: ParseOptions): TableData[] {
    const trimmedInput = csvString.trim();
    if (!trimmedInput) return [];

    // Use PapaParse to handle all CSV edge cases
    // Note: dynamicTyping helps us infer Column Types (number, boolean)
    const { data, errors } = Papa.parse<any[]>(trimmedInput, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: true
    });

    if (errors.length > 0) {
        console.warn("CSV parsing warnings:", errors);
    }

    if (data.length === 0) return [];

    let maxCols = 0;
    data.forEach(row => { if (row.length > maxCols) maxCols = row.length; });

    // Pad rows and cast back to strings for the UI to digest
    let headers: string[] = [];
    let rows: string[][] = data.map(row => {
        const fullRow = [...row];
        while (fullRow.length < maxCols) fullRow.push('');
        return fullRow.map(v => (v === null || v === undefined ? '' : String(v)).trim());
    });

    // Infer column types using the very first data row
    const firstDataRow = options.firstRowAsHeader ? data[1] : data[0];
    const inferredColTypes: ('string' | 'number' | 'boolean')[] = [];
    for (let c = 0; c < maxCols; c++) {
        const val = firstDataRow ? firstDataRow[c] : null;
        if (typeof val === 'number') inferredColTypes.push('number');
        else if (typeof val === 'boolean') inferredColTypes.push('boolean');
        else inferredColTypes.push('string');
    }

    if (options.firstRowAsHeader) {
        headers = rows[0] || [];
        // Extract headers from the data string grid, and keep rows aligned
    } else {
        headers = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`);
        rows = [headers, ...rows];
    }

    // Apply options if requested (e.g. remove Line Breaks within quoted string cells)
    if (options.removeLineBreaks) {
        headers = headers.map(h => h.replace(/\s+/g, ' '));
        rows = rows.map(r => r.map(c => c.replace(/\s+/g, ' ')));
    }

    let table: TableData = {
        id: crypto.randomUUID(),
        index: 1, // Only 1 table mapped per CSV string
        rowCount: rows.length,
        colCount: headers.length,
        headers,
        rows,
        colTypes: inferredColTypes,
        rawHtml: '' // Irrelevant for CSV source
    };

    if (options.filterEmptyData) {
        table = applyFilterEmptyData(table);
    }

    return [table];
}

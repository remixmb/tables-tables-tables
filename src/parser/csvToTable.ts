import Papa from 'papaparse';
import type { TableData, ParseOptions } from '../types';
import { applyFilterEmptyData } from './utils';

export function parseCsvTable(csvString: string, options: ParseOptions): TableData[] {
    const trimmedInput = csvString.trim();
    if (!trimmedInput) return [];

    // Use PapaParse to handle all CSV edge cases (quotes, escaped characters, newlines, etc.)
    const { data, errors } = Papa.parse<string[]>(trimmedInput, {
        header: false,
        skipEmptyLines: true,
    });

    if (errors.length > 0) {
        console.warn("CSV parsing warnings:", errors);
    }

    if (data.length === 0) return [];

    let maxCols = 0;
    data.forEach(row => { if (row.length > maxCols) maxCols = row.length; });

    let headers: string[] = [];
    let rows: string[][] = data.map(row => {
        const fullRow = [...row];
        while (fullRow.length < maxCols) fullRow.push('');
        return fullRow.map(v => (v || '').trim());
    });

    if (options.firstRowAsHeader) {
        headers = rows[0] || [];
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
        rawHtml: '' // Irrelevant for CSV source
    };

    if (options.filterEmptyData) {
        table = applyFilterEmptyData(table);
    }

    return [table];
}

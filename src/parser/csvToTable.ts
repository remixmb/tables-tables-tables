import Papa from 'papaparse';
import type { TableData, ParseOptions } from '../types';

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

    let headers: string[] = [];
    let rows: string[][] = [];

    // For CSV, assume the first row contains headers.
    headers = data[0].map(h => (h || '').trim());

    if (data.length > 1) {
        rows = data.slice(1).map(row => {
            // pad row array if missing columns compared to header
            const fullRow = [...row];
            while (fullRow.length < headers.length) {
                fullRow.push('');
            }
            return fullRow.slice(0, headers.length).map(v => (v || '').trim());
        });
    }

    // Apply options if requested (e.g. remove Line Breaks within quoted string cells)
    if (options.removeLineBreaks) {
        headers = headers.map(h => h.replace(/\s+/g, ' '));
        rows = rows.map(r => r.map(c => c.replace(/\s+/g, ' ')));
    }

    return [{
        id: crypto.randomUUID(),
        index: 1, // Only 1 table mapped per CSV string
        rowCount: rows.length,
        colCount: headers.length,
        headers,
        rows,
        rawHtml: '' // Irrelevant for CSV source
    }];
}

import type { TableData, ParseOptions } from '../types';
import { applyFilterEmptyData } from './utils';

export function parseJsonTable(jsonString: string, options: ParseOptions): TableData[] {
    const trimmedInput = jsonString.trim();
    if (!trimmedInput) return [];

    try {
        const parsed = JSON.parse(trimmedInput);

        // We expect an array of objects for a table representation.
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return []; // Nothing to table-ize
        }

        // Extract headers from the keys of the first object (or all objects to be safe)
        const headerSet = new Set<string>();
        parsed.forEach(rowItem => {
            if (rowItem && typeof rowItem === 'object' && !Array.isArray(rowItem)) {
                Object.keys(rowItem).forEach(key => headerSet.add(key));
            }
        });

        const headers = Array.from(headerSet);

        // Map values according to the discovered header keys
        let rows = parsed.map(rowItem => {
            if (!rowItem || typeof rowItem !== 'object' || Array.isArray(rowItem)) {
                return headers.map(() => '');
            }
            return headers.map(header => {
                const val = rowItem[header];
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') return JSON.stringify(val);
                return String(val);
            });
        });

        // Apply string formatting toggles
        if (options.removeLineBreaks) {
            rows = rows.map(r => r.map(c => c.replace(/\s+/g, ' ')));
        }

        rows = [headers, ...rows];

        let table: TableData = {
            id: crypto.randomUUID(),
            index: 1,
            rowCount: rows.length,
            colCount: headers.length,
            headers,
            rows,
            rawHtml: '' // Irrelevant for JSON parsing
        };

        if (options.filterEmptyData) {
            table = applyFilterEmptyData(table);
        }

        return [table];

    } catch (e) {
        console.warn("Failed to parse JSON string:", e);
        return [];
    }
}

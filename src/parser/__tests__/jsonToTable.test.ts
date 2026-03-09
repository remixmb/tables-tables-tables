import { describe, it, expect } from 'vitest';
import { parseJsonTable } from '../jsonToTable';

const defaultOptions = {
    trimWhitespace: true,
    removeLineBreaks: false,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor' as const,
    firstRowAsHeader: true,
    filterEmptyData: false,
    extractImages: false
};

describe('parseJsonTable', () => {
    it('returns empty array for non-arrays or empty inputs', () => {
        expect(parseJsonTable('', defaultOptions)).toEqual([]);
        expect(parseJsonTable('{"hello": "world"}', defaultOptions)).toEqual([]); // object, not array
        expect(parseJsonTable('[]', defaultOptions)).toEqual([]);
    });

    it('parses a standard JSON array of objects securely', () => {
        const input = `[
            { "id": 1, "name": "Apple", "stock": 50 },
            { "id": 2, "name": "Banana", "stock": 100 }
        ]`;

        const result = parseJsonTable(input, defaultOptions);
        expect(result).toHaveLength(1);

        // Order of headers depends on Set insertion order (first object seen)
        expect(result[0].headers).toEqual(['id', 'name', 'stock']);
        expect(result[0].rows).toHaveLength(3);
        expect(result[0].rows[1]).toEqual(['1', 'Apple', '50']);
        expect(result[0].rows[2]).toEqual(['2', 'Banana', '100']);
    });

    it('handles missing keys in subsequent objects', () => {
        const input = `[
            { "a": "1", "b": "2" },
            { "a": "3", "c": "4" }
        ]`;

        const result = parseJsonTable(input, defaultOptions);
        // Header set should aggregate all unique keys: 'a', 'b', 'c'
        expect(result[0].headers).toEqual(['a', 'b', 'c']);

        // Row 1 missing 'c'
        expect(result[0].rows[1]).toEqual(['1', '2', '']);
        // Row 2 missing 'b'
        expect(result[0].rows[2]).toEqual(['3', '', '4']);
    });

    it('converts nested objects and arrays to strings', () => {
        const input = `[
            { "name": "Item 1", "tags": ["a", "b"], "meta": { "active": true } }
        ]`;
        const result = parseJsonTable(input, defaultOptions);

        expect(result[0].rows[1]).toEqual(['Item 1', '["a","b"]', '{"active":true}']);
    });
});

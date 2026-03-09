import { describe, it, expect } from 'vitest';
import { parseCsvTable } from '../csvToTable';

const defaultOptions = {
    trimWhitespace: true,
    removeLineBreaks: false,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor' as const,
    firstRowAsHeader: true,
    filterEmptyData: false,
    extractImages: false
};

describe('parseCsvTable', () => {
    it('returns empty array for empty string', () => {
        expect(parseCsvTable('', defaultOptions)).toEqual([]);
        expect(parseCsvTable('   \n  ', defaultOptions)).toEqual([]);
    });

    it('parses a basic CSV string', () => {
        const input = `Name,Age,City
Alice,24,New York
Bob,30,Los Angeles`;

        const result = parseCsvTable(input, defaultOptions);

        expect(result).toHaveLength(1);
        expect(result[0].headers).toEqual(['Name', 'Age', 'City']);
        expect(result[0].rows).toHaveLength(3);
        expect(result[0].rows[1]).toEqual(['Alice', '24', 'New York']);
        expect(result[0].rows[2]).toEqual(['Bob', '30', 'Los Angeles']);
    });

    it('handles padding rows missing columns', () => {
        const input = `A,B,C
1,2`; // missing column C's value

        const result = parseCsvTable(input, defaultOptions);
        expect(result[0].rows[1]).toEqual(['1', '2', '']);
    });

    it('handles quoted strings with commas and newlines', () => {
        const input = `Name,"Notes"
Charlie,"Loves, apples
and bananas"`;

        const result = parseCsvTable(input, defaultOptions);
        expect(result[0].rows[1]).toEqual(['Charlie', 'Loves, apples\nand bananas']);

        // Test behavior with removeLineBreaks enabled
        const optClean = { ...defaultOptions, removeLineBreaks: true };
        const resultClean = parseCsvTable(input, optClean);
        expect(resultClean[0].rows[1]).toEqual(['Charlie', 'Loves, apples and bananas']);
    });
});

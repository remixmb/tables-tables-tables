import { describe, it, expect } from 'vitest';
import { parseHtmlTables } from '../htmlToTable';
import type { ParseOptions } from '../../types';

const defaultOptions: ParseOptions = {
    stripHtmlTags: true,
    removeLineBreaks: true,
    trimWhitespace: true,
    linkExtractionMode: 'anchor',
    firstRowAsHeader: true,
    filterEmptyData: false,
    extractImages: false
};

describe('parseHtmlTables', () => {
    it('should parse a simple 2x2 table correctly', () => {
        const html = `
            <table>
                <thead>
                    <tr><th>Name</th><th>Age</th></tr>
                </thead>
                <tbody>
                    <tr><td>Alice</td><td>25</td></tr>
                    <tr><td>Bob</td><td>30</td></tr>
                </tbody>
            </table>
        `;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables.length).toBe(1);
        expect(tables[0].headers).toEqual(['Name', 'Age']);
        expect(tables[0].rows).toEqual([
            ['Name', 'Age'],
            ['Alice', '25'],
            ['Bob', '30'],
        ]);
        expect(tables[0].rowCount).toBe(3); // 1 header + 2 data rows
        expect(tables[0].colCount).toBe(2);
    });

    it('should handle tables with missing tbody', () => {
        const html = `
            <table>
                <tr><td>Item 1</td><td>$10</td></tr>
                <tr><td>Item 2</td><td>$20</td></tr>
            </table>
        `;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables.length).toBe(1);
        expect(tables[0].rows).toEqual([
            ['Item 1', '$10'],
            ['Item 2', '$20'],
        ]);
    });

    it('should parse tables with trailing or empty cells', () => {
        const html = `
            <table>
                <tr><th>Col 1</th><th>Col 2</th><th>Col 3</th></tr>
                <tr><td>Val 1</td><td></td><td></td></tr>
                <tr><td>Val 2</td></tr>
            </table>
        `;

        const tables = parseHtmlTables(html, defaultOptions);

        // It patches up the missing column on row 3 so it remains a uniform grid
        expect(tables[0].rows).toEqual([
            ['Col 1', 'Col 2', 'Col 3'],
            ['Val 1', '', ''],
            ['Val 2', '', '']
        ]);
    });

    it('should handle complex colspan correctly', () => {
        const html = `
            <table>
                <tr>
                    <th colspan="2">Details</th>
                </tr>
                <tr>
                    <td>Title</td>
                    <td>Value</td>
                </tr>
            </table>
        `;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables.length).toBe(1);
        expect(tables[0].rows).toEqual([
            ['Details', ''],
            ['Title', 'Value']
        ]);
    });

    it('should handle complex rowspan and colspan together', () => {
        const html = `
            <table>
                <tr>
                    <td rowspan="2">Group</td>
                    <td>A</td>
                </tr>
                <tr>
                    <td>B</td>
                </tr>
            </table>
        `;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables[0].rows).toEqual([
            ['Group', 'A'],
            ['', 'B'] // The cell below Rowspan becomes empty string to preserve grid
        ]);
    });

    it('should extract URLs correctly according to linkExtractionMode', () => {
        const html = `
            <table>
                <tr>
                    <td><a href="https://example.com">Website</a></td>
                </tr>
            </table>
        `;

        const tablesUrl = parseHtmlTables(html, { ...defaultOptions, linkExtractionMode: 'url' });
        expect(tablesUrl[0].rows[0][0]).toBe('https://example.com');

        const tablesBoth = parseHtmlTables(html, { ...defaultOptions, linkExtractionMode: 'both' });
        expect(tablesBoth[0].rows[0][0]).toBe('Website (https://example.com)');

        const tablesAnchor = parseHtmlTables(html, { ...defaultOptions, linkExtractionMode: 'anchor' });
        expect(tablesAnchor[0].rows[0][0]).toBe('Website');
    });

    it('should respect formatting options for html tags and new lines', () => {
        const html = `
            <table>
                <tr>
                    <td>
                        Line 1<br>
                        Line 2
                    </td>
                    <td><b>Bold</b> text</td>
                </tr>
            </table>
        `;

        const tablesFormatted = parseHtmlTables(html, defaultOptions);
        // Because of removeLineBreaks = true, it should strip line breaks and spaces
        expect(tablesFormatted[0].rows[0][0]).toBe('Line 1 Line 2');
        expect(tablesFormatted[0].rows[0][1]).toBe('Bold text');

        const tablesUnformatted = parseHtmlTables(html, {
            ...defaultOptions,
            stripHtmlTags: false,
            removeLineBreaks: false,
            trimWhitespace: false
        });

        expect(tablesUnformatted[0].rows[0][1]).toBe('<b>Bold</b> text');
    });
});

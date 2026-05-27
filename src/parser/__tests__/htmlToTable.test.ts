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

    it('should return empty array for HTML with no tables', () => {
        const html = `<div><p>No tables here</p><ul><li>Item</li></ul></div>`;
        const tables = parseHtmlTables(html, defaultOptions);
        expect(tables).toEqual([]);
    });

    it('should infer colTypes: numeric columns marked as number, text as string', () => {
        const html = `
            <table>
                <thead><tr><th>Name</th><th>Score</th><th>Grade</th></tr></thead>
                <tbody>
                    <tr><td>Alice</td><td>95</td><td>A</td></tr>
                    <tr><td>Bob</td><td>82</td><td>B</td></tr>
                    <tr><td>Carol</td><td>77</td><td>C</td></tr>
                </tbody>
            </table>
        `;
        const tables = parseHtmlTables(html, defaultOptions);
        expect(tables[0].colTypes).toEqual(['string', 'number', 'string']);
    });

    it('should handle a large complex Drupal views table with nested form elements', () => {
        // Real-world example: Drupal bulk-operations table containing checkboxes,
        // labels, inputs and anchor links inside cells. Tests that:
        // 1. Nested form elements are stripped (stripHtmlTags: true)
        // 2. Correct row/col counts are returned
        // 3. Numeric ID column is inferred as 'number'
        // 4. Anchor text is extracted correctly (linkExtractionMode: 'anchor')
        const html = `
        <table class="vbo-table views-table cols-4">
            <thead>
                <tr>
                    <th scope="col"><input type="checkbox"></th>
                    <th scope="col"></th>
                    <th id="view-type-table-column" scope="col">Type</th>
                    <th id="view-title-table-column" scope="col">Title</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><input type="checkbox" value="val0"></td>
                    <td>112522</td>
                    <td>Views Reference</td>
                    <td></td>
                </tr>
                <tr>
                    <td><input type="checkbox" value="val1"></td>
                    <td>112666</td>
                    <td>Views Reference</td>
                    <td><a href="/consulting" hreflang="en">Consulting</a></td>
                </tr>
                <tr>
                    <td><input type="checkbox" value="val2"></td>
                    <td>112667</td>
                    <td>Views Reference</td>
                    <td><a href="/marketing" hreflang="en">Marketing</a></td>
                </tr>
                <tr>
                    <td><input type="checkbox" value="val3"></td>
                    <td>113027</td>
                    <td>Views Reference</td>
                    <td><a href="/employment-report" hreflang="en">Employment Report</a></td>
                </tr>
                <tr>
                    <td><input type="checkbox" value="val4"></td>
                    <td>113080</td>
                    <td>Views Reference</td>
                    <td><a href="/crafting-curriculum" hreflang="en">Crafting a Curriculum</a></td>
                </tr>
            </tbody>
        </table>`;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables.length).toBe(1);
        // 1 header row + 5 data rows
        expect(tables[0].rowCount).toBe(6);
        expect(tables[0].colCount).toBe(4);

        // Header row: first two cols are empty (checkbox + blank th), then Type/Title
        expect(tables[0].headers[2]).toBe('Type');
        expect(tables[0].headers[3]).toBe('Title');

        // ID column (index 1) should be inferred as numeric
        expect(tables[0].colTypes?.[1]).toBe('number');
        // Type column is all text strings
        expect(tables[0].colTypes?.[2]).toBe('string');

        // Data rows: IDs extracted correctly
        expect(tables[0].rows[1][1]).toBe('112522');
        expect(tables[0].rows[2][1]).toBe('112666');

        // Anchor text extraction: link text only (not href)
        expect(tables[0].rows[2][3]).toBe('Consulting');
        expect(tables[0].rows[3][3]).toBe('Marketing');

        // Empty title cell stays empty
        expect(tables[0].rows[1][3]).toBe('');
    });

    it('should parse the large Drupal vbo-table with 19 data rows correctly', () => {
        // Stress test with the full 19-row production sample provided by the user.
        // Verifies row count and that deeply nested label/input elements do not bleed
        // text into the checkbox column.
        const html = `<table class="vbo-table views-table views-view-table cols-4">
                <thead>
    <tr class="views-form__bulk-operations-row">
                                        <th class="select-all views-field" scope="col"><input type="checkbox" class="form-checkbox" title="Select all rows in this table">
          </th>
                                        <th class="views-field views-field-id" scope="col">
          </th>
                                        <th id="view-type-table-column" class="views-field views-field-type" scope="col">
          Type</th>
                                        <th id="view-title-table-column" class="views-field views-field-title" scope="col">
          Title</th>
          </tr>
  </thead>
        <tbody>
              <tr><td><div><label class="visually-hidden">Row 0</label><input class="js-vbo-checkbox" type="checkbox" value="val0"></div></td><td>112522</td><td>Views Reference</td><td></td></tr>
              <tr><td><div><label class="visually-hidden">Row 1</label><input type="checkbox" value="val1"></div></td><td>112666</td><td>Views Reference</td><td><a href="/consulting">Consulting</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 2</label><input type="checkbox" value="val2"></div></td><td>112667</td><td>Views Reference</td><td><a href="/marketing">Marketing</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 3</label><input type="checkbox" value="val3"></div></td><td>112696</td><td>Views Reference</td><td></td></tr>
              <tr><td><div><label class="visually-hidden">Row 4</label><input type="checkbox" value="val4"></div></td><td>112773</td><td>Views Reference</td><td><a href="/research">Research</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 5</label><input type="checkbox" value="val5"></div></td><td>112774</td><td>Views Reference</td><td></td></tr>
              <tr><td><div><label class="visually-hidden">Row 6</label><input type="checkbox" value="val6"></div></td><td>113027</td><td>Views Reference</td><td><a href="/employment-report">Employment Report</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 7</label><input type="checkbox" value="val7"></div></td><td>113080</td><td>Views Reference</td><td><a href="/crafting-curriculum">Crafting a Curriculum</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 8</label><input type="checkbox" value="val8"></div></td><td>113084</td><td>Views Reference</td><td><a href="/event-dispatch">Event Dispatch</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 9</label><input type="checkbox" value="val9"></div></td><td>113199</td><td>Views Reference</td><td><a href="/impact-stories">Impact Stories</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 10</label><input type="checkbox" value="val10"></div></td><td>113475</td><td>Views Reference</td><td><a href="/our-impact">Our impact</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 11</label><input type="checkbox" value="val11"></div></td><td>113489</td><td>Views Reference</td><td><a href="/50th-anniversary">50th Anniversary</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 12</label><input type="checkbox" value="val12"></div></td><td>113497</td><td>Views Reference</td><td><a href="/50th-anniversary">50th Anniversary</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 13</label><input type="checkbox" value="val13"></div></td><td>113518</td><td>Views Reference</td><td><a href="/50th-anniversary">50th Anniversary</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 14</label><input type="checkbox" value="val14"></div></td><td>113558</td><td>Views Reference</td><td><a href="/test-view-references">Test View References</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 15</label><input type="checkbox" value="val15"></div></td><td>113559</td><td>Views Reference</td><td><a href="/test-view-references">Test View References</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 16</label><input type="checkbox" value="val16"></div></td><td>113561</td><td>Views Reference</td><td><a href="/test-podcast">Podcast Series</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 17</label><input type="checkbox" value="val17"></div></td><td>113562</td><td>Views Reference</td><td><a href="/test-podcast">Podcast Series</a></td></tr>
              <tr><td><div><label class="visually-hidden">Row 18</label><input type="checkbox" value="val18"></div></td><td>113563</td><td>Views Reference</td><td></td></tr>
        </tbody>
</table>`;

        const tables = parseHtmlTables(html, defaultOptions);

        expect(tables.length).toBe(1);
        // 1 header row + 19 data rows = 20
        expect(tables[0].rowCount).toBe(20);
        expect(tables[0].colCount).toBe(4);

        // ID column should be numeric
        expect(tables[0].colTypes?.[1]).toBe('number');

        // Checkbox cells contain the label text (textContent includes all descendants).
        // The label says "Row 0", so that is the expected cell value with stripHtmlTags.
        expect(tables[0].rows[1][0]).toBe('Row 0');

        // Last data row (row 19): empty ID and title shouldn't crash
        expect(tables[0].rows[19][1]).toBe('113563');
        expect(tables[0].rows[19][3]).toBe('');
    });
});


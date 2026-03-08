import { describe, it, expect } from 'vitest';
import { parseMarkdownTable } from '../markdownToTable';

const defaultOptions = {
    trimWhitespace: true,
    removeLineBreaks: false,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor' as const
};

describe('parseMarkdownTable', () => {
    it('returns empty array for non-table strings', () => {
        expect(parseMarkdownTable('', defaultOptions)).toEqual([]);
        expect(parseMarkdownTable('# Hello\nThis is a test', defaultOptions)).toEqual([]);
    });

    it('parses a standard markdown table', () => {
        const input = `
| Header 1 | Header 2 |
| -------- | -------- |
| Value 1  | Value 2  |
| Value 3  | Value 4  |
        `;

        const result = parseMarkdownTable(input, defaultOptions);
        expect(result).toHaveLength(1);
        expect(result[0].headers).toEqual(['Header 1', 'Header 2']);
        // Ensures the separator row '| -------- |' is skipped
        expect(result[0].rows).toHaveLength(2);
        expect(result[0].rows[0]).toEqual(['Value 1', 'Value 2']);
        expect(result[0].rows[1]).toEqual(['Value 3', 'Value 4']);
    });

    it('parses multiple tables in one string', () => {
        const input = `
First table:
| A | B |
|---|---|
| 1 | 2 |

Second table:
| X | Y |
|:---:|:---:|
| 8 | 9 |
        `;
        const result = parseMarkdownTable(input, defaultOptions);
        expect(result).toHaveLength(2);

        expect(result[0].headers).toEqual(['A', 'B']);
        expect(result[0].rows[0]).toEqual(['1', '2']);

        expect(result[1].headers).toEqual(['X', 'Y']);
        expect(result[1].rows[0]).toEqual(['8', '9']);
    });

    it('handles tables without leading/trailing pipes', () => {
        const input = `
Name | Age
--- | ---
Alice | 24
        `;
        const result = parseMarkdownTable(input, defaultOptions);
        expect(result).toHaveLength(1);
        expect(result[0].headers).toEqual(['Name', 'Age']);
        expect(result[0].rows[0]).toEqual(['Alice', '24']);
    });
});

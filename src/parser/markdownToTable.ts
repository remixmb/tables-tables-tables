import type { TableData, ParseOptions } from '../types';

export function parseMarkdownTable(markdownString: string, options: ParseOptions): TableData[] {
    const lines = markdownString.trim().split('\n');
    let tables: TableData[] = [];

    let currentTableRows: string[][] = [];
    let isParsingTable = false;

    // Helper to extract values from a markdown row
    const parseRow = (line: string): string[] => {
        // Remove leading and trailing pipes
        let cleaned = line.trim();
        if (cleaned.startsWith('|')) cleaned = cleaned.substring(1);
        if (cleaned.endsWith('|')) cleaned = cleaned.substring(0, cleaned.length - 1);

        // Split by pipe (ignoring escaped pipes could be a future enhancement)
        return cleaned.split('|').map(cell => cell.trim());
    };

    // Helper to check if a line is a markdown separator (e.g. |---|---|)
    const isSeparatorLine = (line: string): boolean => {
        const cleaned = line.trim();
        if (!cleaned.includes('|') && !cleaned.includes('-')) return false;

        // Remove pipes and spaces, if only dashes and colons remain, it's a separator
        const stripped = cleaned.replace(/[\|\s:]/g, '');
        return stripped.length > 0 && stripped.split('').every(char => char === '-');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Start or continue of a table line
        if (line.includes('|')) {
            isParsingTable = true;

            if (isSeparatorLine(line)) {
                // Skip separator rows in our data output
                continue;
            }

            const rowData = parseRow(line);
            currentTableRows.push(rowData);
        } else {
            // End of a table block
            if (isParsingTable && currentTableRows.length > 0) {
                const headers = currentTableRows[0] || [];
                const rows = currentTableRows.length > 1 ? currentTableRows.slice(1) : [];

                tables.push({
                    id: crypto.randomUUID(),
                    index: tables.length + 1,
                    rowCount: rows.length,
                    colCount: headers.length,
                    headers,
                    rows,
                    rawHtml: '' // Irrelevant for Markdown
                });

                // Reset for the next table
                currentTableRows = [];
                isParsingTable = false;
            }
        }
    }

    // Handle case where table ends at the EOF without an empty line
    if (isParsingTable && currentTableRows.length > 0) {
        const headers = currentTableRows[0] || [];
        const rows = currentTableRows.length > 1 ? currentTableRows.slice(1) : [];

        tables.push({
            id: crypto.randomUUID(),
            index: tables.length + 1,
            rowCount: rows.length,
            colCount: headers.length,
            headers,
            rows,
            rawHtml: ''
        });
    }

    // Post processes
    if (options.removeLineBreaks) {
        tables = tables.map(table => ({
            ...table,
            headers: table.headers.map(h => h.replace(/\s+/g, ' ')),
            rows: table.rows.map(r => r.map(c => c.replace(/\s+/g, ' ')))
        }));
    }

    return tables;
}

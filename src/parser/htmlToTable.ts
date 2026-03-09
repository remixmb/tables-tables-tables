import type { ParseOptions, TableData } from '../types';
import { applyFilterEmptyData } from './utils';

function processImages(element: HTMLElement, extractImages: boolean) {
    if (!extractImages) return;

    const images = element.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        let replacement = '';
        if (alt && src) {
            replacement = `[Image: ${alt}](${src})`;
        } else if (src) {
            replacement = `[Image](${src})`;
        } else if (alt) {
            replacement = `[Image: ${alt}]`;
        }

        if (replacement) {
            const textNode = document.createTextNode(replacement);
            img.replaceWith(textNode);
        }
    });
}

function processLinks(element: HTMLElement, mode: 'anchor' | 'url' | 'both') {
    if (mode === 'anchor') return;

    const links = element.querySelectorAll('a');
    links.forEach(a => {
        const href = a.getAttribute('href') || '';
        const text = a.textContent || '';

        let replacement = '';
        if (mode === 'url') {
            replacement = href;
        } else if (mode === 'both') {
            replacement = text && href ? `${text} (${href})` : (text || href);
        }

        const textNode = document.createTextNode(replacement);
        a.replaceWith(textNode);
    });
}

function extractCellContent(cell: HTMLTableCellElement | HTMLTableHeaderCellElement, options: ParseOptions): string {
    const clone = cell.cloneNode(true) as HTMLElement;

    processLinks(clone, options.linkExtractionMode);
    processImages(clone, options.extractImages);

    let content = options.stripHtmlTags ? (clone.textContent || '') : clone.innerHTML;

    if (options.removeLineBreaks) {
        content = content.replace(/\s+/g, ' ');
    }

    if (options.trimWhitespace) {
        content = content.trim();
    }

    return content;
}

export function parseTable(table: HTMLTableElement, index: number, options: ParseOptions): TableData {
    const rows = Array.from(table.rows);
    const grid: string[][] = [];

    for (let r = 0; r < rows.length; r++) {
        const tr = rows[r];
        const cells = Array.from(tr.cells);

        if (!grid[r]) grid[r] = [];

        let currentHtmlCol = 0;
        for (let c = 0; c < cells.length; c++) {
            const cell = cells[c];
            const content = extractCellContent(cell, options);

            const rowSpan = cell.rowSpan || 1;
            const colSpan = cell.colSpan || 1;

            while (grid[r][currentHtmlCol] !== undefined) {
                currentHtmlCol++;
            }

            for (let rs = 0; rs < rowSpan; rs++) {
                for (let cs = 0; cs < colSpan; cs++) {
                    const rowIdx = r + rs;
                    const colIdx = currentHtmlCol + cs;

                    if (!grid[rowIdx]) grid[rowIdx] = [];

                    if (rs === 0 && cs === 0) {
                        grid[rowIdx][colIdx] = content;
                    } else {
                        grid[rowIdx][colIdx] = '';
                    }
                }
            }
            currentHtmlCol += colSpan;
        }
    }

    const colCount = grid.reduce((max, row) => Math.max(max, row.length), 0);

    grid.forEach(row => {
        while (row.length < colCount) {
            row.push('');
        }
    });

    let headers: string[] = [];
    let finalRows = grid;

    if (options.firstRowAsHeader && grid.length > 0) {
        headers = grid[0];
    } else {
        headers = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
        finalRows = [headers, ...grid];
    }

    let tableData: TableData = {
        id: `table-${index}`,
        index,
        rowCount: finalRows.length,
        colCount,
        headers,
        rows: finalRows,
        rawHtml: table.outerHTML
    };

    if (options.filterEmptyData) {
        tableData = applyFilterEmptyData(tableData);
    }

    return tableData;
}

export function parseHtmlTables(htmlString: string, options: ParseOptions): TableData[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const tableElements = Array.from(doc.querySelectorAll('table'));

    return tableElements.map((table, index) => parseTable(table, index + 1, options));
}

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { TableData } from '../types';

export function exportToCsv(table: TableData): string {
    // We include headers as the first row if present
    // But our parser parses headers as the first row anyway in TableData.rows
    return Papa.unparse(table.rows);
}

export function exportToTsv(table: TableData): string {
    return Papa.unparse(table.rows, { delimiter: '\t' });
}

export function exportToJson(table: TableData): string {
    if (table.rows.length <= 1) {
        return JSON.stringify(table.rows, null, 2);
    }

    const headers = table.rows[0];
    const data = table.rows.slice(1).map(row => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            // Use original header or generated key if header is empty
            const key = header || `Column ${index + 1}`;
            obj[key] = row[index] || '';
        });
        return obj;
    });

    return JSON.stringify(data, null, 2);
}

export function exportToMarkdown(table: TableData): string {
    if (table.rows.length === 0) return '';

    let md = '';
    const headers = table.rows[0];

    // Header row
    md += '| ' + headers.map(h => escapeMarkdown(h)).join(' | ') + ' |\n';

    // Separator row
    md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    // Data rows
    for (let i = 1; i < table.rows.length; i++) {
        md += '| ' + table.rows[i].map(c => escapeMarkdown(c)).join(' | ') + ' |\n';
    }

    return md;
}

function escapeMarkdown(text: string): string {
    // Replace pipes with escaped pipes to not break markdown tables
    return text.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

export function exportToSql(table: TableData, tableName: string = 'imported_table'): string {
    if (table.rows.length <= 1) return '';

    const headers = table.rows[0].map(h => `\`${h.replace(/`/g, '``')}\``);
    const columns = headers.join(', ');

    const rows = table.rows.slice(1).map(row => {
        const values = row.map(val => {
            const num = Number(val);
            if (!isNaN(num) && val.trim() !== '') return val;
            return `'${val.replace(/'/g, "''")}'`;
        });
        return `(${values.join(', ')})`;
    });

    return `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${rows.join(',\n')};`;
}

export function exportToXlsx(table: TableData): Blob {
    const worksheet = XLSX.utils.aoa_to_sheet(table.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const xlsxData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([xlsxData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

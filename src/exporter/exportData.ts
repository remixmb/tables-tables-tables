import Papa from 'papaparse';
import ExcelJS from 'exceljs';
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
        const values = row.map((val, index) => {
            if (val === null || val === undefined) return 'NULL';
            const colType = table.colTypes?.[index] || 'string';

            if (colType === 'number') {
                const num = Number(val);
                return isNaN(num) || val.trim() === '' ? 'NULL' : val;
            } else if (colType === 'boolean') {
                const lower = String(val).toLowerCase().trim();
                if (lower === 'true' || lower === '1') return 'TRUE';
                if (lower === 'false' || lower === '0') return 'FALSE';
                return 'NULL';
            } else {
                return `'${String(val).replace(/'/g, "''")}'`;
            }
        });
        return `(${values.join(', ')})`;
    });

    return `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${rows.join(',\n')};`;
}

export async function exportToXlsx(table: TableData): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRows(table.rows);
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

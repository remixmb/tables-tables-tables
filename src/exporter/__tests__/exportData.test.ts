import { describe, expect, it } from 'vitest';
import type { TableData } from '../../types';
import { exportToJson, exportToMarkdown, exportToSql, exportToXlsx } from '../exportData';

const table: TableData = {
    id: 'test-table',
    index: 0,
    rowCount: 3,
    colCount: 2,
    headers: ['Name', 'Score'],
    rows: [
        ['Name', 'Score'],
        ['Ada | Lovelace', '98'],
        ["Grace O'Hopper", '100']
    ],
    colTypes: ['string', 'number'],
    rawHtml: ''
};

describe('exportData', () => {
    it('serializes rows as JSON objects', () => {
        expect(JSON.parse(exportToJson(table))).toEqual([
            { Name: 'Ada | Lovelace', Score: '98' },
            { Name: "Grace O'Hopper", Score: '100' }
        ]);
    });

    it('escapes Markdown pipes and SQL quotes', () => {
        expect(exportToMarkdown(table)).toContain('Ada \\| Lovelace');
        expect(exportToSql(table)).toContain("Grace O''Hopper");
    });

    it('creates a non-empty XLSX blob', async () => {
        const workbook = await exportToXlsx(table);
        expect(workbook.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(workbook.size).toBeGreaterThan(0);
    });
});

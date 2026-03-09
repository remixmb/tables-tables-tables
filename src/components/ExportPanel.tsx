import { useState } from 'react';
import { Download, Copy, FileJson, FileSpreadsheet, FileText, Check, Database, Table } from 'lucide-react';
import type { TableData } from '../types';
import { exportToCsv, exportToJson, exportToMarkdown, exportToTsv, exportToSql, exportToXlsx } from '../exporter/exportData';

interface ExportPanelProps {
    table: TableData | null;
}

export function ExportPanel({ table }: ExportPanelProps) {
    const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

    const handleCopy = async (format: 'csv' | 'json' | 'tsv' | 'markdown' | 'sql') => {
        if (!table) return;

        let text = '';
        switch (format) {
            case 'csv': text = exportToCsv(table); break;
            case 'tsv': text = exportToTsv(table); break;
            case 'json': text = exportToJson(table); break;
            case 'markdown': text = exportToMarkdown(table); break;
            case 'sql': text = exportToSql(table); break;
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedFormat(format);
            setTimeout(() => setCopiedFormat(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleDownload = async (format: 'csv' | 'json' | 'tsv' | 'markdown' | 'sql' | 'xlsx') => {
        if (!table) return;

        let content: string | Blob = '';
        let type = '';
        let ext = '';

        switch (format) {
            case 'csv':
                content = exportToCsv(table);
                type = 'text/csv;charset=utf-8;';
                ext = 'csv';
                break;
            case 'tsv':
                content = exportToTsv(table);
                type = 'text/tab-separated-values;charset=utf-8;';
                ext = 'tsv';
                break;
            case 'json':
                content = exportToJson(table);
                type = 'application/json;charset=utf-8;';
                ext = 'json';
                break;
            case 'markdown':
                content = exportToMarkdown(table);
                type = 'text/markdown;charset=utf-8;';
                ext = 'md';
                break;
            case 'sql':
                content = exportToSql(table);
                type = 'application/sql;charset=utf-8;';
                ext = 'sql';
                break;
            case 'xlsx':
                content = await exportToXlsx(table);
                ext = 'xlsx';
                break;
        }

        const blob = content instanceof Blob ? content : new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `table-${table.index}.${ext}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden p-4 space-y-4 transition-colors duration-200">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Export Data
            </h2>

            {!table ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 pb-2">Select a table to see export options.</p>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Spreadsheet</h3>
                        <div className="flex flex-col gap-2">
                            <ExportGroup
                                title="CSV"
                                icon={<FileSpreadsheet size={14} />}
                                onCopy={() => handleCopy('csv')}
                                onDownload={() => handleDownload('csv')}
                                copied={copiedFormat === 'csv'}
                            />
                            <ExportGroup
                                title="Excel (XLSX)"
                                icon={<Table size={14} />}
                                onDownload={() => handleDownload('xlsx')}
                            />
                            <ExportGroup
                                title="TSV"
                                icon={<FileSpreadsheet size={14} />}
                                onCopy={() => handleCopy('tsv')}
                                onDownload={() => handleDownload('tsv')}
                                copied={copiedFormat === 'tsv'}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Other Formats</h3>
                        <div className="flex flex-col gap-2">
                            <ExportGroup
                                title="JSON"
                                icon={<FileJson size={14} />}
                                onCopy={() => handleCopy('json')}
                                onDownload={() => handleDownload('json')}
                                copied={copiedFormat === 'json'}
                            />
                            <ExportGroup
                                title="Markdown"
                                icon={<FileText size={14} />}
                                onCopy={() => handleCopy('markdown')}
                                onDownload={() => handleDownload('markdown')}
                                copied={copiedFormat === 'markdown'}
                            />
                            <ExportGroup
                                title="SQL Insert"
                                icon={<Database size={14} />}
                                onCopy={() => handleCopy('sql')}
                                onDownload={() => handleDownload('sql')}
                                copied={copiedFormat === 'sql'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExportGroup({
    title,
    icon,
    onCopy,
    onDownload,
    copied = false
}: {
    title: string;
    icon: React.ReactNode;
    onCopy?: () => void;
    onDownload: () => void;
    copied?: boolean;
}) {
    return (
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 group hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all duration-200">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{icon}</span>
                {title}
            </div>
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {onCopy && (
                    <button
                        onClick={onCopy}
                        className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={14} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={14} />}
                    </button>
                )}
                <button
                    onClick={onDownload}
                    className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all"
                    title="Download file"
                >
                    <Download size={14} />
                </button>
            </div>
        </div>
    );
}

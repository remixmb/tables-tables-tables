import { TableProperties } from 'lucide-react';
import type { TableData } from '../types';

interface TablePreviewProps {
    table: TableData | null;
}

export function TablePreview({ table }: TablePreviewProps) {
    if (!table) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-200">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 transition-colors duration-200">
                    <TableProperties className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Data Preview</h2>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-200">
                    <TableProperties className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a table from the list to preview its data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-0 min-w-0 transition-colors duration-200">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center gap-2">
                    <TableProperties className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Data Preview: Table {table.index}</h2>
                </div>
            </div>
            <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-white dark:bg-slate-900 p-0 relative rounded-b-xl custom-scrollbar">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="sticky top-0 z-10 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-900">
                            <tr>
                                {table.headers.map((header, idx) => (
                                    <th
                                        key={idx}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 last:border-r-0 whitespace-nowrap bg-indigo-50/95 dark:bg-slate-800/95 backdrop-blur-sm"
                                    >
                                        {header || `Column ${idx + 1}`}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                            {table.rows.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    {table.headers.map((_, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 last:border-r-0 max-w-xs truncate"
                                            title={row[colIndex] || ''}
                                        >
                                            {row[colIndex] || <span className="text-slate-300 dark:text-slate-600 italic">empty</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.rows.length <= 1 && (
                                <tr>
                                    <td colSpan={table.colCount} className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400 italic">
                                        No data rows found in this table.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

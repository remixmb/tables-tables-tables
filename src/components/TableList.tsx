import { LayoutGrid, Table2, GitMerge } from 'lucide-react';
import type { TableData } from '../types';

interface TableListProps {
    tables: TableData[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onOpenMerge: () => void;
}

export function TableList({ tables, selectedId, onSelect, onOpenMerge }: TableListProps) {
    if (tables.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-200">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 transition-colors duration-200">
                    <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Detected Tables</h2>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-3 ring-1 ring-slate-100 dark:ring-slate-700/50">
                        <LayoutGrid className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">No tables detected yet.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Paste HTML with &lt;table&gt; tags to see them here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-full transition-colors duration-200">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Detected Tables</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenMerge}
                        disabled={tables.length < 2}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Merge Tables (Join)"
                    >
                        <GitMerge className="w-3.5 h-3.5" />
                        Merge
                    </button>
                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {tables.length}
                    </span>
                </div>
            </div>
            <div className="p-2 overflow-y-auto space-y-2 focus:outline-none custom-scrollbar">
                {tables.map((table) => (
                    <button
                        key={table.id}
                        onClick={() => onSelect(table.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all border outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedId === table.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md transition-colors ${selectedId === table.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-800/80'
                                }`}>
                                <Table2 className={`w-4 h-4 ${selectedId === table.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                                    }`} />
                            </div>
                            <div>
                                <h3 className={`font-medium text-sm transition-colors ${selectedId === table.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    Table {table.index}
                                </h3>
                                <p className={`text-xs mt-0.5 transition-colors ${selectedId === table.id ? 'text-indigo-600/80 dark:text-indigo-300/80' : 'text-slate-500 dark:text-slate-400'
                                    }`}>
                                    {table.rowCount} rows × {table.colCount} cols
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

import { useState, useMemo, useRef } from 'react';
import { TableProperties, ArrowRightLeft, Search, Replace, X, BarChart3, ArrowDownAZ, ArrowUpZA, Filter } from 'lucide-react';
import { DataVisualization } from './DataVisualization';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { TableData } from '../types';

interface TablePreviewProps {
    table: TableData | null;
    onTableChange?: (t: TableData) => void;
}

export function TablePreview({ table, onTableChange }: TablePreviewProps) {
    const [showFindReplace, setShowFindReplace] = useState(false);
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [useRegex, setUseRegex] = useState(false);
    const [activeTab, setActiveTab] = useState<'data' | 'chart'>('data');

    // For Virtualization
    const parentRef = useRef<HTMLDivElement>(null);

    const [sortColumn, setSortColumn] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [gridFilter, setGridFilter] = useState('');
    const [showGridFilter, setShowGridFilter] = useState(false);

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

    const handleHeaderEdit = (colIndex: number, newText: string) => {
        if (!onTableChange) return;
        const newHeaders = [...table.headers];
        newHeaders[colIndex] = newText;
        onTableChange({ ...table, headers: newHeaders });
    };

    const handleCellEdit = (rowIndex: number, colIndex: number, newText: string) => {
        if (!onTableChange) return;
        const newRows = [...table.rows];
        // rowIndex + 1 because table.rows[0] is headers
        newRows[rowIndex + 1] = [...newRows[rowIndex + 1]];
        newRows[rowIndex + 1][colIndex] = newText;
        onTableChange({ ...table, rows: newRows });
    };

    const handleTranspose = () => {
        if (!onTableChange) return;

        const newRows: string[][] = [];
        const newColCount = table.rowCount;
        const newRowCount = table.colCount;

        for (let c = 0; c < table.colCount; c++) {
            const newRow: string[] = [];
            for (let r = 0; r < table.rows.length; r++) {
                newRow.push(table.rows[r][c] || '');
            }
            newRows.push(newRow);
        }

        onTableChange({
            ...table,
            headers: newRows[0] || [],
            rows: newRows,
            colCount: newColCount,
            rowCount: newRowCount
        });
    };

    const handleFindReplace = () => {
        if (!onTableChange || !findText) return;
        try {
            const regex = useRegex
                ? new RegExp(findText, 'g')
                : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

            // Apply to data rows only (not headers)
            const newRows = [...table.rows];
            for (let r = 1; r < newRows.length; r++) {
                newRows[r] = newRows[r].map(cell => typeof cell === 'string' ? cell.replace(regex, replaceText) : cell);
            }

            onTableChange({
                ...table,
                rows: newRows
            });
        } catch (e) {
            console.error("Invalid regex", e);
        }
    };

    const handleSort = (colIndex: number) => {
        if (sortColumn === colIndex) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else setSortColumn(null); // Reset sort on 3rd click
        } else {
            setSortColumn(colIndex);
            setSortDirection('asc');
        }
    };

    // Derived rows based on Sort and Filter (View layer only, doesn't mutate actual TableData)
    const displayedRows = useMemo(() => {
        let result = table.rows.slice(1);

        // Apply Global Filter First
        if (gridFilter.trim()) {
            const lowerFilter = gridFilter.toLowerCase();
            result = result.filter(row =>
                row.some(cell => String(cell || '').toLowerCase().includes(lowerFilter))
            );
        }

        // Apply Sort
        if (sortColumn !== null) {
            const colType = table.colTypes?.[sortColumn] || 'string';
            result = [...result].sort((a, b) => {
                const valA = a[sortColumn];
                const valB = b[sortColumn];

                // Handle empty cases
                if (!valA && valB) return sortDirection === 'asc' ? 1 : -1;
                if (valA && !valB) return sortDirection === 'asc' ? -1 : 1;
                if (!valA && !valB) return 0;

                let comparison = 0;
                if (colType === 'number') {
                    const numA = Number(valA);
                    const numB = Number(valB);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        comparison = numA - numB;
                    } else {
                        comparison = String(valA).localeCompare(String(valB));
                    }
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }

                return sortDirection === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [table, sortColumn, sortDirection, gridFilter]);

    // Setup Row Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: displayedRows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 53, // Estimated height of a standard row (px)
        overscan: 10, // Render 10 rows outside the viewport to prevent flickering when scrolling fast
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-0 min-w-0 transition-colors duration-200">
            <div className="px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between transition-colors duration-200">
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <TableProperties className="w-4 h-4" /> Data Grid
                    </button>
                    <button
                        onClick={() => setActiveTab('chart')}
                        className={`flex items-center gap-2 px-1 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'chart' ? 'border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <BarChart3 className="w-4 h-4" /> Visualization
                    </button>
                </div>
                {onTableChange && activeTab === 'data' && (
                    <div className="flex items-center gap-2 py-2">
                        <button
                            onClick={() => {
                                setShowGridFilter(!showGridFilter);
                                if (showGridFilter) setGridFilter('');
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${showGridFilter ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            title="Filter Rows"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter
                        </button>
                        <button
                            onClick={() => setShowFindReplace(!showFindReplace)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${showFindReplace ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30' : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            title="Find & Replace"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Replace
                        </button>
                        <button
                            onClick={handleTranspose}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            title="Transpose Rows and Columns"
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            Transpose
                        </button>
                    </div>
                )}
            </div>

            {activeTab === 'data' ? (
                <>
                    {showGridFilter && (
                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <Filter className="w-4 h-4 text-slate-400" /> Filter Rows:
                            </span>
                            <input
                                type="text"
                                placeholder="Type to instantly filter rows..."
                                value={gridFilter}
                                onChange={(e) => setGridFilter(e.target.value)}
                                className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 outline-none w-64 transition-all"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                Showing {displayedRows.length} of {table.rowCount - 1} rows
                            </span>
                            <button
                                onClick={() => {
                                    setShowGridFilter(false);
                                    setGridFilter('');
                                }}
                                className="ml-auto p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {showFindReplace && (
                        <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Find..."
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                className="px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 outline-none w-48 transition-all"
                            />
                            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Replace with..."
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                className="px-2.5 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 outline-none w-48 transition-all"
                            />
                            <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useRegex}
                                    onChange={(e) => setUseRegex(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Use Regex
                            </label>
                            <button
                                onClick={handleFindReplace}
                                disabled={!findText}
                                className="ml-auto px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                            >
                                <Replace className="w-3.5 h-3.5" />
                                Replace All
                            </button>
                            <button onClick={() => setShowFindReplace(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div
                        ref={parentRef}
                        className="flex-1 min-h-[400px] overflow-auto bg-white dark:bg-slate-900 p-0 relative rounded-b-xl custom-scrollbar"
                    >
                        <div className="inline-block min-w-full align-top">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border-collapse">
                                <thead className="sticky top-0 z-10 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-50 dark:bg-slate-900">
                                    <tr>
                                        {table.headers.map((header, idx) => (
                                            <th
                                                key={idx}
                                                scope="col"
                                                className="group px-0 py-0 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 last:border-r-0 whitespace-nowrap bg-indigo-50/95 dark:bg-slate-800/95 backdrop-blur-sm focus-within:bg-indigo-100 dark:focus-within:bg-slate-700 transition-colors relative"
                                            >
                                                <div className="flex items-center w-full h-full min-h-[44px]">
                                                    <div
                                                        className="px-6 py-3 flex-1 focus:outline-none"
                                                        contentEditable={!!onTableChange}
                                                        suppressContentEditableWarning
                                                        onBlur={(e) => handleHeaderEdit(idx, e.currentTarget.textContent || '')}
                                                    >
                                                        {header || `Column ${idx + 1}`}
                                                    </div>
                                                    <button
                                                        onClick={() => handleSort(idx)}
                                                        className={`px-2 h-full absolute right-0 flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-slate-600 transition-colors ${sortColumn === idx ? 'text-indigo-600 dark:text-indigo-400 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}
                                                        title="Sort Column"
                                                    >
                                                        {sortColumn === idx ? (
                                                            sortDirection === 'asc' ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowUpZA className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ArrowDownAZ className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody
                                    className="bg-white dark:bg-slate-900 block"
                                    style={{
                                        position: 'relative',
                                        height: `${rowVirtualizer.getTotalSize()}px`,
                                        width: '100%',
                                    }}
                                >
                                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                        const row = displayedRows[virtualRow.index];
                                        // We need to map the visual row index back to the absolute table row index for editing.
                                        const absoluteIndex = table.rows.findIndex(r => r === row);
                                        const dataRowIndex = absoluteIndex - 1;

                                        return (
                                            <tr
                                                key={virtualRow.index}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors absolute w-full flex"
                                                style={{
                                                    top: 0,
                                                    left: 0,
                                                    transform: `translateY(${virtualRow.start}px)`,
                                                }}
                                            >
                                                {table.headers.map((_, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 border-b border-r border-slate-200 dark:border-slate-800 last:border-r-0 max-w-xs truncate focus:outline-none focus:bg-indigo-50/50 dark:focus:bg-slate-700/50 transition-colors flex-1"
                                                        title={row[colIndex] || ''}
                                                        contentEditable={!!onTableChange}
                                                        suppressContentEditableWarning
                                                        onBlur={(e) => handleCellEdit(dataRowIndex, colIndex, e.currentTarget.textContent || '')}
                                                    >
                                                        {row[colIndex] || <span className="text-slate-300 dark:text-slate-600 italic">empty</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        )
                                    })}
                                    {displayedRows.length === 0 && (
                                        <tr className="flex w-full absolute items-center justify-center p-8">
                                            <td colSpan={table.colCount} className="text-center text-sm text-slate-500 dark:text-slate-400 italic">
                                                No data rows found in this table.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 min-h-0 min-w-0 overflow-auto bg-white dark:bg-slate-900 rounded-b-xl relative custom-scrollbar">
                    <DataVisualization table={table} />
                </div>
            )}
        </div>
    );
}

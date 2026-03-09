import React, { useState, useMemo } from 'react';
import { X, GitMerge, FilePlus2 } from 'lucide-react';
import type { TableData } from '../types';

interface MergeDialogProps {
    tables: TableData[];
    isOpen: boolean;
    onClose: () => void;
    onMerge: (newTable: TableData) => void;
}

export function MergeDialog({ tables, isOpen, onClose, onMerge }: MergeDialogProps) {
    const [tableAId, setTableAId] = useState<string>('');
    const [tableBId, setTableBId] = useState<string>('');
    const [joinKeyA, setJoinKeyA] = useState<string>('');
    const [joinKeyB, setJoinKeyB] = useState<string>('');
    const [joinType, setJoinType] = useState<'inner' | 'left'>('inner');

    const tableA = useMemo(() => tables.find(t => t.id === tableAId), [tables, tableAId]);
    const tableB = useMemo(() => tables.find(t => t.id === tableBId), [tables, tableBId]);

    // Attempt to auto-select matching column names if table A or B changes
    React.useEffect(() => {
        if (tableA && tableB && !joinKeyA && !joinKeyB) {
            const commonHeader = tableA.headers.find(h => tableB.headers.includes(h));
            if (commonHeader) {
                setJoinKeyA(commonHeader);
                setJoinKeyB(commonHeader);
            }
        }
    }, [tableA, tableB, joinKeyA, joinKeyB]);

    if (!isOpen) return null;

    const handleMerge = () => {
        if (!tableA || !tableB || !joinKeyA || !joinKeyB) return;

        const colIndexA = tableA.headers.indexOf(joinKeyA);
        const colIndexB = tableB.headers.indexOf(joinKeyB);

        if (colIndexA === -1 || colIndexB === -1) return;

        const newHeaders = [...tableA.headers];
        const newColTypes = [...(tableA.colTypes || [])];

        // Add B's headers (excluding the join key)
        const bHeadersToAdd: number[] = [];
        tableB.headers.forEach((h, idx) => {
            if (idx !== colIndexB) {
                // Ensure unique header names
                let finalHeader = h;
                let counter = 1;
                while (newHeaders.includes(finalHeader)) {
                    finalHeader = `${h}_${counter++}`;
                }
                newHeaders.push(finalHeader);
                newColTypes.push(tableB.colTypes?.[idx] || 'string');
                bHeadersToAdd.push(idx);
            }
        });

        const newRows: string[][] = [];

        tableA.rows.forEach((rowA) => {
            const keyVal = rowA[colIndexA];
            const matchingRowsB = tableB.rows.filter(r => r[colIndexB] === keyVal);

            if (matchingRowsB.length > 0) {
                // Inner and Left join both include matches
                matchingRowsB.forEach(rowB => {
                    const combinedRow = [...rowA];
                    bHeadersToAdd.forEach(idx => combinedRow.push(rowB[idx]));
                    newRows.push(combinedRow);
                });
            } else if (joinType === 'left') {
                // Left join includes rows from A even if no match in B (pad with empty strings)
                const combinedRow = [...rowA];
                bHeadersToAdd.forEach(() => combinedRow.push(''));
                newRows.push(combinedRow);
            }
        });

        const mergedTable: TableData = {
            id: `merged_${Date.now()}`,
            index: tables.length, // this is arbitrary since it'll just be appended
            rowCount: newRows.length,
            colCount: newHeaders.length,
            headers: newHeaders,
            colTypes: newColTypes,
            rows: newRows,
            rawHtml: '' // Not generated from HTML
        };

        onMerge(mergedTable);
        onClose();

        // Reset state
        setTableAId('');
        setTableBId('');
        setJoinKeyA('');
        setJoinKeyB('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                        <GitMerge className="w-5 h-5" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Merge Tables (SQL Join)</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    {tables.length < 2 ? (
                        <div className="text-center py-8">
                            <FilePlus2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Not enough tables</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You need at least 2 tables to perform a merge operation. Paste or load more data.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                                {/* Table A */}
                                <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Table A (Left Table)</label>
                                        <select
                                            value={tableAId}
                                            onChange={(e) => setTableAId(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                                        >
                                            <option value="">Select Table...</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id} disabled={t.id === tableBId}>
                                                    Table {t.index + 1} ({t.rowCount} rows)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {tableA && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Join Column</label>
                                            <select
                                                value={joinKeyA}
                                                onChange={(e) => setJoinKeyA(e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                                            >
                                                <option value="">Select Key...</option>
                                                {tableA.headers.map((h, i) => (
                                                    <option key={`${i}-${h}`} value={h}>{h || `Col ${i + 1}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Join Type Icon */}
                                <div className="hidden md:flex flex-col items-center justify-center pt-8">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                        <GitMerge className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Table B */}
                                <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-800">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Table B (Right Table)</label>
                                        <select
                                            value={tableBId}
                                            onChange={(e) => setTableBId(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                                        >
                                            <option value="">Select Table...</option>
                                            {tables.map(t => (
                                                <option key={t.id} value={t.id} disabled={t.id === tableAId}>
                                                    Table {t.index + 1} ({t.rowCount} rows)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {tableB && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Join Column</label>
                                            <select
                                                value={joinKeyB}
                                                onChange={(e) => setJoinKeyB(e.target.value)}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                                            >
                                                <option value="">Select Key...</option>
                                                {tableB.headers.map((h, i) => (
                                                    <option key={`${i}-${h}`} value={h}>{h || `Col ${i + 1}`}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Join Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="joinType"
                                            value="inner"
                                            checked={joinType === 'inner'}
                                            onChange={(e) => setJoinType(e.target.value as any)}
                                            className="text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                                        />
                                        Inner Join (Intersection)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="joinType"
                                            value="left"
                                            checked={joinType === 'left'}
                                            onChange={(e) => setJoinType(e.target.value as any)}
                                            className="text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                                        />
                                        Left Join (Include all A)
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleMerge}
                        disabled={tables.length < 2 || !tableAId || !tableBId || !joinKeyA || !joinKeyB}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                    >
                        <GitMerge className="w-4 h-4" />
                        Execute Merge
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useMemo, useState, useRef } from 'react';
import type { TableData } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AreaChart as AreaChartIcon, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6', '#ef4444', '#14b8a6'];

interface DataVisualizationProps {
    table: TableData;
}

export function DataVisualization({ table }: DataVisualizationProps) {
    const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'area' | 'scatter'>('bar');
    const [isExporting, setIsExporting] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    // Find viable X and Y axis columns
    const { xAxisOptions, yAxisOptions } = useMemo(() => {
        const xOpts: { index: number, name: string }[] = [];
        const yOpts: { index: number, name: string }[] = [];

        table.headers.forEach((header, index) => {
            const type = table.colTypes?.[index] || 'string';
            if (type === 'number') {
                yOpts.push({ index, name: header });
                // Numbers can also be used as X-Axis
                xOpts.push({ index, name: header });
            } else {
                xOpts.push({ index, name: header });
            }
        });

        return { xAxisOptions: xOpts, yAxisOptions: yOpts };
    }, [table]);

    // Track selected axes
    const [selectedX, setSelectedX] = useState<number | ''>(xAxisOptions.length > 0 ? xAxisOptions[0].index : '');
    const [selectedY, setSelectedY] = useState<number | ''>(yAxisOptions.length > 0 ? yAxisOptions[0].index : '');

    // Transform table data for Recharts
    const chartData = useMemo(() => {
        if (selectedX === '' || selectedY === '') return [];

        const xKey = table.headers[selectedX as number] || 'X';
        const yKey = table.headers[selectedY as number] || 'Y';

        return table.rows.slice(1).map((row, idx) => {
            const xVal = row[selectedX as number];
            const yVal = Number(row[selectedY as number]);

            return {
                id: idx,
                [xKey]: xVal || `Row ${idx + 1}`,
                [yKey]: isNaN(yVal) ? 0 : yVal
            };
        });
    }, [table, selectedX, selectedY]);

    if (yAxisOptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Numerical Data Found</h3>
                <p className="text-sm max-w-sm">
                    Recharts requires at least one numerical column to generate data visualizations.
                    Please ensure your table has parsed number values.
                </p>
            </div>
        );
    }

    const xKey = typeof selectedX === 'number' ? table.headers[selectedX] : '';
    const yKey = typeof selectedY === 'number' ? table.headers[selectedY] : '';

    const handleExportImage = async () => {
        if (!chartRef.current) return;
        try {
            setIsExporting(true);
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
                scale: 2 // Higher resolution
            });
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${table.id}_chart.png`;
            link.href = url;
            link.click();
        } catch (err) {
            console.error("Failed to export chart", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-b-xl">
            {/* Chart Controls */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-wrap gap-4 items-center justify-between rounded-t-xl z-20 sticky top-0">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${chartType === 'bar' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Bar Chart"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${chartType === 'line' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Line Chart"
                        >
                            <LineChartIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setChartType('pie')}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${chartType === 'pie' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Pie Chart"
                        >
                            <PieChartIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setChartType('area')}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${chartType === 'area' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Area Chart"
                        >
                            <AreaChartIcon className="w-4 h-4" />
                        </button>
                        {/* Reusing pie/bar icons for Scatter logically if lucide lacks it */}
                        <button
                            onClick={() => setChartType('scatter')}
                            className={`p-1.5 rounded-md flex items-center justify-center transition-colors p-1.5 font-bold font-serif text-[10px] ${chartType === 'scatter' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            title="Scatter Plot"
                        >
                            •••
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">X-Axis:</label>
                        <select
                            value={selectedX}
                            onChange={(e) => setSelectedX(Number(e.target.value))}
                            className="text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                        >
                            {xAxisOptions.map(opt => (
                                <option key={opt.index} value={opt.index}>{opt.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Y-Axis (Value):</label>
                        <select
                            value={selectedY}
                            onChange={(e) => setSelectedY(Number(e.target.value))}
                            className="text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200"
                        >
                            {yAxisOptions.map(opt => (
                                <option key={opt.index} value={opt.index}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? 'Exporting...' : 'Export PNG'}
            </button>

            {/* Chart Display */}
            <div className="flex-1 p-6 min-h-[400px] relative z-0" ref={chartRef}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey={yKey} fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    ) : chartType === 'line' ? (
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Line type="monotone" dataKey={yKey} stroke="#ec4899" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : chartType === 'area' ? (
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Area type="monotone" dataKey={yKey} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                        </AreaChart>
                    ) : chartType === 'scatter' ? (
                        <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis dataKey={xKey} type="category" tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} />
                            <YAxis dataKey={yKey} type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Scatter name={yKey} data={chartData} fill="#10b981" />
                        </ScatterChart>
                    ) : (
                        <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey={yKey}
                                nameKey={xKey}
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            >
                                {chartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

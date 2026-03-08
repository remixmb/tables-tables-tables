import { Type } from 'lucide-react';

interface InputPanelProps {
    value: string;
    onChange: (value: string) => void;
}

export function InputPanel({ value, onChange }: InputPanelProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-200">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 transition-colors duration-200">
                <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">HTML Input</h2>
            </div>
            <div className="flex-1 p-0 relative">
                <textarea
                    className="w-full h-full min-h-[200px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200"
                    placeholder="Paste your HTML here. We'll automatically find and extract data from any <table> elements..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    spellCheck={false}
                />
                {value.length === 0 && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md mb-2 border border-slate-200 dark:border-slate-700">&lt;table&gt;...&lt;/table&gt;</code>
                        <p className="text-sm">Awaiting content...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

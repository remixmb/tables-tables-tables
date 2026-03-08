import { Settings2 } from 'lucide-react';
import type { ParseOptions } from '../types';

interface OptionsPanelProps {
    options: ParseOptions;
    onChange: (options: ParseOptions) => void;
}

export function OptionsPanel({ options, onChange }: OptionsPanelProps) {
    const handleChange = (key: keyof ParseOptions, value: any) => {
        onChange({ ...options, [key]: value });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 transition-colors duration-200">
                <Settings2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Parser Options</h2>
            </div>
            <div className="p-4 space-y-4">
                <div className="space-y-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                    <label className="flex flex-row-reverse items-center justify-between cursor-pointer group">
                        <div className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={options.trimWhitespace}
                                onChange={(e) => handleChange('trimWhitespace', e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 shadow-inner"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Trim whitespace</span>
                    </label>

                    <label className="flex flex-row-reverse items-center justify-between cursor-pointer group">
                        <div className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={options.removeLineBreaks}
                                onChange={(e) => handleChange('removeLineBreaks', e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 shadow-inner"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Remove line breaks</span>
                    </label>

                    <label className="flex flex-row-reverse items-center justify-between cursor-pointer group">
                        <div className="relative inline-flex items-center">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={options.stripHtmlTags}
                                onChange={(e) => handleChange('stripHtmlTags', e.target.checked)}
                            />
                            <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 shadow-inner"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Strip HTML tags</span>
                    </label>
                </div>

                <div className="pt-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Link Extraction Mode</label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                        {(['anchor', 'url', 'both'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => handleChange('linkExtractionMode', mode)}
                                className={`py-1.5 px-3 text-xs font-semibold rounded-md capitalize transition-all duration-200 ${options.linkExtractionMode === mode
                                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

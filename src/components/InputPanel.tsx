import { Type, FileCode, FileSpreadsheet, FileJson, FileText, Globe, Loader2 } from 'lucide-react';
import type { InputType } from '../types';
import { useState } from 'react';

interface InputPanelProps {
    value: string;
    onChange: (value: string) => void;
    inputType: InputType;
    onTypeChange: (type: InputType) => void;
}

const INPUT_TABS: { id: InputType; label: string; icon: React.ElementType; placeholder: string; isFetch?: boolean }[] = [
    { id: 'html', label: 'HTML', icon: FileCode, placeholder: "Paste HTML here. We'll automatically extract data from any <table> elements..." },
    { id: 'markdown', label: 'Markdown', icon: FileText, placeholder: "Paste Markdown tables here. For example:\n\n| Header 1 | Header 2 |\n| -------- | -------- |\n| Value 1  | Value 2  |" },
    { id: 'csv', label: 'CSV / TSV', icon: FileSpreadsheet, placeholder: "Paste CSV or TSV data here...\n\nHeader 1, Header 2\nValue 1, Value 2" },
    { id: 'json', label: 'JSON', icon: FileJson, placeholder: "Paste a JSON array of objects here...\n\n[\n  { \"id\": 1, \"name\": \"Item 1\" }\n]" },
    { id: 'url', label: 'URL Fetch', icon: Globe, placeholder: "https://en.wikipedia.org/wiki/List_of_countries...", isFetch: true },
];

export function InputPanel({ value, onChange, inputType, onTypeChange }: InputPanelProps) {
    const activeTab = INPUT_TABS.find(t => t.id === inputType) || INPUT_TABS[0];
    const [urlInput, setUrlInput] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const handleFetchUrl = async () => {
        if (!urlInput) return;
        setIsFetching(true);
        setFetchError(null);
        try {
            // Use AllOrigins as a free CORS proxy to fetch the HTML
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.contents) {
                // Submit the fetched HTML back to the parser (treating it exactly like a massive HTML paste)
                onChange(data.contents);
                setUrlInput(''); // clear the input after success
            } else {
                throw new Error("No payload found.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setFetchError("Failed to fetch URL. Security policies may block scraping this site.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full transition-colors duration-200">
            <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col xl:flex-row xl:items-center justify-between gap-3 transition-colors duration-200">
                <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
                    <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Data Input</h2>
                </div>
                <div className="flex overflow-x-auto custom-scrollbar bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg gap-1 min-w-0">
                    {INPUT_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = inputType === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTypeChange(tab.id)}
                                className={`flex items-center justify-center flex-1 sm:flex-auto gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${isActive
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-1 p-0 relative">
                {activeTab.isFetch ? (
                    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 p-6 items-center justify-center">
                        <Globe className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-6" />
                        <div className="max-w-xl w-full flex flex-col gap-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Enter a public URL to automatically scrape (`{'<table>'}`) data
                            </label>
                            <div className="flex gap-2 relative">
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder={activeTab.placeholder}
                                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 outline-none transition-all shadow-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleFetchUrl();
                                    }}
                                />
                                <button
                                    onClick={handleFetchUrl}
                                    disabled={!urlInput || isFetching}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                                >
                                    {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Tables'}
                                </button>
                            </div>
                            {fetchError && (
                                <p className="text-sm text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800/30">
                                    {fetchError}
                                </p>
                            )}
                            {value && !fetchError && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Successfully loaded document ({Math.round(value.length / 1024)} KB)
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <textarea
                            className="w-full h-full min-h-[200px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200"
                            placeholder={activeTab.placeholder}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            spellCheck={false}
                        />
                        {value.length === 0 && (
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px]">
                                <activeTab.icon className="w-8 h-8 opacity-20 mb-3" />
                                <p className="text-sm font-medium">Awaiting {activeTab.label} content...</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

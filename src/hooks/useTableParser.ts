import { useState, useEffect, useMemo } from 'react';
import type { ParseOptions } from '../types';
import { parseHtmlTables } from '../parser/htmlToTable';

const DEFAULT_OPTIONS: ParseOptions = {
    trimWhitespace: true,
    removeLineBreaks: true,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor'
};

export function useTableParser() {
    const [htmlInput, setHtmlInput] = useState<string>('');
    const [options, setOptions] = useState<ParseOptions>(DEFAULT_OPTIONS);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    const tables = useMemo(() => {
        if (!htmlInput.trim()) return [];
        try {
            return parseHtmlTables(htmlInput, options);
        } catch (e) {
            console.error("Failed to parse html tables:", e);
            return [];
        }
    }, [htmlInput, options]);

    // Handle auto-selection when tables change
    useEffect(() => {
        if (tables.length === 0) {
            setSelectedTableId(null);
        } else if (selectedTableId) {
            // Keep selected if still exists
            const exists = tables.find(t => t.id === selectedTableId);
            if (!exists) {
                setSelectedTableId(tables[0].id);
            }
        } else {
            setSelectedTableId(tables[0].id);
        }
    }, [tables, selectedTableId]);

    const selectedTable = useMemo(() => {
        return tables.find(t => t.id === selectedTableId) || null;
    }, [tables, selectedTableId]);

    return {
        htmlInput,
        setHtmlInput,
        options,
        setOptions,
        tables,
        selectedTableId,
        setSelectedTableId,
        selectedTable
    };
}

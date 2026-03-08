import { useState, useEffect, useMemo } from 'react';
import type { ParseOptions, InputType } from '../types';
import { parseHtmlTables } from '../parser/htmlToTable';
import { parseCsvTable } from '../parser/csvToTable';
import { parseJsonTable } from '../parser/jsonToTable';
import { parseMarkdownTable } from '../parser/markdownToTable';

const DEFAULT_OPTIONS: ParseOptions = {
    trimWhitespace: true,
    removeLineBreaks: true,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor'
};

export function useTableParser() {
    const [rawInput, setRawInput] = useState<string>('');
    const [inputType, setInputType] = useState<InputType>('html');
    const [options, setOptions] = useState<ParseOptions>(DEFAULT_OPTIONS);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    const tables = useMemo(() => {
        if (!rawInput.trim()) return [];
        try {
            switch (inputType) {
                case 'html':
                    return parseHtmlTables(rawInput, options);
                case 'markdown':
                    return parseMarkdownTable(rawInput, options);
                case 'csv':
                    return parseCsvTable(rawInput, options);
                case 'json':
                    return parseJsonTable(rawInput, options);
                default:
                    return [];
            }
        } catch (e) {
            console.error(`Failed to parse ${inputType} tables:`, e);
            return [];
        }
    }, [rawInput, inputType, options]);

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
        rawInput,
        setRawInput,
        inputType,
        setInputType,
        options,
        setOptions,
        tables,
        selectedTableId,
        setSelectedTableId,
        selectedTable
    };
}

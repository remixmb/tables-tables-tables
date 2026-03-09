import { useState, useEffect, useMemo } from 'react';
import type { ParseOptions, InputType, TableData } from '../types';
import { parseHtmlTables } from '../parser/htmlToTable';
import { parseCsvTable } from '../parser/csvToTable';
import { parseJsonTable } from '../parser/jsonToTable';
import { parseMarkdownTable } from '../parser/markdownToTable';

const DEFAULT_OPTIONS: ParseOptions = {
    trimWhitespace: true,
    removeLineBreaks: true,
    stripHtmlTags: true,
    linkExtractionMode: 'anchor',
    firstRowAsHeader: true,
    filterEmptyData: false,
    extractImages: false
};

const STORAGE_KEY = 'tableforge_session_v1';

interface SessionState {
    rawInput: string;
    inputType: InputType;
    options: ParseOptions;
    customTables: TableData[];
}

export function useTableParser() {
    // Load initial state from localStorage
    const getInitialState = (): SessionState => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<SessionState>;
                return {
                    rawInput: parsed.rawInput ?? '',
                    inputType: parsed.inputType ?? 'html',
                    options: parsed.options ? { ...DEFAULT_OPTIONS, ...parsed.options } : DEFAULT_OPTIONS,
                    customTables: parsed.customTables ?? []
                };
            }
        } catch (e) {
            console.error('Failed to load session from localStorage', e);
        }
        return {
            rawInput: '',
            inputType: 'html',
            options: DEFAULT_OPTIONS,
            customTables: []
        };
    };

    const initialState = useMemo(() => getInitialState(), []);

    const [rawInput, setRawInput] = useState<string>(initialState.rawInput);
    const [inputType, setInputType] = useState<InputType>(initialState.inputType);
    const [options, setOptions] = useState<ParseOptions>(initialState.options);
    const [customTables, setCustomTables] = useState<TableData[]>(initialState.customTables);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    // Persist state changes to localStorage
    useEffect(() => {
        try {
            const state: SessionState = { rawInput, inputType, options, customTables };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save session to localStorage', e);
        }
    }, [rawInput, inputType, options, customTables]);

    const clearSession = () => {
        setRawInput('');
        setInputType('html');
        setOptions(DEFAULT_OPTIONS);
        setCustomTables([]);
        setSelectedTableId(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const parsedTables = useMemo(() => {
        if (!rawInput.trim()) return [];
        try {
            switch (inputType) {
                case 'html':
                case 'url':
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

    const tables = useMemo(() => {
        return [...parsedTables, ...customTables];
    }, [parsedTables, customTables]);

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
        customTables,
        setCustomTables,
        selectedTableId,
        setSelectedTableId,
        selectedTable,
        clearSession
    };
}

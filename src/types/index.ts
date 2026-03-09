export type LinkExtractionMode = 'anchor' | 'url' | 'both';
export type InputType = 'html' | 'markdown' | 'csv' | 'json';

export interface ParseOptions {
    trimWhitespace: boolean;
    removeLineBreaks: boolean;
    stripHtmlTags: boolean;
    linkExtractionMode: LinkExtractionMode;
    firstRowAsHeader: boolean;
    filterEmptyData: boolean;
    extractImages: boolean;
}

export interface TableData {
    id: string;
    index: number;
    rowCount: number;
    colCount: number;
    headers: string[];
    rows: string[][];
    rawHtml: string;
}

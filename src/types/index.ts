export type LinkExtractionMode = 'anchor' | 'url' | 'both';

export interface ParseOptions {
    trimWhitespace: boolean;
    removeLineBreaks: boolean;
    stripHtmlTags: boolean;
    linkExtractionMode: LinkExtractionMode;
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

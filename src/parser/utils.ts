import type { TableData } from '../types';

export function applyFilterEmptyData(table: TableData): TableData {
    // We expect table.rows to contain the header at index 0 and data from index 1.
    if (table.rows.length <= 1) return table;

    const headers = table.rows[0];
    const dataRows = table.rows.slice(1);

    const nonEmptyRows = dataRows.filter(row => row.some(cell => cell.trim() !== ''));

    // Check which columns have at least one non-empty cell in the data.
    // We want to keep columns that have data or maybe if the header has a name?
    // Usually, we only filter columns if all data cells in that column are empty.
    const colHasData = Array.from({ length: table.colCount }, () => false);
    for (let i = 0; i < nonEmptyRows.length; i++) {
        for (let j = 0; j < table.colCount; j++) {
            if (nonEmptyRows[i][j] && nonEmptyRows[i][j].trim() !== '') {
                colHasData[j] = true;
            }
        }
    }

    // Include the column if it has data OR if it has a non-empty header 
    // Wait, if filterEmptyData is selected, maybe we want to drop columns that have ZERO data even if they have a header?
    // Let's drop completely empty columns. If the header is just "Column 3" and no data, drop it.
    // If the header has a real name but no data, we should probably keep it? The requirement says "Filter empty rows/cols". Let's just drop if there is no data at all.
    const colsToKeep = colHasData.map((hasData) => {
        // Keep if it has data. If it has no data but has a non-default header, it's debatable. Let's strictly require data.
        return hasData;
    });

    // If all columns are empty, maybe keep everything so we don't return an empty grid?
    if (!colsToKeep.some(Boolean)) return table;

    const filterRowCols = (row: string[]) => row.filter((_, idx) => colsToKeep[idx]);

    const filteredHeaders = filterRowCols(headers);
    const filteredDataRows = nonEmptyRows.map(filterRowCols);

    const finalRows = [filteredHeaders, ...filteredDataRows];

    return {
        ...table,
        headers: filteredHeaders,
        rows: finalRows,
        colCount: filteredHeaders.length,
        rowCount: finalRows.length
    };
}

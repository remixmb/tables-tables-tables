# TableForge 🛠️

TableForge is a powerful, universal client-side data parser and converter. Paste in raw HTML, Markdown, CSV, or JSON and instantly convert it into a structured, editable Data Grid with advanced export and visualization capabilities.

No data is ever stored on a server—everything runs instantly in your browser.

## Features ✨

### 📥 Multi-Format Parsing
*   **HTML**: Automatically extracts tables from raw `<table>` markup, handling messy code, complex `colspan`/`rowspan` merges, and hidden elements.
*   **CSV / TSV**: Fast delimiter-separated value parsing powered by PapaParse.
*   **JSON**: Intelligently flattens JSON object arrays into structured tabular data.
*   **Markdown**: Converts GitHub-flavored Markdown tables into actionable data arrays.

### 🧠 Smart Auto-Detection
*   Automatically infers column data types (`string`, `number`, `boolean`) by analyzing your dataset (`dynamicTyping`).
*   Correctly casts data for specialized SQL creation.

### ✏️ Interactive Data Grid
*   **Blazing Fast Edits**: A robust React `contentEditable` grid that skips render lag, letting you modify cells directly.
*   **Data Transposition**: Flip columns and rows geometrically with one click.
*   **Regex Find & Replace**: Execute complex String or Regular Expression replacements specifically on your data rows before you export.

### 📊 Built-in Data Visualization
Instantly map your quantitative data into interactive charts. TableForge dynamically scans inferred `ColumnTypes` to locate viable numerical Data Keys for Recharts integration.
*   Bar Charts 📊
*   Line Charts 📈
*   Pie Charts 🥧

### 📤 Advanced Export Formats
*   Copy to Clipboard (Raw Tab-Separated Data)
*   Export as JSON Array
*   Export as Markdown Table
*   Generate raw SQL `INSERT` statements using dynamically inferred column types and auto-escaped quotes.
*   Download true `.xlsx` Application Excel files powered by `exceljs`.

### ⚙️ Parsing Options
*   **Filter Empty Data**: Silently drop blank columns to condense your grid.
*   **First Row as Header**: Toggle dynamic header discovery.
*   **Format Cleanup**: Remove Line Breaks, Trim Whitespace, Strip nested HTML tags.
*   **Rich Data Extraction**: Extract Hyperlinks (`href` vs `anchor` text) and Image attributes directly from messy HTML layouts.

## Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Run Vitest test suite
npm run test

# Build for production
npm run build
```

## Deployment
Deployment is handled via the `gh-pages` branch.
```bash
npm run deploy
```

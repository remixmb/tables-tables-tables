
import { Table } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { OptionsPanel } from './components/OptionsPanel';
import { TableList } from './components/TableList';
import { TablePreview } from './components/TablePreview';
import { ExportPanel } from './components/ExportPanel';
import { useTableParser } from './hooks/useTableParser';

function App() {
  const {
    htmlInput,
    setHtmlInput,
    options,
    setOptions,
    tables,
    selectedTableId,
    setSelectedTableId,
    selectedTable
  } = useTableParser();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg text-white shadow-sm shadow-indigo-600/20 dark:shadow-indigo-500/20">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">TableForge</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">HTML to Structured Data</p>
            </div>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
            Client-side parsing • No data stored
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Left Column: Input and Lists */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
          <div className="h-2/5 min-h-[250px]">
            <InputPanel value={htmlInput} onChange={setHtmlInput} />
          </div>
          <div className="h-3/5 min-h-[300px] flex flex-col gap-6">
            <div className="flex-1 overflow-hidden">
              <TableList
                tables={tables}
                selectedId={selectedTableId}
                onSelect={setSelectedTableId}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Options */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
            <OptionsPanel options={options} onChange={setOptions} />
            <ExportPanel table={selectedTable} />
          </div>
          <div className="flex-1 min-h-[400px] lg:min-h-0 min-w-0 overflow-hidden">
            <TablePreview table={selectedTable} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

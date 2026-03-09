import { useState, useEffect } from 'react';
import { Table, Trash2 } from 'lucide-react';
import { InputPanel } from './components/InputPanel';
import { OptionsPanel } from './components/OptionsPanel';
import { TableList } from './components/TableList';
import { TablePreview } from './components/TablePreview';
import { ExportPanel } from './components/ExportPanel';
import { MergeDialog } from './components/MergeDialog';
import { useTableParser } from './hooks/useTableParser';

function App() {
  const {
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
  } = useTableParser();

  const [editableTable, setEditableTable] = useState(selectedTable);
  const [isMergeOpen, setIsMergeOpen] = useState(false);

  useEffect(() => {
    setEditableTable(selectedTable);
  }, [selectedTable]);

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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Universal Data Parser</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
              Client-side parsing • No data stored
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your session? All parsed data and options will be lost.')) {
                  clearSession();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:ring-2 focus:ring-red-500 outline-none"
              title="Clear Session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Data
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        {/* Left Column: Input and Lists */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] min-w-0">
          <div className="h-2/5 min-h-[250px]">
            <InputPanel
              value={rawInput}
              onChange={setRawInput}
              inputType={inputType}
              onTypeChange={setInputType}
            />
          </div>
          <div className="h-3/5 min-h-[300px] flex flex-col gap-6">
            <div className="flex-1 overflow-hidden">
              <TableList
                tables={tables}
                selectedId={selectedTableId}
                onSelect={setSelectedTableId}
                onOpenMerge={() => setIsMergeOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Options */}
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-shrink-0">
            <OptionsPanel options={options} onChange={setOptions} inputType={inputType} />
            <ExportPanel table={editableTable} />
          </div>
          <div className="flex-1 min-h-[400px] lg:min-h-0 min-w-0 overflow-hidden">
            <TablePreview table={editableTable} onTableChange={setEditableTable} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <MergeDialog
        isOpen={isMergeOpen}
        onClose={() => setIsMergeOpen(false)}
        tables={tables}
        onMerge={(newTable) => {
          setCustomTables([...customTables, newTable]);
          setSelectedTableId(newTable.id);
        }}
      />
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { DataView } from '../../components/StatAnalyzer/DataView';
import { VariableView } from '../../components/StatAnalyzer/VariableView';
import { AnalysisSidebar } from '../../components/StatAnalyzer/AnalysisSidebar';
import { AnalysisModal } from '../../components/StatAnalyzer/AnalysisModal';
import type { CsvRow } from '../../lib/statistics/types';

export interface ResultData {
  title: string;
  rows: [string, string | number][];
  timestamp: number;
}

function fmt(v: string | number): string {
  if (typeof v === 'string') return v;
  if (!isFinite(v)) return 'N/A';
  return Number.isInteger(v) ? String(v) : v.toFixed(4);
}

function copyAsText(result: ResultData) {
  const text = [
    result.title,
    '─'.repeat(40),
    ...result.rows.map(([l, v]) => `${l.padEnd(24)}${fmt(v)}`),
  ].join('\n');
  navigator.clipboard.writeText(text);
}

function downloadCSV(result: ResultData) {
  const lines = [
    `"${result.title}"`,
    '"Statistic","Value"',
    ...result.rows.map(([l, v]) => `"${l}","${fmt(v)}"`),
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${result.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllResults(results: ResultData[]) {
  const lines: string[] = [];
  results.forEach(r => {
    lines.push(`"${r.title}"`);
    lines.push('"Statistic","Value"');
    r.rows.forEach(([l, v]) => lines.push(`"${l}","${fmt(v)}"`));
    lines.push('');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `statanalyzer_results_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ResultBlock({ result, onRemove }: { result: ResultData; onRemove: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyAsText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-slate-800">{result.title}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs px-2.5 py-1 rounded border border-gray-300 text-slate-600 hover:bg-white transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => downloadCSV(result)}
            className="text-xs px-2.5 py-1 rounded border border-gray-300 text-slate-600 hover:bg-white transition-colors"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs px-2 py-1 rounded text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      </div>
      <table className="min-w-full text-sm">
        <tbody>
          {result.rows.map(([label, value], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="px-4 py-1.5 text-slate-500 font-medium w-48">{label}</td>
              <td className="px-4 py-1.5 text-slate-900 font-mono">{fmt(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-1.5 text-[10px] text-slate-400 border-t border-gray-100">
        {new Date(result.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default function StatAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'data' | 'variable' | 'output'>('data');
  const [data, setData] = useState<CsvRow[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [results, setResults] = useState<ResultData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'data', label: 'Data View' },
    { id: 'variable', label: 'Variable View' },
    { id: 'output', label: `Output${results.length ? ` (${results.length})` : ''}` },
  ] as const;

  const handleAnalysisSelect = (analysis: string) => {
    setSelectedAnalysis(analysis);
    setShowModal(true);
  };

  const removeResult = (i: number) => {
    setResults(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`
        fixed top-0 left-0 md:relative md:top-auto md:left-auto z-30 md:z-auto
        h-screen md:h-full transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <AnalysisSidebar onSelect={name => { handleAnalysisSelect(name); setSidebarOpen(false); }} selected={selectedAnalysis} data={data} variables={variables} />
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden p-1.5 rounded text-slate-500 hover:bg-slate-100"
              aria-label="Toggle analysis menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">StatAnalyzer Pro</h1>
            <Badge variant="beta">Beta</Badge>
          </div>
          <span className="text-sm text-slate-500">
            {data.length > 0 ? `${data.length} rows · ${Object.keys(data[0] ?? {}).length} columns` : 'No data loaded'}
          </span>
        </header>

        <nav className="flex border-b border-gray-200 bg-white px-6 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-auto p-6">
          {/* Keep all tabs mounted so DataView/VariableView don't lose state on switch */}
          <div className={activeTab === 'data' ? '' : 'hidden'}>
            <DataView onDataLoaded={rows => setData(rows)} />
          </div>
          <div className={activeTab === 'variable' ? '' : 'hidden'}>
            <VariableView
              data={data}
              selectedVariables={variables}
              onVariablesSelected={setVariables}
              onRunAnalysis={() => setShowModal(true)}
            />
          </div>
          <div className={activeTab === 'output' ? '' : 'hidden'}>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-semibold text-slate-800">Analysis Output</h2>
                {results.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => exportAllResults(results)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded px-3 py-1 hover:bg-indigo-50"
                    >
                      Export All
                    </button>
                    <button
                      type="button"
                      onClick={() => setResults([])}
                      className="text-sm text-red-600 hover:text-red-800 border border-red-200 rounded px-3 py-1 hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              {results.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-base">No results yet.</p>
                  <p className="text-sm mt-1">Select an analysis from the sidebar.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((r, i) => (
                    <ResultBlock key={r.timestamp + i} result={r} onRemove={() => removeResult(i)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedAnalysis && (
        <AnalysisModal
          data={data}
          variables={variables}
          analysisName={selectedAnalysis}
          onClose={() => setShowModal(false)}
          onAddResult={result => {
            setResults(prev => [result, ...prev]);
            setActiveTab('output');
          }}
        />
      )}
    </div>
  );
}

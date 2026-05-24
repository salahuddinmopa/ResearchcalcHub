import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import type { CsvRow } from '../../lib/statistics/types';

const PAGE_SIZE = 20;

interface ColSummary {
  name: string;
  type: 'numeric' | 'categorical' | 'mixed';
  nonNull: number;
  nullCount: number;
  unique: number;
  min?: number;
  max?: number;
  mean?: number;
}

function summariseCols(data: CsvRow[]): ColSummary[] {
  if (!data.length) return [];
  return Object.keys(data[0]).map(col => {
    const vals = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
    const nullCount = data.length - vals.length;
    const nums = vals.filter(v => typeof v === 'number') as number[];
    const type: ColSummary['type'] =
      nums.length === vals.length ? 'numeric' :
      nums.length === 0 ? 'categorical' : 'mixed';
    const unique = new Set(vals.map(String)).size;
    const mean = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : undefined;
    const min = nums.length ? Math.min(...nums) : undefined;
    const max = nums.length ? Math.max(...nums) : undefined;
    return { name: col, type, nonNull: vals.length, nullCount, unique, min, max, mean };
  });
}

const TYPE_STYLE: Record<ColSummary['type'], string> = {
  numeric: 'bg-blue-100 text-blue-700',
  categorical: 'bg-amber-100 text-amber-700',
  mixed: 'bg-slate-100 text-slate-500',
};

export function DataView({ onDataLoaded }: { onDataLoaded: (data: CsvRow[]) => void }) {
  const [data, setData] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<'data' | 'summary'>('data');
  const [error, setError] = useState('');

  const cols = useMemo(() => (data.length ? Object.keys(data[0]) : []), [data]);
  const summary = useMemo(() => summariseCols(data), [data]);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageRows = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setFileName(file.name);
    setPage(0);
    Papa.parse<any>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: results => {
        const rows = results.data as CsvRow[];
        if (!rows.length) { setError('File parsed but no rows found.'); return; }
        setData(rows);
        onDataLoaded(rows);
      },
      error: err => setError(`Parse error: ${err.message}`),
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Upload CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 text-sm text-slate-500"
          />
        </label>
        {fileName && (
          <span className="text-sm text-slate-600 bg-slate-100 rounded px-2 py-1">
            {fileName} · <span className="font-medium">{data.length}</span> rows · <span className="font-medium">{cols.length}</span> columns
          </span>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      {data.length > 0 && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-0">
            {(['data', 'summary'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${
                  tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'data' ? 'Data Table' : 'Column Summary'}
              </button>
            ))}
          </div>

          {tab === 'data' && (
            <div className="space-y-3">
              {/* Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 w-10">#</th>
                      {cols.map(c => (
                        <th key={c} className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="px-3 py-1.5 text-slate-400 text-xs">{page * PAGE_SIZE + i + 1}</td>
                        {cols.map(c => (
                          <td key={c} className="px-3 py-1.5 text-slate-800 whitespace-nowrap max-w-[180px] truncate" title={String(row[c] ?? '')}>
                            {row[c] === null || row[c] === undefined || row[c] === '' ? (
                              <span className="text-slate-300 italic text-xs">null</span>
                            ) : String(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-2 py-1 border rounded disabled:opacity-30 hover:bg-slate-50"
                  >«</button>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-2 py-1 border rounded disabled:opacity-30 hover:bg-slate-50"
                  >‹</button>
                  <span className="text-slate-600 px-1">
                    Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
                    <span className="text-slate-400 ml-2">
                      (rows {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, data.length)} of {data.length})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="px-2 py-1 border rounded disabled:opacity-30 hover:bg-slate-50"
                  >›</button>
                  <button
                    type="button"
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page === totalPages - 1}
                    className="px-2 py-1 border rounded disabled:opacity-30 hover:bg-slate-50"
                  >»</button>
                </div>
              )}
            </div>
          )}

          {tab === 'summary' && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    {['Column', 'Type', 'Non-null', 'Nulls', 'Unique', 'Min', 'Max', 'Mean'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summary.map((s, i) => (
                    <tr key={s.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                      <td className="px-3 py-2">
                        <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${TYPE_STYLE[s.type]}`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{s.nonNull}</td>
                      <td className="px-3 py-2">
                        {s.nullCount > 0
                          ? <span className="text-amber-600 font-medium">{s.nullCount}</span>
                          : <span className="text-slate-400">0</span>}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{s.unique}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{s.min !== undefined ? s.min : '—'}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{s.max !== undefined ? s.max : '—'}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{s.mean !== undefined ? s.mean.toFixed(3) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!data.length && !fileName && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-14 text-center text-slate-400">
          <p className="text-base font-medium">No data loaded</p>
          <p className="text-sm mt-1">Upload a CSV file to get started. First row must be column headers.</p>
        </div>
      )}
    </div>
  );
}

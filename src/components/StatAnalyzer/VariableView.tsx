import React, { useState, useEffect } from 'react';
import type { CsvRow } from '../../lib/statistics/types';

interface VariableViewProps {
  data: CsvRow[];
  selectedVariables?: string[];
  onVariablesSelected: (variables: string[]) => void;
  onRunAnalysis: () => void;
}

function detectType(data: CsvRow[], col: string): 'numeric' | 'categorical' | 'mixed' {
  const vals = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
  if (vals.length === 0) return 'categorical';
  const numericCount = vals.filter(v => typeof v === 'number').length;
  if (numericCount === vals.length) return 'numeric';
  if (numericCount === 0) return 'categorical';
  return 'mixed';
}

const TYPE_BADGE: Record<string, string> = {
  numeric: 'bg-blue-100 text-blue-700',
  categorical: 'bg-amber-100 text-amber-700',
  mixed: 'bg-slate-100 text-slate-500',
};

export function VariableView({ data, selectedVariables = [], onVariablesSelected }: VariableViewProps) {
  const [selected, setSelected] = useState<string[]>(selectedVariables);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const toggle = (col: string) => {
    setSelected(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    onVariablesSelected(selected);
  }, [selected]);

  if (columns.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-base">No data loaded.</p>
        <p className="text-sm mt-1">Go to Data View and upload a CSV file first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Variables</h2>
        <p className="text-sm text-slate-500">
          Select variables to include, then pick an analysis from the sidebar.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center px-4 py-2 bg-gray-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span></span>
          <span>Column</span>
          <span>Type</span>
        </div>
        {columns.map(col => {
          const type = detectType(data, col);
          return (
            <label
              key={col}
              className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selected.includes(col)}
                onChange={() => toggle(col)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-800 font-medium">{col}</span>
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full ${TYPE_BADGE[type]}`}>
                {type}
              </span>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <p className="text-xs text-slate-500 bg-indigo-50 border border-indigo-100 rounded px-3 py-2">
          {selected.length} variable{selected.length > 1 ? 's' : ''} selected — click an analysis in the sidebar to run it.
        </p>
      )}
    </div>
  );
}

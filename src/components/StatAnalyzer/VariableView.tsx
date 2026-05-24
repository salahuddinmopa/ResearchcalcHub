import React, { useState, useEffect } from 'react';

export function VariableView({ data, onVariablesSelected, onRunAnalysis }: { data: any[]; onVariablesSelected: (variables: string[]) => void; onRunAnalysis: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  // Derive column names from first row of data
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  const toggle = (col: string) => {
    if (selected.includes(col)) {
      setSelected(selected.filter(c => c !== col));
    } else {
      setSelected([...selected, col]);
    }
  };

  // Notify parent whenever selection changes
  useEffect(() => {
    onVariablesSelected(selected);
  }, [selected]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-slate-800">Select Variables</h2>
        {columns.map(col => (
          <label key={col} className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(col)}
              onChange={() => toggle(col)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{col}</span>
          </label>
        ))}
        {/* Run Analysis button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={onRunAnalysis}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Run Analysis
          </button>
        </div>
    </div>
  );
}

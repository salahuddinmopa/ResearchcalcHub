import React, { useState } from 'react';
import Papa from 'papaparse';
import { Table } from '../../components/ui/Table';

export function DataView({ onDataLoaded }: { onDataLoaded: (data: any[]) => void }) {
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<any[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse<any>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        setPreview(rows.slice(0, 5)); // show first 5 rows
        onDataLoaded(rows);
      },
      error: (err) => {
        console.error('Parse error', err);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Upload CSV / Excel (CSV)</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />
        {fileName && <p className="mt-2 text-sm text-slate-600">Selected: {fileName}</p>}
      </div>
      {preview.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-slate-800 mb-2">Preview (first 5 rows)</h2>
          <Table data={preview} />
        </div>
      )}
    </div>
  );
}

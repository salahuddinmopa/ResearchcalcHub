import { Download, Plus, Trash2, ClipboardPaste } from 'lucide-react';
import { downloadCsv } from '../../utils/export';

interface Props {
  headers: string[];
  rows: string[][];
  onRowsChange: (rows: string[][]) => void;
  rowHeaderLabel?: string;
  addRowLabel?: string;
  minRows?: number;
  pastePlaceholder?: string;
  cellPlaceholder?: string;
}

function parseDelimitedRows(raw: string): string[][] {
  return raw
    .trim()
    .split(/\r?\n/)
    .map(row => row.split(/\t|,|;/).map(cell => cell.trim()));
}

export function TableInput({
  headers,
  rows,
  onRowsChange,
  rowHeaderLabel = 'Row',
  addRowLabel = 'Add Row',
  minRows = 1,
  pastePlaceholder,
  cellPlaceholder = '',
}: Props) {
  const columnCount = headers.length;

  const normaliseRow = (row: string[]) => Array.from({ length: columnCount }, (_, index) => row[index] ?? '');

  const updateCell = (rowIndex: number, columnIndex: number, value: string) => {
    onRowsChange(rows.map((row, index) => (
      index === rowIndex
        ? normaliseRow(row).map((cell, cellIndex) => cellIndex === columnIndex ? value : cell)
        : normaliseRow(row)
    )));
  };

  const addRow = () => {
    onRowsChange([...rows.map(normaliseRow), new Array(columnCount).fill('')]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length <= minRows) return;
    onRowsChange(rows.filter((_, index) => index !== rowIndex).map(normaliseRow));
  };

  const handlePaste = (value: string) => {
    const parsed = parseDelimitedRows(value).map(normaliseRow);
    if (parsed.length > 0) onRowsChange(parsed);
  };

  const handleExport = () => {
    downloadCsv({
      filename: `${rowHeaderLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'table'}_data.csv`,
      headers: [rowHeaderLabel, ...headers],
      rows: rows.map((row, index) => [`${rowHeaderLabel} ${index + 1}`, ...normaliseRow(row)]),
    });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="data-table text-sm rounded-xl overflow-hidden w-full">
          <thead>
            <tr>
              <th className="text-left pl-3" style={{ minWidth: 90 }}>{rowHeaderLabel}</th>
              {headers.map(header => (
                <th key={header} style={{ minWidth: 120 }}>{header}</th>
              ))}
              <th style={{ width: 70 }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-3 py-2 bg-slate-50 text-slate-600 text-xs">{rowHeaderLabel} {rowIndex + 1}</td>
                {normaliseRow(row).map((cell, columnIndex) => (
                  <td key={columnIndex}>
                    <input
                      type="text"
                      value={cell}
                      onChange={event => updateCell(rowIndex, columnIndex, event.target.value)}
                      className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent"
                      placeholder={cellPlaceholder}
                    />
                  </td>
                ))}
                <td className="text-center p-1">
                  {rows.length > minRows && (
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Remove row ${rowIndex + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-3 items-start">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={addRow} className="btn-secondary text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {addRowLabel}
          </button>
          <button type="button" onClick={handleExport} className="btn-secondary text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-500">
          <ClipboardPaste className="w-4 h-4 text-slate-400 flex-shrink-0 mt-2" />
          <textarea
            className="input-field h-16 font-mono text-xs resize-none"
            placeholder={pastePlaceholder || 'Paste rows from Excel here'}
            onBlur={event => {
              if (event.target.value.trim()) {
                handlePaste(event.target.value);
                event.target.value = '';
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}

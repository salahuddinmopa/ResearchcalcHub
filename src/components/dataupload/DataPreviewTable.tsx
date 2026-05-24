import type { ParsedDataset } from '../../utils/dataParsing';
import type { ColumnInfo } from '../../utils/dataTypeDetection';

const TYPE_BADGE: Record<string, string> = {
  numeric: 'bg-blue-100 text-blue-700',
  categorical: 'bg-purple-100 text-purple-700',
  likert: 'bg-amber-100 text-amber-700',
  text: 'bg-slate-100 text-slate-700',
  id: 'bg-green-100 text-green-700',
};

interface Props {
  dataset: ParsedDataset;
  columns: ColumnInfo[];
  previewRows?: number;
}

export default function DataPreviewTable({ dataset, columns, previewRows = 10 }: Props) {
  const preview = dataset.rows.slice(0, previewRows);
  const colMap = new Map(columns.map(c => [c.name, c]));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-8">#</th>
            {dataset.headers.map(h => {
              const col = colMap.get(h);
              return (
                <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-700 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">{h}</span>
                    {col && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit font-medium ${TYPE_BADGE[col.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {col.type}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {preview.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-1.5 text-xs text-slate-400">{i + 1}</td>
              {dataset.headers.map(h => (
                <td key={h} className="px-3 py-1.5 text-slate-700 max-w-xs truncate" title={row[h]}>
                  {row[h] || <span className="text-slate-300 italic">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {dataset.rowCount > previewRows && (
        <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 bg-slate-50">
          Showing first {previewRows} of {dataset.rowCount.toLocaleString()} rows
        </div>
      )}
    </div>
  );
}

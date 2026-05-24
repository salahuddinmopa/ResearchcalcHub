import { Table, Hash, Tag, AlertTriangle } from 'lucide-react';
import type { ParsedDataset } from '../../utils/dataParsing';
import type { ColumnInfo, ColumnType } from '../../utils/dataTypeDetection';

interface Props {
  dataset: ParsedDataset;
  columns: ColumnInfo[];
}

const TYPE_COLORS: Record<ColumnType, string> = {
  numeric: 'bg-blue-500',
  categorical: 'bg-purple-500',
  likert: 'bg-amber-500',
  text: 'bg-slate-400',
  id: 'bg-green-500',
};

export default function UploadedDataSummary({ dataset, columns }: Props) {
  const typeCounts = columns.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] ?? 0) + 1;
    return acc;
  }, {} as Record<ColumnType, number>);

  const totalMissing = columns.reduce((a, c) => a + c.missingCount, 0);
  const totalCells = dataset.rowCount * dataset.colCount;
  const missingPct = totalCells > 0 ? ((totalMissing / totalCells) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Table className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{dataset.rowCount.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Rows</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <Hash className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{dataset.colCount}</p>
          <p className="text-xs text-slate-500">Columns</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {(Object.entries(typeCounts) as [ColumnType, number][]).map(([type, count]) => (
              <span key={type} className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-700">
                <span className={`w-1.5 h-1.5 rounded-full ${TYPE_COLORS[type]}`} />
                {count} {type}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Column types</p>
        </div>
      </div>

      <div className={`border rounded-xl p-4 flex items-start gap-3 ${totalMissing > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalMissing > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
          <AlertTriangle className={`w-4 h-4 ${totalMissing > 0 ? 'text-amber-600' : 'text-green-600'}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{missingPct}%</p>
          <p className="text-xs text-slate-500">Missing values</p>
        </div>
      </div>
    </div>
  );
}

import { ANALYSIS_VARIABLE_REQUIREMENTS } from '../../utils/dataAnalysis';
import type { AnalysisType } from '../../utils/dataAnalysis';
import type { ColumnInfo, ColumnType } from '../../utils/dataTypeDetection';

interface Props {
  analysisType: AnalysisType;
  columns: ColumnInfo[];
  selectedVars: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}

function isAllowed(col: ColumnInfo, allowedTypes: ColumnType[]): boolean {
  return allowedTypes.includes(col.type);
}

export default function VariableSelector({ analysisType, columns, selectedVars, onChange }: Props) {
  const requirements = ANALYSIS_VARIABLE_REQUIREMENTS[analysisType];

  return (
    <div className="space-y-4">
      {requirements.map(req => {
        const eligible = columns.filter(c => isAllowed(c, req.allowedTypes));

        if (req.multi) {
          const selected = (selectedVars[req.key] as string[] | undefined) ?? [];
          return (
            <div key={req.key}>
              <label className="block text-sm font-semibold text-slate-800 mb-1">{req.label}</label>
              <p className="text-xs text-slate-500 mb-2">{req.hint}</p>
              {eligible.length === 0 ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No eligible columns found. Allowed types: {req.allowedTypes.join(', ')}.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {eligible.map(col => {
                    const checked = selected.includes(col.name);
                    return (
                      <label key={col.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${checked ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked ? selected.filter(v => v !== col.name) : [...selected, col.name];
                            onChange(req.key, next);
                          }}
                          className="accent-indigo-600"
                        />
                        <span className="truncate">{col.name}</span>
                        <span className="text-[10px] text-slate-400">({col.type})</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {req.minSelect && selected.length > 0 && selected.length < req.minSelect && (
                <p className="text-xs text-amber-700 mt-1">Select at least {req.minSelect} items.</p>
              )}
            </div>
          );
        }

        const singleSelected = (selectedVars[req.key] as string | undefined) ?? '';
        return (
          <div key={req.key}>
            <label className="block text-sm font-semibold text-slate-800 mb-1">{req.label}</label>
            <p className="text-xs text-slate-500 mb-2">{req.hint}</p>
            {eligible.length === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No eligible columns. Allowed types: {req.allowedTypes.join(', ')}.
              </p>
            ) : (
              <select
                value={singleSelected}
                onChange={e => onChange(req.key, e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="">— Select column —</option>
                {eligible.map(col => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.type})
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import type { CsvRow } from '../../lib/statistics/types';

interface AnalysisSidebarProps {
  onSelect: (analysis: string) => void;
  selected?: string;
  data?: CsvRow[];
  variables?: string[];
}

type VarType = 'numeric' | 'categorical' | 'mixed' | 'unknown';

function detectType(data: CsvRow[], col: string): VarType {
  if (!data.length) return 'unknown';
  const vals = data.map(r => r[col]).filter(v => v !== null && v !== undefined && v !== '');
  if (!vals.length) return 'unknown';
  const numCount = vals.filter(v => typeof v === 'number').length;
  if (numCount === vals.length) return 'numeric';
  if (numCount === 0) return 'categorical';
  return 'mixed';
}

interface AnalysisEntry {
  name: string;
  requires: 'numeric' | 'categorical' | 'any';
  minVars: number;
}

const ANALYSES: AnalysisEntry[] = [
  { name: 'Frequencies', requires: 'any', minVars: 1 },
  { name: 'Descriptives', requires: 'numeric', minVars: 1 },
  { name: 'One‑Sample T‑Test', requires: 'numeric', minVars: 1 },
  { name: 'Independent Samples T‑Test', requires: 'numeric', minVars: 2 },
  { name: 'Paired Samples T‑Test', requires: 'numeric', minVars: 2 },
  { name: 'One‑Way ANOVA', requires: 'any', minVars: 2 },
  { name: 'Correlation', requires: 'numeric', minVars: 2 },
  { name: 'Linear Regression', requires: 'numeric', minVars: 2 },
  { name: 'Chi‑Square', requires: 'any', minVars: 1 },
  { name: 'Mann‑Whitney U', requires: 'numeric', minVars: 2 },
  { name: 'Cronbach Alpha', requires: 'numeric', minVars: 2 },
];

function getHint(entry: AnalysisEntry, selectedVarTypes: VarType[], varCount: number): string | null {
  if (varCount < entry.minVars) {
    return `Select ${entry.minVars}+ variable${entry.minVars > 1 ? 's' : ''} in Variable View`;
  }
  if (entry.requires === 'numeric' && selectedVarTypes.length > 0 && selectedVarTypes.every(t => t === 'categorical')) {
    return 'Needs numeric variables';
  }
  return null;
}

export function AnalysisSidebar({ onSelect, selected, data = [], variables = [] }: AnalysisSidebarProps) {
  const selectedVarTypes: VarType[] = variables.map(v => detectType(data, v));
  const numericCount = selectedVarTypes.filter(t => t === 'numeric' || t === 'mixed').length;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-slate-700">Analyses</h3>
        {variables.length > 0 && (
          <p className="text-[10px] text-slate-400 mt-0.5">
            {variables.length} var{variables.length > 1 ? 's' : ''} selected · {numericCount} numeric
          </p>
        )}
      </div>
      <ul className="overflow-y-auto flex-1 py-1">
        {ANALYSES.map(entry => {
          const hint = getHint(entry, selectedVarTypes, variables.length);
          const isDisabled = hint !== null && data.length > 0 && variables.length > 0;
          const isSelected = selected === entry.name;

          return (
            <li key={entry.name}>
              <button
                type="button"
                onClick={() => !isDisabled && onSelect(entry.name)}
                title={hint ?? undefined}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-indigo-100 text-indigo-800 font-semibold'
                    : isDisabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <span>{entry.name}</span>
                {isDisabled && (
                  <span className="text-[9px] font-medium text-slate-300 uppercase tracking-wide shrink-0">
                    {variables.length < entry.minVars ? `${entry.minVars}v` : 'N/A'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

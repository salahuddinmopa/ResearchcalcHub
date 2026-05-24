import React from 'react';

interface AnalysisSidebarProps {
  onSelect: (analysis: string) => void;
  selected?: string;
}

const analyses = [
  'Frequencies',
  'Descriptives',
  'One‑Sample T‑Test',
  'Independent Samples T‑Test',
  'Paired Samples T‑Test',
  'One‑Way ANOVA',
  'Correlation',
  'Linear Regression',
  'Chi‑Square',
  'Mann‑Whitney U',
  'Cronbach Alpha',
];

export function AnalysisSidebar({ onSelect, selected }: AnalysisSidebarProps) {
  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto h-full">
      <h3 className="text-lg font-medium mb-3">Statistical Analyses</h3>
      <ul className="space-y-1">
        {analyses.map(name => (
          <li key={name}>
            <button
              type="button"
              onClick={() => onSelect(name)}
              className={`w-full text-left px-2 py-1 rounded hover:bg-indigo-100 transition-colors ${selected === name ? 'bg-indigo-200 font-semibold' : ''}`}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

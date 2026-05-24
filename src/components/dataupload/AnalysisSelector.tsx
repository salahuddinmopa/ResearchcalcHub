import { ANALYSIS_META } from '../../utils/dataAnalysis';
import type { AnalysisType } from '../../utils/dataAnalysis';

interface Props {
  selected: AnalysisType | null;
  onSelect: (type: AnalysisType) => void;
}

const ORDER: AnalysisType[] = ['descriptive', 'frequency', 'crosstab', 'correlation', 'cronbach', 'kappa', 'likert', 'ttest'];

export default function AnalysisSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {ORDER.map(type => {
        const meta = ANALYSIS_META[type];
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}
          >
            <div className="text-xl mb-1">{meta.icon}</div>
            <div className="font-semibold text-sm text-slate-900">{meta.label}</div>
            <div className="text-xs text-slate-500 mt-0.5 leading-snug">{meta.description}</div>
          </button>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateAHPWeights } from '../../utils/decisionTools';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import PieChartResult from '../../components/visualizations/PieChartResult';

const calc = getCalculatorById('ahp-weight')!;
const defaultCriteria = ['Reliability', 'Validity', 'Feasibility', 'Cost'];
const defaultMatrix = [
  [1, 3, 5, 7],
  [1 / 3, 1, 3, 5],
  [1 / 5, 1 / 3, 1, 3],
  [1 / 7, 1 / 5, 1 / 3, 1],
];
const scaleValues = [1 / 9, 1 / 8, 1 / 7, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 1 / 2, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function formatSaaty(value: number) {
  return value < 1 ? `1/${Math.round(1 / value)}` : String(value);
}

export function AHPWeightPage() {
  const [criteria, setCriteria] = useState(['Criterion A', 'Criterion B', 'Criterion C']);
  const [matrix, setMatrix] = useState<number[][]>([[1, 3, 5], [1 / 3, 1, 3], [1 / 5, 1 / 3, 1]]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const addCriterion = () => {
    const nextLength = criteria.length + 1;
    setCriteria(prev => [...prev, `Criterion ${nextLength}`]);
    setMatrix(prev => {
      const expanded = prev.map(row => [...row, 1]);
      expanded.push(new Array(nextLength).fill(1));
      return expanded;
    });
  };

  const removeCriterion = (index: number) => {
    setCriteria(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    setMatrix(prev => prev.filter((_, row) => row !== index).map(row => row.filter((_, col) => col !== index)));
  };

  const updateComparison = (row: number, col: number, value: number) => {
    setMatrix(prev => {
      const next = prev.map(item => [...item]);
      next[row][col] = value;
      next[col][row] = 1 / value;
      return next;
    });
  };

  const [visualData, setVisualData] = useState<{name: string, value: number}[]>([]);

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateAHPWeights(criteria, matrix);
      
      setVisualData(r.rankings.map(item => ({ name: item.name, value: item.weight * 100 })));

      setResult({
        summary: [
          ...r.rankings.map(item => ({ label: `#${item.rank} ${item.name}`, value: `${(item.weight * 100).toFixed(2)}%`, highlight: item.rank === 1 })),
          { label: 'Consistency Ratio', value: r.cr.toFixed(4), highlight: true },
          { label: 'Consistency Status', value: r.isConsistent ? 'Acceptable' : 'Review comparisons' },
          { label: 'Lambda Max', value: r.lambdaMax.toFixed(4) },
          { label: 'Consistency Index', value: r.ci.toFixed(4) },
        ],
        interpretation: r.isConsistent
          ? `The pairwise comparisons are acceptably consistent (CR = ${r.cr.toFixed(3)}). The highest weighted criterion is ${r.rankings[0].name}.`
          : `The consistency ratio is ${r.cr.toFixed(3)}, above the common 0.10 threshold. Review the pairwise comparisons.`,
        interpretationLevel: r.isConsistent ? 'good' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate AHP weights.');
    }
  };

  const handleExample = () => { setCriteria(defaultCriteria); setMatrix(defaultMatrix.map(row => [...row])); setResult(null); setVisualData([]); setError(''); };
  const handleReset = () => { setCriteria(['Criterion A', 'Criterion B', 'Criterion C']); setMatrix([[1, 3, 5], [1 / 3, 1, 3], [1 / 5, 1 / 3, 1]]); setResult(null); setVisualData([]); setError(''); };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualData.length > 0 ? (
        <ResultSection
          title="AHP Weight Distribution"
          visual={
            <PieChartResult
              data={visualData}
            />
          }
          interpretation="The chart visualises the derived weights (percentages) for each criterion based on your pairwise comparisons."
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
          Use Saaty's 1-9 scale. Values below the diagonal are reciprocal values and are filled automatically.
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-1">
              <input
                value={criterion}
                onChange={event => setCriteria(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                className="input-field w-36 py-2 text-sm"
              />
              {criteria.length > 2 && (
                <button onClick={() => removeCriterion(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
          {criteria.length < 9 && <button onClick={addCriterion} className="btn-secondary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Criterion</button>}
        </div>

        <div className="overflow-x-auto">
          <table className="data-table text-sm rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="text-left pl-3">Criteria</th>
                {criteria.map(criterion => <th key={criterion}>{criterion}</th>)}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-3 py-2 bg-slate-50 text-slate-700 text-xs font-medium">{criteria[rowIndex]}</td>
                  {row.map((value, colIndex) => (
                    <td key={colIndex} className={rowIndex === colIndex ? 'bg-indigo-50' : ''}>
                      {rowIndex === colIndex ? (
                        <div className="text-center py-2 text-slate-400 font-bold">1</div>
                      ) : rowIndex < colIndex ? (
                        <select value={value} onChange={event => updateComparison(rowIndex, colIndex, Number(event.target.value))} className="w-full border-0 focus:ring-0 text-center text-xs py-2 bg-transparent">
                          {scaleValues.map(item => <option key={item} value={item}>{formatSaaty(item)}</option>)}
                        </select>
                      ) : (
                        <div className="text-center py-2 text-xs text-slate-400">{formatSaaty(value)}</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate AHP Weights</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateDecisionMatrix } from '../../utils/decisionTools';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import BarChartResult from '../../components/visualizations/BarChartResult';

const calc = getCalculatorById('decision-matrix')!;

const exampleOptions = ['Option A', 'Option B', 'Option C'];
const exampleCriteria = ['Cost', 'Impact', 'Feasibility'];
const exampleWeights = ['25', '45', '30'];
const exampleScores = [
  ['7', '8', '6'],
  ['9', '6', '8'],
  ['5', '9', '7'],
];

export function DecisionMatrixPage() {
  const [options, setOptions] = useState(['Option A', 'Option B']);
  const [criteria, setCriteria] = useState(['Criterion 1', 'Criterion 2']);
  const [weights, setWeights] = useState(['50', '50']);
  const [scores, setScores] = useState<string[][]>([['5', '5'], ['5', '5']]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const [visualData, setVisualData] = useState<{name: string, value: number}[]>([]);

  const syncScores = (nextOptions = options, nextCriteria = criteria) => {
    setScores(prev => nextOptions.map((_, optionIndex) => (
      nextCriteria.map((_, criteriaIndex) => prev[optionIndex]?.[criteriaIndex] || '')
    )));
  };

  const addOption = () => {
    const next = [...options, `Option ${options.length + 1}`];
    setOptions(next);
    syncScores(next, criteria);
  };

  const removeOption = (index: number) => {
    const next = options.filter((_, itemIndex) => itemIndex !== index);
    setOptions(next);
    setScores(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const addCriterion = () => {
    const nextCriteria = [...criteria, `Criterion ${criteria.length + 1}`];
    setCriteria(nextCriteria);
    setWeights(prev => [...prev, '10']);
    syncScores(options, nextCriteria);
  };

  const removeCriterion = (index: number) => {
    const nextCriteria = criteria.filter((_, itemIndex) => itemIndex !== index);
    setCriteria(nextCriteria);
    setWeights(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    setScores(prev => prev.map(row => row.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateDecisionMatrix({
        options,
        criteria,
        weights: weights.map(Number),
        scores: scores.map(row => row.map(Number)),
      });
      
      setVisualData(r.results.map(item => ({ name: item.option, value: item.total })));

      setResult({
        summary: [
          { label: 'Best Option', value: r.bestOption.option, highlight: true },
          { label: 'Best Weighted Score', value: r.bestOption.total.toFixed(4), highlight: true },
          ...r.results.map(item => ({ label: `#${item.rank} ${item.option}`, value: item.total.toFixed(4) })),
        ],
        interpretation: `${r.bestOption.option} is the highest ranked option with a weighted total score of ${r.bestOption.total.toFixed(3)}.`,
        interpretationLevel: 'good',
        steps: [
          `Normalised weights: ${criteria.map((criterion, index) => `${criterion} ${(r.normalizedWeights[index] * 100).toFixed(1)}%`).join(', ')}`,
          ...r.steps,
        ],
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate decision matrix.');
    }
  };

  const handleExample = () => {
    setOptions(exampleOptions);
    setCriteria(exampleCriteria);
    setWeights(exampleWeights);
    setScores(exampleScores);
    setResult(null);
    setVisualData([]);
    setError('');
  };

  const handleReset = () => {
    setOptions(['Option A', 'Option B']);
    setCriteria(['Criterion 1', 'Criterion 2']);
    setWeights(['50', '50']);
    setScores([['5', '5'], ['5', '5']]);
    setResult(null);
    setVisualData([]);
    setError('');
  };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualData.length > 0 ? (
        <ResultSection
          title="Options Comparison"
          visual={
            <BarChartResult
              data={visualData}
              xKey="name"
              yKey="value"
              barColor="#4f46e5"
            />
          }
          interpretation="The chart displays the total weighted score for each option. Higher scores indicate better options."
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div>
          <label className="label">Options</label>
          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-1">
                <input value={option} onChange={event => setOptions(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="input-field w-36 py-2 text-sm" />
                {options.length > 2 && <button onClick={() => removeOption(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
            <button onClick={addOption} className="btn-secondary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Option</button>
          </div>
        </div>

        <div>
          <label className="label">Criteria and Weights</label>
          <div className="flex flex-wrap gap-2">
            {criteria.map((criterion, index) => (
              <div key={index} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-2">
                <input value={criterion} onChange={event => setCriteria(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="input-field w-32 py-1.5 text-sm" />
                <input value={weights[index]} onChange={event => setWeights(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="input-field w-20 py-1.5 text-sm" type="number" min="0" placeholder="Weight" />
                {criteria.length > 1 && <button onClick={() => removeCriterion(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
            ))}
            <button onClick={addCriterion} className="btn-secondary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Criterion</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table text-sm rounded-xl overflow-hidden w-full">
            <thead>
              <tr>
                <th className="text-left pl-3">Option</th>
                {criteria.map(criterion => <th key={criterion}>{criterion}</th>)}
              </tr>
            </thead>
            <tbody>
              {options.map((option, optionIndex) => (
                <tr key={optionIndex}>
                  <td className="px-3 py-2 bg-slate-50 text-slate-700 text-xs font-medium">{option}</td>
                  {criteria.map((_, criterionIndex) => (
                    <td key={criterionIndex}>
                      <input
                        type="number"
                        value={scores[optionIndex]?.[criterionIndex] || ''}
                        onChange={event => setScores(prev => prev.map((row, rowIndex) => rowIndex === optionIndex ? row.map((cell, cellIndex) => cellIndex === criterionIndex ? event.target.value : cell) : row))}
                        className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent"
                        min="0"
                        step="0.1"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Decision Matrix</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

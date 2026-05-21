import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateWeightedScoring, type WeightedCriterion } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import BarChartResult from '../../components/visualizations/BarChartResult';

const calc = getCalculatorById('weighted-scoring')!;

const exampleCriteria: WeightedCriterion[] = [
  { name: 'Relevance', weight: 30, score: 8 },
  { name: 'Feasibility', weight: 25, score: 6 },
  { name: 'Impact', weight: 30, score: 9 },
  { name: 'Cost-effectiveness', weight: 15, score: 7 },
];

export function WeightedScoringPage() {
  const [criteria, setCriteria] = useState<WeightedCriterion[]>([
    { name: 'Criterion 1', weight: 25, score: 5 },
    { name: 'Criterion 2', weight: 25, score: 5 },
  ]);
  const [maxScore, setMaxScore] = useState('10');
  const [normaliseWeights, setNormaliseWeights] = useState(true);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');
  const [visualData, setVisualData] = useState<{name: string, value: number}[]>([]);

  const update = (index: number, field: keyof WeightedCriterion, value: string) => {
    setCriteria(prev => prev.map((criterion, criterionIndex) => (
      criterionIndex === index
        ? { ...criterion, [field]: field === 'name' ? value : parseFloat(value) || 0 }
        : criterion
    )));
  };

  const addCriterion = () => setCriteria(prev => [...prev, { name: `Criterion ${prev.length + 1}`, weight: 10, score: 5 }]);
  const removeCriterion = (index: number) => setCriteria(prev => prev.filter((_, criterionIndex) => criterionIndex !== index));

  const handleCalculate = () => {
    setError('');
    const max = parseFloat(maxScore);
    const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

    if (isNaN(max) || max <= 0) return setError('Max score must be positive.');
    if (criteria.length === 0) return setError('Add at least one criterion.');
    if (criteria.some(criterion => !criterion.name.trim())) return setError('All criteria need a name.');
    if (criteria.some(criterion => criterion.weight <= 0)) return setError('All criteria must have positive weights.');
    if (criteria.some(criterion => criterion.score < 0 || criterion.score > max)) return setError(`All scores must be between 0 and ${max}.`);
    if (!normaliseWeights && Math.abs(totalWeight - 100) > 0.001) return setError('When weight normalisation is off, weights must add to 100.');

    const r = calculateWeightedScoring(criteria, max, normaliseWeights);
    const rankedCriteria = [...r.criteria].sort((a, b) => a.rank - b.rank);

    setVisualData(r.criteria.map(c => ({ name: c.name, value: c.weightedScore })));

    setResult({
      summary: [
        { label: 'Weighted Score', value: `${r.weightedScore.toFixed(3)} / ${r.maxPossibleScore.toFixed(3)}`, highlight: true },
        { label: 'Percentage Score', value: `${r.percentageScore.toFixed(1)}%`, highlight: true },
        { label: 'Top Ranked Criterion', value: rankedCriteria[0]?.name || 'N/A' },
        ...rankedCriteria.map(criterion => ({
          label: `#${criterion.rank} ${criterion.name} (${(criterion.normalizedWeight * 100).toFixed(1)}% weight)`,
          value: `Score ${criterion.score} -> ${criterion.weightedScore.toFixed(3)}`,
        })),
      ],
      interpretation: `The overall weighted score is ${r.weightedScore.toFixed(2)} out of ${r.maxPossibleScore.toFixed(2)} (${r.percentageScore.toFixed(1)}%). ${r.interpretation}`,
      interpretationLevel: r.percentageScore >= 80 ? 'excellent' : r.percentageScore >= 60 ? 'good' : r.percentageScore >= 40 ? 'acceptable' : 'poor',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => {
    setCriteria(exampleCriteria);
    setMaxScore('10');
    setNormaliseWeights(true);
    setResult(null);
    setVisualData([]);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setCriteria([
      { name: 'Criterion 1', weight: 25, score: 5 },
      { name: 'Criterion 2', weight: 25, score: 5 },
    ]);
    setMaxScore('10');
    setNormaliseWeights(true);
    setVisualData([]);
  };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualData.length > 0 ? (
        <ResultSection
          title="Weighted Score Breakdown"
          visual={
            <BarChartResult
              data={visualData}
              xKey="name"
              yKey="value"
              barColor="#4f46e5"
            />
          }
          interpretation="The chart displays the contribution of each criterion to the final overall score, accounting for its weight."
        />
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-36">
            <label className="label">Max Score</label>
            <input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} className="input-field" min="1" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-3 cursor-pointer">
            <input type="checkbox" checked={normaliseWeights} onChange={e => setNormaliseWeights(e.target.checked)} className="accent-indigo-600" />
            Normalise weights
          </label>
          <p className="text-sm text-slate-500 pb-3">Scores should be between 0 and the max score.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="text-left pl-3" style={{ minWidth: 170 }}>Criterion Name</th>
                <th style={{ minWidth: 100 }}>Weight</th>
                <th style={{ minWidth: 110 }}>Score</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, index) => (
                <tr key={index}>
                  <td>
                    <input type="text" value={criterion.name} onChange={e => update(index, 'name', e.target.value)} className="w-full border-0 focus:ring-0 text-sm py-2 px-3 bg-transparent" />
                  </td>
                  <td>
                    <input type="number" value={criterion.weight} onChange={e => update(index, 'weight', e.target.value)} className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent" min="0" step="0.1" />
                  </td>
                  <td>
                    <input type="number" value={criterion.score} onChange={e => update(index, 'score', e.target.value)} className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent" min="0" max={maxScore} step="0.1" />
                  </td>
                  <td className="text-center p-1">
                    {criteria.length > 1 && (
                      <button onClick={() => removeCriterion(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addCriterion} className="btn-secondary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Criterion
        </button>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateZScore } from '../../utils/statistics';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('z-score')!;

export function ZScorePage() {
  const [rawScore, setRawScore] = useState('');
  const [mean, setMean] = useState('');
  const [standardDeviation, setStandardDeviation] = useState('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateZScore(Number(rawScore), Number(mean), Number(standardDeviation));
      setResult({
        summary: [
          { label: 'Z-Score', value: r.zScore.toFixed(4), highlight: true },
          { label: 'Interpretation', value: r.interpretation, highlight: true },
          { label: 'Raw Score', value: rawScore },
          { label: 'Mean', value: mean },
          { label: 'Standard Deviation', value: standardDeviation },
        ],
        interpretation: `The z-score is ${r.zScore.toFixed(3)}, which falls in the "${r.interpretation}" category.`,
        interpretationLevel: r.level,
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate z-score.');
    }
  };

  const handleExample = () => { setResult(null); setError(''); setRawScore('88'); setMean('78'); setStandardDeviation('12'); };
  const handleReset = () => { setResult(null); setError(''); setRawScore(''); setMean(''); setStandardDeviation(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Raw Score</label>
            <input type="number" value={rawScore} onChange={e => setRawScore(e.target.value)} className="input-field" placeholder="e.g. 88" step="0.01" />
          </div>
          <div>
            <label className="label">Mean</label>
            <input type="number" value={mean} onChange={e => setMean(e.target.value)} className="input-field" placeholder="e.g. 78" step="0.01" />
          </div>
          <div>
            <label className="label">Standard Deviation</label>
            <input type="number" value={standardDeviation} onChange={e => setStandardDeviation(e.target.value)} className="input-field" placeholder="e.g. 12" min="0.001" step="0.01" />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Z-Score</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateMeanConfidenceInterval, type ConfidenceLevel } from '../../utils/statistics';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('confidence-interval')!;

export function ConfidenceIntervalPage() {
  const [sampleMean, setSampleMean] = useState('');
  const [standardDeviation, setStandardDeviation] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>(95);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      if (!sampleMean.trim() || !standardDeviation.trim() || !sampleSize.trim()) {
        throw new Error('Please complete the sample mean, standard deviation, and sample size.');
      }
      const r = calculateMeanConfidenceInterval(
        Number(sampleMean),
        Number(standardDeviation),
        Number(sampleSize),
        confidenceLevel
      );
      setResult({
        summary: [
          { label: 'Lower Bound', value: r.lower.toFixed(4), highlight: true },
          { label: 'Upper Bound', value: r.upper.toFixed(4), highlight: true },
          { label: 'Margin of Error', value: `±${r.marginOfError.toFixed(4)}` },
          { label: 'Standard Error', value: r.standardError.toFixed(4) },
          { label: 'Critical Value', value: `t* = ${r.criticalValue.toFixed(3)}` },
          { label: 'Degrees of Freedom', value: String(r.degreesOfFreedom) },
          { label: 'Confidence Level', value: `${confidenceLevel}%` },
        ],
        interpretation: `The ${confidenceLevel}% confidence interval is [${r.lower.toFixed(3)}, ${r.upper.toFixed(3)}], with a margin of error of ±${r.marginOfError.toFixed(3)}.`,
        interpretationLevel: 'neutral',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate confidence interval.');
    }
  };

  const handleExample = () => { setResult(null); setError(''); setSampleMean('72.5'); setStandardDeviation('8.3'); setSampleSize('45'); setConfidenceLevel(95); };
  const handleReset = () => { setResult(null); setError(''); setSampleMean(''); setStandardDeviation(''); setSampleSize(''); setConfidenceLevel(95); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Sample Mean</label>
            <input type="number" value={sampleMean} onChange={e => setSampleMean(e.target.value)} className="input-field" placeholder="e.g. 72.5" step="0.01" />
          </div>
          <div>
            <label className="label">Standard Deviation</label>
            <input type="number" value={standardDeviation} onChange={e => setStandardDeviation(e.target.value)} className="input-field" placeholder="e.g. 8.3" min="0.001" step="0.01" />
          </div>
          <div>
            <label className="label">Sample Size</label>
            <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)} className="input-field" placeholder="e.g. 45" min="2" />
          </div>
          <div>
            <label className="label">Confidence Level</label>
            <select value={confidenceLevel} onChange={e => setConfidenceLevel(Number(e.target.value) as ConfidenceLevel)} className="input-field">
              {[90, 95, 99].map(level => <option key={level} value={level}>{level}%</option>)}
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate CI</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

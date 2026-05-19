import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateMarginOfError } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('margin-of-error')!;
const CONFIDENCE_LEVELS = ['90', '95', '99'];

export function MarginOfErrorPage() {
  const [sampleSize, setSampleSize] = useState('');
  const [population, setPopulation] = useState('');
  const [confidence, setConfidence] = useState('95');
  const [proportion, setProportion] = useState('50');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const n = parseInt(sampleSize);
    const populationSize = population ? parseInt(population) : undefined;
    const p = parseFloat(proportion);
    const cl = parseFloat(confidence);

    if (isNaN(n) || n < 1) return setError('Sample size must be a positive integer.');
    if (populationSize !== undefined && (isNaN(populationSize) || populationSize < 1)) return setError('Population size must be positive when provided.');
    if (isNaN(p) || p <= 0 || p >= 100) return setError('Proportion must be between 0 and 100%.');

    const r = calculateMarginOfError(n, cl, p, populationSize);
    setResult({
      summary: [
        { label: 'Margin of Error', value: `±${r.moePct.toFixed(2)}%`, highlight: true },
        { label: 'Lower Bound', value: `${Math.max(0, r.lowerBound).toFixed(2)}%` },
        { label: 'Upper Bound', value: `${Math.min(100, r.upperBound).toFixed(2)}%` },
        { label: 'Sample Size', value: n.toLocaleString() },
        ...(populationSize ? [{ label: 'Population Size', value: populationSize.toLocaleString() }] : []),
        ...(r.finitePopulationCorrection ? [{ label: 'Finite Population Correction', value: r.finitePopulationCorrection.toFixed(4) }] : []),
        { label: 'Confidence Level', value: `${confidence}%` },
        { label: 'Proportion', value: `${proportion}%` },
      ],
      interpretation: `The margin of error is ±${r.moePct.toFixed(2)} percentage points. At ${confidence}% confidence, a proportion of ${proportion}% would be reported between ${Math.max(0, r.lowerBound).toFixed(2)}% and ${Math.min(100, r.upperBound).toFixed(2)}%.`,
      interpretationLevel: r.moePct <= 3 ? 'excellent' : r.moePct <= 5 ? 'good' : r.moePct <= 10 ? 'acceptable' : 'warning',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => {
    setResult(null);
    setError('');
    setSampleSize('384');
    setPopulation('10000');
    setConfidence('95');
    setProportion('50');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setSampleSize('');
    setPopulation('');
    setConfidence('95');
    setProportion('50');
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Sample Size</label>
            <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)} className="input-field" placeholder="e.g. 384" min="1" />
          </div>
          <div>
            <label className="label">Population Size <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={population} onChange={e => setPopulation(e.target.value)} className="input-field" placeholder="Optional" min="1" />
          </div>
          <div>
            <label className="label">Confidence Level</label>
            <select value={confidence} onChange={e => setConfidence(e.target.value)} className="input-field">
              {CONFIDENCE_LEVELS.map(level => <option key={level} value={level}>{level}%</option>)}
            </select>
          </div>
          <div>
            <label className="label">Proportion (%)</label>
            <input type="number" value={proportion} onChange={e => setProportion(e.target.value)} className="input-field" placeholder="50" min="0.1" max="99.9" step="0.1" />
            <p className="text-xs text-slate-400 mt-1">Use 50% if the true proportion is unknown.</p>
          </div>
        </div>

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

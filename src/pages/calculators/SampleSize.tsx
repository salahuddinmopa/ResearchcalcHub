import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateSampleSize } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('sample-size')!;
const CONFIDENCE_LEVELS = ['90', '95', '99'];

export function SampleSizePage() {
  const [population, setPopulation] = useState('');
  const [confidence, setConfidence] = useState('95');
  const [moe, setMoe] = useState('5');
  const [proportion, setProportion] = useState('50');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const moeNum = parseFloat(moe);
    const propNum = parseFloat(proportion);
    const popNum = population ? parseInt(population) : undefined;

    if (popNum !== undefined && (isNaN(popNum) || popNum < 1)) return setError('Population size must be a positive number.');
    if (isNaN(moeNum) || moeNum <= 0 || moeNum >= 50) return setError('Margin of error must be between 0 and 50%.');
    if (isNaN(propNum) || propNum <= 0 || propNum >= 100) return setError('Expected proportion must be between 0 and 100%.');

    const r = calculateSampleSize(parseFloat(confidence), moeNum, propNum, popNum);
    const final = r.adjustedSampleSize ?? r.sampleSize;

    setResult({
      summary: [
        { label: 'Required Sample Size', value: final.toLocaleString(), highlight: true },
        { label: 'Unadjusted Sample Size', value: r.sampleSize.toLocaleString() },
        ...(r.adjustedSampleSize ? [{ label: 'Finite Population Corrected Size', value: r.adjustedSampleSize.toLocaleString() }] : []),
        { label: 'Confidence Level', value: `${confidence}%` },
        { label: 'Margin of Error', value: `±${moe}%` },
        { label: 'Expected Proportion', value: `${proportion}%` },
        ...(popNum ? [{ label: 'Population Size', value: popNum.toLocaleString() }] : []),
      ],
      interpretation: `A minimum of ${final.toLocaleString()} valid participants is required. ${r.adjustedSampleSize ? `Finite population correction reduced the required sample from ${r.sampleSize.toLocaleString()} to ${r.adjustedSampleSize.toLocaleString()}.` : 'No finite population correction was applied.'}`,
      interpretationLevel: 'neutral',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => {
    setResult(null);
    setError('');
    setPopulation('1000');
    setConfidence('95');
    setMoe('5');
    setProportion('50');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setPopulation('');
    setConfidence('95');
    setMoe('5');
    setProportion('50');
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Population Size</label>
            <input type="number" value={population} onChange={e => setPopulation(e.target.value)} className="input-field" placeholder="Optional, e.g. 1000" min="1" />
          </div>
          <div>
            <label className="label">Confidence Level</label>
            <select value={confidence} onChange={e => setConfidence(e.target.value)} className="input-field">
              {CONFIDENCE_LEVELS.map(level => <option key={level} value={level}>{level}%</option>)}
            </select>
          </div>
          <div>
            <label className="label">Margin of Error (%)</label>
            <input type="number" value={moe} onChange={e => setMoe(e.target.value)} className="input-field" placeholder="e.g. 5" min="0.1" max="49" step="0.1" />
          </div>
          <div>
            <label className="label">Expected Proportion (%)</label>
            <input type="number" value={proportion} onChange={e => setProportion(e.target.value)} className="input-field" placeholder="50" min="0.1" max="99.9" step="0.1" />
            <p className="text-xs text-slate-400 mt-1">Use 50% when the expected proportion is unknown.</p>
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

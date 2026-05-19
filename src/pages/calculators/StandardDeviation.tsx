import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { NumericInputBox } from '../../components/ui/NumericInputBox';
import { getCalculatorById } from '../../data/calculators';
import { calculateSpread, parseNumberList, type VarianceMode } from '../../utils/statistics';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('standard-deviation')!;

export function StandardDeviationPage() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<VarianceMode>('sample');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const parsed = parseNumberList(input);
    if (parsed.invalidTokens.length > 0) return setError(`Remove non-numeric value(s): ${parsed.invalidTokens.join(', ')}`);
    if (parsed.values.length < 2) return setError('Please enter at least two numbers.');

    const r = calculateSpread(parsed.values, mode);
    setResult({
      summary: [
        { label: `${mode === 'sample' ? 'Sample' : 'Population'} Standard Deviation`, value: r.standardDeviation.toFixed(6), highlight: true },
        { label: 'Mean', value: r.mean.toFixed(6) },
        { label: 'Variance', value: r.variance.toFixed(6) },
        { label: 'Count', value: r.count.toString() },
        { label: 'Divisor', value: mode === 'sample' ? 'n - 1' : 'N' },
      ],
      interpretation: `The ${mode} standard deviation is ${r.standardDeviation.toFixed(4)}, meaning values typically vary around the mean (${r.mean.toFixed(4)}) by about ${r.standardDeviation.toFixed(4)} units.`,
      interpretationLevel: 'neutral',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => { setResult(null); setError(''); setInput('12, 15, 18, 22, 19, 14, 21, 16, 13, 20'); };
  const handleReset = () => { setResult(null); setError(''); setInput(''); setMode('sample'); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {(['sample', 'population'] as const).map(option => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={mode === option} onChange={() => setMode(option)} className="accent-indigo-600" />
              <span className="text-sm font-medium text-slate-700 capitalize">{option} standard deviation</span>
              <span className="text-xs text-slate-400">({option === 'sample' ? 'n - 1' : 'N'})</span>
            </label>
          ))}
        </div>
        <NumericInputBox label="List of Numbers" value={input} onChange={setInput} minCount={2} />
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

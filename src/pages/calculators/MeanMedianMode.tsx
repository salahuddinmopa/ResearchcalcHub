import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { NumericInputBox } from '../../components/ui/NumericInputBox';
import { getCalculatorById } from '../../data/calculators';
import { calculateMeanMedianMode, parseNumberList } from '../../utils/statistics';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('mean-median-mode')!;

export function MeanMedianModePage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const parsed = parseNumberList(input);
    if (parsed.invalidTokens.length > 0) return setError(`Remove non-numeric value(s): ${parsed.invalidTokens.join(', ')}`);
    if (parsed.values.length < 1) return setError('Please enter at least one number.');

    const r = calculateMeanMedianMode(parsed.values);
    setResult({
      summary: [
        { label: 'Mean', value: r.mean.toFixed(4), highlight: true },
        { label: 'Median', value: r.median.toString(), highlight: true },
        { label: 'Mode', value: r.mode.join(', ') },
        { label: 'Count', value: r.count.toString() },
        { label: 'Minimum', value: r.min.toString() },
        { label: 'Maximum', value: r.max.toString() },
        { label: 'Range', value: r.range.toString() },
      ],
      interpretation: `The dataset contains ${r.count} value(s). The average value is ${r.mean.toFixed(3)}, with a median of ${r.median} and range of ${r.range}.`,
      interpretationLevel: 'neutral',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => { setResult(null); setError(''); setInput('23\t45\t12\t67\t34\n23\t89\t45\t12\t78\n34\t56\t23\t45\t67'); };
  const handleReset = () => { setResult(null); setError(''); setInput(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <NumericInputBox
          label="List of Numbers"
          value={input}
          onChange={setInput}
          placeholder="Paste from Excel, or enter numbers separated by spaces, commas, tabs, or new lines"
        />
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

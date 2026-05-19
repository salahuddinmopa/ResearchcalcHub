import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateLikertMean, type LikertItem } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('likert-scale')!;

const labelPresets: Record<number, string[]> = {
  3: ['Disagree', 'Neutral', 'Agree'],
  5: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  7: ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'],
};

const exampleItems: LikertItem[] = [
  { label: 'Teaching quality', frequencies: [2, 5, 8, 12, 8] },
  { label: 'Course resources', frequencies: [1, 3, 6, 15, 10] },
  { label: 'Assessment clarity', frequencies: [3, 7, 10, 8, 7] },
];

export function LikertScalePage() {
  const [scalePoints, setScalePoints] = useState(5);
  const [labels, setLabels] = useState<string[]>(labelPresets[5]);
  const [items, setItems] = useState<LikertItem[]>([{ label: 'Item 1', frequencies: new Array(5).fill(0) }]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const updateFrequency = (itemIndex: number, frequencyIndex: number, value: string) => {
    setItems(prev => prev.map((item, index) => {
      if (index !== itemIndex) return item;
      const frequencies = [...item.frequencies];
      frequencies[frequencyIndex] = parseInt(value) || 0;
      return { ...item, frequencies };
    }));
  };

  const updateLabel = (index: number, label: string) => {
    setItems(prev => prev.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item));
  };

  const handleScaleChange = (points: number) => {
    setScalePoints(points);
    setLabels(labelPresets[points] || Array.from({ length: points }, (_, index) => `Level ${index + 1}`));
    setItems(prev => prev.map(item => ({ ...item, frequencies: new Array(points).fill(0) })));
    setResult(null);
  };

  const addItem = () => setItems(prev => [...prev, { label: `Item ${prev.length + 1}`, frequencies: new Array(scalePoints).fill(0) }]);
  const removeItem = (index: number) => setItems(prev => prev.filter((_, itemIndex) => itemIndex !== index));

  const handleCalculate = () => {
    setError('');
    if (items.length === 0) return setError('Add at least one Likert item.');
    if (items.some(item => !item.label.trim())) return setError('Every item needs a label.');
    if (items.some(item => item.frequencies.some(frequency => frequency < 0))) return setError('Frequencies cannot be negative.');
    if (items.some(item => item.frequencies.reduce((sum, frequency) => sum + frequency, 0) === 0)) return setError('Each item must have at least one response.');

    const r = calculateLikertMean(items, scalePoints);
    setResult({
      summary: [
        { label: 'Weighted Mean', value: r.overallMean.toFixed(3), highlight: true },
        { label: 'Total Responses', value: r.totalResponses.toLocaleString(), highlight: true },
        { label: 'Agreement Level', value: r.interpretation },
        ...r.items.map(item => ({
          label: `${item.label} Mean`,
          value: `${item.mean.toFixed(3)} (SD ${item.sd.toFixed(3)}, n=${item.n})`,
        })),
      ],
      interpretation: `The weighted mean is ${r.overallMean.toFixed(2)} across ${r.totalResponses.toLocaleString()} responses on a ${scalePoints}-point Likert scale, indicating ${r.interpretation.toLowerCase()}.`,
      interpretationLevel: 'neutral',
      steps: r.steps,
      academicText: r.academicText,
    });
  };

  const handleExample = () => {
    setScalePoints(5);
    setLabels(labelPresets[5]);
    setItems(exampleItems);
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setLabels(labelPresets[scalePoints] || Array.from({ length: scalePoints }, (_, index) => `Level ${index + 1}`));
    setItems([{ label: 'Item 1', frequencies: new Array(scalePoints).fill(0) }]);
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <label className="label mb-0">Scale Points</label>
          {[3, 5, 7].map(points => (
            <label key={points} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="scale" checked={scalePoints === points} onChange={() => handleScaleChange(points)} className="accent-indigo-600" />
              <span className="text-sm text-slate-700">{points}-point</span>
            </label>
          ))}
        </div>

        <div>
          <label className="label">Optional Response Labels</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {labels.map((label, index) => (
              <input
                key={index}
                type="text"
                value={label}
                onChange={e => setLabels(prev => prev.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}
                className="input-field py-2 text-sm"
                placeholder={`Label ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="text-left pl-3" style={{ minWidth: 150 }}>Item</th>
                {Array.from({ length: scalePoints }, (_, index) => (
                  <th key={index} style={{ minWidth: 82 }}>
                    <span className="block text-indigo-700">{index + 1}</span>
                    <span className="block text-[10px] text-slate-400 font-normal leading-tight" style={{ maxWidth: 82, wordBreak: 'break-word' }}>
                      {labels[index] || `Level ${index + 1}`}
                    </span>
                  </th>
                ))}
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, itemIndex) => (
                <tr key={itemIndex}>
                  <td>
                    <input type="text" value={item.label} onChange={e => updateLabel(itemIndex, e.target.value)} className="w-full border-0 focus:ring-0 text-sm py-2 px-3 bg-transparent" />
                  </td>
                  {item.frequencies.map((frequency, frequencyIndex) => (
                    <td key={frequencyIndex}>
                      <input type="number" value={frequency === 0 ? '' : frequency} onChange={e => updateFrequency(itemIndex, frequencyIndex, e.target.value)} className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent" min="0" placeholder="0" />
                    </td>
                  ))}
                  <td className="text-center p-1">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(itemIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addItem} className="btn-secondary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
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

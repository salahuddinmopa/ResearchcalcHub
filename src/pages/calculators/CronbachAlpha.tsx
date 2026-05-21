import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateCronbachAlpha } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import ResultGauge from '../../components/visualizations/ResultGauge';

const calc = getCalculatorById('cronbach-alpha')!;

const ALPHA_SCALE = [
  { range: '< 0.60', label: 'Poor', color: 'text-red-700', bg: 'bg-red-50' },
  { range: '0.60-0.69', label: 'Questionable', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { range: '0.70-0.79', label: 'Acceptable', color: 'text-blue-700', bg: 'bg-blue-50' },
  { range: '0.80-0.89', label: 'Good', color: 'text-teal-700', bg: 'bg-teal-50' },
  { range: '>= 0.90', label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50' },
];

const exampleRows = [
  ['4', '3', '4', '3', '4'],
  ['5', '5', '4', '5', '5'],
  ['3', '3', '3', '2', '3'],
  ['4', '4', '5', '4', '4'],
  ['2', '2', '3', '2', '2'],
  ['5', '4', '4', '5', '5'],
  ['3', '4', '3', '3', '3'],
  ['4', '5', '5', '4', '4'],
];

export function CronbachAlphaPage() {
  const [itemLabels, setItemLabels] = useState(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');
  const [visualValue, setVisualValue] = useState<number | null>(null);
  const [visualInterpretation, setVisualInterpretation] = useState<string>('');
  const [visualCategory, setVisualCategory] = useState<'low' | 'medium' | 'high' | 'excellent' | undefined>(undefined);

  const getColourCategory = (val: number) => {
    if (val < 0.6) return 'low';
    if (val < 0.7) return 'medium';
    if (val < 0.8) return 'high';
    return 'excellent';
  };

  const syncItems = (count: number) => {
    const labels = Array.from({ length: count }, (_, index) => itemLabels[index] || `Item ${index + 1}`);
    setItemLabels(labels);
    setRows(prev => prev.map(row => Array.from({ length: count }, (_, index) => row[index] || '')));
  };

  const handleCalculate = () => {
    setError('');
    try {
      const data = rows.map(row => row.map(cell => Number(cell)));
      if (rows.some(row => row.some(cell => cell.trim() === ''))) {
        return setError('Cronbach\'s Alpha requires a complete data table. Please fill missing values or remove incomplete rows.');
      }
      if (data.some(row => row.some(value => !Number.isFinite(value)))) return setError('All survey item values must be numeric.');
      const r = calculateCronbachAlpha(data);
      // Update visual state
      setVisualValue(r.alpha);
      setVisualInterpretation(`Alpha = ${r.alpha.toFixed(3)}, indicating ${r.interpretation.toLowerCase()}.`);
      setVisualCategory(getColourCategory(r.alpha));
      setResult({
        summary: [
          { label: "Cronbach's Alpha", value: r.alpha.toFixed(4), highlight: true },
          { label: 'Interpretation', value: r.interpretation },
          { label: 'Number of Items', value: r.numItems.toString() },
          { label: 'Number of Respondents', value: r.numRespondents.toString() },
          { label: 'Sum of Item Variances', value: r.itemVariances.reduce((sum, value) => sum + value, 0).toFixed(4) },
          { label: 'Total Score Variance', value: r.totalVariance.toFixed(4) },
        ],
        interpretation: `Alpha = ${r.alpha.toFixed(3)}, indicating ${r.interpretation.toLowerCase()}.`,
        interpretationLevel: r.interpretationLevel as CalculatorResult['interpretationLevel'],
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate Cronbach\'s Alpha.');
    }
  };

  const handleExample = () => {
    setItemLabels(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
    setRows(exampleRows);
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setItemLabels(['Item 1', 'Item 2', 'Item 3']);
    setRows([
      ['', '', ''],
      ['', '', ''],
    ]);
  };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualValue !== null ? (
        <ResultSection
          title="Cronbach Alpha Result"
          visual={
            <ResultGauge
              value={visualValue}
              min={0}
              max={1}
              label="Cronbach's Alpha"
              colourCategory={visualCategory}
              interpretation={visualInterpretation}
            />
          }
          interpretation={visualInterpretation}
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ALPHA_SCALE.map(item => (
            <div key={item.label} className={`${item.bg} rounded-lg p-2 text-center`}>
              <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
              <div className="text-[10px] text-slate-500">{item.range}</div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          Rows are respondents. Columns are survey items. Missing values are rejected because alpha requires a complete numeric table.
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="label mb-0">Number of Items</label>
          {[3, 4, 5, 6, 7, 8].map(count => (
            <button
              key={count}
              type="button"
              onClick={() => syncItems(count)}
              className={`text-xs px-3 py-1.5 rounded-full border ${itemLabels.length === count ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {count}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Item Labels</label>
          <div className="flex flex-wrap gap-2">
            {itemLabels.map((label, index) => (
              <input
                key={index}
                value={label}
                onChange={event => setItemLabels(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                className="input-field w-32 py-2 text-sm"
              />
            ))}
          </div>
        </div>

        <TableInput
          headers={itemLabels}
          rows={rows}
          onRowsChange={setRows}
          rowHeaderLabel="Respondent"
          addRowLabel="Add Respondent"
          minRows={2}
          pastePlaceholder={'4\t3\t4\t3\n5\t5\t4\t5\n3\t3\t3\t2'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Alpha</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

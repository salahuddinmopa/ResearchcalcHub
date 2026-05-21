import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import type { CalculatorResult } from '../../types';
import { calculateFleissKappa } from '../../utils/calculations';
import ResultSection from '../../components/visualizations/ResultSection';
import ResultGauge from '../../components/visualizations/ResultGauge';

const calc = getCalculatorById('fleiss-kappa')!;

const exampleRows = [
  ['1', '1', '1'],
  ['0', '2', '1'],
  ['3', '0', '0'],
  ['2', '1', '0'],
  ['0', '0', '3'],
  ['1', '2', '0'],
];

export function FleissKappaPage() {
  const [numItems, setNumItems] = useState('6');
  const [numRaters, setNumRaters] = useState('3');
  const [categoryLabels, setCategoryLabels] = useState(['Category A', 'Category B', 'Category C']);
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');
  const [visualValue, setVisualValue] = useState<number | null>(null);
  const [visualInterpretation, setVisualInterpretation] = useState<string>('');
  const [visualCategory, setVisualCategory] = useState<'low' | 'medium' | 'high' | 'excellent' | undefined>(undefined);

  const getColourCategory = (val: number) => {
    if (val < 0.2) return 'low';
    if (val < 0.4) return 'medium';
    if (val < 0.6) return 'high';
    return 'excellent';
  };

const syncItems = (count: string) => {
  const newCount = Number(count);
  setRows(prev => prev.map(row => Array.from({ length: newCount }, (_, i) => row[i] || '')));
  setNumItems(String(newCount));
};

const syncCategories = (count: number) => {
  const newCount = Number(count);
  const labels = Array.from({ length: newCount }, (_, i) => categoryLabels[i] || `Category ${i + 1}`);
  setCategoryLabels(labels);
  setRows(prev => prev.map(row => Array.from({ length: newCount }, (_, i) => row[i] || '')));
};

  const handleCalculate = () => {
    setError('');
    try {
      const raters = parseInt(numRaters);
      const data = rows.map(row => row.map(cell => Number(cell || 0)));
      if (parseInt(numItems) !== rows.length) return setError('Number of items must match the category count table rows.');
      if (data.some(row => row.some(value => !Number.isFinite(value) || value < 0))) return setError('Category counts must be non-negative numbers.');
      const r = calculateFleissKappa(data, raters);
      // Update visual state
      setVisualValue(r.kappa);
      setVisualInterpretation(`Kappa = ${r.kappa.toFixed(3)}, indicating ${r.interpretation.toLowerCase()}.`);
      setVisualCategory(getColourCategory(r.kappa));
      setResult({
        summary: [
          { label: "Fleiss' Kappa", value: r.kappa.toFixed(4), highlight: true },
          { label: 'Agreement Interpretation', value: r.interpretation },
          { label: 'Items', value: rows.length.toLocaleString() },
          { label: 'Raters', value: raters.toLocaleString() },
          { label: 'Categories', value: categoryLabels.length.toLocaleString() },
          { label: 'Mean Subject Agreement', value: r.Pbar.toFixed(4) },
          { label: 'Expected Agreement', value: r.Pe.toFixed(4) },
        ],
        interpretation: `Fleiss' Kappa was ${r.kappa.toFixed(3)}, indicating ${r.interpretation.toLowerCase()}.`,
        interpretationLevel: r.interpretationLevel as CalculatorResult['interpretationLevel'],
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate Fleiss\' Kappa.');
    }
  };
  const handleExample = () => {
    setNumItems('6');
    setNumRaters('3');
    setCategoryLabels(['Category A', 'Category B', 'Category C']);
    setRows(exampleRows);
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setNumItems('2');
    setNumRaters('3');
    setCategoryLabels(['Category A', 'Category B', 'Category C']);
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
          title="Fleiss' Kappa Result"
          visual={
            <ResultGauge
              value={visualValue}
              min={-1}
              max={1}
              label="Fleiss' Kappa"
              colourCategory={visualCategory}
              interpretation={visualInterpretation}
            />
          }
          interpretation={visualInterpretation}
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          Each row is one item. Each column is one category. Every row sum must equal the number of raters.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Number of Items</label>
            <input type="number" value={numItems} onChange={event => syncItems(event.target.value)} className="input-field" min="2" />
          </div>
          <div>
            <label className="label">Number of Raters</label>
            <input type="number" value={numRaters} onChange={event => setNumRaters(event.target.value)} className="input-field" min="2" />
          </div>
          <div>
            <label className="label">Number of Categories</label>
            <select value={categoryLabels.length} onChange={event => syncCategories(parseInt(event.target.value))} className="input-field">
              {[2, 3, 4, 5, 6].map(count => <option key={count} value={count}>{count}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Category Labels</label>
          <div className="flex flex-wrap gap-2">
            {categoryLabels.map((label, index) => (
              <input
                key={index}
                value={label}
                onChange={event => setCategoryLabels(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                className="input-field w-36 py-2 text-sm"
              />
            ))}
          </div>
        </div>

        <TableInput
          headers={categoryLabels}
          rows={rows}
          onRowsChange={nextRows => {
            setRows(nextRows);
            setNumItems(String(nextRows.length));
          }}
          rowHeaderLabel="Item"
          addRowLabel="Add Item"
          minRows={2}
          pastePlaceholder={'1\t1\t1\n0\t2\t1\n3\t0\t0'}
          cellPlaceholder="0"
        />

        <p className="text-xs text-slate-500">
          Missing cells are treated as 0. Rows with totals different from {numRaters || 'the rater count'} will be rejected.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Fleiss' Kappa</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

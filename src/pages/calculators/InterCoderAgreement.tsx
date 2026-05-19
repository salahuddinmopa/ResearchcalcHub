import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateInterCoderAgreement, calculateMultiCoderAgreement } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('inter-coder-agreement')!;

const exampleRows = [
  ['Theme A', 'Theme A', 'Theme A'],
  ['Theme B', 'Theme B', 'Theme B'],
  ['Theme A', 'Theme B', 'Theme A'],
  ['Theme C', 'Theme C', 'Theme C'],
  ['Theme B', 'Theme B', 'Theme A'],
  ['Theme A', 'Theme A', 'Theme A'],
  ['Theme C', 'Theme C', 'Theme C'],
  ['Theme A', 'Theme A', 'Theme A'],
  ['Theme B', 'Theme A', 'Theme B'],
  ['Theme C', 'Theme C', 'Theme C'],
];

export function InterCoderAgreementPage() {
  const [coderCount, setCoderCount] = useState(3);
  const [coderLabels, setCoderLabels] = useState(['Coder 1', 'Coder 2', 'Coder 3']);
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [categoryLabels, setCategoryLabels] = useState('Theme A, Theme B, Theme C');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const syncCoders = (count: number) => {
    setCoderCount(count);
    const labels = Array.from({ length: count }, (_, index) => coderLabels[index] || `Coder ${index + 1}`);
    setCoderLabels(labels);
    setRows(prev => prev.map(row => Array.from({ length: count }, (_, index) => row[index] || '')));
  };

  const handleCalculate = () => {
    setError('');
    try {
      const r = coderCount === 2
        ? (() => {
          const completeRows = rows.map(row => [row[0] || '', row[1] || '']).filter(row => row[0].trim() && row[1].trim());
          if (completeRows.length === 0) throw new Error('No complete coded rows were found.');
          const twoCoderResult = calculateInterCoderAgreement(completeRows.map(row => row[0]), completeRows.map(row => row[1]));
          return {
            ...twoCoderResult,
            disagreements: twoCoderResult.total - twoCoderResult.agreements,
            skippedRows: rows.length - completeRows.length,
            coderCount: 2,
            categories: Array.from(new Set(completeRows.flat())).sort((a, b) => a.localeCompare(b)),
          };
        })()
        : calculateMultiCoderAgreement(rows.map(row => Array.from({ length: coderCount }, (_, index) => row[index] || '')));

      setResult({
        summary: [
          { label: 'Percentage Agreement', value: `${r.agreementPct.toFixed(2)}%`, highlight: true },
          { label: 'Agreement Count', value: `${r.agreements} / ${r.total}`, highlight: true },
          { label: 'Disagreement Count', value: r.disagreements.toString() },
          { label: 'Coder Columns', value: r.coderCount.toString() },
          { label: 'Rows Skipped for Missing Values', value: r.skippedRows.toString() },
          { label: 'Category Labels', value: r.categories.join(', ') || categoryLabels },
          { label: 'Interpretation', value: r.interpretation },
        ],
        interpretation: `${r.agreementPct.toFixed(1)}% agreement across ${r.coderCount} coder columns: ${r.interpretation}. ${r.skippedRows > 0 ? `${r.skippedRows} row(s) with missing values were excluded.` : 'No missing rows were excluded.'}`,
        interpretationLevel: r.interpretationLevel as CalculatorResult['interpretationLevel'],
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate inter-coder agreement.');
    }
  };

  const handleExample = () => {
    setCoderCount(3);
    setCoderLabels(['Coder 1', 'Coder 2', 'Coder 3']);
    setRows(exampleRows);
    setCategoryLabels('Theme A, Theme B, Theme C');
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setCoderCount(2);
    setCoderLabels(['Coder 1', 'Coder 2']);
    setRows([
      ['', ''],
      ['', ''],
    ]);
    setCategoryLabels('');
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          Enter one coded item per row. Rows with missing coder values are excluded and reported clearly.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Number of Coder Columns</label>
            <select value={coderCount} onChange={event => syncCoders(parseInt(event.target.value))} className="input-field">
              {[2, 3, 4, 5, 6].map(count => <option key={count} value={count}>{count}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Category Labels <span className="text-slate-400 font-normal">(optional)</span></label>
            <input value={categoryLabels} onChange={event => setCategoryLabels(event.target.value)} className="input-field" placeholder="Theme A, Theme B, Theme C" />
          </div>
        </div>

        <div>
          <label className="label">Coder Labels</label>
          <div className="flex flex-wrap gap-2">
            {coderLabels.map((label, index) => (
              <input
                key={index}
                value={label}
                onChange={event => setCoderLabels(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                className="input-field w-32 py-2 text-sm"
              />
            ))}
          </div>
        </div>

        <TableInput
          headers={coderLabels}
          rows={rows}
          onRowsChange={setRows}
          rowHeaderLabel="Item"
          addRowLabel="Add Coded Item"
          minRows={2}
          pastePlaceholder={'Theme A\tTheme A\tTheme A\nTheme B\tTheme B\tTheme A'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Agreement</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

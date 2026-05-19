import { useMemo, useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { buildCohenMatrixFromPairs, calculateCohensKappa, parseDelimitedTable } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('cohens-kappa')!;

const KAPPA_SCALE = [
  { range: '< 0.00', label: 'Poor', color: 'text-red-600', bg: 'bg-red-50' },
  { range: '0.00-0.20', label: 'Slight', color: 'text-orange-600', bg: 'bg-orange-50' },
  { range: '0.21-0.40', label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { range: '0.41-0.60', label: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-50' },
  { range: '0.61-0.80', label: 'Substantial', color: 'text-teal-600', bg: 'bg-teal-50' },
  { range: '0.81-1.00', label: 'Almost Perfect', color: 'text-green-600', bg: 'bg-green-50' },
];

const examplePairs = [
  ['Yes', 'Yes'],
  ['Yes', 'Yes'],
  ['Yes', 'No'],
  ['No', 'No'],
  ['No', 'No'],
  ['No', 'Yes'],
  ['Maybe', 'Maybe'],
  ['Maybe', 'Yes'],
  ['Yes', 'Yes'],
  ['No', 'No'],
];

export function CohensKappaPage() {
  const [inputMode, setInputMode] = useState<'raw' | 'matrix'>('raw');
  const [rawRows, setRawRows] = useState<string[][]>(examplePairs);
  const [matrixRows, setMatrixRows] = useState<string[][]>([
    ['20', '5'],
    ['10', '65'],
  ]);
  const [categoryLabels, setCategoryLabels] = useState(['Category A', 'Category B']);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const matrixHeaders = useMemo(() => categoryLabels.map(label => `Rater 2: ${label}`), [categoryLabels]);

  const syncMatrixSize = (size: number) => {
    const labels = Array.from({ length: size }, (_, index) => categoryLabels[index] || `Category ${index + 1}`);
    setCategoryLabels(labels);
    setMatrixRows(prev => Array.from({ length: size }, (_, row) => (
      Array.from({ length: size }, (_, col) => prev[row]?.[col] || '')
    )));
  };

  const parseMatrix = () => {
    const matrix = matrixRows.map(row => row.map(cell => Number(cell || 0)));
    if (matrix.length < 2 || matrix.some(row => row.length !== matrix.length)) {
      throw new Error('Manual table input must be a square category-by-category matrix.');
    }
    if (matrix.some(row => row.some(value => !Number.isFinite(value) || value < 0))) {
      throw new Error('Matrix values must be non-negative numbers.');
    }
    return { matrix, labels: categoryLabels, skippedRows: 0 };
  };

  const parseRawPairs = () => {
    const pairs = rawRows.map(row => [row[0] || '', row[1] || ''] as [string, string]);
    const { matrix, categories, skippedRows } = buildCohenMatrixFromPairs(pairs);
    if (categories.length < 2) throw new Error('Raw coding data must contain at least two complete categories.');
    return { matrix, labels: categories, skippedRows };
  };

  const handleCalculate = () => {
    setError('');
    try {
      const parsed = inputMode === 'raw' ? parseRawPairs() : parseMatrix();
      const r = calculateCohensKappa(parsed.matrix);
      setResult({
        summary: [
          { label: "Cohen's Kappa", value: r.kappa.toFixed(4), highlight: true },
          { label: 'Interpretation', value: r.interpretation },
          { label: 'Total Coded Items', value: r.totalItems.toLocaleString() },
          { label: 'Number of Categories', value: r.numCategories.toString() },
          { label: 'Observed Agreement', value: `${(r.observedAgreement * 100).toFixed(2)}%` },
          { label: 'Expected Agreement', value: `${(r.expectedAgreement * 100).toFixed(2)}%` },
          ...(parsed.skippedRows ? [{ label: 'Rows Skipped for Missing Values', value: parsed.skippedRows.toLocaleString() }] : []),
        ],
        interpretation: `Kappa = ${r.kappa.toFixed(3)}, indicating ${r.interpretation.toLowerCase()}. Observed agreement was ${(r.observedAgreement * 100).toFixed(1)}% and expected agreement was ${(r.expectedAgreement * 100).toFixed(1)}%.`,
        interpretationLevel: r.interpretationLevel as CalculatorResult['interpretationLevel'],
        steps: [
          `Categories analysed: ${parsed.labels.join(', ')}`,
          ...r.steps,
        ],
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate Cohen\'s Kappa.');
    }
  };

  const handleExample = () => {
    setInputMode('raw');
    setRawRows(examplePairs);
    setCategoryLabels(['Yes', 'No']);
    setMatrixRows([['20', '5'], ['10', '65']]);
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setInputMode('raw');
    setRawRows([['', ''], ['', '']]);
    setCategoryLabels(['Category A', 'Category B']);
    setMatrixRows([['', ''], ['', '']]);
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {KAPPA_SCALE.map(item => (
            <div key={item.label} className={`${item.bg} rounded-lg p-2 text-center`}>
              <div className={`text-xs font-bold ${item.color}`}>{item.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.range}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'raw', label: 'Raw Two-Column Coding Data' },
            { id: 'matrix', label: 'Manual Agreement Table' },
          ].map(mode => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setInputMode(mode.id as 'raw' | 'matrix')}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${inputMode === mode.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {inputMode === 'raw' ? (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Paste two columns from Excel: Rater 1 in the first column, Rater 2 in the second. Rows with missing values are excluded and reported.</p>
            <TableInput
              headers={['Rater 1', 'Rater 2']}
              rows={rawRows}
              onRowsChange={setRawRows}
              rowHeaderLabel="Item"
              addRowLabel="Add Item"
              minRows={2}
              pastePlaceholder={'Yes\tYes\nYes\tNo\nNo\tNo'}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="label mb-0">Categories</label>
              {[2, 3, 4, 5].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => syncMatrixSize(size)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${matrixRows.length === size ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryLabels.map((label, index) => (
                <input
                  key={index}
                  value={label}
                  onChange={event => setCategoryLabels(prev => prev.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  className="input-field w-36 py-2 text-sm"
                  placeholder={`Category ${index + 1}`}
                />
              ))}
            </div>
            <TableInput
              headers={matrixHeaders}
              rows={matrixRows}
              onRowsChange={setMatrixRows}
              rowHeaderLabel="Rater 1"
              addRowLabel="Add Matrix Row"
              minRows={2}
              pastePlaceholder={'20\t5\n10\t65'}
              cellPlaceholder="0"
            />
            <p className="text-xs text-slate-400">For matrix mode, keep the table square. Diagonal cells represent agreement.</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Kappa</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

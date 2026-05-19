import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateDelphiConsensus, type DelphiItem } from '../../utils/decisionTools';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('delphi-consensus')!;

const exampleRows = [
  ['AI adoption is critical for research efficiency', '5', '4', '5', '4', '5', '5', '4', '5'],
  ['Mixed methods improve research validity', '4', '5', '4', '5', '5', '4', '5', '4'],
  ['PhD programs need more data skills training', '3', '4', '2', '3', '4', '3', '3', '4'],
];

export function DelphiConsensusPage() {
  const [scaleMax, setScaleMax] = useState('5');
  const [threshold, setThreshold] = useState('1');
  const [expertCount, setExpertCount] = useState(8);
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const headers = ['Item', ...Array.from({ length: expertCount }, (_, index) => `Expert ${index + 1}`)];

  const syncExperts = (count: number) => {
    setExpertCount(count);
    setRows(prev => prev.map(row => [row[0] || '', ...Array.from({ length: count }, (_, index) => row[index + 1] || '')]));
  };

  const parseRows = (): DelphiItem[] => rows.map(row => ({
    label: row[0] || '',
    ratings: row.slice(1, expertCount + 1).filter(cell => cell !== '').map(Number),
  }));

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateDelphiConsensus(parseRows(), Number(scaleMax), Number(threshold));
      setResult({
        summary: [
          { label: 'Consensus Achieved', value: `${r.items.filter(item => item.consensus).length} / ${r.items.length}`, highlight: true },
          { label: 'Overall Consensus', value: r.overallConsensus ? 'Yes' : 'Not yet' },
          ...r.items.map((item, index) => ({
            label: `#${index + 1} ${item.label}`,
            value: `Mean ${item.mean.toFixed(2)}, Median ${item.median.toFixed(2)}, IQR ${item.iqr.toFixed(2)} - ${item.consensus ? 'Consensus' : 'No consensus'}`,
          })),
        ],
        interpretation: `${r.items.filter(item => item.consensus).length} of ${r.items.length} item(s) met the IQR threshold of ${threshold}.`,
        interpretationLevel: r.overallConsensus ? 'excellent' : 'acceptable',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate Delphi consensus.');
    }
  };

  const handleExample = () => { setScaleMax('5'); setThreshold('1'); setExpertCount(8); setRows(exampleRows); setResult(null); setError(''); };
  const handleReset = () => { setRows([['Statement 1', '', '', ''], ['Statement 2', '', '', '']]); setExpertCount(3); setScaleMax('5'); setThreshold('1'); setResult(null); setError(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Likert Scale Range</label>
            <select value={scaleMax} onChange={event => setScaleMax(event.target.value)} className="input-field">
              {[4, 5, 7, 9, 10].map(value => <option key={value} value={value}>1-{value}</option>)}
            </select>
          </div>
          <div>
            <label className="label">IQR Consensus Threshold</label>
            <input type="number" value={threshold} onChange={event => setThreshold(event.target.value)} className="input-field" min="0" step="0.25" />
          </div>
          <div>
            <label className="label">Number of Experts</label>
            <input type="number" value={expertCount} onChange={event => syncExperts(Math.max(3, Number(event.target.value) || 3))} className="input-field" min="3" />
          </div>
        </div>

        <TableInput
          headers={headers}
          rows={rows}
          onRowsChange={setRows}
          rowHeaderLabel="Item"
          addRowLabel="Add Item"
          pastePlaceholder={'Statement A\t5\t4\t5\t4\nStatement B\t3\t4\t3\t2'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Measure Consensus</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

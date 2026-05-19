import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateCapabilityScore, type CapabilityArea } from '../../utils/maturityScoring';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('capability-score')!;
const exampleRows = [['Research design', '3', '25'], ['Data analysis', '2.5', '30'], ['Governance', '2', '20'], ['Dissemination', '3.5', '25']];

export function CapabilityScorePage() {
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [normaliseWeights, setNormaliseWeights] = useState(true);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      const areas: CapabilityArea[] = rows.map(row => ({ name: row[0] || '', score: Number(row[1]), weight: Number(row[2]) }));
      const r = calculateCapabilityScore(areas, normaliseWeights);
      setResult({
        summary: [
          { label: 'Overall Capability Score', value: `${r.overallScore.toFixed(3)} / 4.000`, highlight: true },
          { label: 'Capability Category', value: `Level ${r.level}: ${r.category}`, highlight: true },
          { label: 'Strengths', value: r.strengths.map(area => area.name).join(', ') },
          { label: 'Weak Areas', value: r.weakAreas.map(area => area.name).join(', ') },
        ],
        interpretation: `Overall capability is Level ${r.level} (${r.category}). Strongest area: ${r.strengths[0]?.name}. Weakest area: ${r.weakAreas[0]?.name}.`,
        interpretationLevel: r.level >= 3 ? 'good' : r.level === 2 ? 'acceptable' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate capability score.');
    }
  };

  const handleExample = () => { setRows(exampleRows); setNormaliseWeights(true); setResult(null); setError(''); };
  const handleReset = () => { setRows([['Capability Area 1', '2', '100']]); setNormaliseWeights(true); setResult(null); setError(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={normaliseWeights} onChange={event => setNormaliseWeights(event.target.checked)} className="accent-indigo-600" />
          Automatically normalise weights
        </label>
        <TableInput headers={['Capability Area', 'Score (0-4)', 'Weight']} rows={rows} onRowsChange={setRows} rowHeaderLabel="Area" addRowLabel="Add Area" pastePlaceholder={'Research design\t3\t25\nData analysis\t2.5\t30'} />
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Capability</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

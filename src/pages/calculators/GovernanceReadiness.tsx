import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateGovernanceReadiness, type GovernanceDomain } from '../../utils/maturityScoring';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('governance-readiness')!;
const exampleRows = [['Policy governance', '3', '3', '2', '2', '3'], ['Data governance', '2', '3', '2', '2', '2'], ['Cyber governance', '3', '2', '2', '3', '2']];

export function GovernanceReadinessPage() {
  const [rows, setRows] = useState<string[][]>(exampleRows);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      const domains: GovernanceDomain[] = rows.map(row => ({ name: row[0] || '', policy: Number(row[1]), leadership: Number(row[2]), resources: Number(row[3]), monitoring: Number(row[4]), accountability: Number(row[5]) }));
      const r = calculateGovernanceReadiness(domains);
      setResult({
        summary: [
          { label: 'Governance Readiness Percentage', value: `${r.percentage.toFixed(1)}%`, highlight: true },
          { label: 'Readiness Level', value: r.level, highlight: true },
          ...r.domains.map(domain => ({ label: domain.name, value: `${domain.percentage.toFixed(1)}% readiness` })),
        ],
        interpretation: `Governance readiness is ${r.percentage.toFixed(1)}%, indicating ${r.level.toLowerCase()}.`,
        interpretationLevel: r.percentage >= 80 ? 'excellent' : r.percentage >= 60 ? 'good' : r.percentage >= 40 ? 'acceptable' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate governance readiness.');
    }
  };

  const handleExample = () => { setRows(exampleRows); setResult(null); setError(''); };
  const handleReset = () => { setRows([['Governance domain 1', '2', '2', '2', '2', '2']]); setResult(null); setError(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <TableInput headers={['Governance Domain', 'Policy', 'Leadership', 'Resources', 'Monitoring', 'Accountability']} rows={rows} onRowsChange={setRows} rowHeaderLabel="Domain" addRowLabel="Add Domain" pastePlaceholder={'Policy governance\t3\t3\t2\t2\t3'} />
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Readiness</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

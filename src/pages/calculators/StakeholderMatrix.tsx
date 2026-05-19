import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateStakeholderPriority, type StakeholderItem } from '../../utils/decisionTools';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('stakeholder-matrix')!;

const exampleRows = [
  ['Research Director', '5', '5'],
  ['Survey Participants', '2', '5'],
  ['University Ethics Board', '5', '2'],
  ['Library Staff', '2', '2'],
];

export function StakeholderMatrixPage() {
  const [rows, setRows] = useState<string[][]>([['Stakeholder 1', '3', '3']]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const parseRows = (): StakeholderItem[] => rows.map(row => ({
    name: row[0] || '',
    power: Number(row[1]),
    interest: Number(row[2]),
  }));

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateStakeholderPriority(parseRows());
      setResult({
        summary: [
          { label: 'Total Stakeholders', value: r.stakeholders.length.toString(), highlight: true },
          { label: 'Manage Closely', value: r.stakeholders.filter(item => item.group === 'Manage closely').length.toString() },
          { label: 'Keep Satisfied', value: r.stakeholders.filter(item => item.group === 'Keep satisfied').length.toString() },
          { label: 'Keep Informed', value: r.stakeholders.filter(item => item.group === 'Keep informed').length.toString() },
          { label: 'Monitor', value: r.stakeholders.filter(item => item.group === 'Monitor').length.toString() },
          ...r.stakeholders.map(item => ({ label: item.name, value: `${item.group} (priority ${item.priorityScore})` })),
        ],
        interpretation: `Highest priority stakeholder: ${r.stakeholders[0]?.name || 'N/A'} (${r.stakeholders[0]?.group || 'N/A'}).`,
        interpretationLevel: 'neutral',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate stakeholder priorities.');
    }
  };

  const handleExample = () => { setRows(exampleRows); setResult(null); setError(''); };
  const handleReset = () => { setRows([['Stakeholder 1', '3', '3']]); setResult(null); setError(''); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            ['Manage closely', 'High power, high interest'],
            ['Keep satisfied', 'High power, low interest'],
            ['Keep informed', 'Low power, high interest'],
            ['Monitor', 'Low power, low interest'],
          ].map(([group, meaning]) => (
            <div key={group} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <div className="text-xs font-bold text-slate-800">{group}</div>
              <div className="text-xs text-slate-500">{meaning}</div>
            </div>
          ))}
        </div>

        <TableInput
          headers={['Stakeholder Name', 'Power (1-5)', 'Interest (1-5)']}
          rows={rows}
          onRowsChange={setRows}
          rowHeaderLabel="Stakeholder"
          addRowLabel="Add Stakeholder"
          pastePlaceholder={'Research Director\t5\t5\nSurvey Participants\t2\t5'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Map Stakeholders</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

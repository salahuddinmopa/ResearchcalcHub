import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { TableInput } from '../../components/ui/TableInput';
import { getCalculatorById } from '../../data/calculators';
import { calculateRiskMatrix, type RiskItem } from '../../utils/decisionTools';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import PieChartResult from '../../components/visualizations/PieChartResult';

const calc = getCalculatorById('risk-matrix')!;

const exampleRows = [
  ['Low participation rate', '4', '4'],
  ['Data quality issues', '3', '5'],
  ['Time overrun', '3', '3'],
  ['Budget constraints', '2', '4'],
];

const categoryColor: Record<string, string> = {
  Low: 'bg-green-100 text-green-800 border-green-300',
  Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  High: 'bg-orange-100 text-orange-800 border-orange-300',
  Critical: 'bg-red-100 text-red-800 border-red-300',
};

export function RiskMatrixPage() {
  const [rows, setRows] = useState<string[][]>([['', '3', '3']]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const [visualData, setVisualData] = useState<{name: string, value: number}[]>([]);
  const [visualColors, setVisualColors] = useState<string[]>([]);

  const parseRows = (): RiskItem[] => rows.map(row => ({
    name: row[0] || '',
    likelihood: Number(row[1]),
    impact: Number(row[2]),
  }));

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateRiskMatrix(parseRows());
      
      const vData: {name: string, value: number}[] = [];
      const vColors: string[] = [];
      if (r.summary.Critical > 0) { vData.push({ name: 'Critical', value: r.summary.Critical }); vColors.push('#ef4444'); }
      if (r.summary.High > 0) { vData.push({ name: 'High', value: r.summary.High }); vColors.push('#f97316'); }
      if (r.summary.Moderate > 0) { vData.push({ name: 'Moderate', value: r.summary.Moderate }); vColors.push('#eab308'); }
      if (r.summary.Low > 0) { vData.push({ name: 'Low', value: r.summary.Low }); vColors.push('#22c55e'); }
      setVisualData(vData);
      setVisualColors(vColors);

      setResult({
        summary: [
          { label: 'Total Risks Assessed', value: r.risks.length.toString(), highlight: true },
          { label: 'Critical Risks', value: r.summary.Critical.toString(), highlight: r.summary.Critical > 0 },
          { label: 'High Risks', value: r.summary.High.toString() },
          { label: 'Moderate Risks', value: r.summary.Moderate.toString() },
          { label: 'Low Risks', value: r.summary.Low.toString() },
          ...r.risks.map(risk => ({
            label: risk.name,
            value: `Score ${risk.score} - ${risk.category}; ${risk.strategy}`,
          })),
        ],
        interpretation: r.summary.Critical > 0
          ? 'Critical risks were identified and require immediate response planning.'
          : r.summary.High > 0
            ? 'High risks were identified and should be actively mitigated.'
            : 'No high or critical risks were identified. Continue monitoring moderate and low risks.',
        interpretationLevel: r.summary.Critical > 0 ? 'poor' : r.summary.High > 0 ? 'warning' : r.summary.Moderate > 0 ? 'acceptable' : 'excellent',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate risk matrix.');
    }
  };

  const handleExample = () => { setRows(exampleRows); setResult(null); setVisualData([]); setError(''); };
  const handleReset = () => { setRows([['', '3', '3']]); setResult(null); setVisualData([]); setError(''); };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualData.length > 0 ? (
        <ResultSection
          title="Risk Profile Summary"
          visual={
            <PieChartResult
              data={visualData}
              colors={visualColors}
            />
          }
          interpretation="The chart displays the distribution of identified risks across severity levels."
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ['Low', '1-4'],
            ['Moderate', '5-9'],
            ['High', '10-16'],
            ['Critical', '17-25'],
          ].map(([label, range]) => (
            <div key={label} className={`${categoryColor[label]} border rounded-lg px-3 py-2 text-center`}>
              <div className="text-xs font-bold">{label}</div>
              <div className="text-xs opacity-70">{range}</div>
            </div>
          ))}
        </div>

        <TableInput
          headers={['Risk Name', 'Likelihood (1-5)', 'Impact (1-5)']}
          rows={rows}
          onRowsChange={setRows}
          rowHeaderLabel="Risk"
          addRowLabel="Add Risk"
          pastePlaceholder={'Low participation rate\t4\t4\nData quality issues\t3\t5'}
        />

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Assess Risks</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

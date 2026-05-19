import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { MaturityChart } from '../../components/ui/MaturityChart';
import { getCalculatorById } from '../../data/calculators';
import { calculateMiniMaturity, type SimpleMaturityDomain } from '../../utils/maturityScoring';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('ai-governance-readiness')!;
const domains = ['AI policy', 'Human oversight', 'Data governance', 'Transparency', 'Accountability', 'Risk monitoring', 'Cybersecurity integration'];

export function AIGovernanceReadinessPage() {
  const [scores, setScores] = useState<Record<string, string>>({
    'AI policy': '2',
    'Human oversight': '2',
    'Data governance': '2',
    Transparency: '1.5',
    Accountability: '2',
    'Risk monitoring': '1',
    'Cybersecurity integration': '2',
  });
  const [chartItems, setChartItems] = useState<SimpleMaturityDomain[]>([]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    try {
      const domainScores = domains.map(name => ({ name, score: Number(scores[name]) }));
      const r = calculateMiniMaturity(domainScores, 'AI governance');
      setChartItems(domainScores);
      setResult({
        summary: [
          { label: 'AI Governance Readiness Score', value: `${r.percentage.toFixed(1)}%`, highlight: true },
          { label: 'Readiness Level', value: `Level ${r.level}: ${r.levelName}`, highlight: true },
          { label: 'Suggested Next Steps', value: r.improvementAreas.map(area => `Improve ${area.name}`).join('; ') || 'Maintain and monitor current controls' },
          ...r.domains.map(domain => ({ label: domain.name, value: `${domain.score} / 4` })),
        ],
        interpretation: `AI governance readiness is ${r.percentage.toFixed(1)}%, corresponding to Level ${r.level} (${r.levelName}).`,
        interpretationLevel: r.level >= 3 ? 'good' : r.level === 2 ? 'acceptable' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate AI governance readiness.');
    }
  };

  const handleExample = () => { setScores({ 'AI policy': '2', 'Human oversight': '2', 'Data governance': '2', Transparency: '1.5', Accountability: '2', 'Risk monitoring': '1', 'Cybersecurity integration': '2' }); setResult(null); setError(''); setChartItems([]); };
  const handleReset = () => { setScores(Object.fromEntries(domains.map(name => [name, '2']))); setResult(null); setError(''); setChartItems([]); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {domains.map(domain => (
            <div key={domain}>
              <label className="label">{domain}</label>
              <input type="number" value={scores[domain] || '0'} onChange={event => setScores(prev => ({ ...prev, [domain]: event.target.value }))} min="0" max="4" step="0.5" className="input-field" />
            </div>
          ))}
        </div>
        {chartItems.length > 0 && <MaturityChart items={chartItems} />}
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate AI Readiness</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

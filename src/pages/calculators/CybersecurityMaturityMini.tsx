import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { MaturityChart } from '../../components/ui/MaturityChart';
import { getCalculatorById } from '../../data/calculators';
import { calculateMiniMaturity, type SimpleMaturityDomain } from '../../utils/maturityScoring';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('cybersecurity-maturity-mini')!;
const baseDomains = ['Governance', 'Risk management', 'Asset protection', 'Threat detection', 'Incident response', 'Recovery'];

export function CybersecurityMaturityMiniPage() {
  const [includeAI, setIncludeAI] = useState(true);
  const [scores, setScores] = useState<Record<string, string>>({
    Governance: '2',
    'Risk management': '2',
    'Asset protection': '3',
    'Threat detection': '2',
    'Incident response': '2',
    Recovery: '1',
    'AI oversight': '1',
  });
  const [chartItems, setChartItems] = useState<SimpleMaturityDomain[]>([]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const domains = includeAI ? [...baseDomains, 'AI oversight'] : baseDomains;

  const handleCalculate = () => {
    setError('');
    try {
      const domainScores = domains.map(name => ({ name, score: Number(scores[name]) }));
      const r = calculateMiniMaturity(domainScores, 'Cybersecurity maturity');
      setChartItems(domainScores);
      setResult({
        summary: [
          { label: 'Overall Cybersecurity Maturity Score', value: `${r.overallScore.toFixed(3)} / 4.000`, highlight: true },
          { label: 'Overall Maturity Level', value: `Level ${r.level}: ${r.levelName}`, highlight: true },
          { label: 'Suggested Improvement Areas', value: r.improvementAreas.map(area => area.name).join(', ') || 'None' },
          ...r.domains.map(domain => ({ label: domain.name, value: `${domain.score} / 4` })),
        ],
        interpretation: `Cybersecurity maturity is Level ${r.level} (${r.levelName}). Priority improvement areas: ${r.improvementAreas.map(area => area.name).join(', ') || 'maintain current strengths'}.`,
        interpretationLevel: r.level >= 3 ? 'good' : r.level === 2 ? 'acceptable' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate cybersecurity maturity.');
    }
  };

  const handleExample = () => { setIncludeAI(true); setScores({ Governance: '2', 'Risk management': '2', 'Asset protection': '3', 'Threat detection': '2', 'Incident response': '2', Recovery: '1', 'AI oversight': '1' }); setResult(null); setError(''); setChartItems([]); };
  const handleReset = () => { setIncludeAI(false); setScores(Object.fromEntries([...baseDomains, 'AI oversight'].map(name => [name, '2']))); setResult(null); setError(''); setChartItems([]); };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={includeAI} onChange={event => setIncludeAI(event.target.checked)} className="accent-indigo-600" />
          Include AI oversight domain
        </label>
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
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Cyber Maturity</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { MaturityChart } from '../../components/ui/MaturityChart';
import { getCalculatorById } from '../../data/calculators';
import { calculateMaturityModel, maturityLevelNames, type MaturityDomain } from '../../utils/maturityScoring';
import type { CalculatorResult } from '../../types';
import ResultSection from '../../components/visualizations/ResultSection';
import RadarChartResult from '../../components/visualizations/RadarChartResult';

const calc = getCalculatorById('maturity-model')!;
const levelColors = ['bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700'];

const exampleDomains: MaturityDomain[] = [
  { name: 'Governance', weight: 30, factors: [{ name: 'Policy framework', score: 3, weight: 40 }, { name: 'Accountability', score: 2.5, weight: 30 }, { name: 'Monitoring', score: 2, weight: 30 }] },
  { name: 'Cybersecurity', weight: 25, factors: [{ name: 'Asset protection', score: 3, weight: 50 }, { name: 'Incident response', score: 2, weight: 50 }] },
  { name: 'Research Capability', weight: 25, factors: [{ name: 'Method documentation', score: 3, weight: 60 }, { name: 'Data quality', score: 2, weight: 40 }] },
  { name: 'Education & Training', weight: 20, factors: [{ name: 'Staff capability', score: 2, weight: 50 }, { name: 'Learning resources', score: 3, weight: 50 }] },
];

export function MaturityModelPage() {
  const [domains, setDomains] = useState<MaturityDomain[]>(exampleDomains);
  const [normaliseWeights, setNormaliseWeights] = useState(true);
  const [openDomains, setOpenDomains] = useState<number[]>([0, 1, 2, 3]);
  const [chartItems, setChartItems] = useState<{ name: string; score: number }[]>([]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const updateDomain = (index: number, field: 'name' | 'weight', value: string) => {
    setDomains(prev => prev.map((domain, itemIndex) => itemIndex === index ? { ...domain, [field]: field === 'name' ? value : Number(value) } : domain));
  };

  const updateFactor = (domainIndex: number, factorIndex: number, field: 'name' | 'score' | 'weight', value: string) => {
    setDomains(prev => prev.map((domain, itemIndex) => itemIndex !== domainIndex ? domain : {
      ...domain,
      factors: domain.factors.map((factor, currentFactorIndex) => currentFactorIndex === factorIndex
        ? { ...factor, [field]: field === 'name' ? value : Number(value) }
        : factor),
    }));
  };

  const addDomain = () => {
    setDomains(prev => [...prev, { name: `Domain ${prev.length + 1}`, weight: 10, factors: [{ name: 'Factor 1', score: 2, weight: 100 }] }]);
    setOpenDomains(prev => [...prev, domains.length]);
  };

  const removeDomain = (index: number) => {
    setDomains(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    setOpenDomains(prev => prev.filter(item => item !== index));
  };

  const addFactor = (domainIndex: number) => {
    setDomains(prev => prev.map((domain, itemIndex) => itemIndex !== domainIndex ? domain : {
      ...domain,
      factors: [...domain.factors, { name: `Factor ${domain.factors.length + 1}`, score: 2, weight: 10 }],
    }));
  };

  const removeFactor = (domainIndex: number, factorIndex: number) => {
    setDomains(prev => prev.map((domain, itemIndex) => itemIndex !== domainIndex ? domain : {
      ...domain,
      factors: domain.factors.filter((_, currentFactorIndex) => currentFactorIndex !== factorIndex),
    }));
  };

  const handleCalculate = () => {
    setError('');
    try {
      const r = calculateMaturityModel(domains, normaliseWeights);
      setChartItems(r.domains.map(domain => ({ name: domain.name, score: domain.score })));
      setResult({
        summary: [
          { label: 'Overall Maturity Score', value: `${r.overallScore.toFixed(3)} / 4.000`, highlight: true },
          { label: 'Overall Maturity Level', value: `Level ${r.level}: ${r.levelName}`, highlight: true },
          ...r.domains.map(domain => ({ label: domain.name, value: `${domain.score.toFixed(3)} -> Level ${domain.level}: ${domain.levelName}` })),
          ...r.domains.flatMap(domain => domain.factors.map(factor => ({ label: `${domain.name}: ${factor.name}`, value: `${factor.score} / 4` }))),
        ],
        interpretation: `Overall maturity is Level ${r.level} (${r.levelName}). Weakest domain: ${r.weakestDomains[0]?.name || 'N/A'} (${r.weakestDomains[0]?.score.toFixed(2) || 'N/A'}).`,
        interpretationLevel: r.level >= 3 ? 'good' : r.level === 2 ? 'acceptable' : 'warning',
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate maturity model score.');
    }
  };

  const handleExample = () => { setDomains(exampleDomains); setOpenDomains([0, 1, 2, 3]); setNormaliseWeights(true); setResult(null); setError(''); setChartItems([]); };
  const handleReset = () => { setDomains([{ name: 'Domain 1', weight: 100, factors: [{ name: 'Factor 1', score: 2, weight: 100 }] }]); setOpenDomains([0]); setNormaliseWeights(true); setResult(null); setError(''); setChartItems([]); };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={chartItems.length > 0 ? (
        <ResultSection
          title="Maturity Profile"
          visual={
            <RadarChartResult 
              data={chartItems.map(item => ({ category: item.name, value: item.score }))} 
              title="" 
            />
          }
          interpretation="The radar chart visualises maturity scores across assessed domains. Larger area indicates higher overall maturity."
        />
      ) : undefined}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-5 gap-1.5">
          {maturityLevelNames.map((name, index) => (
            <div key={name} className={`${levelColors[index]} rounded-lg p-2 text-center`}>
              <div className="text-xs font-bold">Level {index}</div>
              <div className="text-[10px] mt-0.5 leading-tight">{name}</div>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={normaliseWeights} onChange={event => setNormaliseWeights(event.target.checked)} className="accent-indigo-600" />
          Automatically normalise weights
        </label>

        <div className="space-y-3">
          {domains.map((domain, domainIndex) => (
            <div key={domainIndex} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <button onClick={() => setOpenDomains(prev => prev.includes(domainIndex) ? prev.filter(item => item !== domainIndex) : [...prev, domainIndex])} className="p-1 hover:bg-slate-200 rounded-lg">
                  {openDomains.includes(domainIndex) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <input value={domain.name} onChange={event => updateDomain(domainIndex, 'name', event.target.value)} className="flex-1 bg-transparent border-0 focus:ring-0 font-semibold text-slate-800 text-sm" />
                <span className="text-xs text-slate-500">Domain weight</span>
                <input type="number" value={domain.weight} onChange={event => updateDomain(domainIndex, 'weight', event.target.value)} className="input-field w-20 py-1 text-sm text-center" />
                {domains.length > 1 && <button onClick={() => removeDomain(domainIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}
              </div>
              {openDomains.includes(domainIndex) && (
                <div className="p-4 space-y-2">
                  <table className="data-table w-full text-sm rounded-xl overflow-hidden">
                    <thead>
                      <tr>
                        <th className="text-left pl-3">Factor Name</th>
                        <th>Score (0-4)</th>
                        <th>Factor Weight</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {domain.factors.map((factor, factorIndex) => (
                        <tr key={factorIndex}>
                          <td><input value={factor.name} onChange={event => updateFactor(domainIndex, factorIndex, 'name', event.target.value)} className="w-full border-0 focus:ring-0 text-sm py-2 px-3 bg-transparent" /></td>
                          <td><input type="number" value={factor.score} onChange={event => updateFactor(domainIndex, factorIndex, 'score', event.target.value)} min="0" max="4" step="0.5" className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent" /></td>
                          <td><input type="number" value={factor.weight} onChange={event => updateFactor(domainIndex, factorIndex, 'weight', event.target.value)} min="0" className="w-full border-0 focus:ring-0 text-center text-sm py-2 px-1 bg-transparent" /></td>
                          <td className="text-center p-1">{domain.factors.length > 1 && <button onClick={() => removeFactor(domainIndex, factorIndex)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => addFactor(domainIndex)} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"><Plus className="w-3.5 h-3.5" /> Add Factor</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addDomain} className="btn-secondary text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add Domain</button>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Maturity Score</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

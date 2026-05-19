import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { calculateResponseRate } from '../../utils/calculations';
import type { CalculatorResult } from '../../types';

const calc = getCalculatorById('survey-response-rate')!;

export function SurveyResponseRatePage() {
  const [sent, setSent] = useState('');
  const [returned, setReturned] = useState('');
  const [ineligible, setIneligible] = useState('0');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    const s = parseInt(sent);
    const r = parseInt(returned);
    const i = parseInt(ineligible) || 0;

    if (isNaN(s) || s < 1) return setError('Survey invitations sent must be a positive integer.');
    if (isNaN(r) || r < 0) return setError('Valid responses received must be a non-negative integer.');
    if (i < 0) return setError('Ineligible invitations cannot be negative.');
    if (s - i <= 0) return setError('Eligible invitations must be greater than zero.');
    if (r > s - i) return setError('Valid responses cannot exceed eligible invitations.');

    const res = calculateResponseRate(s, r, i);
    const rate = res.responseRate;
    setResult({
      summary: [
        { label: 'Response Rate', value: `${rate.toFixed(2)}%`, highlight: true },
        { label: 'Interpretation', value: res.interpretationLabel, highlight: true },
        { label: 'Survey Invitations Sent', value: s.toLocaleString() },
        { label: 'Ineligible Invitations', value: i.toLocaleString() },
        { label: 'Eligible Invitations', value: res.eligibleSent.toLocaleString() },
        { label: 'Valid Responses Received', value: r.toLocaleString() },
        { label: 'Non-respondents', value: (res.eligibleSent - r).toLocaleString() },
      ],
      interpretation: res.interpretation,
      interpretationLevel: rate >= 70 ? 'excellent' : rate >= 50 ? 'good' : rate >= 30 ? 'acceptable' : 'warning',
      steps: res.steps,
      academicText: res.academicText,
    });
  };

  const handleExample = () => {
    setResult(null);
    setError('');
    setSent('200');
    setReturned('134');
    setIneligible('10');
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setSent('');
    setReturned('');
    setIneligible('0');
  };

  return (
    <CalculatorLayout calculator={calc} result={result}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Survey Invitations Sent</label>
            <input type="number" value={sent} onChange={e => setSent(e.target.value)} className="input-field" placeholder="e.g. 200" min="1" />
          </div>
          <div>
            <label className="label">Valid Responses Received</label>
            <input type="number" value={returned} onChange={e => setReturned(e.target.value)} className="input-field" placeholder="e.g. 134" min="0" />
          </div>
          <div>
            <label className="label">Ineligible Invitations <span className="text-slate-400 font-normal">(optional)</span></label>
            <input type="number" value={ineligible} onChange={e => setIneligible(e.target.value)} className="input-field" placeholder="0" min="0" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

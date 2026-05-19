import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { getCybersecurityCalculator, type CyberCalculatorConfig } from '../../utils/cybersecurity';
import type { CalculatorResult } from '../../types';

interface Props {
  calculatorId?: string;
}

function getInitialValues(config: CyberCalculatorConfig, useExample = false) {
  return config.fields.reduce<Record<string, string>>((values, field) => {
    values[field.key] = useExample
      ? config.example[field.key] || field.options?.[0]?.value || ''
      : field.options?.[0]?.value || '';
    return values;
  }, {});
}

export function CybersecurityCalculatorPage({ calculatorId }: Props) {
  const { slug } = useParams();
  const config = getCybersecurityCalculator(calculatorId || slug);
  const calculator = config ? getCalculatorById(config.id) : undefined;
  const initialValues = useMemo(() => (config ? getInitialValues(config) : {}), [config]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  if (!config || !calculator) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Calculator not found</h1>
          <p className="text-sm text-slate-600 mb-5">This calculator is not available yet.</p>
          <Link to="/calculators" className="btn-primary inline-flex">Browse calculators</Link>
        </div>
      </div>
    );
  }

  const calculate = () => {
    setError('');
    try {
      const calculation = config.calculate(values);
      setResult({ ...calculation, interpretationLevel: 'warning' });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Please check the input values.');
    }
  };

  return (
    <CalculatorLayout calculator={calculator} result={result}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-red-900 leading-relaxed">{config.explanation}</p>
              <p className="text-xs text-red-700">Educational and preliminary only. These calculators do not replace professional cybersecurity audits, assurance reviews, or incident response advice.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.fields.map(field => (
            <div key={field.key} className={field.type === 'password' ? 'sm:col-span-2' : ''}>
              <label className="label">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={values[field.key] || field.options?.[0]?.value || ''}
                  onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}
                  className="input-field"
                >
                  {field.options?.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'password' ? 'text' : 'number'}
                  value={values[field.key] || ''}
                  onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}
                  className="input-field"
                  step="any"
                  autoComplete="off"
                />
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={calculate} className="btn-primary flex-1 sm:flex-none">Calculate</button>
          <button type="button" onClick={() => { setValues(getInitialValues(config, true)); setResult(null); setError(''); }} className="btn-secondary">Load Example</button>
          <button type="button" onClick={() => { setValues(getInitialValues(config)); setResult(null); setError(''); }} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

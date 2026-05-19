import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { getCalculatorById } from '../../data/calculators';
import { getPracticalCalculator, type PracticalCalculatorConfig } from '../../utils/practicalCalculators';
import type { CalculatorResult } from '../../types';

interface Props {
  calculatorId?: string;
}

function getInitialValues(config: PracticalCalculatorConfig, useExample = false) {
  return config.fields.reduce<Record<string, string>>((values, field) => {
    values[field.key] = useExample
      ? config.example[field.key] || field.options?.[0]?.value || ''
      : field.options?.[0]?.value || '';
    return values;
  }, {});
}

export function PracticalCalculatorPage({ calculatorId }: Props) {
  const { slug } = useParams();
  const config = getPracticalCalculator(calculatorId || slug);
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

  const handleCalculate = () => {
    setError('');
    try {
      const calculation = config.calculate(values);
      setResult({ ...calculation, interpretationLevel: 'neutral' });
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Please check the input values.');
    }
  };

  const handleExample = () => {
    setValues(getInitialValues(config, true));
    setResult(null);
    setError('');
  };

  const handleReset = () => {
    setValues(getInitialValues(config));
    setResult(null);
    setError('');
  };

  return (
    <CalculatorLayout calculator={calculator} result={result}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-sm text-teal-900 leading-relaxed">{config.explanation}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.fields.map(field => (
            <div key={field.key}>
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
                <div className="relative">
                  <input
                    type={field.type || 'number'}
                    value={values[field.key] || ''}
                    onChange={event => setValues(current => ({ ...current, [field.key]: event.target.value }))}
                    className={`input-field ${field.unit ? 'pr-16' : ''}`}
                    step={field.type ? undefined : 'any'}
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                      {field.unit}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate</button>
          <button type="button" onClick={handleExample} className="btn-secondary">Load Example</button>
          <button type="button" onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>
    </CalculatorLayout>
  );
}

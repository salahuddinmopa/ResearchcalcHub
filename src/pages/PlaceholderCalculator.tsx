import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Construction, Sparkles } from 'lucide-react';
import { calculators } from '../data/calculators';
import { FormulaBox } from '../components/ui/FormulaBox';
import { CalculatorCard } from '../components/ui/CalculatorCard';

export function PlaceholderCalculatorPage() {
  const { slug } = useParams();
  const calculator = calculators.find(item => item.slug === slug || item.id === slug || item.path.endsWith(`/${slug}`));

  if (!calculator) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Calculator not found</h1>
          <p className="text-slate-600 mb-5">This calculator is not in the metadata yet.</p>
          <Link to="/calculators" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to calculators
          </Link>
        </div>
      </div>
    );
  }

  const related = calculator.relatedCalculators
    .map(id => calculators.find(item => item.id === id))
    .filter(Boolean) as typeof calculators;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <Link to="/calculators" className="text-sm text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 mb-5">
            <ArrowLeft className="w-4 h-4" />
            Back to calculators
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge bg-indigo-100 text-indigo-700">{calculator.category}</span>
            <span className="badge bg-slate-100 text-slate-600">{calculator.difficulty}</span>
            <span className="badge bg-amber-100 text-amber-700">Placeholder</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{calculator.name}</h1>
          <p className="text-slate-600 leading-relaxed max-w-3xl">{calculator.longDescription || calculator.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Construction className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Calculator layout ready</h2>
                  <p className="text-slate-600 leading-relaxed">
                    This placeholder preserves the page structure for future tools. Input fields, calculation logic, results, and academic reporting can be added in a later phase without changing the listing architecture.
                  </p>
                </div>
              </div>
            </div>

            <FormulaBox formula={calculator.formula || 'Formula will be added with the calculator logic.'} />

            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-5">
              <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-700" />
                Planned page sections
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Input controls', 'Result summary', 'Interpretation guidance', 'Academic report text'].map(item => (
                  <div key={item} className="bg-white/70 rounded-xl px-4 py-3 text-sm text-slate-700 border border-teal-100">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Status
              </h3>
              <p className="text-sm text-slate-600">
                {calculator.status === 'active' ? 'Active calculator metadata is available.' : 'Coming soon calculator metadata is reserved.'}
              </p>
            </div>
            {related.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Related calculators</h3>
                <div className="space-y-3">
                  {related.slice(0, 3).map(item => (
                    <CalculatorCard key={item.id} calculator={item} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

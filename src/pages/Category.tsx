import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { calculators, categories, getCalculatorsByCategory } from '../data/calculators';
import { CalculatorCard } from '../components/ui/CalculatorCard';
import { CategoryCard } from '../components/ui/CategoryCard';
import { HeroSection } from '../components/ui/HeroSection';
import { useSEO } from '../utils/seo';

export function CategoryPage() {
  const { categoryId } = useParams();
  const category = categories.find(item => item.id === categoryId);
  useSEO(
    category ? `${category.name} | ResearchCalcHub` : 'Calculator Category | ResearchCalcHub',
    category ? `${category.description} Browse formulas, examples, reports, and related calculator tools.` : 'Browse ResearchCalcHub calculator categories.'
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Category not found</h1>
          <p className="text-slate-600 mb-5">This category may be planned for a later release.</p>
          <Link to="/calculators" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to calculators
          </Link>
        </div>
      </div>
    );
  }

  const categoryCalculators = getCalculatorsByCategory(category.id).filter(calculator => calculator.status === 'active');
  const relatedCategories = categories.filter(item => item.id !== category.id && item.status === 'active').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection
        eyebrow={category.status === 'active' ? 'Active calculator category' : 'Future calculator category'}
        title={category.name}
        subtitle={category.description}
        primaryLabel="View Category Tools"
        primaryTo="#category-tools"
        secondaryLabel="All Calculators"
        secondaryTo="/calculators"
      />

      <section id="category-tools" className="section bg-slate-50">
        <div className="container">
          <div className="flex items-start justify-between gap-5 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Available Tools</h2>
              <p className="text-slate-600">
                {categoryCalculators.length > 0
                  ? `${categoryCalculators.length} calculators are ready in this category.`
                  : 'This category is planned for a future release.'}
              </p>
            </div>
            <Link to="/calculators" className="btn-secondary hidden sm:inline-flex items-center gap-2 text-sm">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {categoryCalculators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryCalculators.map(calculator => (
                <CalculatorCard key={calculator.id} calculator={calculator} />
              ))}
            </div>
          ) : (
            <div className="card text-center max-w-2xl mx-auto">
              <BookOpen className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tools are being planned</h3>
              <p className="text-slate-600">
                ResearchCalcHub has reserved this category so future calculators can be added through the central metadata system.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              `${category.name} tools are organised through central metadata, so search, filters, and related links stay consistent.`,
              'Each calculator page includes formulas, interpretation, exportable reports, and reusable result actions.',
              'The category structure supports academic research, school subjects, governance, finance, health, and everyday calculations.',
            ].map(point => (
              <div key={point} className="flex items-start gap-3 bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedCategories.map(item => (
              <CategoryCard key={item.id} category={item} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

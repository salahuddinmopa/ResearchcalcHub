import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, BookOpen, BarChart2, Users, ShieldCheck,
  Calculator, FlaskConical, Star,
  Brain, Target, Award
} from 'lucide-react';
import { calculators, categories } from '../data/calculators';
import { CalculatorCard } from '../components/ui/CalculatorCard';
import { CategoryCard } from '../components/ui/CategoryCard';

const FEATURED_IDS = ['sample-size', 'cohens-kappa', 'cronbach-alpha', 'maturity-model', 'ahp-weight', 'delphi-consensus'];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'research-methodology': FlaskConical,
  'reliability-validity': ShieldCheck,
  'statistics': BarChart2,
  'social-science-decision': Users,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'research-methodology': 'from-indigo-500 to-indigo-700',
  'reliability-validity': 'from-blue-500 to-blue-700',
  'statistics': 'from-teal-500 to-teal-600',
  'social-science-decision': 'from-purple-500 to-purple-700',
};

export function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/calculators?q=${encodeURIComponent(search.trim())}`);
  };

  const featuredCalcs = FEATURED_IDS.map(id => calculators.find(c => c.id === id)).filter(Boolean) as typeof calculators;
  const activeCalcCount = calculators.filter(c => c.status === 'active').length;
  const activeCatCount = categories.filter(c => c.status === 'active').length;
  const researchCategoryIds = ['research-methodology', 'reliability-validity', 'statistics', 'social-science-decision'];
  const researchCategories = categories.filter(c => researchCategoryIds.includes(c.id));
  const stemCategories = categories.filter(c => c.status === 'active' && !researchCategoryIds.includes(c.id));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100 rounded-full opacity-40 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5" />
            Free academic calculators for researchers
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4">
            Research & Statistics<br />
            <span className="text-gradient">Calculator Hub</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Academic calculators for PhD, MPhil, university research, statistics, and real-world problem solving.
            Free, accurate, and explainable.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search calculators, methods, or research tools..."
              className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl shadow-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-sm py-2 px-4">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {['reliability', 'sample size', 'Cronbach alpha', 'Cohen kappa', 'AHP', 'maturity model'].map(term => (
              <button key={term} onClick={() => navigate(`/calculators?q=${encodeURIComponent(term)}`)}
                className="text-xs px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm">
                {term}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/calculators" className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
              Explore Research Calculators <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/calculators" className="btn-secondary flex items-center gap-2 text-base px-7 py-3.5">
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-slate-900 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: activeCalcCount.toString(), label: 'Active Calculators' },
            { value: activeCatCount.toString(), label: 'Categories' },
            { value: '100%', label: 'Free to Use' },
            { value: '12', label: 'Subject Areas' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Research categories */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Research Calculator Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">All calculators include formula explanations, step-by-step solutions, and academic reporting text.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {researchCategories.map(cat => {
              const Icon = CATEGORY_ICONS[cat.id] || Calculator;
              const gradient = CATEGORY_GRADIENTS[cat.id] || 'from-slate-500 to-slate-700';
              const catCalcs = calculators.filter(c => c.categoryId === cat.id);
              return (
                <Link
                  key={cat.id}
                  to={`/calculators?cat=${cat.id}`}
                  className="group rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-br ${gradient} p-6`}>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-base leading-snug">{cat.name}</h3>
                  </div>
                  <div className="bg-white p-4">
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{catCalcs.length} calculators</span>
                      <span className="text-xs text-indigo-600 font-medium group-hover:underline">Explore →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured calculators */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Featured Calculators</h2>
              <p className="text-slate-600">Most used by researchers and students</p>
            </div>
            <Link to="/calculators" className="btn-secondary hidden sm:flex items-center gap-2 text-sm">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCalcs.map((calc, i) => (
              <CalculatorCard key={calc.id} calculator={calc} featured={i < 3} />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link to="/calculators" className="btn-secondary text-sm">View all calculators →</Link>
          </div>
        </div>
      </section>

      {/* Research toolkit preview */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="badge bg-teal-100 text-teal-700 mb-3">Research Toolkit</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                A practical workspace for research planning and reporting
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Use a guided toolkit for common thesis and publication tasks: study design, survey planning,
                reliability checks, consensus analysis, and academic reporting.
              </p>
              <Link to="/research-toolkit" className="btn-primary inline-flex items-center gap-2">
                Open Research Toolkit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['sample-size', 'cronbach-alpha', 'delphi-consensus', 'ahp-weight'].map(id => {
                const calculator = calculators.find(calc => calc.id === id);
                return calculator ? <CalculatorCard key={calculator.id} calculator={calculator} /> : null;
              })}
            </div>
          </div>
        </div>
      </section>

      {/* STEM, Finance, Everyday categories */}
      <section className="section bg-slate-50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Explore More Tools</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Beyond research: math, science, finance, education, everyday life, and cybersecurity calculators.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stemCategories.map(cat => (
              <CategoryCard key={cat.id} category={cat} compact />
            ))}
          </div>
        </div>
      </section>

      {/* Why ResearchCalcHub */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Built for Academic Rigour</h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                ResearchCalcHub is designed for researchers who need accurate, explainable calculations — not just numbers.
                Every calculator shows its formula, step-by-step working, and generates academic reporting text ready for your thesis or paper.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Target, title: 'Accurate Calculations', desc: 'Mathematically verified formulas following published academic standards.' },
                  { icon: BookOpen, title: 'Academic Reporting', desc: 'Auto-generated text you can copy directly into your methodology section.' },
                  { icon: Brain, title: 'Step-by-Step Explanations', desc: 'See every calculation step so you understand the result.' },
                  { icon: Award, title: 'Beginner Friendly', desc: 'Clear explanations of when and how to use each calculator.' },
                ].map(feature => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{feature.title}</h4>
                      <p className="text-sm text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: '🎓', label: 'PhD Researchers', desc: 'Design studies, test reliability, run analyses' },
                { emoji: '📊', label: 'Data Analysts', desc: 'Statistics, correlation, weighted scoring' },
                { emoji: '👥', label: 'Social Scientists', desc: 'Delphi, stakeholder analysis, AHP' },
                { emoji: '📚', label: 'Students', desc: 'Learn methods with guided explanations' },
              ].map(u => (
                <div key={u.label} className="bg-slate-50 rounded-2xl p-5">
                  <div className="text-2xl mb-2">{u.emoji}</div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">{u.label}</h4>
                  <p className="text-xs text-slate-500">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-slate-900">
        <div className="container text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to start calculating?</h2>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">Browse all {activeCalcCount} calculators across {activeCatCount} categories — free, no sign-up required.</p>
          <Link to="/calculators" className="btn-primary inline-flex items-center gap-2 text-base px-7 py-3.5">
            Browse All Calculators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

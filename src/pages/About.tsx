import { Link } from 'react-router-dom';
import {
  BookOpen, Target, Users, Layers, ArrowRight,
  CheckCircle2, FlaskConical, BarChart2, ShieldCheck, Brain
} from 'lucide-react';
import { useSEO } from '../utils/seo';

export function AboutPage() {
  useSEO(
    'About ResearchCalcHub | Academic Calculator Platform',
    'Learn about ResearchCalcHub, an educational calculator platform with formulas, steps, interpretations, and academic reporting text.'
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-teal-600 py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About ResearchCalcHub</h1>
          <p className="text-indigo-100 text-lg max-w-2xl mx-auto leading-relaxed">
            An educational calculator platform for students, researchers, teachers, professionals, and general users who need clear,
            explainable calculations — not just raw numbers.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Research methods can be complex. Understanding <em>how</em> a calculation works — not just the result — is
                what separates good researchers from great ones. ResearchCalcHub makes complex academic calculations
                accessible, transparent, and understandable.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Every calculator on this platform shows its mathematical formula, walks through the calculation step-by-step,
                provides an interpretation of the result, and generates academic reporting text you can use directly in
                your thesis or paper.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The first version focuses on research methodology, statistics, reliability, validity, and social science
                decision tools — the tools most needed by PhD and MPhil researchers. Future versions will expand into
                mathematics, physics, chemistry, finance, cybersecurity, education, and everyday life calculations.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Target, title: 'Accurate Results', desc: 'Every formula is verified against published academic sources and textbooks.' },
                { icon: BookOpen, title: 'Academic Reporting', desc: 'Auto-generate APA/academic style reporting text for your methodology section.' },
                { icon: Users, title: 'Accessible to All', desc: 'From PhD researchers to first-year students — clear explanations for every level.' },
                { icon: Layers, title: 'Expandable Platform', desc: 'Built to grow — more categories and calculators are added regularly.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Version 1 */}
      <section className="section bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Version 1: Research & Statistics Focus</h2>
          <p className="text-slate-600 text-center mb-8">The first release includes 20 carefully built calculators across 4 categories.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: FlaskConical,
                title: 'Research Methodology',
                color: 'indigo',
                items: ['Sample Size Calculator', 'Margin of Error', 'Survey Response Rate', 'Likert Scale Mean', 'Weighted Scoring'],
              },
              {
                icon: ShieldCheck,
                title: 'Reliability & Validity',
                color: 'blue',
                items: ["Cohen's Kappa", "Fleiss' Kappa", "Cronbach's Alpha", 'Inter-Coder Agreement'],
              },
              {
                icon: BarChart2,
                title: 'Statistics',
                color: 'teal',
                items: ['Mean/Median/Mode', 'Standard Deviation', 'Variance', 'Z-Score', 'Confidence Interval', 'Pearson Correlation'],
              },
              {
                icon: Users,
                title: 'Social Science & Decision',
                color: 'purple',
                items: ['Risk Matrix', 'Stakeholder Matrix', 'AHP Weight Calculator', 'Delphi Consensus', 'Maturity Model Score'],
              },
            ].map(cat => (
              <div key={cat.title} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 bg-${cat.color}-50 rounded-lg flex items-center justify-center`}>
                    <cat.icon className={`w-4 h-4 text-${cat.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{cat.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Future roadmap */}
      <section className="section bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Future Roadmap</h2>
          <p className="text-slate-600 text-center mb-8">ResearchCalcHub is designed to grow. Future versions will include:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji: '🧮', label: 'Mathematics' },
              { emoji: '⚡', label: 'Physics' },
              { emoji: '🧪', label: 'Chemistry' },
              { emoji: '🌿', label: 'Biology & Health' },
              { emoji: '💰', label: 'Finance' },
              { emoji: '🔒', label: 'Cybersecurity' },
              { emoji: '📚', label: 'Education' },
              { emoji: '🏠', label: 'Everyday Life' },
            ].map(item => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-sm font-medium text-slate-700">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="section bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Who Uses ResearchCalcHub?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { emoji: '🎓', label: 'PhD Researchers' },
              { emoji: '📖', label: 'MPhil Students' },
              { emoji: '🏫', label: 'University Students' },
              { emoji: '👨‍🏫', label: 'Teachers & Lecturers' },
              { emoji: '📊', label: 'Data Analysts' },
              { emoji: '📋', label: 'Policy Researchers' },
              { emoji: '🌍', label: 'Social Scientists' },
              { emoji: '🔬', label: 'General Learners' },
            ].map(u => (
              <div key={u.label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center text-white">
                <div className="text-xl mb-1">{u.emoji}</div>
                <div className="text-xs font-medium">{u.label}</div>
              </div>
            ))}
          </div>
          <Link to="/calculators" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
            Start Using Calculators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

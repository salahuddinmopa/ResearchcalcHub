import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, FileText, Lightbulb, SearchCheck, Target, Users } from 'lucide-react';
import { calculators } from '../data/calculators';
import { CalculatorCard } from '../components/ui/CalculatorCard';
import { HeroSection } from '../components/ui/HeroSection';
import { FAQSection } from '../components/ui/FAQSection';

const toolkitSteps = [
  { title: 'Design the Study', icon: Target, description: 'Estimate sample size, margin of error, and response requirements before data collection.' },
  { title: 'Collect Better Data', icon: ClipboardCheck, description: 'Use survey and Likert tools to prepare transparent methods and cleaner datasets.' },
  { title: 'Check Quality', icon: SearchCheck, description: 'Assess reliability, agreement, and consistency before reporting findings.' },
  { title: 'Report Clearly', icon: FileText, description: 'Use formulas, interpretation boxes, and academic report text to support thesis writing.' },
];

const toolkitCalculatorIds = [
  'sample-size',
  'margin-of-error',
  'survey-response-rate',
  'cronbach-alpha',
  'cohens-kappa',
  'delphi-consensus',
];

export function ResearchToolkitPage() {
  const toolkitCalculators = toolkitCalculatorIds
    .map(id => calculators.find(calculator => calculator.id === id))
    .filter(Boolean) as typeof calculators;

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection
        eyebrow="Research Toolkit"
        title="Plan, analyse, and explain academic research with confidence."
        subtitle="A guided hub for PhD, MPhil, postgraduate, and social science researchers who need practical calculators plus clear interpretation support."
        primaryLabel="Open Toolkit Calculators"
        primaryTo="/calculators?q=research"
        secondaryLabel="Explore Statistics"
        secondaryTo="/categories/statistics"
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {toolkitSteps.map(step => (
              <div key={step.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Recommended Research Tools</h2>
              <p className="text-slate-600">A focused starting set for proposal writing, data collection, and methodology reporting.</p>
            </div>
            <Link to="/calculators" className="btn-secondary hidden sm:inline-flex items-center gap-2 text-sm">
              All calculators <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {toolkitCalculators.map(calculator => (
              <CalculatorCard key={calculator.id} calculator={calculator} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-teal-50 border border-teal-100 p-6">
              <Lightbulb className="w-7 h-7 text-teal-700 mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">For thesis and publication workflows</h2>
              <p className="text-slate-600 leading-relaxed">
                The toolkit groups calculators around research decisions: design quality, measurement reliability, descriptive analysis, and defensible reporting.
              </p>
            </div>
            <div className="rounded-2xl bg-purple-50 border border-purple-100 p-6">
              <Users className="w-7 h-7 text-purple-700 mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">For social science teams</h2>
              <p className="text-slate-600 leading-relaxed">
                Decision tools such as stakeholder matrices, Delphi consensus, and AHP weighting give group research projects a structured starting point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        title="Research Toolkit FAQ"
        faqs={[
          { question: 'Does the toolkit replace statistical software?', answer: 'No. It is designed for quick planning, checking, learning, and reporting support. Specialist software is still useful for larger analyses.' },
          { question: 'Can new calculators be added later?', answer: 'Yes. The platform uses central calculator metadata so new tools can be added without rebuilding listing pages manually.' },
          { question: 'Who is this toolkit for?', answer: 'It is aimed at students, supervisors, PhD and MPhil researchers, social scientists, and applied research teams.' },
        ]}
      />
    </div>
  );
}

import { Rocket, Wrench, Layers } from 'lucide-react';
import { categories } from '../data/calculators';
import { CategoryCard } from '../components/ui/CategoryCard';
import { HeroSection } from '../components/ui/HeroSection';

export function FutureToolsPage() {
  const futureCategories = categories.filter(category => category.status === 'coming-soon');

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection
        eyebrow="Future Tools"
        title="An expandable calculator platform for every learning domain."
        subtitle="ResearchCalcHub starts with research and statistics, then grows into math, science, finance, cybersecurity, education, engineering, health, and everyday life calculators."
        primaryLabel="See Current Calculators"
        primaryTo="/calculators"
        secondaryLabel="Research Toolkit"
        secondaryTo="/research-toolkit"
      />

      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {[
              { title: 'Expandable metadata', icon: Layers, text: 'Future calculators can be surfaced from the same central data model used by current tools.' },
              { title: 'Consistent layouts', icon: Wrench, text: 'New calculator pages can reuse formula, result, interpretation, and report components.' },
              { title: 'Academic first', icon: Rocket, text: 'Expansion keeps the same education-friendly design and clear explanation style.' },
            ].map(item => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <item.icon className="w-6 h-6 text-indigo-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">Planned Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {futureCategories.map(category => (
              <CategoryCard key={category.id} category={category} compact />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

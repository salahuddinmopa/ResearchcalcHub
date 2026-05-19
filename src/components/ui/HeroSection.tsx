import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Search } from 'lucide-react';

interface Props {
  title: string;
  subtitle: string;
  eyebrow?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

export function HeroSection({
  title,
  subtitle,
  eyebrow = 'ResearchCalcHub',
  primaryLabel = 'Browse Calculators',
  primaryTo = '/calculators',
  secondaryLabel = 'Research Toolkit',
  secondaryTo = '/research-toolkit',
}: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      <div className="max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm mb-5">
          <GraduationCap className="w-4 h-4" />
          {eyebrow}
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-3xl">
          {title}
        </h1>
        <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-3xl">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to={primaryTo} className="btn-primary inline-flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            {primaryLabel}
          </Link>
          <Link to={secondaryTo} className="btn-secondary inline-flex items-center justify-center gap-2">
            {secondaryLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

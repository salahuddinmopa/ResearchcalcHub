import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import type { Calculator } from '../../types';

interface Props {
  calculator: Calculator;
  featured?: boolean;
}

const difficultyColors: Record<string, string> = {
  Basic: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-purple-100 text-purple-700',
};

export function CalculatorCard({ calculator, featured }: Props) {
  const isComingSoon = calculator.status === 'coming-soon';

  const content = (
    <>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`badge ${difficultyColors[calculator.difficulty]}`}>
                {calculator.difficulty}
              </span>
              {isComingSoon && (
                <span className="badge bg-slate-100 text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Coming Soon
                </span>
              )}
              {featured && !isComingSoon && (
                <span className="badge bg-indigo-100 text-indigo-700 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <h3 className={`font-semibold text-base leading-snug transition-colors ${isComingSoon ? 'text-slate-600' : 'text-slate-900 group-hover:text-indigo-700'}`}>
              {calculator.name}
            </h3>
          </div>
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isComingSoon ? 'bg-slate-100' : 'bg-indigo-50 group-hover:bg-indigo-600'}`}>
            {isComingSoon ? (
              <Clock className="w-4 h-4 text-slate-400" />
            ) : (
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" />
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{calculator.description}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {calculator.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">{calculator.category}</span>
        <span className={`text-xs font-medium ${isComingSoon ? 'text-slate-400' : 'text-indigo-600 group-hover:underline'}`}>
          {isComingSoon ? 'Coming Soon' : 'Use Calculator'}
        </span>
      </div>
    </>
  );

  if (isComingSoon) {
    return (
      <div
        className="group block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden opacity-75 cursor-not-allowed"
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={calculator.path}
      className="group block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      {content}
    </Link>
  );
}

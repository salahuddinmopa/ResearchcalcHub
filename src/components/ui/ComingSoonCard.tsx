import { Clock } from 'lucide-react';
import type { Category } from '../../types';
import * as Icons from 'lucide-react';

interface Props {
  category: Category;
}

const colorMap: Record<string, string> = {
  orange: 'from-orange-400 to-orange-600',
  yellow: 'from-yellow-400 to-yellow-600',
  green: 'from-green-400 to-green-600',
  emerald: 'from-emerald-400 to-emerald-600',
  sky: 'from-sky-400 to-sky-600',
  red: 'from-red-400 to-red-600',
  violet: 'from-violet-400 to-violet-600',
  pink: 'from-pink-400 to-pink-600',
};

export function ComingSoonCard({ category }: Props) {
  const gradientClass = colorMap[category.color] || 'from-slate-400 to-slate-600';

  return (
    <div className="relative block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden opacity-80 hover:opacity-90 transition-opacity">
      <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center flex-shrink-0`}>
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-700 text-sm">{category.name}</h3>
              <span className="badge bg-slate-100 text-slate-500 text-[10px]">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{category.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

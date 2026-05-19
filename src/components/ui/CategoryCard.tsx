import { Link } from 'react-router-dom';
import {
  BarChart2, Beaker, BookOpen, Calculator, FlaskConical, Home,
  Leaf, Shield, ShieldCheck, TrendingUp, Users, Zap, ArrowRight
} from 'lucide-react';
import type { Category } from '../../types';
import { calculators } from '../../data/calculators';

interface Props {
  category: Category;
  compact?: boolean;
}

const icons: Record<string, React.ElementType> = {
  BarChart2,
  Beaker,
  BookOpen,
  Calculator,
  FlaskConical,
  Home,
  Leaf,
  Shield,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
};

export function CategoryCard({ category, compact }: Props) {
  const Icon = icons[category.icon] || Calculator;
  const count = calculators.filter(calculator => calculator.categoryId === category.id && calculator.status === 'active').length;
  const target = category.status === 'active' ? `/categories/${category.id}` : '/future-tools';

  return (
    <Link
      to={target}
      className={`group block bg-white rounded-2xl border ${category.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
    >
      <div className={`${category.bgColor} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className={`w-11 h-11 rounded-xl bg-white border ${category.borderColor} flex items-center justify-center shadow-sm`}>
            <Icon className={`w-5 h-5 ${category.textColor}`} />
          </div>
          <span className={`badge ${category.status === 'active' ? 'bg-white text-slate-600' : 'bg-white/80 text-slate-500'}`}>
            {category.status === 'active' ? `${count} tools` : 'Coming soon'}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
          {category.name}
        </h3>
        <p className={`mt-2 text-sm text-slate-500 leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
          {category.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
          Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

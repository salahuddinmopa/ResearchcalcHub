import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface Props {
  interpretation: string;
  level: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral' | 'warning';
  title?: string;
}

const config = {
  excellent: { icon: CheckCircle2, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon_color: 'text-green-600' },
  good: { icon: CheckCircle2, bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', icon_color: 'text-teal-600' },
  acceptable: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon_color: 'text-blue-600' },
  poor: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon_color: 'text-red-500' },
  neutral: { icon: Info, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', icon_color: 'text-slate-500' },
  warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-600' },
};

export function InterpretationBox({ interpretation, level, title = 'Interpretation' }: Props) {
  const c = config[level] || config.neutral;
  const Icon = c.icon;

  return (
    <div className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${c.icon_color} flex-shrink-0 mt-0.5`} />
        <div>
          <h4 className={`font-semibold text-sm mb-1 ${c.text}`}>{title}</h4>
          <p className={`text-sm leading-relaxed ${c.text}`}>{interpretation}</p>
        </div>
      </div>
    </div>
  );
}

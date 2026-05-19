import { Code2 } from 'lucide-react';

interface Props {
  formula: string;
  title?: string;
}

export function FormulaBox({ formula, title = 'Formula' }: Props) {
  const parts = formula.split('|').map(p => p.trim());

  return (
    <section className="bg-slate-900 rounded-2xl p-5 my-4 overflow-hidden" aria-label={title}>
      <div className="flex items-center gap-2 mb-3">
        <Code2 className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400 text-sm font-medium">{title}</span>
      </div>
      <div className="space-y-2 overflow-x-auto">
        {parts.map((part, i) => (
          <p key={i} className="font-mono text-teal-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {part}
          </p>
        ))}
      </div>
    </section>
  );
}

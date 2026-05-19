interface ChartItem {
  name: string;
  score: number;
}

interface Props {
  items: ChartItem[];
  max?: number;
}

export function MaturityChart({ items, max = 4 }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
      <h3 className="font-semibold text-sm text-slate-900">Maturity Score Chart</h3>
      {items.map(item => {
        const pct = Math.max(0, Math.min(100, (item.score / max) * 100));
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs font-medium text-slate-600 truncate">{item.name}</span>
              <span className="text-xs font-mono text-slate-500">{item.score.toFixed(2)} / {max}</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

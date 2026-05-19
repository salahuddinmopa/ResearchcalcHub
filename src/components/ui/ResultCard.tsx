interface ResultItem {
  label: string;
  value: string;
  highlight?: boolean;
  subtext?: string;
}

interface Props {
  results: ResultItem[];
  title?: string;
}

export function ResultCard({ results, title = 'Results' }: Props) {
  return (
    <section className="bg-white border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-sm" aria-label={title}>
      <div className="bg-gradient-to-r from-indigo-600 to-teal-600 px-5 py-3">
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {results.map((item, i) => (
          <div key={i} className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 ${item.highlight ? 'bg-indigo-50' : ''}`}>
            <div className="min-w-0">
              <span className={`text-sm ${item.highlight ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {item.subtext && <p className="text-xs text-slate-400 mt-0.5">{item.subtext}</p>}
            </div>
            <span className={`font-mono sm:text-right break-words ${item.highlight ? 'text-lg font-bold text-indigo-700' : 'text-sm font-medium text-slate-900'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

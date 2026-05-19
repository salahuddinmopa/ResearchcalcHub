import { parseNumberList } from '../../utils/statistics';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  minCount?: number;
}

export function NumericInputBox({ value, onChange, label, placeholder, minCount = 1 }: Props) {
  const parsed = parseNumberList(value);

  return (
    <div>
      <label className="label">{label}</label>
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        className="input-field h-32 font-mono text-sm resize-none"
        placeholder={placeholder || 'Paste from Excel, or enter numbers separated by spaces, commas, or new lines'}
      />
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        <span className={parsed.values.length >= minCount ? 'text-slate-400' : 'text-amber-600'}>
          {parsed.values.length} numeric value{parsed.values.length !== 1 ? 's' : ''} detected
        </span>
        {parsed.invalidTokens.length > 0 && (
          <span className="text-red-500">
            Invalid: {parsed.invalidTokens.slice(0, 4).join(', ')}{parsed.invalidTokens.length > 4 ? '...' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

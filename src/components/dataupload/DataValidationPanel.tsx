import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import type { ValidationWarning } from '../../utils/dataValidation';

interface Props {
  warnings: ValidationWarning[];
}

const ICONS = {
  error: <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />,
};

const BG = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function DataValidationPanel({ warnings }: Props) {
  if (warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
        <CheckCircle className="w-4 h-4" />
        Dataset passed all validation checks.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div key={i} className={`flex items-start gap-2 border rounded-lg px-4 py-2.5 text-sm ${BG[w.level]}`}>
          {ICONS[w.level]}
          {w.message}
        </div>
      ))}
    </div>
  );
}

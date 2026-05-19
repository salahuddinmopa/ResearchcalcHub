import { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/pdf';

interface Props {
  text: string;
  title?: string;
}

export function AcademicReportBox({ text, title = 'How to Report in Academic Writing' }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h4 className="font-semibold text-sm text-indigo-900">{title}</h4>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:shadow-sm"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5" /> Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy text</>
          )}
        </button>
      </div>
      <blockquote className="text-sm text-indigo-800 leading-relaxed italic border-l-2 border-indigo-300 pl-4">
        "{text}"
      </blockquote>
    </div>
  );
}

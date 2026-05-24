import { useState } from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';
import { parsePastedTable } from '../../utils/dataParsing';
import type { ParsedDataset } from '../../utils/dataParsing';

interface Props {
  onDataLoaded: (dataset: ParsedDataset) => void;
}

const PLACEHOLDER = `gender,age,satisfaction,score
Male,25,4,78
Female,31,5,88
Male,28,3,72`;

export default function PasteDataInput({ onDataLoaded }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  function handleParse() {
    setError('');
    if (!text.trim()) {
      setError('Please paste some data first.');
      return;
    }
    try {
      const dataset = parsePastedTable(text);
      onDataLoaded(dataset);
    } catch (err: any) {
      setError(err?.message ?? 'Could not parse pasted data. Check the format.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
        <ClipboardList className="w-4 h-4" />
        Paste CSV or Excel-style data below (with headers in the first row)
      </div>
      <textarea
        className="w-full h-44 font-mono text-sm border border-slate-300 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white"
        placeholder={PLACEHOLDER}
        value={text}
        onChange={e => setText(e.target.value)}
        spellCheck={false}
      />
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      <button
        onClick={handleParse}
        className="btn-primary text-sm"
      >
        Parse Pasted Data
      </button>
    </div>
  );
}

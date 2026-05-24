import { useRef, useState } from 'react';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { validateFileSecure, parseFile } from '../../utils/dataParsing';
import type { ParsedDataset } from '../../utils/dataParsing';

interface Props {
  onDataLoaded: (dataset: ParsedDataset) => void;
}

export default function FileDropzone({ onDataLoaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  async function processFile(file: File) {
    setError('');
    const validation = validateFileSecure(file);
    if (!validation.ok) {
      setError(validation.error!);
      return;
    }
    setFileName(file.name);
    setFileSize(formatSize(file.size));
    setLoading(true);
    try {
      const dataset = await parseFile(file);
      onDataLoaded(dataset);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to parse file. Please check the format.');
      setFileName('');
      setFileSize('');
    } finally {
      setLoading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function clearFile() {
    setFileName('');
    setFileSize('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
        }`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Click or drag to upload file"
      >
        <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">
          {loading ? 'Parsing file…' : 'Drag & drop your file here, or click to browse'}
        </p>
        <p className="text-xs text-slate-500 mt-1">Accepted: CSV, TXT, XLSX · Max 5 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.xlsx"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {fileName && !error && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <File className="w-4 h-4" />
            <span className="font-medium">{fileName}</span>
            <span className="text-green-600">{fileSize}</span>
          </div>
          <button onClick={clearFile} className="text-green-500 hover:text-green-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

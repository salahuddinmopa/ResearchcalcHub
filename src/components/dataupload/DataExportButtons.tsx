import { Download, Copy, FileText } from 'lucide-react';
import { downloadCsv } from '../../utils/export';
import type { ParsedDataset } from '../../utils/dataParsing';
import type { AnalysisResult } from '../../utils/dataAnalysis';

interface Props {
  dataset: ParsedDataset;
  result: AnalysisResult;
}

export default function DataExportButtons({ dataset, result }: Props) {
  function downloadCleanedData() {
    downloadCsv({
      filename: `cleaned_${dataset.fileName ?? 'data'}.csv`,
      headers: dataset.headers,
      rows: dataset.rows.map(row => dataset.headers.map(h => row[h] ?? '')),
    });
  }

  function downloadResults() {
    downloadCsv({
      filename: `${result.analysisType}_results.csv`,
      headers: result.tableHeaders,
      rows: result.tableRows,
    });
  }

  function copySummary() {
    const lines = [
      result.title,
      '',
      ...result.summary.map(s => `${s.label}: ${s.value}`),
      '',
      result.interpretation,
      '',
      result.academicText,
    ].join('\n');
    navigator.clipboard.writeText(lines);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={downloadCleanedData} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
        <Download className="w-4 h-4" />
        Download Data (CSV)
      </button>
      <button onClick={downloadResults} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors">
        <FileText className="w-4 h-4" />
        Download Results (CSV)
      </button>
      <button onClick={copySummary} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors">
        <Copy className="w-4 h-4" />
        Copy Summary
      </button>
    </div>
  );
}

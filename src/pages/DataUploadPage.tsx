import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, ClipboardList, FileText, Database, RotateCcw, PlayCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import DataPrivacyNotice from '../components/dataupload/DataPrivacyNotice';
import FileDropzone from '../components/dataupload/FileDropzone';
import PasteDataInput from '../components/dataupload/PasteDataInput';
import DataPreviewTable from '../components/dataupload/DataPreviewTable';
import UploadedDataSummary from '../components/dataupload/UploadedDataSummary';
import DataValidationPanel from '../components/dataupload/DataValidationPanel';
import AnalysisSelector from '../components/dataupload/AnalysisSelector';
import VariableSelector from '../components/dataupload/VariableSelector';
import DataExportButtons from '../components/dataupload/DataExportButtons';

import { SAMPLE_DATASET } from '../utils/dataParsing';
import type { ParsedDataset } from '../utils/dataParsing';
import { detectColumnTypes } from '../utils/dataTypeDetection';
import type { ColumnInfo } from '../utils/dataTypeDetection';
import { validateDataset } from '../utils/dataValidation';
import type { ValidationWarning } from '../utils/dataValidation';
import { runAnalysis, ANALYSIS_VARIABLE_REQUIREMENTS } from '../utils/dataAnalysis';
import type { AnalysisType, AnalysisResult } from '../utils/dataAnalysis';

type Tab = 'file' | 'paste' | 'qualitative' | 'sample';

const TABS: { id: Tab; label: string; icon: typeof UploadCloud }[] = [
  { id: 'file', label: 'Upload File', icon: UploadCloud },
  { id: 'paste', label: 'Paste Table Data', icon: ClipboardList },
  { id: 'qualitative', label: 'Paste Qualitative Text', icon: FileText },
  { id: 'sample', label: 'Load Sample Data', icon: Database },
];

function sectionCard(children: React.ReactNode) {
  return <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-slate-900 mb-4">{children}</h2>;
}

export default function DataUploadPage() {
  const [privacyDismissed, setPrivacyDismissed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('file');
  const [qualText, setQualText] = useState('');

  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [selectedVars, setSelectedVars] = useState<Record<string, string | string[]>>({});

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  function loadDataset(ds: ParsedDataset) {
    const cols = detectColumnTypes(ds);
    const warns = validateDataset(ds, cols);
    setDataset(ds);
    setColumns(cols);
    setWarnings(warns);
    setSelectedAnalysis(null);
    setSelectedVars({});
    setResult(null);
    setAnalysisError('');
  }

  function onVarChange(key: string, value: string | string[]) {
    setSelectedVars(prev => ({ ...prev, [key]: value }));
    setResult(null);
    setAnalysisError('');
  }

  function onAnalysisSelect(type: AnalysisType) {
    setSelectedAnalysis(type);
    setSelectedVars({});
    setResult(null);
    setAnalysisError('');
  }

  function reset() {
    setDataset(null);
    setColumns([]);
    setWarnings([]);
    setSelectedAnalysis(null);
    setSelectedVars({});
    setResult(null);
    setAnalysisError('');
  }

  function isVarsReady(): boolean {
    if (!selectedAnalysis) return false;
    const reqs = ANALYSIS_VARIABLE_REQUIREMENTS[selectedAnalysis];
    for (const req of reqs) {
      const val = selectedVars[req.key];
      if (req.multi) {
        const arr = (val as string[] | undefined) ?? [];
        if (arr.length < (req.minSelect ?? 1)) return false;
      } else {
        if (!val) return false;
      }
    }
    return true;
  }

  function runAnalysisNow() {
    if (!dataset || !selectedAnalysis) return;
    setIsRunning(true);
    setAnalysisError('');
    try {
      const res = runAnalysis(selectedAnalysis, dataset, selectedVars);
      setResult(res);
    } catch (err: any) {
      setAnalysisError(err?.message ?? 'Analysis failed. Check variable selections.');
    } finally {
      setIsRunning(false);
    }
  }

  const hasErrors = warnings.some(w => w.level === 'error');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-800 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <UploadCloud className="w-3 h-3" />
            Data Upload & Analysis Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Upload Data for Analysis</h1>
          <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Upload CSV, TXT, or Excel-style data to generate descriptive statistics, frequency tables,
            cross-tabs, reliability analysis, qualitative themes, and visual results.
          </p>
          <p className="mt-4 text-sm text-indigo-300">
            All data is processed locally in your browser. Nothing is sent to any server.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Privacy notice */}
        {!privacyDismissed && <DataPrivacyNotice onDismiss={() => setPrivacyDismissed(true)} />}

        {/* Upload section */}
        {!dataset && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-slate-200 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'file' && <FileDropzone onDataLoaded={loadDataset} />}

              {activeTab === 'paste' && <PasteDataInput onDataLoaded={loadDataset} />}

              {activeTab === 'qualitative' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Paste interview transcripts, open-ended survey responses, focus group notes, or policy document text.
                  </p>
                  <textarea
                    className="w-full h-52 text-sm border border-slate-300 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    placeholder="Paste qualitative text here..."
                    value={qualText}
                    onChange={e => setQualText(e.target.value)}
                    spellCheck={false}
                  />
                  <div className="flex gap-3">
                    <Link
                      to="/calculators/qualitative-thematic-analysis"
                      className="flex items-center gap-2 btn-primary text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Qualitative Thematic Analysis Tool
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500">
                    For full thematic coding, NVivo-style analysis, and AI-assisted theme generation, use the dedicated Qualitative Thematic Analysis tool above.
                  </p>
                </div>
              )}

              {activeTab === 'sample' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <h3 className="font-semibold text-indigo-900 mb-2">Sample Research Dataset</h3>
                    <p className="text-sm text-indigo-800 mb-3">
                      A synthetic dataset with 20 participants across Treatment and Control groups. Includes numeric,
                      categorical, Likert, inter-rater, and qualitative columns suitable for testing all supported analyses.
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-xs text-indigo-700 mb-4">
                      {['Descriptive Stats', 'Frequency Table', 'Correlation', 'Cronbach α', "Cohen's κ", 'T-Test', 'Likert Analysis'].map(t => (
                        <span key={t} className="bg-indigo-100 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <button onClick={() => loadDataset(SAMPLE_DATASET)} className="btn-primary text-sm">
                      Load Sample Dataset
                    </button>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    Columns: participant_id, gender, age, education_level, group, training_received,
                    satisfaction, confidence_score, performance_score, pre_test_score, post_test_score,
                    likert_q1_governance through likert_q5_ai_oversight, coder1_theme, coder2_theme, qualitative_response
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dataset loaded — summary + preview */}
        {dataset && (
          <>
            {/* Header bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{dataset.fileName ?? 'Pasted data'}</p>
                  <p className="text-xs text-slate-500">{dataset.rowCount} rows · {dataset.colCount} columns</p>
                </div>
              </div>
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-red-600 transition-colors">
                <RotateCcw className="w-4 h-4" />
                Upload New Data
              </button>
            </div>

            {/* Summary cards */}
            <UploadedDataSummary dataset={dataset} columns={columns} />

            {/* Validation */}
            {sectionCard(
              <>
                <SectionTitle>Data Validation</SectionTitle>
                <DataValidationPanel warnings={warnings} />
              </>
            )}

            {/* Data preview */}
            {sectionCard(
              <>
                <SectionTitle>Data Preview</SectionTitle>
                <DataPreviewTable dataset={dataset} columns={columns} />
              </>
            )}

            {/* Analysis selection */}
            {!hasErrors && sectionCard(
              <>
                <SectionTitle>Select Analysis</SectionTitle>
                <AnalysisSelector selected={selectedAnalysis} onSelect={onAnalysisSelect} />
              </>
            )}

            {/* Variable selection */}
            {selectedAnalysis && !hasErrors && sectionCard(
              <>
                <SectionTitle>Configure Variables</SectionTitle>
                <VariableSelector
                  analysisType={selectedAnalysis}
                  columns={columns}
                  selectedVars={selectedVars}
                  onChange={onVarChange}
                />
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={runAnalysisNow}
                    disabled={!isVarsReady() || isRunning}
                    className="flex items-center gap-2 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isRunning ? 'Analysing…' : 'Analyse Data'}
                  </button>
                  {!isVarsReady() && (
                    <p className="text-xs text-slate-500 mt-2">Select all required variables above to run the analysis.</p>
                  )}
                  {analysisError && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                      {analysisError}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Results */}
            {result && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-teal-600 px-6 py-4">
                  <h2 className="text-white font-bold text-lg">{result.title}</h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Summary stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {result.summary.map((s, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <p className="text-xs text-slate-500 mb-0.5">{s.label}</p>
                          <p className="font-bold text-slate-900 text-sm break-all">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  {result.chartData && result.chartData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">{result.chartTitle ?? 'Chart'}</h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill={result.chartColor ?? '#6366f1'} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Results table */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Results Table</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {result.tableHeaders.map((h, i) => (
                              <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-700">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {result.tableRows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50">
                              {row.map((cell, ci) => (
                                <td key={ci} className="px-4 py-2 text-slate-700">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Interpretation */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-2">Interpretation</h3>
                    <p className="text-sm text-indigo-800 leading-relaxed">{result.interpretation}</p>
                  </div>

                  {/* Academic reporting text */}
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-teal-900">Academic Reporting Text</h3>
                      <ChevronDown className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-sm text-teal-800 leading-relaxed font-mono">{result.academicText}</p>
                  </div>

                  {/* Export */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Export</h3>
                    <DataExportButtons dataset={dataset} result={result} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            Data processed entirely in-browser · No files stored · For educational and research-support use
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-slate-400">
            <Link to="/calculators" className="hover:text-indigo-600 transition-colors">All Calculators</Link>
            <Link to="/calculators/qualitative-thematic-analysis" className="hover:text-indigo-600 transition-colors">Qualitative Analysis</Link>
            <Link to="/stat-analyzer" className="hover:text-indigo-600 transition-colors">StatAnalyzer Pro</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

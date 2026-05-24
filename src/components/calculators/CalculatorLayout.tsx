import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Download, ChevronDown, ChevronUp,
  Lightbulb, Clock, HelpCircle, Link2, Copy, Check, Printer, Moon, Sun, History
} from 'lucide-react';
import type { Calculator, CalculatorResult } from '../../types';
import { FormulaBox } from '../ui/FormulaBox';
import { InterpretationBox } from '../ui/InterpretationBox';
import { AcademicReportBox } from '../ui/AcademicReportBox';
import { ResultCard } from '../ui/ResultCard';
import { CalculatorCard } from '../ui/CalculatorCard';
import { copyToClipboard } from '../../utils/pdf';
import { calculators } from '../../data/calculators';
import { downloadCsv, resultToText, type CsvExport } from '../../utils/export';
import { useSEO } from '../../utils/seo';

interface Props {
  calculator: Calculator;
  result?: CalculatorResult | null;
  csvExport?: CsvExport | null;
  visual?: React.ReactNode;
  children: React.ReactNode;
}

interface RecentCalculation {
  calculatorId: string;
  calculatorName: string;
  date: string;
  summary: { label: string; value: string; highlight?: boolean; subtext?: string }[];
  interpretation: string;
}

const difficultyColors: Record<string, string> = {
  Basic: 'bg-green-100 text-green-700',
  Intermediate: 'bg-yellow-100 text-yellow-700',
  Advanced: 'bg-purple-100 text-purple-700',
};

const disclaimer = 'ResearchCalcHub results are generated from user-provided inputs and are intended for educational and planning purposes. They do not replace professional advice, audits, medical guidance, financial advice, or formal research review.';

function getRecentCalculations(): RecentCalculation[] {
  try {
    return JSON.parse(localStorage.getItem('researchCalcHub.recentCalculations') || '[]');
  } catch {
    return [];
  }
}

export function CalculatorLayout({ calculator, result, csvExport, visual, children }: Props) {
  useSEO(`${calculator.name} | ResearchCalcHub`, `${calculator.description} Formula, examples, interpretation, exportable reports, and related calculators for students, researchers, and professionals.`);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [resultCopied, setResultCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('researchCalcHub.theme') === 'dark');
  const [recentCalculations, setRecentCalculations] = useState<RecentCalculation[]>(() => getRecentCalculations());
  const inputRef = useRef<HTMLDivElement>(null);

  const relatedCalcs = calculator.relatedCalculators
    .map(id => calculators.find(c => c.id === id))
    .filter(Boolean) as Calculator[];
  const faqs = calculator.faqs.length > 0 ? calculator.faqs : [
    {
      question: `How do I use the ${calculator.name}?`,
      answer: 'Enter the required values, review any validation message, then select Calculate. Use the example button when available to see a working input pattern.',
    },
    {
      question: 'Can I export or save the result?',
      answer: 'Yes. After calculating, you can copy the result, download a PDF report, export a CSV report, print the page, and view recent calculations saved locally in your browser.',
    },
  ];

  const getInputSnapshot = () => {
    const root = inputRef.current;
    if (!root) return [];
    const fields = Array.from(root.querySelectorAll('input, select, textarea')) as Array<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    return fields
      .map(field => {
        const container = field.parentElement?.closest('div');
        const label = container?.querySelector('label')?.textContent?.trim()
          || container?.parentElement?.querySelector('label')?.textContent?.trim()
          || field.getAttribute('aria-label')
          || field.getAttribute('placeholder')
          || 'Input';
        const value = field instanceof HTMLSelectElement
          ? field.options[field.selectedIndex]?.text || field.value
          : field.value;
        return { label, value };
      })
      .filter(item => item.value.trim());
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('researchCalcHub.theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (!result) return;
    const next: RecentCalculation[] = [
      {
        calculatorId: calculator.id,
        calculatorName: calculator.name,
        date: new Date().toISOString(),
        summary: result.summary,
        interpretation: result.interpretation,
      },
      ...getRecentCalculations().filter(item => item.calculatorId !== calculator.id || item.interpretation !== result.interpretation),
    ].slice(0, 8);
    localStorage.setItem('researchCalcHub.recentCalculations', JSON.stringify(next));
    setRecentCalculations(next);
  }, [calculator.id, calculator.name, result]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  const handleDownload = () => {
    if (!result) return;
    setIsDownloading(true);
    
    // Dynamically import html2pdf to avoid SSR issues
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('calculator-report-content');
      if (element) {
        const filename = calculator.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        html2pdf.default().from(element).save(`${filename}_report.pdf`).then(() => {
          setIsDownloading(false);
          showToast('PDF report downloaded');
        });
      } else {
        setIsDownloading(false);
      }
    }).catch(() => {
      setIsDownloading(false);
      showToast('Failed to generate PDF');
    });
  };

  const handleCopyResult = async () => {
    if (!result) return;
    const text = resultToText({
      calculatorName: calculator.name,
      formula: calculator.formula,
      results: result.summary.map(item => ({ label: item.label, value: item.value })),
      interpretation: result.interpretation,
      academicText: result.academicText,
      steps: result.steps,
      inputs: getInputSnapshot(),
      disclaimer,
    });
    await copyToClipboard(text);
    setResultCopied(true);
    showToast('Result copied to clipboard');
    setTimeout(() => setResultCopied(false), 2000);
  };

  const handleCsvExport = () => {
    if (csvExport) {
      downloadCsv(csvExport);
    } else if (result) {
      downloadCsv({
        filename: `${calculator.id}_report.csv`,
        headers: ['Section', 'Label', 'Value'],
        rows: [
          ...getInputSnapshot().map(input => ['Input', input.label, input.value]),
          ['Formula', 'Formula', calculator.formula],
          ...result.summary.map(item => ['Result', item.label, item.value]),
          ['Interpretation', 'Interpretation', result.interpretation],
          ['Academic reporting text', 'Academic reporting text', result.academicText],
          ...result.steps.map((step, index) => ['Step', String(index + 1), step]),
          ['Disclaimer', 'Disclaimer', disclaimer],
        ],
      });
    }
    showToast('CSV exported');
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm shadow-lg print:hidden">
          {toast}
        </div>
      )}
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
              <Link to="/" className="hover:text-slate-700 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to="/calculators" className="hover:text-slate-700 transition-colors">Calculators</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link to={`/categories/${calculator.categoryId}`} className="hover:text-slate-700 transition-colors truncate">{calculator.category}</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-900 font-medium truncate">{calculator.name}</span>
            </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6" id="calculator-report-content">
            {/* Title section */}
            <div className="print-section">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`badge ${difficultyColors[calculator.difficulty]}`}>
                  {calculator.difficulty}
                </span>
                <span className="badge bg-slate-100 text-slate-600">{calculator.category}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                {calculator.name}
              </h1>
              <p className="text-slate-600 leading-relaxed">{calculator.longDescription}</p>
            </div>

            {/* When to use */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 text-sm mb-1">When to use this calculator</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">{calculator.whenToUse}</p>
                </div>
              </div>
            </div>

            {/* Formula */}
            <FormulaBox formula={calculator.formula} />

            {/* Calculator inputs (injected by child) */}
            <div className="card print:hidden" ref={inputRef} data-html2canvas-ignore="true">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Calculate</h2>
                <span className="text-xs text-slate-400" title="Inputs are captured automatically for copy, PDF, and recent calculation history.">
                  Auto-saved after calculation
                </span>
              </div>
              {children}
            </div>

            {/* Results */}
            {result && (
              <div className="space-y-4 animate-slide-up">
                {visual && (
                  <div className="animate-fade-in">
                    {visual}
                  </div>
                )}
                
                <ResultCard results={result.summary} title="Calculation Results" />

                <InterpretationBox
                  interpretation={result.interpretation}
                  level={result.interpretationLevel}
                />

                {/* Steps */}
                {result.steps.length > 0 && (
                  <div className="card">
                    <button
                      className="w-full flex items-center justify-between text-left"
                      onClick={() => setStepsOpen(!stepsOpen)}
                    >
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        Step-by-Step Calculation
                      </h3>
                      {stepsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {stepsOpen && (
                      <ol className="mt-4 space-y-2 animate-fade-in">
                        {result.steps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="text-slate-700 font-mono text-xs leading-relaxed pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                <AcademicReportBox text={result.academicText} />

                {/* Download */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:hidden" data-html2canvas-ignore="true">
                  <button
                    onClick={handleCopyResult}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    {resultCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {resultCopied ? 'Copied Result' : 'Copy Result'}
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={handleCsvExport}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                    title="Exports the current inputs, formula, results, interpretation, and calculation steps as CSV."
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </div>
              </div>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <div className="card" data-html2canvas-ignore="true">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-slate-500" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      >
                        <span className="text-sm font-medium text-slate-800">{faq.question}</span>
                        {faqOpen === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                      </button>
                      {faqOpen === i && (
                        <div className="px-4 pb-3 animate-fade-in">
                          <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="card print:hidden">
              <button
                type="button"
                onClick={() => setIsDark(!isDark)}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {recentCalculations.length > 0 && (
              <div className="card print:hidden">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  Recent Calculations
                </h3>
                <div className="space-y-3">
                  {recentCalculations.slice(0, 4).map(item => (
                    <div key={`${item.calculatorId}-${item.date}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-xs font-semibold text-slate-700">{item.calculatorName}</div>
                      <div className="text-[11px] text-slate-400 mb-1">{new Date(item.date).toLocaleString()}</div>
                      <div className="text-xs text-slate-600">{item.summary[0]?.label}: {item.summary[0]?.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {calculator.tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* User types */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Suitable For</h3>
              <div className="space-y-1.5">
                {calculator.userTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            {/* Related calculators */}
            {relatedCalcs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-500" />
                  Related Calculators
                </h3>
                <div className="space-y-2.5">
                  {relatedCalcs.map(c => (
                    <CalculatorCard key={c.id} calculator={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

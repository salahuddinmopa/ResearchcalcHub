import { useState, useEffect, Suspense } from 'react';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { generateWordFrequencies, summarizeText, generateInitialCodes } from '../../utils/qualitativeAnalysis';
import { UploadSection } from "../../components/research/qualitative/UploadSection";
// Lazy load chart components
import { LazyBarChart } from '../../components/charts/LazyBarChart';

// Types for codes, categories, themes
interface Code {
  name: string;
  description: string;
  frequency: number;
  quote: string;
  sourceIdx: number;
}
interface Category {
  name: string;
  description: string;
  codes: Code[];
  frequency: number;
  exampleQuote: string;
}
interface Theme {
  name: string;
  description: string;
  categories: Category[];
  strength: 'Weak' | 'Moderate' | 'Strong';
  evidenceQuotes: string[];
}

const steps = [
  'Data Upload & Familiarisation',
  'Phase 1 – Data Familiarisation',
  'Phase 2 – Initial Coding',
  'Phase 3 – Category Development',
  'Phase 4 – Theme Generation',
  'Phase 5 – Report & Export',
];

export default function QualitativeThematicAnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectTitle, setProjectTitle] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [dataType, setDataType] = useState('Interview transcript');
  const [rawText, setRawText] = useState('');
  const [wordFreq, setWordFreq] = useState<{word:string;freq:number}[]>([]);
  const [summary, setSummary] = useState('');
  const [codes, setCodes] = useState<Code[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  // New state for Category Development
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [codeAssignments, setCodeAssignments] = useState<Record<number, string>>({});
  // New state for Theme Generation
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDesc, setNewThemeDesc] = useState('');
  const [newThemeStrength, setNewThemeStrength] = useState<'Weak' | 'Moderate' | 'Strong'>('Moderate');
  const [themeAssignments, setThemeAssignments] = useState<Record<string, string[]>>({});
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');


  // Persist progress to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('qualitativeAnalysisState');
    if (saved) {
      const state = JSON.parse(saved);
      setCurrentStep(state.currentStep||0);
      setProjectTitle(state.projectTitle||'');
      setResearchTopic(state.researchTopic||'');
      setResearchQuestion(state.researchQuestion||'');
      setDataType(state.dataType||'Interview transcript');
      setRawText(state.rawText||'');
      setWordFreq(state.wordFreq||[]);
      setSummary(state.summary||'');
      setCodes(state.codes||[]);
      setCategories(state.categories||[]);
      setThemes(state.themes||[]);
    }
  }, []);

  useEffect(() => {
    const state = {
      currentStep,
      projectTitle,
      researchTopic,
      researchQuestion,
      dataType,
      rawText,
      wordFreq,
      summary,
      codes,
      categories,
      themes,
    };
    localStorage.setItem('qualitativeAnalysisState', JSON.stringify(state));
  }, [currentStep, projectTitle, researchTopic, researchQuestion, dataType, rawText, wordFreq, summary, codes, categories, themes]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const runPhase1 = () => {
    const freq = generateWordFrequencies(rawText);
    setWordFreq(freq);
    const sum = summarizeText(rawText, 150);
    setSummary(sum);
  };

  const runPhase2 = () => {
    const initCodes = generateInitialCodes(rawText);
    setCodes(initCodes);
  };

const exportReport = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.text(`Project Title: ${projectTitle}`, 10, y); y+=10;
    doc.text(`Research Question: ${researchQuestion}`, 10, y); y+=10;
    doc.text('---', 10, y); y+=10;
    doc.text('Summary of Data Familiarisation', 10, y); y+=10;
    doc.text(summary, 10, y); y+=10;
    // Categories
    doc.text('Categories:', 10, y); y+=10;
    categories.forEach((cat, idx) => {
        doc.text(`${idx+1}. ${cat.name} – ${cat.description} (Codes: ${cat.codes?.length || 0})`, 10, y);
        y+=7;
    });
    // Themes
    doc.text('Themes:', 10, y); y+=10;
    themes.forEach((theme, idx) => {
        doc.text(`${idx+1}. ${theme.name} – ${theme.description} (Strength: ${theme.strength})`, 10, y);
        y+=7;
        if (theme.categories && theme.categories.length) {
            const catNames = theme.categories.map(c=>c.name).join(', ');
            doc.text(`   Categories: ${catNames}`, 12, y);
            y+=7;
        }
    });
    // Generate preview URL
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    setPreviewUrl(url);
    setShowPreview(true);
};

  // Render step-specific UI
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Project Information</h2>
            <input
              type="text"
              placeholder="Project title"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Research topic"
              value={researchTopic}
              onChange={e => setResearchTopic(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Research question"
              value={researchQuestion}
              onChange={e => setResearchQuestion(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <select
              value={dataType}
              onChange={e => setDataType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option>Interview transcript</option>
              <option>Focus group transcript</option>
              <option>Open‑ended survey response</option>
              <option>Policy document</option>
              <option>Field notes</option>
              <option>Other</option>
            </select>
            <textarea
              placeholder="Paste qualitative data here (or upload a .txt/.csv file)"
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={8}
              className="w-full p-2 border rounded"
            />
            <UploadSection onDataLoaded={setRawText} />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <button onClick={runPhase1} className="btn-primary">Run Familiarisation</button>
            {wordFreq.length > 0 && (
              <div>
                <h3 className="font-medium">Word Frequency</h3>
                <div style={{ height: '300px' }}>
                  <LazyBarChart
                  data={{
                    labels: wordFreq.slice(0, 10).map(w => w.word),
                    datasets: [{ label: 'Frequency', data: wordFreq.slice(0, 10).map(w => w.freq), backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
                </div>
                <table className="w-full text-left table-auto border mt-4">
                  <thead className="bg-gray-100"><tr><th className="p-1">Word</th><th className="p-1">Frequency</th></tr></thead>
                  <tbody>
                    {wordFreq.slice(0, 20).map((w, i) => (
                      <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
                        <td className="p-1">{w.word}</td><td className="p-1">{w.freq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {summary && (
              <div>
                <h3 className="font-medium">Data Summary</h3>
                <p>{summary}</p>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <button onClick={runPhase2} className="btn-primary">Generate Initial Codes</button>
            {codes.length > 0 && (
              <div>
                <h3 className="font-medium">Initial Codes</h3>
                <ul className="list-disc pl-5">
                  {codes.map((c, i) => (
                    <li key={i}>
                      <strong>{c.name}</strong> ({c.frequency}): {c.quote}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        case 3:
          return (
            <div className="space-y-4">
              <h3 className="font-medium">Category Development</h3>
              {/* New Category Form */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategoryDesc}
                  onChange={e => setNewCategoryDesc(e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={() => {
                    if (!newCategoryName) return;
                    const newCat: Category = {
                      name: newCategoryName,
                      description: newCategoryDesc,
                      codes: [],
                      frequency: 0,
                      exampleQuote: '',
                    };
                    setCategories([...categories, newCat]);
                    setNewCategoryName('');
                    setNewCategoryDesc('');
                  }}
                  className="btn-primary"
                >Add Category</button>
              </div>
              {/* List of Categories */}
              {categories.map((cat, catIdx) => (
                <div key={catIdx} className="border p-3 rounded bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <strong>{cat.name}</strong> – {cat.description}
                    </div>
                    <button
                      onClick={() => {
                        const el = document.getElementById(`cat-assign-${catIdx}`);
                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                      }}
                      className="text-sm text-indigo-600 underline"
                    >Assign Codes</button>
                  </div>
                  <div id={`cat-assign-${catIdx}`} style={{ display: 'none' }} className="ml-4">
                    {codes.map((code, codeIdx) => (
                      <div key={codeIdx} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={codeAssignments[codeIdx] === cat.name}
                          onChange={e => {
                            const newAssign = { ...codeAssignments };
                            if (e.target.checked) {
                              newAssign[codeIdx] = cat.name;
                            } else {
                              delete newAssign[codeIdx];
                            }
                            setCodeAssignments(newAssign);
                            // Update category codes
                            const updatedCategories = categories.map((c, i) => {
                              if (i === catIdx) {
                                const assignedCodes = codes.filter((_, idx) => newAssign[idx] === c.name);
                                return { ...c, codes: assignedCodes };
                              }
                              return c;
                            });
                            setCategories(updatedCategories);
                          }}
                          className="mr-2"
                        />
                        <span>{code.name} ({code.frequency})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {/* Category Frequency Bar Chart */}
              {categories.length > 0 && (
                <div style={{ height: '300px' }} className="mt-4">
                  <LazyBarChart
                  data={{
                    labels: categories.map(c => c.name),
                    datasets: [{
                      label: 'Number of Codes',
                      data: categories.map(c => (c.codes?.length || 0)),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)'
                    }]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
                </div>
              )}
            </div>
          )

          
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Theme Generation</h3>
            {/* New Theme Form */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Theme name"
                value={newThemeName}
                onChange={e => setNewThemeName(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newThemeDesc}
                onChange={e => setNewThemeDesc(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <select
                value={newThemeStrength}
                onChange={e => setNewThemeStrength(e.target.value as Theme['strength'])}
                className="p-2 border rounded"
              >
                <option value="Weak">Weak</option>
                <option value="Moderate">Moderate</option>
                <option value="Strong">Strong</option>
              </select>
              <button
                onClick={() => {
                  if (!newThemeName) return;
                  const newTheme: Theme = {
                    name: newThemeName,
                    description: newThemeDesc,
                    categories: [],
                    strength: newThemeStrength,
                    evidenceQuotes: [],
                  };
                  setThemes([...themes, newTheme]);
                  setNewThemeName('');
                  setNewThemeDesc('');
                }}
                className="btn-primary"
              >Add Theme</button>
            </div>
            {/* List of Themes */}
            {themes.map((theme, thIdx) => (
              <div key={thIdx} className="border p-3 rounded bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <strong>{theme.name}</strong> – {theme.description} <em>({theme.strength})</em>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById(`theme-assign-${thIdx}`);
                      if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    }}
                    className="text-sm text-indigo-600 underline"
                  >Assign Categories</button>
                </div>
                <div id={`theme-assign-${thIdx}`} style={{ display: 'none' }} className="ml-4">
                  {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={themeAssignments[theme.name]?.includes(cat.name) ?? false}
                        onChange={e => {
                          const current = themeAssignments[theme.name] ?? [];
                          const newArr = e.target.checked
                            ? [...current, cat.name]
                            : current.filter(name => name !== cat.name);
                          setThemeAssignments({ ...themeAssignments, [theme.name]: newArr });
                          // Update theme's categories
                          const updatedThemes = themes.map((t, i) => {
                            if (i === thIdx) {
                              const assignedCats = categories.filter(c => newArr.includes(c.name));
                              return { ...t, categories: assignedCats };
                            }
                            return t;
                          });
                          setThemes(updatedThemes);
                        }}
                        className="mr-2"
                      />
                      <span>{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          
          {/* Theme Strength Bar Chart */}
          {themes.length > 0 && (
            <div style={{ height: '300px' }} className="mt-4">
              <LazyBarChart
                  data={{
                    labels: ['Weak', 'Moderate', 'Strong'],
                    datasets: [{
                      label: 'Number of Themes',
                      data: ['Weak', 'Moderate', 'Strong'].map(strength => themes.filter(t => t.strength === strength).length),
                      backgroundColor: ['rgba(255,99,132,0.6)','rgba(54,162,235,0.6)','rgba(75,192,192,0.6)'],
                    }],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
            </div>
          )}
            </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <button onClick={() => setShowExportConfirm(true)} className="btn-primary">Export PDF Report</button>
            <p className="text-sm text-gray-600">*Disclaimer: This tool supports qualitative analysis but does not replace researcher judgement. Review and edit all outputs before academic use.</p>
            {showExportConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                  <h3 className="text-lg font-medium mb-4">Confirm Export</h3>
                  <p className="mb-2"><strong>Project Title:</strong> {projectTitle || '(none)'}</p>
                  <p className="mb-2"><strong>Research Question:</strong> {researchQuestion || '(none)'}</p>
                  <p className="mb-2"><strong>Categories:</strong> {categories.length}</p>
                  <p className="mb-4"><strong>Themes:</strong> {themes.length}</p>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => setShowExportConfirm(false)} className="btn-secondary">Cancel</button>
                    <button onClick={() => { exportReport(); setShowExportConfirm(false); }} className="btn-primary">Confirm</button>
                  </div>
                </div>
              </div>
            )}
            {/* PDF preview modal */}
            {showPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 h-5/6 overflow-auto">
                  <h3 className="text-lg font-medium mb-2">PDF Preview</h3>
                  <embed src={previewUrl} type="application/pdf" className="w-full h-4/5" />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={() => { setShowPreview(false); URL.revokeObjectURL(previewUrl); }} className="btn-secondary">Close</button>
                    <button onClick={() => { const link = document.createElement('a'); link.href = previewUrl; link.download = 'Qualitative_Thematic_Report.pdf'; link.click(); }} className="btn-primary">Download</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center mb-4">
        <div className="flex-1 h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-indigo-600 rounded"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <span className="ml-2 text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
      </div>
      <h1 className="text-2xl font-bold mb-4">AI‑Assisted Thematic Analysis Tool</h1>
      {renderStep()}
      <div className="flex justify-between mt-6">
        <button onClick={handleBack} disabled={currentStep === 0} className="btn-secondary">Back</button>
        <button onClick={handleNext} disabled={currentStep === steps.length - 1} className="btn-primary">Next</button>
      </div>
    </div>
  );
}

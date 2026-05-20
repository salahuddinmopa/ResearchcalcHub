import React, { useState } from 'react';
import Step1Input from '../../components/qualitative/Step1Input';
import Step2Familiarisation from '../../components/qualitative/Step2Familiarisation';
import Step3InitialCodes from '../../components/qualitative/Step3InitialCodes';
import Step4Categories from '../../components/qualitative/Step4Categories';
import Step5Themes from '../../components/qualitative/Step5Themes';
import Step6Report from '../../components/qualitative/Step6Report';
import ProgressBar from '../../components/qualitative/ProgressBar';



// Simple stop‑word list for English
const STOP_WORDS = new Set([
  'the','and','for','are','but','not','you','your','with','that','this','from','they','have','has','was','were','been','being','will','would','can','could','should','may','might','must','do','does','did','done','of','in','to','a','an','on','at','by','as','i','we','he','she','it','them','their','its','or','if','else','when','where','what','how','why','so','than','then','once','here','there','now','just','like','also','about','into','out','up','down','over','under','after','before','again','new','old','more','most','some','any','all','one','two','three','four','five','six','seven','eight','nine','ten','participant','researcher','data','study'
]);

export default function QualitativeThematicAnalysisPage() {
  const [step, setStep] = useState(1);

  // Shared data across steps
  const [projectTitle, setProjectTitle] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [dataType, setDataType] = useState('Interview transcript');
  const [rawText, setRawText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [codes, setCodes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);

  // Helper: basic text analysis
  const analyseText = (text: string) => {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w && !STOP_WORDS.has(w));
    const wordCount = words.length;
    const charCount = text.length;
    const paragraphCount = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const readingTime = Math.ceil(wordCount / 200); // approx 200 wpm
    // Frequency map
    const freq: Record<string, number> = {};
    words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const topKeywords = sorted.slice(0, 10).map(([k, v]) => ({ word: k, count: v }));
    const summary = text.split('. ').slice(0, 3).join('. ') + '.';
    return { wordCount, charCount, paragraphCount, readingTime, summary, freq, topKeywords };
  };

  const handleAnalyse = () => {
    const result = analyseText(rawText);
    setAnalysisResult(result);
    // generate simple codes from top keywords
    const generatedCodes = result.topKeywords.map((kw) => ({
      name: kw.word.charAt(0).toUpperCase() + kw.word.slice(1),
      description: '',
      frequency: kw.count,
      example: rawText.includes(kw.word) ? kw.word : ''
    }));
    setCodes(generatedCodes);
    // simple category placeholders
    const defaultCategories = [
      { name: 'Governance Issues', codes: [], explanation: '' },
      { name: 'Resource Constraints', codes: [], explanation: '' },
      { name: 'Training and Skills', codes: [], explanation: '' },
      { name: 'Technology Challenges', codes: [], explanation: '' },
      { name: 'Policy and Compliance', codes: [], explanation: '' },
      { name: 'Trust and Accountability', codes: [], explanation: '' }
    ];
    setCategories(defaultCategories);
    // simple themes derived from categories
    const defaultThemes = defaultCategories.map((cat) => ({
      name: cat.name + ' Theme',
      description: '',
      relatedCategories: [cat.name],
      supportingCodes: [],
      supportingQuote: '',
      strength: 'Moderate'
    }));
    setThemes(defaultThemes);
  };

  const resetAll = () => {
    setStep(1);
    setProjectTitle('');
    setResearchQuestion('');
    setDataType('Interview transcript');
    setRawText('');
    setAnalysisResult(null);
    setCodes([]);
    setCategories([]);
    setThemes([]);
  };

  const stepProps = {
    projectTitle,
    setProjectTitle,
    researchQuestion,
    setResearchQuestion,
    dataType,
    setDataType,
    rawText,
    setRawText,
    analysisResult,
    setAnalysisResult,
    codes,
    setCodes,
    categories,
    setCategories,
    themes,
    setThemes,
    handleAnalyse,
    resetAll
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">Qualitative Thematic Analysis Tool</h1>
      <ProgressBar currentStep={step} totalSteps={6} />
      <div className="mt-6">
        {step === 1 && <Step1Input {...stepProps} />}
        {step === 2 && <Step2Familiarisation {...stepProps} />}
        {step === 3 && <Step3InitialCodes {...stepProps} />}
        {step === 4 && <Step4Categories {...stepProps} />}
        {step === 5 && <Step5Themes {...stepProps} />}
        {step === 6 && <Step6Report {...stepProps} />}
      </div>
      <div className="flex justify-between mt-8">
        <button
          className="btn-secondary"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
        >Previous</button>
        {step < 6 && (
          <button className="btn-primary" onClick={() => setStep((s) => Math.min(6, s + 1))}>Next</button>
        )}
        {step === 6 && (
          <button className="btn-primary" onClick={resetAll}>Reset All</button>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p className="italic">
          “This tool supports qualitative analysis but does not replace researcher judgement. Users should review and validate all codes, categories, themes, and interpretations before using them in academic work.”
        </p>
      </div>
    </div>
  );
}

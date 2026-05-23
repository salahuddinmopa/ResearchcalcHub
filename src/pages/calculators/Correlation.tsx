import { useState } from 'react';
import { CalculatorLayout } from '../../components/calculators/CalculatorLayout';
import { NumericInputBox } from '../../components/ui/NumericInputBox';
import { getCalculatorById } from '../../data/calculators';
import { calculatePearsonCorrelation, parseNumberList, parsePairedNumberTable } from '../../utils/statistics';
import type { CalculatorResult } from '../../types';
import CorrelationResult from '../../components/visualizations/CorrelationResult';


const calc = getCalculatorById('correlation')!;

export function CorrelationPage() {
  const [mode, setMode] = useState<'separate' | 'paired'>('separate');
  const [xValues, setXValues] = useState('');
  const [yValues, setYValues] = useState('');
  const [pairedValues, setPairedValues] = useState('');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [error, setError] = useState('');

  const [visualData, setVisualData] = useState<null | {
    r: number;
    direction: string;
    strengthLabel: string;
    strengthPct: number;
    points: { x: number; y: number }[];
  }>(null);

  const getColourCategory = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal < 0.3) return 'low';
    if (absVal < 0.5) return 'medium';
    if (absVal < 0.7) return 'high';
    return 'excellent';
  };

  const handleCalculate = () => {
    setError('');
    let x: number[] = [];
    let y: number[] = [];

    if (mode === 'paired') {
      const parsed = parsePairedNumberTable(pairedValues);
      if (parsed.invalidRows.length > 0) return setError(`Invalid paired row(s): ${parsed.invalidRows.join(', ')}`);
      x = parsed.x;
      y = parsed.y;
    } else {
      const parsedX = parseNumberList(xValues);
      const parsedY = parseNumberList(yValues);
      if (parsedX.invalidTokens.length > 0) return setError(`Invalid X value(s): ${parsedX.invalidTokens.join(', ')}`);
      if (parsedY.invalidTokens.length > 0) return setError(`Invalid Y value(s): ${parsedY.invalidTokens.join(', ')}`);
      x = parsedX.values;
      y = parsedY.values;
    }

    try {
      const r = calculatePearsonCorrelation(x, y);
      
      // Prepare visual data for CorrelationResult component
      const strengthPct = Math.abs(r.r) * 100;
      setVisualData({
        r: r.r,
        direction: r.direction,
        strengthLabel: r.interpretation,
        strengthPct,
        points: x.map((xi, i) => ({ x: xi, y: y[i] })),
      });
      setResult({
        summary: [
          { label: 'Pearson Correlation Coefficient', value: r.r.toFixed(4), highlight: true },
          { label: 'Strength of Relationship', value: r.strength, highlight: true },
          { label: 'Direction of Relationship', value: r.direction },
          { label: 'Basic Interpretation', value: r.interpretation },
          { label: 'R Squared', value: r.rSquared.toFixed(4) },
          { label: 'Paired Observations', value: r.count.toString() },
        ],
        interpretation: `Pearson's r = ${r.r.toFixed(3)}, indicating a ${r.interpretation.toLowerCase()}.`,
        interpretationLevel: r.level,
        steps: r.steps,
        academicText: r.academicText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to calculate correlation.');
    }
  };

  const handleExample = () => {
    setResult(null);
    setError('');
    setMode('paired');
    setPairedValues('10\t12\n20\t22\n30\t28\n40\t38\n50\t52\n60\t58\n70\t72\n80\t81\n90\t88\n100\t102');
    setXValues('');
    setYValues('');
    setVisualData(null);
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setMode('separate');
    setXValues('');
    setYValues('');
    setPairedValues('');
    setVisualData(null);
  };

  return (
    <CalculatorLayout 
      calculator={calc} 
      result={result}
      visual={visualData !== null ? (
        <CorrelationResult
          data={visualData}
        />
      ) : undefined}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === 'separate'} onChange={() => setMode('separate')} className="accent-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Separate X and Y lists</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={mode === 'paired'} onChange={() => setMode('paired')} className="accent-indigo-600" />
            <span className="text-sm font-medium text-slate-700">Paste paired Excel columns</span>
          </label>
        </div>

        {mode === 'paired' ? (
          <div>
            <label className="label">Paired X and Y Values</label>
            <textarea
              value={pairedValues}
              onChange={e => setPairedValues(e.target.value)}
              className="input-field h-40 font-mono text-sm resize-none"
              placeholder={'10\t12\n20\t22\n30\t28'}
            />
            <p className="text-xs text-slate-400 mt-1">Paste two columns from Excel: X in column 1, Y in column 2.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumericInputBox label="X Values" value={xValues} onChange={setXValues} minCount={3} />
            <NumericInputBox label="Y Values" value={yValues} onChange={setYValues} minCount={3} />
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleCalculate} className="btn-primary flex-1 sm:flex-none">Calculate Correlation</button>
          <button onClick={handleExample} className="btn-secondary">Load Example</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>

      </div>
    </CalculatorLayout>
  );
}

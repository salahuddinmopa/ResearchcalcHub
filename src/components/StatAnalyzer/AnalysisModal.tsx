import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { frequencies } from '../../lib/statistics/frequencies';
import { descriptives } from '../../lib/statistics/descriptives';
import { oneSampleTTest, independentTTest, pairedTTest } from '../../lib/statistics/tTests';
import { anova } from '../../lib/statistics/anova';
import { correlationTest } from '../../lib/statistics/correlation';
import { linearRegression } from '../../lib/statistics/regression';
import { chiSquareTest } from '../../lib/statistics/chiSquare';
import { mannWhitneyUTest } from '../../lib/statistics/mannWhitney';
import { cronbachAlpha } from '../../lib/statistics/cronbach';
import type { ResultData } from '../../pages/StatAnalyzer/StatAnalyzerPage';
import type { CsvRow } from '../../lib/statistics/types';

interface AnalysisModalProps {
  data: CsvRow[];
  variables: string[];
  onClose: () => void;
  onAddResult: (result: ResultData) => void;
  analysisName: string;
}

const TWO_VAR = new Set([
  'Independent Samples T‑Test',
  'Paired Samples T‑Test',
  'Correlation',
  'Linear Regression',
  'Mann‑Whitney U',
  'One‑Way ANOVA',
]);

function sig(p: number): string {
  if (p < 0.001) return 'p < .001 ***';
  if (p < 0.01) return `p = ${p.toFixed(3)} **`;
  if (p < 0.05) return `p = ${p.toFixed(3)} *`;
  return `p = ${p.toFixed(3)} ns`;
}


export function AnalysisModal({ data, variables, onClose, onAddResult, analysisName }: AnalysisModalProps) {
  const allCols = data.length > 0 ? Object.keys(data[0]) : variables;
  const [varA, setVarA] = useState<string>(allCols[0] ?? '');
  const [varB, setVarB] = useState<string>(allCols[1] ?? allCols[0] ?? '');
  const [mu, setMu] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const needsTwo = TWO_VAR.has(analysisName);
  const isCronbach = analysisName === 'Cronbach Alpha';
  const isOneSampleT = analysisName === 'One‑Sample T‑Test';

  const handleRun = () => {
    setError('');
    if (data.length === 0) { setError('No data loaded. Upload a CSV first.'); return; }

    let title = '';
    let rows: [string, string | number][] = [];

    try {
      if (analysisName === 'Frequencies') {
        const r = frequencies(data, [varA])[0];
        title = `Frequencies – ${varA}`;
        rows = [
          ['Count', r.count],
          ['Distinct values', r.distinct],
          ['Min', r.min ?? 'N/A'],
          ['Max', r.max ?? 'N/A'],
          ...(r.mean !== undefined ? [['Mean', r.mean] as [string, number]] : []),
          ...(r.median !== undefined ? [['Median', r.median] as [string, number]] : []),
          ...(r.mode?.length ? [['Mode', r.mode.join(', ')] as [string, string]] : []),
          ['—— Value counts ——', ''],
          ...Object.entries(r.counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([k, v]) => [k, v] as [string, number]),
        ];

      } else if (analysisName === 'Descriptives') {
        const r = descriptives(data, varA);
        title = `Descriptives – ${varA}`;
        rows = [
          ['N', r.count],
          ['Mean', r.mean ?? 'N/A'],
          ['Median', r.median ?? 'N/A'],
          ['Std. Deviation', r.stdDev ?? 'N/A'],
          ['Variance', r.variance ?? 'N/A'],
          ['Min', r.min],
          ['Max', r.max],
          ['Range', typeof r.min === 'number' && typeof r.max === 'number' ? r.max - r.min : 'N/A'],
        ];

      } else if (isOneSampleT) {
        const r = oneSampleTTest(data, varA, mu);
        const dInterp = Math.abs(r.cohensD) >= 0.8 ? 'large' : Math.abs(r.cohensD) >= 0.5 ? 'medium' : 'small';
        title = `One-Sample T-Test – ${varA} (μ₀ = ${mu})`;
        rows = [
          ['Variable', varA],
          ['N', r.n],
          ['Sample Mean', r.mean],
          ['Hypothesized Mean', mu],
          ['t', r.tStatistic],
          ['df', r.df],
          ['Significance', sig(r.pValue)],
          ["Cohen's d", r.cohensD],
          ['Effect size', dInterp],
        ];

      } else if (analysisName === 'Independent Samples T‑Test') {
        const r = independentTTest(data, varA, varB);
        const dInterp = Math.abs(r.cohensD) >= 0.8 ? 'large' : Math.abs(r.cohensD) >= 0.5 ? 'medium' : 'small';
        title = `Independent T-Test – ${varA} vs ${varB}`;
        rows = [
          ['Group 1 (X)', varA],
          ['Group 2 (Y)', varB],
          ['Mean X', r.meanX],
          ['Mean Y', r.meanY],
          ['Mean diff (X−Y)', r.meanX - r.meanY],
          ['t', r.tStatistic],
          ['df', r.df],
          ['Significance', sig(r.pValue)],
          ["Cohen's d", r.cohensD],
          ['Effect size', dInterp],
        ];

      } else if (analysisName === 'Paired Samples T‑Test') {
        const r = pairedTTest(data, varA, varB);
        const dInterp = Math.abs(r.cohensD) >= 0.8 ? 'large' : Math.abs(r.cohensD) >= 0.5 ? 'medium' : 'small';
        title = `Paired T-Test – ${varA} vs ${varB}`;
        rows = [
          ['Variable 1', varA],
          ['Variable 2', varB],
          ['Mean difference', r.meanDiff],
          ['t', r.tStatistic],
          ['df', r.df],
          ['Significance', sig(r.pValue)],
          ["Cohen's d", r.cohensD],
          ['Effect size', dInterp],
        ];

      } else if (analysisName === 'One‑Way ANOVA') {
        const groupsData: Record<string, number[]> = {};
        data.forEach(row => {
          const grp = String(row[varA] ?? 'Unknown');
          const val = row[varB];
          if (typeof val === 'number') {
            if (!groupsData[grp]) groupsData[grp] = [];
            groupsData[grp].push(val);
          }
        });
        if (Object.keys(groupsData).length < 2) {
          setError('Need at least 2 groups. Check group variable has categorical values.');
          return;
        }
        const r = anova(groupsData);
        const etaInterp = r.etaSquared >= 0.14 ? 'large' : r.etaSquared >= 0.06 ? 'medium' : 'small';
        title = `One-Way ANOVA – ${varB} by ${varA}`;
        rows = [
          ['Dependent (value)', varB],
          ['Factor (group)', varA],
          ['Groups', r.groups.join(', ')],
          ['df Between', r.dfBetween],
          ['df Within', r.dfWithin],
          ['F', r.fStatistic],
          ['Significance', sig(r.pValue)],
          ['η² (eta-squared)', r.etaSquared],
          ['ω² (omega-squared)', r.omegaSquared],
          ['Effect size', etaInterp],
        ];

      } else if (analysisName === 'Correlation') {
        const r = correlationTest(data, varA, varB);
        const strength = Math.abs(r.r) >= 0.7 ? 'Strong' : Math.abs(r.r) >= 0.4 ? 'Moderate' : Math.abs(r.r) >= 0.2 ? 'Weak' : 'Negligible';
        const direction = r.r > 0 ? 'positive' : 'negative';
        title = `Pearson Correlation – ${varA} vs ${varB}`;
        rows = [
          ['Variable X', varA],
          ['Variable Y', varB],
          ['N', r.n],
          ['Pearson r', r.r],
          ['r² (variance explained)', r.rSquared],
          ['95% CI for r', `[${r.ciLower.toFixed(3)}, ${r.ciUpper.toFixed(3)}]`],
          ['Significance', sig(r.pValue)],
          ['Interpretation', `${strength} ${direction}`],
        ];

      } else if (analysisName === 'Linear Regression') {
        const r = linearRegression(data, varB, varA);
        title = `Linear Regression – ${varB} ~ ${varA}`;
        rows = [
          ['Dependent (Y)', varB],
          ['Independent (X)', varA],
          ['Slope (b₁)', r.slope],
          ['Intercept (b₀)', r.intercept],
          ['R²', r.rSquared],
          ['Equation', `Ŷ = ${r.slope.toFixed(4)}·X + ${r.intercept.toFixed(4)}`],
        ];

      } else if (analysisName === 'Chi‑Square') {
        const freq = frequencies(data, [varA])[0];
        const observed = Object.values(freq.counts);
        const total = observed.reduce((a: number, b: number) => a + b, 0);
        const expected = observed.map(() => total / observed.length);
        const r = chiSquareTest(observed, expected);
        title = `Chi-Square Goodness-of-Fit – ${varA}`;
        rows = [
          ['Variable', varA],
          ['N', total],
          ['Categories', observed.length],
          ['χ²', r.chi2],
          ['df', observed.length - 1],
          ['Significance', sig(r.pValue)],
          ['Note', 'H₀: equal distribution across categories'],
        ];

      } else if (analysisName === 'Mann‑Whitney U') {
        const r = mannWhitneyUTest(data, varA, varB);
        title = `Mann-Whitney U – ${varA} vs ${varB}`;
        rows = [
          ['Variable X', varA],
          ['Variable Y', varB],
          ['U statistic', r.uStatistic],
          ['Significance', sig(r.pValue)],
          ['Note', 'Normal approximation used'],
        ];

      } else if (isCronbach) {
        const vars = variables.length > 0 ? variables : allCols;
        const alpha = cronbachAlpha(data, vars);
        const interp = alpha >= 0.9 ? 'Excellent' : alpha >= 0.8 ? 'Good' : alpha >= 0.7 ? 'Acceptable' : alpha >= 0.6 ? 'Questionable' : 'Poor';
        title = `Cronbach's Alpha – ${vars.length} items`;
        rows = [
          ['Items', vars.join(', ')],
          ['N items', vars.length],
          ['N cases', data.length],
          ['α', alpha],
          ['Interpretation', interp],
        ];
      }
    } catch (e: any) {
      setError(e?.message || 'Calculation error. Check variable types and data.');
      return;
    }

    onAddResult({ title, rows, timestamp: Date.now() });
    onClose();
  };

  const labelA = analysisName === 'One‑Way ANOVA' ? 'Group Variable (factor)'
    : analysisName === 'Linear Regression' ? 'Independent Variable (X)'
    : 'Variable';
  const labelB = analysisName === 'One‑Way ANOVA' ? 'Value Variable (outcome)'
    : analysisName === 'Linear Regression' ? 'Dependent Variable (Y)'
    : 'Second Variable';

  return (
    <Modal onClose={onClose} title={analysisName}>
      <div className="p-4 space-y-4 min-w-[320px]">
        {isCronbach ? (
          <p className="text-sm text-slate-600">
            Uses all variables selected in Variable View
            {variables.length > 0 ? `: ${variables.join(', ')}` : ' (none selected — will use all columns)'}.
          </p>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-wide">{labelA}</label>
              <select
                value={varA}
                onChange={e => setVarA(e.target.value)}
                className="border border-gray-300 rounded w-full p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {allCols.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {needsTwo && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-wide">{labelB}</label>
                <select
                  value={varB}
                  onChange={e => setVarB(e.target.value)}
                  className="border border-gray-300 rounded w-full p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {allCols.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            {isOneSampleT && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-wide">Hypothesized Mean (μ₀)</label>
                <input
                  type="number"
                  value={mu}
                  onChange={e => setMu(Number(e.target.value))}
                  className="border border-gray-300 rounded w-full p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-sm text-slate-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRun}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 font-medium"
          >
            Run Analysis
          </button>
        </div>
      </div>
    </Modal>
  );
}

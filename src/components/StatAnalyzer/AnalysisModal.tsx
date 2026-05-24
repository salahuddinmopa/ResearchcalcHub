import React, { useState } from 'react';
import { frequencies, FrequencyResult } from '../../lib/statistics/frequencies';
import { descriptives, DescriptiveResult } from '../../lib/statistics/descriptives';
import { Modal } from '../../components/ui/Modal';
import { oneSampleTTest, independentTTest, pairedTTest } from '../../lib/statistics/tTests';
import { anova } from '../../lib/statistics/anova';
import { correlationTest } from '../../lib/statistics/correlation';
import { linearRegression } from '../../lib/statistics/regression';
import { chiSquareTest } from '../../lib/statistics/chiSquare';
import { mannWhitneyUTest } from '../../lib/statistics/mannWhitney';
import { cronbachAlpha } from '../../lib/statistics/cronbach';

interface AnalysisModalProps {
  data: any[];
  variables: string[];
  onClose: () => void;
  onAddResult: (block: React.ReactNode) => void;
  analysisName: string;
}

export function AnalysisModal({ data, variables, onClose, onAddResult, analysisName }: AnalysisModalProps) {
  const [selectedVar, setSelectedVar] = useState<string>(variables[0] || '');

  const handleRun = () => {
    if (!selectedVar) return;
    let block = null;
    if (analysisName === 'Frequencies') {
      const results = frequencies(data, [selectedVar]);
      const result = results[0];
      
      block = (
        <div className="p-4 border rounded-lg bg-white shadow-sm mb-4" id="analysis-result">
          <h3 className="font-semibold mb-2">Frequencies – {selectedVar}</h3>
          <table className="min-w-full text-sm border">
            <tbody>
              <tr><td className="px-2 py-1">Count</td><td className="px-2 py-1">{result.count}</td></tr>
              <tr><td className="px-2 py-1">Distinct</td><td className="px-2 py-1">{result.distinct}</td></tr>
              <tr><td className="px-2 py-1">Min</td><td className="px-2 py-1">{result.min}</td></tr>
              <tr><td className="px-2 py-1">Max</td><td className="px-2 py-1">{result.max}</td></tr>
              {result.mean !== undefined && (
                <tr><td className="px-2 py-1">Mean</td><td className="px-2 py-1">{result.mean.toFixed(2)}</td></tr>
              )}
              {result.median !== undefined && (
                <tr><td className="px-2 py-1">Median</td><td className="px-2 py-1">{result.median.toFixed(2)}</td></tr>
              )}
              {result.mode && result.mode.length > 0 && (
                <tr><td className="px-2 py-1">Mode</td><td className="px-2 py-1">{result.mode.join(', ')}</td></tr>
              )}
            </tbody>
          </table>
          <div className="mt-2 flex space-x-2">
            <button type="button" onClick={() => {
              const text = `Count: ${result.count}\nDistinct: ${result.distinct}\nMin: ${result.min}\nMax: ${result.max}\nMean: ${result.mean?.toFixed(2) ?? ''}\nMedian: ${result.median?.toFixed(2) ?? ''}\nMode: ${result.mode?.join(', ') ?? ''}`;
              navigator.clipboard.writeText(text);
            }} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm">Copy</button>
            <button type="button" onClick={() => {
              const element = document.createElement('div');
              element.innerHTML = document.getElementById('analysis-result')?.innerHTML || '';
              // @ts-ignore
              window.html2pdf().from(element).save();
            }} className="px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Export PDF</button>
          </div>
        </div>
      );
    } else if (analysisName === 'Descriptives') {
      const result: DescriptiveResult = descriptives(data, selectedVar);
      block = (
        <div className="p-4 border rounded-lg bg-white shadow-sm mb-4" id="analysis-result">
          <h3 className="font-semibold mb-2">Descriptives – {selectedVar}</h3>
          <table className="min-w-full text-sm border">
            <tbody>
              <tr><td className="px-2 py-1">Mean</td><td className="px-2 py-1">{result.mean?.toFixed(2) ?? 'N/A'}</td></tr>
              <tr><td className="px-2 py-1">Median</td><td className="px-2 py-1">{result.median?.toFixed(2) ?? 'N/A'}</td></tr>
              <tr><td className="px-2 py-1">Std Dev</td><td className="px-2 py-1">{result.stdDev?.toFixed(2) ?? 'N/A'}</td></tr>
              <tr><td className="px-2 py-1">Variance</td><td className="px-2 py-1">{result.variance?.toFixed(2) ?? 'N/A'}</td></tr>
            </tbody>
          </table>
        </div>
      );
    }
    // Future analysis cases will be added here.
    if (block) {
      onAddResult(block);
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} title={`Statistical Analysis – ${analysisName}`}> 
      <div className="p-4">
        <label className="block mb-2 font-medium">Variable</label>
        <select value={selectedVar} onChange={e => setSelectedVar(e.target.value)} className="border rounded w-full p-2">
          {variables.map(v => (<option key={v} value={v}>{v}</option>))}
        </select>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={handleRun} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Run</button>
        </div>
      </div>
    </Modal>
  );
}

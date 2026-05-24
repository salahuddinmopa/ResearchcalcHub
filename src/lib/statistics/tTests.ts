import { jStat } from 'jstat';
import type { CsvRow } from './types';

export interface OneSampleTResult {
  variable: string;
  n: number;
  mean: number;
  tStatistic: number;
  df: number;
  pValue: number;
  cohensD: number;
}

export function oneSampleTTest(
  data: CsvRow[],
  variable: string,
  mu = 0
): OneSampleTResult {
  const values = data.map(row => row[variable]).filter(v => typeof v === 'number') as number[];
  const n = values.length;
  const mean = values.reduce((a: number, b: number) => a + b, 0) / n;
  const variance = values.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  const t = (mean - mu) / se;
  const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 1));
  const cohensD = (mean - mu) / sd;
  return { variable, n, mean, tStatistic: t, df: n - 1, pValue: p, cohensD };
}

export interface IndependentTResult {
  variableX: string;
  variableY: string;
  meanX: number;
  meanY: number;
  tStatistic: number;
  df: number;
  pValue: number;
  cohensD: number;
}

export function independentTTest(
  data: CsvRow[],
  variableX: string,
  variableY: string
): IndependentTResult {
  const xVals = data.map(r => r[variableX]).filter(v => typeof v === 'number') as number[];
  const yVals = data.map(r => r[variableY]).filter(v => typeof v === 'number') as number[];
  const n1 = xVals.length;
  const n2 = yVals.length;
  const mean1 = xVals.reduce((a: number, b: number) => a + b, 0) / n1;
  const mean2 = yVals.reduce((a: number, b: number) => a + b, 0) / n2;
  const var1 = xVals.reduce((s: number, v: number) => s + (v - mean1) ** 2, 0) / (n1 - 1);
  const var2 = yVals.reduce((s: number, v: number) => s + (v - mean2) ** 2, 0) / (n2 - 1);
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
  const pooledSD = Math.sqrt(pooledVar);
  const pooledSE = pooledSD * Math.sqrt(1 / n1 + 1 / n2);
  const tStat = (mean1 - mean2) / pooledSE;
  const dfVal = n1 + n2 - 2;
  const pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), dfVal));
  const cohensD = (mean1 - mean2) / pooledSD;
  return { variableX, variableY, meanX: mean1, meanY: mean2, tStatistic: tStat, df: dfVal, pValue: pVal, cohensD };
}

export interface PairedTResult {
  variableX: string;
  variableY: string;
  meanDiff: number;
  tStatistic: number;
  df: number;
  pValue: number;
  cohensD: number;
}

export function pairedTTest(
  data: CsvRow[],
  variableX: string,
  variableY: string
): PairedTResult {
  const diffs = data
    .map(r => {
      const a = r[variableX];
      const b = r[variableY];
      return typeof a === 'number' && typeof b === 'number' ? a - b : null;
    })
    .filter((v): v is number => v !== null);
  const n = diffs.length;
  const meanDiff = diffs.reduce((a: number, b: number) => a + b, 0) / n;
  const sdDiff = Math.sqrt(diffs.reduce((s: number, v: number) => s + (v - meanDiff) ** 2, 0) / (n - 1));
  const tStat = meanDiff / (sdDiff / Math.sqrt(n));
  const pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), n - 1));
  const cohensD = meanDiff / sdDiff;
  return { variableX, variableY, meanDiff, tStatistic: tStat, df: n - 1, pValue: pVal, cohensD };
}

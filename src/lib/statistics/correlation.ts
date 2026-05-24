import { jStat } from 'jstat';
import type { CsvRow } from './types';

export interface CorrelationResult {
  variableX: string;
  variableY: string;
  r: number;
  rSquared: number;
  pValue: number;
  n: number;
  ciLower: number;
  ciUpper: number;
}

export function correlationTest(
  data: CsvRow[],
  variableX: string,
  variableY: string
): CorrelationResult {
  const xVals = data.map(row => row[variableX]).filter(v => typeof v === 'number') as number[];
  const yVals = data.map(row => row[variableY]).filter(v => typeof v === 'number') as number[];
  const n = Math.min(xVals.length, yVals.length);

  if (n < 3) {
    return { variableX, variableY, r: NaN, rSquared: NaN, pValue: NaN, n, ciLower: NaN, ciUpper: NaN };
  }

  const r = jStat.corrcoeff(xVals.slice(0, n), yVals.slice(0, n));
  const rSquared = r ** 2;
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  // Fisher z-transformation for 95% CI
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const zCrit = 1.96;
  const ciLower = Math.tanh(z - zCrit * se);
  const ciUpper = Math.tanh(z + zCrit * se);

  return { variableX, variableY, r, rSquared, pValue: p, n, ciLower, ciUpper };
}

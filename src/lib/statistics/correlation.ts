import { jStat } from 'jstat';

export interface CorrelationResult {
  variableX: string;
  variableY: string;
  r: number;
  pValue: number;
  n: number;
}

/**
 * Pearson correlation between two numeric variables.
 * Returns the correlation coefficient `r`, its two‑tailed p‑value, and sample size.
 */
export function correlationTest(
  data: Record<string, any>[],
  variableX: string,
  variableY: string
): CorrelationResult {
  const xVals = data
    .map(row => row[variableX])
    .filter(v => typeof v === 'number') as number[];
  const yVals = data
    .map(row => row[variableY])
    .filter(v => typeof v === 'number') as number[];
  const n = Math.min(xVals.length, yVals.length);
  if (n === 0) {
    return { variableX, variableY, r: NaN, pValue: NaN, n: 0 };
  }
  const r = jStat.corrcoeff(xVals.slice(0, n), yVals.slice(0, n));
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));
  return { variableX, variableY, r, pValue: p, n };
}

import { jStat } from 'jstat';

export interface OneSampleTResult {
  variable: string;
  tStatistic: number;
  df: number;
  pValue: number;
  mean: number;
}

/**
 * One‑sample t‑test comparing the variable mean to a hypothesized value (default 0).
 */
export function oneSampleTTest(
  data: Record<string, any>[],
  variable: string,
  mu = 0
): OneSampleTResult {
  const values = data
    .map(row => row[variable])
    .filter(v => typeof v === 'number') as number[];
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const { t, p } = jStat.ttest(values, mu);
  return {
    variable,
    tStatistic: t,
    df: n - 1,
    pValue: p,
    mean,
  };
}

export interface IndependentTResult {
  variableX: string;
  variableY: string;
  tStatistic: number;
  df: number;
  pValue: number;
}

/**
 * Independent‑samples t‑test (two‑sample) assuming equal variances.
 */
export function independentTTest(
  data: Record<string, any>[],
  variableX: string,
  variableY: string
): IndependentTResult {
  const xVals = data
    .map(r => r[variableX])
    .filter(v => typeof v === 'number') as number[];
  const yVals = data
    .map(r => r[variableY])
    .filter(v => typeof v === 'number') as number[];
  // Compute two-sample t-test manually (jStat has no ttest2)
  const n1 = xVals.length;
  const n2 = yVals.length;
  const mean1 = jStat.mean(xVals);
  const mean2 = jStat.mean(yVals);
  const var1 = jStat.variance(xVals, true);
  const var2 = jStat.variance(yVals, true);
  const pooledSE = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2) * (1 / n1 + 1 / n2));
  const tStat = (mean1 - mean2) / pooledSE;
  const dfVal = n1 + n2 - 2;
  const pVal = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), dfVal));
  return {
    variableX,
    variableY,
    tStatistic: tStat,
    df: dfVal,
    pValue: pVal,
  };
}

export interface PairedTResult {
  variableX: string;
  variableY: string;
  tStatistic: number;
  df: number;
  pValue: number;
}

/**
 * Paired‑samples t‑test.
 */
export function pairedTTest(
  data: Record<string, any>[],
  variableX: string,
  variableY: string
): PairedTResult {
  const diffs = data
    .map(r => {
      const a = r[variableX];
      const b = r[variableY];
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }
      return null;
    })
    .filter(v => v !== null) as number[];
  const n = diffs.length;
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / n;
  // Compute one-sample t-test on differences
  const meanDiffVal = jStat.mean(diffs);
  const sdDiff = jStat.stdev(diffs, true);
  const tStat2 = meanDiffVal / (sdDiff / Math.sqrt(n));
  const pVal2 = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat2), n - 1));
  return {
    variableX,
    variableY,
    tStatistic: tStat2,
    df: n - 1,
    pValue: pVal2,
  };
}

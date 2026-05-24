import { jStat } from 'jstat';

export interface MannWhitneyResult {
  variableX: string;
  variableY: string;
  uStatistic: number;
  pValue: number;
}

/**
 * Mann‑Whitney U test for two independent samples.
 * Returns U statistic and two‑tailed p‑value.
 */
export function mannWhitneyUTest(
  data: Record<string, any>[],
  variableX: string,
  variableY: string
): MannWhitneyResult {
  const xVals = data
    .map(r => r[variableX])
    .filter(v => typeof v === 'number') as number[];
  const yVals = data
    .map(r => r[variableY])
    .filter(v => typeof v === 'number') as number[];

  // Use jStat to compute ranks and U statistic.
  const combined = xVals.concat(yVals);
  const ranks = jStat.rank(combined);
  const xRanks = ranks.slice(0, xVals.length);
  const yRanks = ranks.slice(xVals.length);

  const rx = xRanks.reduce((a, b) => a + b, 0);
  const ry = yRanks.reduce((a, b) => a + b, 0);

  const n1 = xVals.length;
  const n2 = yVals.length;

  const u1 = rx - (n1 * (n1 + 1)) / 2;
  const u2 = ry - (n2 * (n2 + 1)) / 2;
  const u = Math.min(u1, u2);

  // Approximate p‑value using normal approximation.
  const mu = (n1 * n2) / 2;
  const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = (u - mu) / sigma;
  const p = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));

  return {
    variableX,
    variableY,
    uStatistic: u,
    pValue: p,
  };
}

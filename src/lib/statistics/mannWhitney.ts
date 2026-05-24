import { jStat } from 'jstat';
import type { CsvRow } from './types';

export interface MannWhitneyResult {
  variableX: string;
  variableY: string;
  uStatistic: number;
  pValue: number;
}

function rankValues(values: number[]): number[] {
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(values.length);
  let j = 0;
  while (j < indexed.length) {
    let k = j;
    while (k < indexed.length - 1 && indexed[k + 1].v === indexed[k].v) k++;
    const avgRank = (j + 1 + k + 1) / 2;
    for (let m = j; m <= k; m++) ranks[indexed[m].i] = avgRank;
    j = k + 1;
  }
  return ranks;
}

export function mannWhitneyUTest(
  data: CsvRow[],
  variableX: string,
  variableY: string
): MannWhitneyResult {
  const xVals = data.map(r => r[variableX]).filter(v => typeof v === 'number') as number[];
  const yVals = data.map(r => r[variableY]).filter(v => typeof v === 'number') as number[];
  const combined = [...xVals, ...yVals];
  const ranks = rankValues(combined);
  const xRanks = ranks.slice(0, xVals.length);
  const yRanks = ranks.slice(xVals.length);
  const n1 = xVals.length;
  const n2 = yVals.length;
  const rx = xRanks.reduce((a: number, b: number) => a + b, 0);
  const ry = yRanks.reduce((a: number, b: number) => a + b, 0);
  const u1 = rx - (n1 * (n1 + 1)) / 2;
  const u2 = ry - (n2 * (n2 + 1)) / 2;
  const u = Math.min(u1, u2);
  const mu = (n1 * n2) / 2;
  const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = (u - mu) / sigma;
  const p = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
  return { variableX, variableY, uStatistic: u, pValue: p };
}

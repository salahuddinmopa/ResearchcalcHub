import type { CsvRow } from './types';

export interface RegressionResult {
  dependent: string;
  independent: string;
  slope: number;
  intercept: number;
  rSquared: number;
}

export function linearRegression(
  data: CsvRow[],
  dependent: string,
  independent: string
): RegressionResult {
  const pairs = data
    .map(r => ({ x: r[independent], y: r[dependent] }))
    .filter(p => typeof p.x === 'number' && typeof p.y === 'number') as { x: number; y: number }[];

  const n = pairs.length;
  if (n < 2) return { dependent, independent, slope: 0, intercept: 0, rSquared: 0 };

  const xMean = pairs.reduce((s, p) => s + p.x, 0) / n;
  const yMean = pairs.reduce((s, p) => s + p.y, 0) / n;

  const ssXX = pairs.reduce((s, p) => s + (p.x - xMean) ** 2, 0);
  const ssXY = pairs.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0);
  const ssYY = pairs.reduce((s, p) => s + (p.y - yMean) ** 2, 0);

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;
  const rSquared = ssYY === 0 ? 0 : (ssXY ** 2) / (ssXX * ssYY);

  return { dependent, independent, slope, intercept, rSquared };
}

import { ols } from 'jstat';

export interface RegressionResult {
  dependent: string;
  independent: string;
  slope: number;
  intercept: number;
  rSquared: number;
}

/**
 * Simple linear regression (one predictor).
 * Returns slope, intercept, and R².
 */
export function linearRegression(
  data: Record<string, any>[],
  dependent: string,
  independent: string
): RegressionResult {
  const y = data.map(r => r[dependent]).filter(v => typeof v === 'number') as number[];
  const x = data.map(r => r[independent]).filter(v => typeof v === 'number') as number[];
  const n = Math.min(x.length, y.length);
  const xVals = x.slice(0, n);
  const yVals = y.slice(0, n);
  // Use jStat's simple linear regression via ols
  // @ts-ignore
  const model = ols(xVals, yVals);
  const slope = model.beta[0];
  const intercept = model.beta[1];
  const r2 = model.r2;
  return { dependent, independent, slope, intercept, rSquared: r2 };
}

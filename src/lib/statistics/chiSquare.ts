import { jStat } from 'jstat';

export interface ChiSquareResult {
  observed: number[];
  expected: number[];
  chi2: number;
  pValue: number;
}

/**
 * Simple chi‑square goodness‑of‑fit test.
 * Returns chi2 statistic and approximate p‑value.
 */
export function chiSquareTest(observed: number[], expected: number[]): ChiSquareResult {
  // Validate input lengths
  if (observed.length !== expected.length) {
    throw new Error('Observed and expected arrays must have the same length');
  }

  const chi2 = observed.reduce((sum, o, i) => sum + Math.pow(o - expected[i], 2) / expected[i], 0);
  // Approximate p‑value using jStat's chi‑square CDF (degrees of freedom = n‑1)
  const pValue = 1 - jStat.chi2.cdf(chi2, observed.length - 1);
  return { observed, expected, chi2, pValue };
}

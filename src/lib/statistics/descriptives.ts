import { jStat } from 'jstat';
import type { CsvRow } from './types';

export interface DescriptiveResult {
  variable: string;
  count: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  variance?: number;
  min: number;
  max: number;
}

/**
 * Compute descriptive statistics for a numeric variable.
 */
export function descriptives(data: CsvRow[], variable: string): DescriptiveResult {
  const values = data.map(row => row[variable]).filter(v => v != null && v !== '');
  const numeric = values.filter(v => typeof v === 'number') as number[];
  const count = values.length;
  const min = numeric.length ? Math.min(...numeric) : NaN;
  const max = numeric.length ? Math.max(...numeric) : NaN;
  const meanVal = numeric.length ? jStat.mean(numeric) : undefined;
  const medianVal = numeric.length ? jStat.median(numeric) : undefined;
  const stdDevVal = numeric.length ? jStat.stdev(numeric) : undefined;
  const varianceVal = numeric.length ? jStat.variance(numeric) : undefined;

  return {
    variable,
    count,
    mean: meanVal,
    median: medianVal,
    stdDev: stdDevVal,
    variance: varianceVal,
    min,
    max,
  };
}

export type VarianceMode = 'sample' | 'population';
export type ConfidenceLevel = 90 | 95 | 99;

export interface ParsedNumbers {
  values: number[];
  invalidTokens: string[];
}

export function parseNumberList(raw: string): ParsedNumbers {
  const tokens = raw
    .split(/[\s,;\t\r\n]+/)
    .map(token => token.trim())
    .filter(Boolean);

  const values: number[] = [];
  const invalidTokens: string[] = [];

  tokens.forEach(token => {
    const value = Number(token);
    if (Number.isFinite(value)) values.push(value);
    else invalidTokens.push(token);
  });

  return { values, invalidTokens };
}

export function parsePairedNumberTable(raw: string): { x: number[]; y: number[]; invalidRows: number[] } {
  const x: number[] = [];
  const y: number[] = [];
  const invalidRows: number[] = [];

  raw.trim().split(/\r?\n/).forEach((row, index) => {
    if (!row.trim()) return;
    const cells = row.split(/\t|,|;/).map(cell => cell.trim()).filter(Boolean);
    const xValue = Number(cells[0]);
    const yValue = Number(cells[1]);
    if (cells.length < 2 || !Number.isFinite(xValue) || !Number.isFinite(yValue)) {
      invalidRows.push(index + 1);
      return;
    }
    x.push(xValue);
    y.push(yValue);
  });

  return { x, y, invalidRows };
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(sorted: number[]): number {
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export interface DescriptiveStatsResult {
  mean: number;
  median: number;
  mode: number[];
  count: number;
  min: number;
  max: number;
  range: number;
  steps: string[];
  academicText: string;
}

export function calculateMeanMedianMode(values: number[]): DescriptiveStatsResult {
  if (values.length === 0) throw new Error('Enter at least one number.');
  const sorted = [...values].sort((a, b) => a - b);
  const frequencies = new Map<number, number>();
  values.forEach(value => frequencies.set(value, (frequencies.get(value) || 0) + 1));
  const maxFrequency = Math.max(...frequencies.values());
  const modes = [...frequencies.entries()]
    .filter(([, count]) => count === maxFrequency)
    .map(([value]) => value)
    .sort((a, b) => a - b);
  const m = mean(values);
  const med = median(sorted);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  const steps = [
    `Sorted values = [${sorted.join(', ')}]`,
    `Count = ${values.length}`,
    `Mean = sum(values) / n = ${values.reduce((sum, value) => sum + value, 0).toFixed(4)} / ${values.length} = ${m.toFixed(4)}`,
    `Median = middle value of the sorted data = ${med}`,
    `Mode = most frequent value(s) = ${modes.join(', ')}`,
    `Range = max - min = ${max} - ${min} = ${max - min}`,
  ];

  const academicText = `Descriptive statistics were calculated for ${values.length} observations. The mean was ${m.toFixed(3)}, the median was ${med}, the mode was ${modes.join(', ')}, and the range was ${max - min} (min = ${min}, max = ${max}).`;

  return { mean: m, median: med, mode: modes, count: values.length, min, max, range: max - min, steps, academicText };
}

export interface SpreadResult {
  mean: number;
  variance: number;
  standardDeviation: number;
  sumSquaredDifferences: number;
  count: number;
  divisor: number;
  mode: VarianceMode;
  steps: string[];
  academicText: string;
}

export function calculateSpread(values: number[], mode: VarianceMode): SpreadResult {
  if (values.length < 2) throw new Error('Enter at least two numbers.');
  if (mode === 'sample' && values.length < 2) throw new Error('Sample calculations require at least two numbers.');

  const m = mean(values);
  const squaredDifferences = values.map(value => (value - m) ** 2);
  const sumSquaredDifferences = squaredDifferences.reduce((sum, value) => sum + value, 0);
  // Population variance divides by N; sample variance uses Bessel's correction and divides by n - 1.
  const divisor = mode === 'sample' ? values.length - 1 : values.length;
  const variance = sumSquaredDifferences / divisor;
  const standardDeviation = Math.sqrt(variance);

  const steps = [
    `Mean = ${m.toFixed(6)}`,
    ...values.slice(0, 12).map((value, index) => `(${value} - ${m.toFixed(6)})² = ${squaredDifferences[index].toFixed(6)}`),
    values.length > 12 ? `... ${values.length - 12} additional squared differences omitted from display` : '',
    `Sum of squared differences = ${sumSquaredDifferences.toFixed(6)}`,
    `Divisor = ${mode === 'sample' ? 'n - 1' : 'N'} = ${divisor}`,
    `Variance = ${sumSquaredDifferences.toFixed(6)} / ${divisor} = ${variance.toFixed(6)}`,
    `Standard deviation = sqrt(${variance.toFixed(6)}) = ${standardDeviation.toFixed(6)}`,
  ].filter(Boolean);

  const academicText = `The ${mode} variance was ${variance.toFixed(3)} and the ${mode} standard deviation was ${standardDeviation.toFixed(3)} for ${values.length} observations (mean = ${m.toFixed(3)}).`;

  return { mean: m, variance, standardDeviation, sumSquaredDifferences, count: values.length, divisor, mode, steps, academicText };
}

export interface ZScoreResult {
  zScore: number;
  interpretation: string;
  level: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral' | 'warning';
  steps: string[];
  academicText: string;
}

export function calculateZScore(rawScore: number, populationMean: number, standardDeviation: number): ZScoreResult {
  if (!Number.isFinite(rawScore) || !Number.isFinite(populationMean)) throw new Error('Raw score and mean must be numeric.');
  if (!Number.isFinite(standardDeviation) || standardDeviation <= 0) throw new Error('Standard deviation must be greater than 0.');

  const zScore = (rawScore - populationMean) / standardDeviation;
  const absZ = Math.abs(zScore);
  let interpretation = 'Average range';
  let level: ZScoreResult['level'] = 'neutral';
  if (absZ >= 2) {
    interpretation = zScore > 0 ? 'Very high' : 'Very low';
    level = 'warning';
  } else if (zScore >= 0.5) {
    interpretation = 'Above average';
    level = 'good';
  } else if (zScore <= -0.5) {
    interpretation = 'Below average';
    level = 'acceptable';
  }

  const steps = [
    `z = (x - mean) / standard deviation`,
    `z = (${rawScore} - ${populationMean}) / ${standardDeviation}`,
    `z = ${(rawScore - populationMean).toFixed(6)} / ${standardDeviation} = ${zScore.toFixed(6)}`,
  ];

  const academicText = `A z-score was calculated for a raw score of ${rawScore} using a mean of ${populationMean} and standard deviation of ${standardDeviation}. The resulting z-score was ${zScore.toFixed(3)}, indicating ${interpretation.toLowerCase()}.`;

  return { zScore, interpretation, level, steps, academicText };
}

const Z_CRITICAL: Record<ConfidenceLevel, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

const T_CRITICAL: Record<ConfidenceLevel, Record<number, number>> = {
  90: { 1: 6.314, 2: 2.92, 3: 2.353, 4: 2.132, 5: 2.015, 6: 1.943, 7: 1.895, 8: 1.86, 9: 1.833, 10: 1.812, 11: 1.796, 12: 1.782, 13: 1.771, 14: 1.761, 15: 1.753, 16: 1.746, 17: 1.74, 18: 1.734, 19: 1.729, 20: 1.725, 21: 1.721, 22: 1.717, 23: 1.714, 24: 1.711, 25: 1.708, 26: 1.706, 27: 1.703, 28: 1.701, 29: 1.699, 30: 1.697, 40: 1.684, 60: 1.671, 80: 1.664, 100: 1.66, 120: 1.658 },
  95: { 1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228, 11: 2.201, 12: 2.179, 13: 2.16, 14: 2.145, 15: 2.131, 16: 2.12, 17: 2.11, 18: 2.101, 19: 2.093, 20: 2.086, 21: 2.08, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.06, 26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042, 40: 2.021, 60: 2, 80: 1.99, 100: 1.984, 120: 1.98 },
  99: { 1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032, 6: 3.707, 7: 3.499, 8: 3.355, 9: 3.25, 10: 3.169, 11: 3.106, 12: 3.055, 13: 3.012, 14: 2.977, 15: 2.947, 16: 2.921, 17: 2.898, 18: 2.878, 19: 2.861, 20: 2.845, 21: 2.831, 22: 2.819, 23: 2.807, 24: 2.797, 25: 2.787, 26: 2.779, 27: 2.771, 28: 2.763, 29: 2.756, 30: 2.75, 40: 2.704, 60: 2.66, 80: 2.639, 100: 2.626, 120: 2.617 },
};

function tCriticalValue(confidenceLevel: ConfidenceLevel, df: number): number {
  const table = T_CRITICAL[confidenceLevel];
  if (df in table) return table[df];
  if (df > 120) return Z_CRITICAL[confidenceLevel];

  const anchors = Object.keys(table).map(Number).sort((a, b) => a - b);
  const upper = anchors.find(value => value > df) ?? anchors[anchors.length - 1];
  const lower = [...anchors].reverse().find(value => value < df) ?? anchors[0];
  const proportion = (df - lower) / (upper - lower);
  return table[lower] + proportion * (table[upper] - table[lower]);
}

export interface ConfidenceIntervalStatsResult {
  lower: number;
  upper: number;
  marginOfError: number;
  standardError: number;
  criticalValue: number;
  distribution: 't';
  degreesOfFreedom: number;
  steps: string[];
  academicText: string;
}

export function calculateMeanConfidenceInterval(
  sampleMean: number,
  standardDeviation: number,
  sampleSize: number,
  confidenceLevel: ConfidenceLevel
): ConfidenceIntervalStatsResult {
  if (!Number.isFinite(sampleMean)) throw new Error('Sample mean must be numeric.');
  if (!Number.isFinite(standardDeviation) || standardDeviation <= 0) throw new Error('Standard deviation must be greater than 0.');
  if (!Number.isInteger(sampleSize) || sampleSize < 2) throw new Error('Sample size must be an integer of at least 2.');

  const degreesOfFreedom = sampleSize - 1;
  // The input is a sample standard deviation, so the mean interval uses t* rather than z*.
  const criticalValue = tCriticalValue(confidenceLevel, degreesOfFreedom);
  const standardError = standardDeviation / Math.sqrt(sampleSize);
  // CI for a population mean: sample mean +/- t* x sample standard error.
  const marginOfError = criticalValue * standardError;
  const lower = sampleMean - marginOfError;
  const upper = sampleMean + marginOfError;

  const steps = [
    `Standard error = SD / sqrt(n) = ${standardDeviation} / sqrt(${sampleSize}) = ${standardError.toFixed(6)}`,
    `Degrees of freedom = n - 1 = ${degreesOfFreedom}`,
    `t critical value for ${confidenceLevel}% confidence = ${criticalValue.toFixed(6)}`,
    `Margin of error = ${criticalValue} × ${standardError.toFixed(6)} = ${marginOfError.toFixed(6)}`,
    `Lower bound = ${sampleMean} - ${marginOfError.toFixed(6)} = ${lower.toFixed(6)}`,
    `Upper bound = ${sampleMean} + ${marginOfError.toFixed(6)} = ${upper.toFixed(6)}`,
  ];

  const academicText = `A ${confidenceLevel}% confidence interval was calculated around the sample mean using the t distribution (df = ${degreesOfFreedom}). Based on M = ${sampleMean}, SD = ${standardDeviation}, and n = ${sampleSize}, the interval was [${lower.toFixed(3)}, ${upper.toFixed(3)}], with a margin of error of ${marginOfError.toFixed(3)}.`;

  return { lower, upper, marginOfError, standardError, criticalValue, distribution: 't', degreesOfFreedom, steps, academicText };
}

export interface CorrelationStatsResult {
  r: number;
  rSquared: number;
  strength: string;
  direction: string;
  interpretation: string;
  level: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral' | 'warning';
  count: number;
  steps: string[];
  academicText: string;
}

export function calculatePearsonCorrelation(xValues: number[], yValues: number[]): CorrelationStatsResult {
  if (xValues.length !== yValues.length) throw new Error('X and Y must contain the same number of values.');
  if (xValues.length < 3) throw new Error('Enter at least three paired observations.');

  const xMean = mean(xValues);
  const yMean = mean(yValues);
  // Pearson r is covariance scaled by the product of each variable's sum of squared deviations.
  const numerator = xValues.reduce((sum, x, index) => sum + (x - xMean) * (yValues[index] - yMean), 0);
  const xSumSquares = xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
  const ySumSquares = yValues.reduce((sum, y) => sum + (y - yMean) ** 2, 0);
  if (xSumSquares === 0 || ySumSquares === 0) throw new Error('Correlation is undefined when either variable has zero variance.');

  const r = numerator / Math.sqrt(xSumSquares * ySumSquares);
  const absR = Math.abs(r);
  let strength = 'Very weak';
  let level: CorrelationStatsResult['level'] = 'poor';
  if (absR >= 0.8) { strength = 'Very strong'; level = 'excellent'; }
  else if (absR >= 0.6) { strength = 'Strong'; level = 'good'; }
  else if (absR >= 0.4) { strength = 'Moderate'; level = 'good'; }
  else if (absR >= 0.2) { strength = 'Weak'; level = 'acceptable'; }

  const direction = r > 0 ? 'Positive' : r < 0 ? 'Negative' : 'No direction';
  const interpretation = `${strength} ${direction.toLowerCase()} relationship`;
  const rSquared = r * r;

  const steps = [
    `n = ${xValues.length}`,
    `Mean of X = ${xMean.toFixed(6)}, mean of Y = ${yMean.toFixed(6)}`,
    `Sum of cross-products = ${numerator.toFixed(6)}`,
    `Sum of squared X deviations = ${xSumSquares.toFixed(6)}`,
    `Sum of squared Y deviations = ${ySumSquares.toFixed(6)}`,
    `r = ${numerator.toFixed(6)} / sqrt(${xSumSquares.toFixed(6)} × ${ySumSquares.toFixed(6)}) = ${r.toFixed(6)}`,
  ];

  const academicText = `Pearson's correlation coefficient was calculated for ${xValues.length} paired observations. The result showed a ${strength.toLowerCase()} ${direction.toLowerCase()} relationship, r = ${r.toFixed(3)}, with R² = ${rSquared.toFixed(3)}.`;

  return { r, rSquared, strength, direction, interpretation, level, count: xValues.length, steps, academicText };
}

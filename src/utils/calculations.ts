// ─── Shared helpers ───────────────────────────────────────────────────────────

export function parseNumbers(raw: string): number[] {
  return raw
    .split(/[\s,;]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => parseFloat(s))
    .filter(n => !isNaN(n));
}

export function parseDelimitedTable(raw: string): string[][] {
  return raw
    .trim()
    .split(/\r?\n/)
    .map(row => row.split(/\t|,|;/).map(cell => cell.trim()));
}

export function parseNumericTable(raw: string): number[][] {
  return parseDelimitedTable(raw).map(row => row.map(cell => Number(cell)));
}

export function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function variance(arr: number[], sample = true): number {
  const m = mean(arr);
  const sum = arr.reduce((a, b) => a + (b - m) ** 2, 0);
  return sum / (sample ? arr.length - 1 : arr.length);
}

export function stdDev(arr: number[], sample = true): number {
  return Math.sqrt(variance(arr, sample));
}

// Z critical values for common confidence levels
const Z_SCORES: Record<string, number> = {
  '80': 1.282,
  '85': 1.440,
  '90': 1.645,
  '95': 1.960,
  '99': 2.576,
  '99.5': 2.807,
  '99.9': 3.291,
};

// T-distribution critical values (approximate, two-tailed) for common DFs
// Full implementation uses a polynomial approximation
function tCritical(df: number, alpha: number): number {
  // Simple approximation valid for df >= 2
  // alpha = 1 - confidence level (two-tailed, so alpha/2 per tail)
  const p = 1 - alpha / 2;
  // Using Cornish-Fisher approximation
  const z = normalInverse(p);
  const correction = (z ** 3 + z) / (4 * df) + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df ** 2);
  return z + correction;
}

function normalInverse(p: number): number {
  // Rational approximation for N^-1(p)
  const a = [2.515517, 0.802853, 0.010328];
  const b = [1.432788, 0.189269, 0.001308];
  const t = Math.sqrt(-2 * Math.log(p <= 0.5 ? p : 1 - p));
  const num = a[0] + a[1] * t + a[2] * t * t;
  const den = 1 + b[0] * t + b[1] * t * t + b[2] * t * t * t;
  const sign = p <= 0.5 ? -1 : 1;
  return sign * (t - num / den);
}

// ─── 1. Sample Size ───────────────────────────────────────────────────────────

export interface SampleSizeResult {
  sampleSize: number;
  adjustedSampleSize: number | null;
  zScore: number;
  marginOfError: number;
  proportion: number;
  populationSize: number | null;
  steps: string[];
  academicText: string;
}

export function calculateSampleSize(
  confidenceLevel: number,
  marginOfErrorPct: number,
  proportionPct: number,
  populationSize?: number
): SampleSizeResult {
  if (!Number.isFinite(marginOfErrorPct) || marginOfErrorPct <= 0 || marginOfErrorPct >= 100) {
    throw new Error('Margin of error must be greater than 0 and less than 100%.');
  }
  if (!Number.isFinite(proportionPct) || proportionPct <= 0 || proportionPct >= 100) {
    throw new Error('Expected proportion must be greater than 0 and less than 100%.');
  }
  if (populationSize !== undefined && (!Number.isFinite(populationSize) || populationSize < 1)) {
    throw new Error('Population size must be a positive number when supplied.');
  }

  const z = Z_SCORES[String(confidenceLevel)] || 1.96;
  const e = marginOfErrorPct / 100;
  const p = proportionPct / 100;

  // Cochran proportion sample size: z^2 * p(1-p) / e^2.
  const n0 = (z ** 2 * p * (1 - p)) / (e ** 2);
  const n0Rounded = Math.ceil(n0);

  let adjusted: number | null = null;
  if (populationSize && populationSize > 0) {
    // Finite population correction reduces n when the population is known and limited.
    adjusted = Math.ceil(n0 / (1 + (n0 - 1) / populationSize));
  }

  const final = adjusted ?? n0Rounded;

  const steps = [
    `Z-score for ${confidenceLevel}% confidence level = ${z}`,
    `Margin of error = ${marginOfErrorPct}% = ${e}`,
    `Population proportion = ${proportionPct}% = ${p}`,
    `Infinite population formula: n₀ = (${z}² × ${p} × ${(1 - p).toFixed(4)}) / ${e}² = ${n0.toFixed(2)}`,
    `Rounded up: n₀ = ${n0Rounded}`,
    adjusted != null
      ? `Finite population correction: n = ${n0Rounded} / (1 + (${n0Rounded}−1)/${populationSize}) = ${adjusted}`
      : `No finite population correction applied (population size not specified).`,
    `Required sample size: ${final}`,
  ];

  const academicText = `A minimum sample size of ${final} participants is required based on a ${confidenceLevel}% confidence level, a ${marginOfErrorPct}% margin of error, and an assumed population proportion of ${proportionPct}%${populationSize ? ` with a finite population of ${populationSize.toLocaleString()} units` : ''}. This was calculated using the standard formula for estimating sample size for proportions${adjusted ? ' with finite population correction' : ''}.`;

  return { sampleSize: n0Rounded, adjustedSampleSize: adjusted, zScore: z, marginOfError: marginOfErrorPct, proportion: p, populationSize: populationSize ?? null, steps, academicText };
}

// ─── 2. Margin of Error ───────────────────────────────────────────────────────

export interface MarginOfErrorResult {
  moe: number;
  moePct: number;
  lowerBound: number;
  upperBound: number;
  finitePopulationCorrection: number | null;
  steps: string[];
  academicText: string;
}

export function calculateMarginOfError(
  sampleSize: number,
  confidenceLevel: number,
  proportionPct: number,
  populationSize?: number
): MarginOfErrorResult {
  const z = Z_SCORES[String(confidenceLevel)] || 1.96;
  const p = proportionPct / 100;
  const standardError = Math.sqrt((p * (1 - p)) / sampleSize);
  let finitePopulationCorrection: number | null = null;
  if (populationSize && populationSize > sampleSize) {
    finitePopulationCorrection = Math.sqrt((populationSize - sampleSize) / (populationSize - 1));
  }
  const moe = z * standardError * (finitePopulationCorrection ?? 1);
  const moePct = moe * 100;

  const steps = [
    `Z-score for ${confidenceLevel}% confidence level = ${z}`,
    `p = ${p}, (1−p) = ${(1 - p).toFixed(4)}`,
    `Standard error = √(${p} × ${(1 - p).toFixed(4)} / ${sampleSize}) = ${standardError.toFixed(6)}`,
    finitePopulationCorrection != null
      ? `Finite population correction = √((${populationSize} − ${sampleSize}) / (${populationSize} − 1)) = ${finitePopulationCorrection.toFixed(6)}`
      : `No finite population correction applied${populationSize ? ' because population size must be greater than sample size' : ''}.`,
    `MOE = ${z} × ${standardError.toFixed(6)}${finitePopulationCorrection != null ? ` × ${finitePopulationCorrection.toFixed(6)}` : ''} = ${moe.toFixed(4)} = ±${moePct.toFixed(2)}%`,
  ];

  const academicText = `Based on a sample of ${sampleSize} respondents${populationSize ? ` from a population of ${populationSize.toLocaleString()}` : ''} with a ${confidenceLevel}% confidence level and an observed or expected proportion of ${proportionPct}%, the margin of error is ±${moePct.toFixed(2)} percentage points${finitePopulationCorrection ? ' after finite population correction' : ''}.`;

  return { moe, moePct, lowerBound: proportionPct - moePct, upperBound: proportionPct + moePct, finitePopulationCorrection, steps, academicText };
}

// ─── 3. Survey Response Rate ──────────────────────────────────────────────────

export interface ResponseRateResult {
  responseRate: number;
  completedResponses: number;
  eligibleSent: number;
  interpretationLabel: 'Low' | 'Moderate' | 'Good' | 'Excellent';
  interpretation: string;
  steps: string[];
  academicText: string;
}

export function calculateResponseRate(
  sent: number,
  returned: number,
  ineligible: number = 0
): ResponseRateResult {
  const eligible = sent - ineligible;
  const rate = (returned / eligible) * 100;

  let interpretationLabel: ResponseRateResult['interpretationLabel'] = 'Low';
  let interpretation = '';
  if (rate >= 70) {
    interpretationLabel = 'Excellent';
    interpretation = 'Excellent response rate. Exceeds most academic standards.';
  } else if (rate >= 50) {
    interpretationLabel = 'Good';
    interpretation = 'Good response rate. Meets most academic and journal standards.';
  } else if (rate >= 30) {
    interpretationLabel = 'Moderate';
    interpretation = 'Moderate response rate. Consider discussing potential non-response bias.';
  } else {
    interpretationLabel = 'Low';
    interpretation = 'Low response rate. Non-response bias analysis is recommended before reporting results.';
  }

  const steps = [
    `Surveys sent: ${sent}`,
    `Ineligible units: ${ineligible}`,
    `Eligible units: ${sent} − ${ineligible} = ${eligible}`,
    `Completed responses: ${returned}`,
    `Response rate = (${returned} / ${eligible}) × 100 = ${rate.toFixed(2)}%`,
  ];

  const academicText = `A total of ${sent} survey invitations were distributed, of which ${ineligible} were deemed ineligible, leaving ${eligible} eligible units. A total of ${returned} valid responses were received, yielding a ${interpretationLabel.toLowerCase()} response rate of ${rate.toFixed(2)}%.`;

  return { responseRate: rate, completedResponses: returned, eligibleSent: eligible, interpretationLabel, interpretation, steps, academicText };
}

// ─── 4. Likert Scale Mean ─────────────────────────────────────────────────────

export interface LikertItem {
  label: string;
  frequencies: number[];
}

export interface LikertResult {
  items: { label: string; mean: number; sd: number; n: number; interpretation: string }[];
  overallMean: number;
  totalResponses: number;
  interpretation: string;
  scalePoints: number;
  steps: string[];
  academicText: string;
}

function interpretLikert(mean: number, scale: number): string {
  const mid = (scale + 1) / 2;
  const range = scale - 1;
  const normalized = (mean - 1) / range;
  if (normalized >= 0.8) return 'Very High / Strongly Agree';
  if (normalized >= 0.6) return 'High / Agree';
  if (normalized >= 0.4) return 'Moderate / Neutral';
  if (normalized >= 0.2) return 'Low / Disagree';
  return 'Very Low / Strongly Disagree';
}

export function calculateLikertMean(items: LikertItem[], scalePoints: number): LikertResult {
  const scale = Array.from({ length: scalePoints }, (_, i) => i + 1);

  const itemResults = items.map(item => {
    const total = item.frequencies.reduce((a, b) => a + b, 0);
    if (total === 0) return { label: item.label, mean: 0, sd: 0, n: 0, interpretation: 'No data' };
    const m = scale.reduce((acc, val, idx) => acc + val * item.frequencies[idx], 0) / total;
    const variance = scale.reduce((acc, val, idx) => acc + item.frequencies[idx] * (val - m) ** 2, 0) / total;
    const sd = Math.sqrt(variance);
    return { label: item.label, mean: m, sd, n: total, interpretation: interpretLikert(m, scalePoints) };
  });

  const totalResponses = itemResults.reduce((sum, item) => sum + item.n, 0);
  const overallMean = totalResponses > 0
    ? itemResults.reduce((sum, item) => sum + item.mean * item.n, 0) / totalResponses
    : 0;
  const interpretation = interpretLikert(overallMean, scalePoints);

  const steps = itemResults.map((r, i) =>
    `Item ${i + 1} "${r.label}": Mean = ${r.mean.toFixed(3)}, SD = ${r.sd.toFixed(3)}, n = ${r.n}`
  );
  steps.push(`Weighted overall mean across ${totalResponses} responses = ${overallMean.toFixed(3)}`);

  const academicText = `Descriptive analysis of the ${scalePoints}-point Likert scale revealed an overall weighted mean of ${overallMean.toFixed(2)} across ${totalResponses} responses, indicating ${interpretation.toLowerCase()}.`;

  return { items: itemResults, overallMean, totalResponses, interpretation, scalePoints, steps, academicText };
}

// ─── 5. Weighted Scoring ──────────────────────────────────────────────────────

export interface WeightedCriterion {
  name: string;
  weight: number;
  score: number;
}

export interface WeightedScoringResult {
  weightedScore: number;
  maxPossibleScore: number;
  percentageScore: number;
  criteria: { name: string; weight: number; normalizedWeight: number; score: number; weightedScore: number; percentageScore: number; rank: number }[];
  interpretation: string;
  steps: string[];
  academicText: string;
}

export function calculateWeightedScoring(criteria: WeightedCriterion[], maxScore: number = 10, normalizeWeights: boolean = true): WeightedScoringResult {
  const totalWeight = criteria.reduce((a, b) => a + b.weight, 0);
  const divisor = normalizeWeights ? totalWeight : 100;
  const normalized = criteria.map(c => {
    const normalizedWeight = c.weight / divisor;
    const weightedScore = normalizedWeight * c.score;
    return { ...c, normalizedWeight, weightedScore, percentageScore: (c.score / maxScore) * 100, rank: 0 };
  });
  const ranked = [...normalized].sort((a, b) => b.weightedScore - a.weightedScore);
  ranked.forEach((criterion, index) => {
    criterion.rank = index + 1;
  });
  const weightedScore = normalized.reduce((a, b) => a + b.weightedScore, 0);
  const maxPossibleScore = normalizeWeights ? maxScore : maxScore * (totalWeight / 100);
  const percentageScore = (weightedScore / maxPossibleScore) * 100;
  const interpretation = percentageScore >= 80
    ? 'Excellent overall performance.'
    : percentageScore >= 60
      ? 'Good overall performance.'
      : percentageScore >= 40
        ? 'Moderate performance; review lower-scoring criteria.'
        : 'Low performance; substantial improvement is recommended.';

  const steps = [
    `Total weight: ${totalWeight}`,
    normalizeWeights ? `Weights normalized using total weight (${totalWeight}).` : `Weights treated as percentages out of 100.`,
    ...normalized.map(c => `${c.name}: (${c.weight}/${divisor}) × ${c.score} = ${c.weightedScore.toFixed(4)}`),
    `Weighted Score = ${weightedScore.toFixed(4)} out of ${maxPossibleScore.toFixed(4)}`,
    `Percentage = ${percentageScore.toFixed(2)}%`,
    `Top-ranked criterion contribution: ${ranked[0]?.name || 'N/A'}`,
  ];

  const academicText = `A weighted scoring analysis was conducted across ${criteria.length} criteria. The overall weighted score was ${weightedScore.toFixed(3)} out of ${maxPossibleScore.toFixed(3)} (${percentageScore.toFixed(1)}%), based on ${normalizeWeights ? 'normalised' : 'percentage-based'} criterion weights. The strongest weighted contribution was ${ranked[0]?.name || 'N/A'}.`;

  return { weightedScore, maxPossibleScore, percentageScore, criteria: normalized, interpretation, steps, academicText };
}

// ─── 6. Cohen's Kappa ─────────────────────────────────────────────────────────

export interface KappaResult {
  kappa: number;
  observedAgreement: number;
  expectedAgreement: number;
  totalItems: number;
  numCategories: number;
  interpretation: string;
  interpretationLevel: string;
  steps: string[];
  academicText: string;
}

export function interpretKappa(kappa: number): { text: string; level: string } {
  if (kappa < 0) return { text: 'Poor (worse than chance)', level: 'poor' };
  if (kappa <= 0.20) return { text: 'Slight agreement', level: 'poor' };
  if (kappa <= 0.40) return { text: 'Fair agreement', level: 'acceptable' };
  if (kappa <= 0.60) return { text: 'Moderate agreement', level: 'good' };
  if (kappa <= 0.80) return { text: 'Substantial agreement', level: 'good' };
  return { text: 'Almost perfect agreement', level: 'excellent' };
}

export function calculateCohensKappa(matrix: number[][]): KappaResult {
  const n = matrix.length;
  const N = matrix.reduce((a, row) => a + row.reduce((b, c) => b + c, 0), 0);

  if (n < 2) throw new Error('Cohen\'s Kappa requires at least two categories.');
  if (N <= 0) throw new Error('At least one coded item is required.');
  if (matrix.some(row => row.length !== n || row.some(value => !Number.isFinite(value) || value < 0))) {
    throw new Error('The agreement matrix must be square and contain non-negative numbers only.');
  }

  // Row sums represent Rater 1 category totals; column sums represent Rater 2 category totals.
  const rowSums = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colSums = Array.from({ length: n }, (_, j) => matrix.reduce((a, row) => a + row[j], 0));

  // Observed agreement is the proportion of items on the diagonal of the confusion matrix.
  const Po = matrix.reduce((a, row, i) => a + row[i], 0) / N;
  // Expected agreement is the chance agreement implied by the two raters' marginal distributions.
  const Pe = rowSums.reduce((a, r, i) => a + (r * colSums[i]) / (N * N), 0);
  const kappa = (Po - Pe) / (1 - Pe);

  const interp = interpretKappa(kappa);

  const steps = [
    `Total N = ${N}`,
    `Observed agreement (Po) = diagonal sum / N = ${Po.toFixed(4)}`,
    `Expected agreement (Pe) = Σ(row_i × col_i) / N² = ${Pe.toFixed(4)}`,
    `Cohen's Kappa κ = (${Po.toFixed(4)} − ${Pe.toFixed(4)}) / (1 − ${Pe.toFixed(4)}) = ${kappa.toFixed(4)}`,
    `Interpretation: ${interp.text}`,
  ];

  const academicText = `Cohen's Kappa was calculated to assess inter-rater reliability between the two coders. The analysis yielded κ = ${kappa.toFixed(3)}, indicating ${interp.text.toLowerCase()} (Po = ${Po.toFixed(3)}, Pe = ${Pe.toFixed(3)}). This result ${kappa >= 0.61 ? 'meets' : 'does not yet meet'} the commonly accepted threshold of κ ≥ 0.61 for substantial agreement.`;

  return { kappa, observedAgreement: Po, expectedAgreement: Pe, totalItems: N, numCategories: n, interpretation: interp.text, interpretationLevel: interp.level, steps, academicText };
}

export function buildCohenMatrixFromPairs(pairs: Array<[string, string]>): { matrix: number[][]; categories: string[]; skippedRows: number } {
  const completePairs = pairs
    .map(([rater1, rater2]) => [rater1.trim(), rater2.trim()] as [string, string])
    .filter(([rater1, rater2]) => rater1 && rater2);
  const skippedRows = pairs.length - completePairs.length;
  const categories = Array.from(new Set(completePairs.flat())).sort((a, b) => a.localeCompare(b));
  const indexByCategory = new Map(categories.map((category, index) => [category, index]));
  const matrix = Array.from({ length: categories.length }, () => new Array(categories.length).fill(0));

  completePairs.forEach(([rater1, rater2]) => {
    const row = indexByCategory.get(rater1);
    const col = indexByCategory.get(rater2);
    if (row !== undefined && col !== undefined) matrix[row][col] += 1;
  });

  return { matrix, categories, skippedRows };
}

// ─── 7. Fleiss' Kappa ─────────────────────────────────────────────────────────

export interface FleissKappaResult {
  kappa: number;
  Pbar: number;
  Pe: number;
  interpretation: string;
  interpretationLevel: string;
  steps: string[];
  academicText: string;
}

export function calculateFleissKappa(data: number[][], numRaters: number): FleissKappaResult {
  const n = data.length;      // subjects
  const k = data[0].length;   // categories

  if (numRaters < 2) throw new Error('Fleiss\' Kappa requires at least two raters.');
  if (data.length < 2) throw new Error('Fleiss\' Kappa requires at least two items.');
  if (data.some(row => row.some(value => !Number.isFinite(value) || value < 0))) {
    throw new Error('Category counts must be non-negative numbers.');
  }

  // Pi is the degree of agreement for item i, based on how raters are distributed across categories.
  const Pi = data.map(row => {
    const ni = row.reduce((a, b) => a + b, 0);
    if (ni !== numRaters) throw new Error(`Row sums must equal the number of raters (${numRaters}).`);
    return (row.reduce((a, nij) => a + nij * (nij - 1), 0)) / (numRaters * (numRaters - 1));
  });

  const Pbar = Pi.reduce((a, b) => a + b, 0) / n;

  // Pj is the overall proportion of assignments made to category j across all items and raters.
  const Pj = Array.from({ length: k }, (_, j) => data.reduce((a, row) => a + row[j], 0) / (n * numRaters));
  const Pe = Pj.reduce((a, p) => a + p * p, 0);

  const kappa = (Pbar - Pe) / (1 - Pe);
  const interp = interpretKappa(kappa);

  const steps = [
    `Subjects: ${n}, Categories: ${k}, Raters per subject: ${numRaters}`,
    `P̄ (mean subject agreement) = ${Pbar.toFixed(4)}`,
    `Category proportions Pj: [${Pj.map(p => p.toFixed(3)).join(', ')}]`,
    `P̄e (expected agreement) = Σ(Pj²) = ${Pe.toFixed(4)}`,
    `Fleiss' κ = (${Pbar.toFixed(4)} − ${Pe.toFixed(4)}) / (1 − ${Pe.toFixed(4)}) = ${kappa.toFixed(4)}`,
    `Interpretation: ${interp.text}`,
  ];

  const academicText = `Fleiss' Kappa was calculated to assess inter-rater reliability among ${numRaters} raters across ${n} subjects and ${k} categories. The result was κ = ${kappa.toFixed(3)}, indicating ${interp.text.toLowerCase()}.`;

  return { kappa, Pbar, Pe, interpretation: interp.text, interpretationLevel: interp.level, steps, academicText };
}

// ─── 8. Cronbach's Alpha ──────────────────────────────────────────────────────

export interface CronbachResult {
  alpha: number;
  numItems: number;
  numRespondents: number;
  itemVariances: number[];
  totalVariance: number;
  interpretation: string;
  interpretationLevel: string;
  steps: string[];
  academicText: string;
}

export function interpretAlpha(alpha: number): { text: string; level: string } {
  if (alpha < 0.60) return { text: 'Poor internal consistency', level: 'poor' };
  if (alpha < 0.70) return { text: 'Questionable internal consistency', level: 'acceptable' };
  if (alpha < 0.80) return { text: 'Acceptable internal consistency', level: 'acceptable' };
  if (alpha < 0.90) return { text: 'Good internal consistency', level: 'good' };
  return { text: 'Excellent internal consistency (possible item redundancy)', level: 'excellent' };
}

export function calculateCronbachAlpha(data: number[][]): CronbachResult {
  const numRespondents = data.length;
  const numItems = data[0].length;

  if (numRespondents < 2) throw new Error('Cronbach\'s Alpha requires at least two respondents.');
  if (numItems < 2) throw new Error('Cronbach\'s Alpha requires at least two survey items.');
  if (data.some(row => row.length !== numItems || row.some(value => !Number.isFinite(value)))) {
    throw new Error('Cronbach\'s Alpha data must be a complete numeric table with no missing values.');
  }

  // Item variances are computed across respondents for each survey item.
  const itemVariances = Array.from({ length: numItems }, (_, j) => {
    const col = data.map(row => row[j]);
    return variance(col, true);
  });

  // Each respondent's total score is used to compute the variance of the summed scale.
  const totals = data.map(row => row.reduce((a, b) => a + b, 0));
  const totalVariance = variance(totals, true);
  if (totalVariance === 0) throw new Error('Total score variance is zero, so Cronbach\'s Alpha is undefined.');

  const sumItemVar = itemVariances.reduce((a, b) => a + b, 0);
  // Alpha = k/(k-1) * (1 - sum item variances / total score variance).
  const alpha = (numItems / (numItems - 1)) * (1 - sumItemVar / totalVariance);
  const interp = interpretAlpha(alpha);

  const steps = [
    `Number of items (k) = ${numItems}`,
    `Number of respondents = ${numRespondents}`,
    `Sum of item variances = ${sumItemVar.toFixed(4)}`,
    `Variance of total scores = ${totalVariance.toFixed(4)}`,
    `α = (${numItems} / ${numItems - 1}) × (1 − ${sumItemVar.toFixed(4)} / ${totalVariance.toFixed(4)})`,
    `α = ${(numItems / (numItems - 1)).toFixed(4)} × ${(1 - sumItemVar / totalVariance).toFixed(4)} = ${alpha.toFixed(4)}`,
    `Interpretation: ${interp.text}`,
  ];

  const academicText = `Cronbach's Alpha was calculated to assess the internal consistency reliability of the ${numItems}-item scale. The result (α = ${alpha.toFixed(3)}) indicates ${interp.text.toLowerCase()}. This was computed from ${numRespondents} respondents.`;

  return { alpha, numItems, numRespondents, itemVariances, totalVariance, interpretation: interp.text, interpretationLevel: interp.level, steps, academicText };
}

// ─── 9. Inter-Coder Agreement ─────────────────────────────────────────────────

export interface InterCoderResult {
  agreementPct: number;
  agreements: number;
  total: number;
  interpretation: string;
  interpretationLevel: string;
  steps: string[];
  academicText: string;
}

export function calculateInterCoderAgreement(codes1: string[], codes2: string[]): InterCoderResult {
  const total = Math.min(codes1.length, codes2.length);
  const agreements = Array.from({ length: total }, (_, i) =>
    codes1[i].trim().toLowerCase() === codes2[i].trim().toLowerCase() ? 1 : 0
  ).reduce<number>((a, b) => a + b, 0);

  const pct = (agreements / total) * 100;
  let interpretation = '';
  let level = 'poor';
  if (pct >= 90) { interpretation = 'Excellent agreement'; level = 'excellent'; }
  else if (pct >= 80) { interpretation = 'Good agreement (meets typical academic threshold)'; level = 'good'; }
  else if (pct >= 70) { interpretation = 'Acceptable agreement'; level = 'acceptable'; }
  else { interpretation = 'Poor agreement — review coding scheme'; level = 'poor'; }

  const steps = [
    `Total coding decisions = ${total}`,
    `Agreements = ${agreements}`,
    `Disagreements = ${total - agreements}`,
    `Agreement % = (${agreements} / ${total}) × 100 = ${pct.toFixed(2)}%`,
  ];

  const academicText = `Inter-coder agreement was calculated to assess the reliability of the coding process. The two coders agreed on ${agreements} out of ${total} coding decisions, yielding an agreement percentage of ${pct.toFixed(1)}%. ${interpretation}.`;

  return { agreementPct: pct, agreements, total, interpretation, interpretationLevel: level, steps, academicText };
}

export interface MultiCoderAgreementResult extends InterCoderResult {
  disagreements: number;
  skippedRows: number;
  coderCount: number;
  categories: string[];
}

export function calculateMultiCoderAgreement(rows: string[][]): MultiCoderAgreementResult {
  if (rows.length === 0) throw new Error('Enter at least one coded item.');
  const coderCount = rows[0].length;
  if (coderCount < 2) throw new Error('Inter-coder agreement requires at least two coder columns.');
  if (rows.some(row => row.length !== coderCount)) throw new Error('All rows must have the same number of coder columns.');

  const completeRows = rows
    .map(row => row.map(code => code.trim()))
    .filter(row => row.every(code => code.length > 0));
  const skippedRows = rows.length - completeRows.length;
  if (completeRows.length === 0) throw new Error('No complete coded rows were found. Rows with missing values are excluded.');

  // A row is an agreement only when every coder assigned the same category label.
  const agreements = completeRows.filter(row => {
    const first = row[0].toLowerCase();
    return row.every(code => code.toLowerCase() === first);
  }).length;
  const total = completeRows.length;
  const pct = (agreements / total) * 100;
  const disagreements = total - agreements;
  const categories = Array.from(new Set(completeRows.flat())).sort((a, b) => a.localeCompare(b));

  let interpretation = '';
  let level = 'poor';
  if (pct >= 90) { interpretation = 'Excellent agreement'; level = 'excellent'; }
  else if (pct >= 80) { interpretation = 'Good agreement (meets typical academic threshold)'; level = 'good'; }
  else if (pct >= 70) { interpretation = 'Acceptable agreement'; level = 'acceptable'; }
  else { interpretation = 'Poor agreement — review coding scheme'; level = 'poor'; }

  const steps = [
    `Coder columns = ${coderCount}`,
    `Rows entered = ${rows.length}`,
    `Complete rows analysed = ${total}`,
    `Rows excluded because of missing values = ${skippedRows}`,
    `Agreement rows = ${agreements}`,
    `Disagreement rows = ${disagreements}`,
    `Agreement % = (${agreements} / ${total}) × 100 = ${pct.toFixed(2)}%`,
  ];

  const academicText = `Inter-coder percentage agreement was calculated across ${coderCount} coders. After excluding ${skippedRows} row(s) with missing codes, coders agreed on ${agreements} of ${total} coded item(s), yielding ${pct.toFixed(1)}% agreement. ${interpretation}.`;

  return { agreementPct: pct, agreements, disagreements, total, skippedRows, coderCount, categories, interpretation, interpretationLevel: level, steps, academicText };
}

// ─── 10. Mean / Median / Mode ─────────────────────────────────────────────────

export interface DescriptiveResult {
  mean: number;
  median: number;
  mode: number[];
  range: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  count: number;
  steps: string[];
  academicText: string;
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n % 2 === 0) return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return sorted[Math.floor(n / 2)];
}

function quartile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  return sorted[lower] + (pos - lower) * (sorted[upper] - sorted[lower]);
}

export function calculateDescriptive(data: number[]): DescriptiveResult {
  const sorted = [...data].sort((a, b) => a - b);
  const n = data.length;
  const m = mean(data);

  const freq: Record<number, number> = {};
  data.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  const mode = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => parseFloat(v));

  const q1 = quartile(sorted, 0.25);
  const q3 = quartile(sorted, 0.75);
  const med = median(sorted);

  const steps = [
    `Dataset (sorted): [${sorted.join(', ')}]`,
    `n = ${n}`,
    `Mean = (${data.join(' + ')}) / ${n} = ${m.toFixed(4)}`,
    `Median = ${med}`,
    `Mode = ${mode.join(', ')} (frequency = ${maxFreq})`,
    `Range = ${sorted[n - 1]} − ${sorted[0]} = ${sorted[n - 1] - sorted[0]}`,
    `Q1 = ${q1.toFixed(4)}, Q3 = ${q3.toFixed(4)}, IQR = ${(q3 - q1).toFixed(4)}`,
  ];

  const academicText = `Descriptive analysis of the dataset (n = ${n}) revealed a mean of ${m.toFixed(3)}, a median of ${med}, and a mode of ${mode.join(', ')}. The range was ${sorted[n - 1] - sorted[0]} (min = ${sorted[0]}, max = ${sorted[n - 1]}), with an interquartile range of ${(q3 - q1).toFixed(3)}.`;

  return { mean: m, median: med, mode, range: sorted[n - 1] - sorted[0], min: sorted[0], max: sorted[n - 1], q1, q3, iqr: q3 - q1, count: n, steps, academicText };
}

// ─── 11. Standard Deviation ───────────────────────────────────────────────────

export interface StdDevResult {
  stdDev: number;
  variance: number;
  mean: number;
  n: number;
  type: 'population' | 'sample';
  steps: string[];
  academicText: string;
}

export function calculateStdDev(data: number[], sampleType: 'population' | 'sample'): StdDevResult {
  const isSample = sampleType === 'sample';
  const n = data.length;
  const m = mean(data);
  const v = variance(data, isSample);
  const sd = Math.sqrt(v);
  const diffs = data.map(x => `(${x} − ${m.toFixed(3)})² = ${((x - m) ** 2).toFixed(4)}`);

  const steps = [
    `n = ${n}, Mean = ${m.toFixed(4)}`,
    `Squared deviations:`,
    ...diffs.slice(0, 10),
    diffs.length > 10 ? `... (${diffs.length - 10} more)` : '',
    `Sum of squared deviations = ${data.reduce((a, x) => a + (x - m) ** 2, 0).toFixed(4)}`,
    `Variance = sum / ${isSample ? `(${n}−1)` : n} = ${v.toFixed(4)}`,
    `Standard deviation = √${v.toFixed(4)} = ${sd.toFixed(4)}`,
  ].filter(Boolean);

  const academicText = `The ${isSample ? 'sample' : 'population'} standard deviation of the dataset (n = ${n}) was calculated to be ${sd.toFixed(3)} (variance = ${v.toFixed(3)}, mean = ${m.toFixed(3)}).`;

  return { stdDev: sd, variance: v, mean: m, n, type: sampleType, steps, academicText };
}

// ─── 12. Variance (standalone) ────────────────────────────────────────────────

export function calculateVariance(data: number[], sampleType: 'population' | 'sample'): StdDevResult {
  return calculateStdDev(data, sampleType);
}

// ─── 13. Z-Score ──────────────────────────────────────────────────────────────

export interface ZScoreResult {
  zScores: number[];
  mean: number;
  stdDev: number;
  values: number[];
  steps: string[];
  academicText: string;
}

export function calculateZScores(values: number[], populationMean: number, populationSD: number): ZScoreResult {
  const zScores = values.map(x => (x - populationMean) / populationSD);

  const steps = [
    `Mean (μ) = ${populationMean}`,
    `Standard Deviation (σ) = ${populationSD}`,
    ...values.map((x, i) => `z${i + 1} = (${x} − ${populationMean}) / ${populationSD} = ${zScores[i].toFixed(4)}`),
  ];

  const academicText = `Z-scores were calculated for ${values.length} value(s) using μ = ${populationMean} and σ = ${populationSD}. Results: ${values.map((x, i) => `${x} → z = ${zScores[i].toFixed(3)}`).join('; ')}.`;

  return { zScores, mean: populationMean, stdDev: populationSD, values, steps, academicText };
}

// ─── 14. Confidence Interval ──────────────────────────────────────────────────

export interface ConfidenceIntervalResult {
  lower: number;
  upper: number;
  margin: number;
  criticalValue: number;
  se: number;
  distributionType: 'z' | 't';
  steps: string[];
  academicText: string;
}

export function calculateConfidenceInterval(
  sampleMean: number,
  sampleSD: number,
  sampleSize: number,
  confidenceLevel: number,
  useT: boolean
): ConfidenceIntervalResult {
  const alpha = 1 - confidenceLevel / 100;
  let cv: number;
  const distType: 'z' | 't' = useT ? 't' : 'z';

  if (useT) {
    cv = tCritical(sampleSize - 1, alpha);
  } else {
    cv = Z_SCORES[String(confidenceLevel)] || 1.96;
  }

  const se = sampleSD / Math.sqrt(sampleSize);
  const margin = cv * se;
  const lower = sampleMean - margin;
  const upper = sampleMean + margin;

  const steps = [
    `Sample mean (x̄) = ${sampleMean}`,
    `Sample SD (s) = ${sampleSD}`,
    `Sample size (n) = ${sampleSize}`,
    `Standard error (SE) = ${sampleSD} / √${sampleSize} = ${se.toFixed(4)}`,
    `Critical value (${distType}*) at ${confidenceLevel}% = ${cv.toFixed(4)}`,
    `Margin of error = ${cv.toFixed(4)} × ${se.toFixed(4)} = ${margin.toFixed(4)}`,
    `${confidenceLevel}% CI = ${sampleMean} ± ${margin.toFixed(4)} = [${lower.toFixed(4)}, ${upper.toFixed(4)}]`,
  ];

  const academicText = `A ${confidenceLevel}% confidence interval for the population mean was calculated using the ${distType === 't' ? 't-distribution (df = ' + (sampleSize - 1) + ')' : 'z-distribution'}. Based on a sample mean of ${sampleMean} and standard deviation of ${sampleSD} (n = ${sampleSize}), the ${confidenceLevel}% CI is [${lower.toFixed(3)}, ${upper.toFixed(3)}].`;

  return { lower, upper, margin, criticalValue: cv, se, distributionType: distType, steps, academicText };
}

// ─── 15. Pearson Correlation ──────────────────────────────────────────────────

export interface CorrelationResult {
  r: number;
  rSquared: number;
  tStatistic: number;
  n: number;
  interpretation: string;
  interpretationLevel: string;
  steps: string[];
  academicText: string;
}

export function calculateCorrelation(xValues: number[], yValues: number[]): CorrelationResult {
  const n = Math.min(xValues.length, yValues.length);
  const x = xValues.slice(0, n);
  const y = yValues.slice(0, n);

  const xMean = mean(x);
  const yMean = mean(y);

  const num = x.reduce((a, xi, i) => a + (xi - xMean) * (y[i] - yMean), 0);
  const denX = Math.sqrt(x.reduce((a, xi) => a + (xi - xMean) ** 2, 0));
  const denY = Math.sqrt(y.reduce((a, yi) => a + (yi - yMean) ** 2, 0));
  const r = num / (denX * denY);
  const rSquared = r * r;

  const tStat = Math.abs(r) >= 1 ? Infinity : r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);

  const absR = Math.abs(r);
  let interp = '';
  let level = 'poor';
  if (absR >= 0.90) { interp = 'Very strong correlation'; level = 'excellent'; }
  else if (absR >= 0.70) { interp = 'Strong correlation'; level = 'good'; }
  else if (absR >= 0.50) { interp = 'Moderate correlation'; level = 'good'; }
  else if (absR >= 0.30) { interp = 'Weak correlation'; level = 'acceptable'; }
  else { interp = 'Negligible/no correlation'; level = 'poor'; }
  const direction = r > 0 ? 'positive' : r < 0 ? 'negative' : '';

  const steps = [
    `n = ${n}, x̄ = ${xMean.toFixed(4)}, ȳ = ${yMean.toFixed(4)}`,
    `Σ(xᵢ−x̄)(yᵢ−ȳ) = ${num.toFixed(4)}`,
    `√Σ(xᵢ−x̄)² = ${denX.toFixed(4)}, √Σ(yᵢ−ȳ)² = ${denY.toFixed(4)}`,
    `r = ${num.toFixed(4)} / (${denX.toFixed(4)} × ${denY.toFixed(4)}) = ${r.toFixed(4)}`,
    `R² = ${rSquared.toFixed(4)}`,
    `t-statistic = ${tStat.toFixed(4)} (df = ${n - 2})`,
  ];

  const academicText = `Pearson's correlation coefficient was calculated to examine the relationship between the two variables (n = ${n}). The result indicated a ${direction} ${interp.toLowerCase()} (r = ${r.toFixed(3)}, R² = ${rSquared.toFixed(3)}, t(${n - 2}) = ${tStat.toFixed(3)}).`;

  return { r, rSquared, tStatistic: tStat, n, interpretation: interp, interpretationLevel: level, steps, academicText };
}

// ─── 16. Risk Matrix ──────────────────────────────────────────────────────────

export interface RiskItem {
  name: string;
  likelihood: number;
  impact: number;
}

export interface RiskResult {
  risks: { name: string; likelihood: number; impact: number; score: number; level: string; color: string }[];
  summary: { critical: number; high: number; medium: number; low: number };
  steps: string[];
  academicText: string;
}

function riskLevel(score: number): { level: string; color: string } {
  if (score >= 15) return { level: 'Critical', color: 'red' };
  if (score >= 10) return { level: 'High', color: 'orange' };
  if (score >= 5) return { level: 'Medium', color: 'yellow' };
  return { level: 'Low', color: 'green' };
}

export function calculateRiskMatrix(risks: RiskItem[]): RiskResult {
  const results = risks.map(r => {
    const score = r.likelihood * r.impact;
    const rl = riskLevel(score);
    return { ...r, score, ...rl };
  });

  const summary = { critical: 0, high: 0, medium: 0, low: 0 };
  results.forEach(r => {
    if (r.level === 'Critical') summary.critical++;
    else if (r.level === 'High') summary.high++;
    else if (r.level === 'Medium') summary.medium++;
    else summary.low++;
  });

  const steps = results.map(r => `${r.name}: Likelihood ${r.likelihood} × Impact ${r.impact} = Score ${r.score} (${r.level})`);

  const academicText = `A risk assessment was conducted using a 5×5 risk matrix across ${risks.length} identified risks. Results identified ${summary.critical} critical, ${summary.high} high, ${summary.medium} medium, and ${summary.low} low-level risks based on the product of likelihood (1–5) and impact (1–5) scores.`;

  return { risks: results, summary, steps, academicText };
}

// ─── 17. Stakeholder Matrix ───────────────────────────────────────────────────

export interface Stakeholder {
  name: string;
  power: number;
  interest: number;
}

export interface StakeholderResult {
  stakeholders: { name: string; power: number; interest: number; quadrant: string; strategy: string; priority: number }[];
  steps: string[];
  academicText: string;
}

export function calculateStakeholderMatrix(stakeholders: Stakeholder[]): StakeholderResult {
  const results = stakeholders.map(s => {
    const midpoint = 5;
    let quadrant: string;
    let strategy: string;
    if (s.power >= midpoint && s.interest >= midpoint) { quadrant = 'Manage Closely'; strategy = 'Engage actively, communicate frequently, involve in decisions.'; }
    else if (s.power >= midpoint && s.interest < midpoint) { quadrant = 'Keep Satisfied'; strategy = 'Meet their needs, keep informed but avoid overwhelming.'; }
    else if (s.power < midpoint && s.interest >= midpoint) { quadrant = 'Keep Informed'; strategy = 'Provide regular updates, gather their input.'; }
    else { quadrant = 'Monitor'; strategy = 'Monitor with minimal effort; general communications.'; }
    return { ...s, quadrant, strategy, priority: s.power * s.interest };
  }).sort((a, b) => b.priority - a.priority);

  const steps = results.map(s => `${s.name}: Power ${s.power}, Interest ${s.interest} → ${s.quadrant}`);

  const academicText = `A stakeholder analysis was conducted using the power-interest matrix framework. ${results.length} stakeholders were mapped across four quadrants: ${results.filter(s => s.quadrant === 'Manage Closely').length} require close management, ${results.filter(s => s.quadrant === 'Keep Satisfied').length} should be kept satisfied, ${results.filter(s => s.quadrant === 'Keep Informed').length} should be kept informed, and ${results.filter(s => s.quadrant === 'Monitor').length} require monitoring only.`;

  return { stakeholders: results, steps, academicText };
}

// ─── 18. AHP Weight Calculator ────────────────────────────────────────────────

export interface AHPResult {
  weights: number[];
  criteriaNames: string[];
  lambdaMax: number;
  ci: number;
  cr: number;
  ri: number;
  isConsistent: boolean;
  steps: string[];
  academicText: string;
}

const RI: Record<number, number> = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

export function calculateAHP(criteria: string[], matrix: number[][]): AHPResult {
  const n = criteria.length;

  // Column sums
  const colSums = Array.from({ length: n }, (_, j) => matrix.reduce((a, row) => a + row[j], 0));

  // Normalize matrix
  const normalized = matrix.map(row => row.map((v, j) => v / colSums[j]));

  // Priority vector (row averages)
  const weights = normalized.map(row => row.reduce((a, b) => a + b, 0) / n);

  // Weighted sum vector
  const wSum = matrix.map(row => row.reduce((a, v, j) => a + v * weights[j], 0));

  // Lambda max
  const lambdaMax = wSum.reduce((a, w, i) => a + w / weights[i], 0) / n;

  const ci = (lambdaMax - n) / (n - 1);
  const ri = RI[n] || 1.49;
  const cr = ri === 0 ? 0 : ci / ri;
  const isConsistent = cr <= 0.10;

  const steps = [
    `Matrix size: ${n}×${n}`,
    `Column sums: [${colSums.map(s => s.toFixed(3)).join(', ')}]`,
    `Priority weights: ${criteria.map((c, i) => `${c} = ${(weights[i] * 100).toFixed(1)}%`).join(', ')}`,
    `λ_max = ${lambdaMax.toFixed(4)}`,
    `CI = (${lambdaMax.toFixed(4)} − ${n}) / (${n} − 1) = ${ci.toFixed(4)}`,
    `RI (n=${n}) = ${ri}`,
    `CR = ${ci.toFixed(4)} / ${ri} = ${cr.toFixed(4)}`,
    isConsistent ? 'CR ≤ 0.10: Matrix is acceptably consistent.' : 'CR > 0.10: Matrix is inconsistent — revise comparisons.',
  ];

  const academicText = `AHP pairwise comparison analysis was conducted for ${n} criteria. The derived priority weights were: ${criteria.map((c, i) => `${c} (${(weights[i] * 100).toFixed(1)}%)`).join(', ')}. The consistency ratio (CR = ${cr.toFixed(3)}) ${isConsistent ? 'falls within the acceptable threshold of 0.10, indicating consistent judgments' : 'exceeds the 0.10 threshold, indicating inconsistent pairwise judgments that require revision'}.`;

  return { weights, criteriaNames: criteria, lambdaMax, ci, cr, ri, isConsistent, steps, academicText };
}

// ─── 19. Delphi Consensus ─────────────────────────────────────────────────────

export interface DelphiResult {
  items: {
    label: string;
    ratings: number[];
    mean: number;
    median: number;
    sd: number;
    cv: number;
    q1: number;
    q3: number;
    iqr: number;
    pctWithinOneUnit: number;
    consensusReached: boolean;
  }[];
  overallConsensus: boolean;
  steps: string[];
  academicText: string;
}

export function calculateDelphiConsensus(items: { label: string; ratings: number[] }[], threshold: number = 70): DelphiResult {
  const results = items.map(item => {
    const sorted = [...item.ratings].sort((a, b) => a - b);
    const n = sorted.length;
    const m = mean(item.ratings);
    const med = sorted.length % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const sd = stdDev(item.ratings, true);
    const cv = (sd / m) * 100;
    const q1 = quartile(sorted, 0.25);
    const q3 = quartile(sorted, 0.75);
    const iqr = q3 - q1;
    const withinOne = item.ratings.filter(r => Math.abs(r - med) <= 1).length;
    const pctWithinOneUnit = (withinOne / n) * 100;
    const consensusReached = iqr <= 1 && pctWithinOneUnit >= threshold;

    return { label: item.label, ratings: item.ratings, mean: m, median: med, sd, cv, q1, q3, iqr, pctWithinOneUnit, consensusReached };
  });

  const overallConsensus = results.every(r => r.consensusReached);

  const steps = results.map(r =>
    `"${r.label}": Mean=${r.mean.toFixed(2)}, Median=${r.median}, IQR=${r.iqr.toFixed(2)}, CV=${r.cv.toFixed(1)}%, ${r.pctWithinOneUnit.toFixed(0)}% within ±1 unit → ${r.consensusReached ? 'Consensus reached' : 'No consensus'}`
  );

  const consensusCount = results.filter(r => r.consensusReached).length;
  const academicText = `Consensus analysis was performed on ${items.length} Delphi items across the expert panel. Consensus was defined as IQR ≤ 1.0 and ≥ ${threshold}% of ratings within one unit of the median. Consensus was reached on ${consensusCount} of ${items.length} items (${((consensusCount / items.length) * 100).toFixed(0)}%).`;

  return { items: results, overallConsensus, steps, academicText };
}

// ─── 20. Maturity Model ───────────────────────────────────────────────────────

export interface MaturityDomain {
  name: string;
  weight: number;
  factors: { name: string; score: number; weight: number }[];
}

export interface MaturityResult {
  overallScore: number;
  overallLevel: number;
  overallLevelName: string;
  domains: { name: string; weight: number; score: number; level: number; levelName: string }[];
  steps: string[];
  academicText: string;
}

function maturityLevel(score: number): { level: number; name: string } {
  if (score < 0.5) return { level: 0, name: 'Non-existent' };
  if (score < 1.5) return { level: 1, name: 'Initial' };
  if (score < 2.5) return { level: 2, name: 'Developing' };
  if (score < 3.5) return { level: 3, name: 'Managed' };
  return { level: 4, name: 'Optimised' };
}

export function calculateMaturityModel(domains: MaturityDomain[]): MaturityResult {
  const totalDomainWeight = domains.reduce((a, d) => a + d.weight, 0);

  const domainResults = domains.map(domain => {
    const totalFactorWeight = domain.factors.reduce((a, f) => a + f.weight, 0);
    const domainScore = domain.factors.reduce((a, f) => a + (f.score * f.weight) / totalFactorWeight, 0);
    const lvl = maturityLevel(domainScore);
    return { name: domain.name, weight: domain.weight, score: domainScore, level: lvl.level, levelName: lvl.name };
  });

  const overallScore = domainResults.reduce((a, d) => a + (d.score * d.weight) / totalDomainWeight, 0);
  const overallLvl = maturityLevel(overallScore);

  const steps = [
    ...domainResults.map(d => `Domain "${d.name}" (weight ${d.weight}): Score = ${d.score.toFixed(3)} → Level ${d.level} (${d.levelName})`),
    `Overall weighted score = ${overallScore.toFixed(3)} → Level ${overallLvl.level} (${overallLvl.name})`,
  ];

  const academicText = `A maturity model assessment was conducted across ${domains.length} domains. The overall maturity score was ${overallScore.toFixed(3)} out of 4.0, corresponding to Level ${overallLvl.level}: ${overallLvl.name}. Domain-level scores ranged from ${Math.min(...domainResults.map(d => d.score)).toFixed(2)} to ${Math.max(...domainResults.map(d => d.score)).toFixed(2)}.`;

  return { overallScore, overallLevel: overallLvl.level, overallLevelName: overallLvl.name, domains: domainResults, steps, academicText };
}

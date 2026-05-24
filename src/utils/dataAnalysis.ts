import { jStat } from 'jstat';
import { calculateCronbachAlpha, calculateCohensKappa, buildCohenMatrixFromPairs, interpretKappa } from './calculations';
import type { ParsedDataset } from './dataParsing';
import type { ColumnType } from './dataTypeDetection';

export type AnalysisType =
  | 'descriptive'
  | 'frequency'
  | 'crosstab'
  | 'correlation'
  | 'cronbach'
  | 'kappa'
  | 'likert'
  | 'ttest';

export interface ChartPoint {
  name: string;
  value: number;
}

export interface AnalysisResult {
  analysisType: AnalysisType;
  title: string;
  summary: { label: string; value: string }[];
  tableHeaders: string[];
  tableRows: string[][];
  chartData?: ChartPoint[];
  chartTitle?: string;
  chartColor?: string;
  interpretation: string;
  academicText: string;
}

export interface VariableRequirement {
  key: string;
  label: string;
  hint: string;
  multi: boolean;
  minSelect?: number;
  allowedTypes: ColumnType[];
}

export const ANALYSIS_META: Record<AnalysisType, { label: string; description: string; icon: string }> = {
  descriptive: { label: 'Descriptive Statistics', description: 'Mean, median, std dev, min/max for numeric columns', icon: '📊' },
  frequency: { label: 'Frequency Table', description: 'Count and % for each category', icon: '📋' },
  crosstab: { label: 'Cross-Tabulation', description: 'Contingency table for two categorical variables', icon: '🔲' },
  correlation: { label: 'Correlation (Pearson)', description: 'Strength and direction of linear relationship', icon: '📈' },
  cronbach: { label: "Cronbach's Alpha", description: 'Internal consistency for Likert-scale items', icon: '🔬' },
  kappa: { label: "Cohen's Kappa", description: 'Inter-rater reliability between two coders', icon: '👥' },
  likert: { label: 'Likert Scale Analysis', description: 'Mean and distribution per Likert item', icon: '⭐' },
  ttest: { label: 'Independent T-Test', description: 'Compare means across two groups', icon: '⚖️' },
};

export const ANALYSIS_VARIABLE_REQUIREMENTS: Record<AnalysisType, VariableRequirement[]> = {
  descriptive: [
    { key: 'col', label: 'Numeric Variable', hint: 'Select a numeric column to summarise', multi: false, allowedTypes: ['numeric', 'likert'] },
  ],
  frequency: [
    { key: 'col', label: 'Categorical Variable', hint: 'Select a categorical or Likert column', multi: false, allowedTypes: ['categorical', 'likert'] },
  ],
  crosstab: [
    { key: 'row', label: 'Row Variable', hint: 'Categorical column for rows', multi: false, allowedTypes: ['categorical', 'likert'] },
    { key: 'col', label: 'Column Variable', hint: 'Categorical column for columns', multi: false, allowedTypes: ['categorical', 'likert'] },
  ],
  correlation: [
    { key: 'x', label: 'X Variable', hint: 'First numeric variable', multi: false, allowedTypes: ['numeric', 'likert'] },
    { key: 'y', label: 'Y Variable', hint: 'Second numeric variable', multi: false, allowedTypes: ['numeric', 'likert'] },
  ],
  cronbach: [
    { key: 'items', label: 'Scale Items', hint: 'Select 2 or more Likert/numeric columns', multi: true, minSelect: 2, allowedTypes: ['numeric', 'likert'] },
  ],
  kappa: [
    { key: 'rater1', label: 'Rater 1 Column', hint: "First coder's column", multi: false, allowedTypes: ['categorical', 'text', 'likert'] },
    { key: 'rater2', label: 'Rater 2 Column', hint: "Second coder's column", multi: false, allowedTypes: ['categorical', 'text', 'likert'] },
  ],
  likert: [
    { key: 'items', label: 'Likert Items', hint: 'Select 2 or more Likert scale columns', multi: true, minSelect: 2, allowedTypes: ['numeric', 'likert'] },
  ],
  ttest: [
    { key: 'value', label: 'Outcome Column', hint: 'Numeric column to compare across groups', multi: false, allowedTypes: ['numeric', 'likert'] },
    { key: 'group', label: 'Group Column', hint: 'Categorical column with exactly 2 groups', multi: false, allowedTypes: ['categorical'] },
  ],
};

function getNumericCol(dataset: ParsedDataset, col: string): number[] {
  return dataset.rows.map(r => parseFloat(r[col] ?? '')).filter(n => !isNaN(n));
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  return n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
}

function sampleStd(arr: number[], m: number): number {
  if (arr.length < 2) return NaN;
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

function histogramBins(values: number[], numBins = 8): ChartPoint[] {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (min === max) return [{ name: String(min), value: values.length }];
  const binWidth = (max - min) / numBins;
  const bins: ChartPoint[] = Array.from({ length: numBins }, (_, i) => ({
    name: `${(min + i * binWidth).toFixed(1)}`,
    value: 0,
  }));
  sorted.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), numBins - 1);
    bins[idx].value++;
  });
  return bins;
}

export function runDescriptive(dataset: ParsedDataset, col: string): AnalysisResult {
  const values = getNumericCol(dataset, col);
  if (values.length === 0) throw new Error(`No numeric values found in "${col}".`);
  const sorted = [...values].sort((a, b) => a - b);
  const m = mean(values);
  const med = median(sorted);
  const sd = sampleStd(values, m);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;
  const missing = dataset.rowCount - values.length;

  const fmt = (n: number) => isNaN(n) ? 'N/A' : n.toFixed(3);

  return {
    analysisType: 'descriptive',
    title: `Descriptive Statistics: ${col}`,
    summary: [
      { label: 'N (valid)', value: String(values.length) },
      { label: 'Missing', value: String(missing) },
      { label: 'Mean', value: fmt(m) },
      { label: 'Median', value: fmt(med) },
      { label: 'Std Dev', value: fmt(sd) },
      { label: 'Variance', value: fmt(sd ** 2) },
      { label: 'Min', value: fmt(min) },
      { label: 'Max', value: fmt(max) },
      { label: 'Range', value: fmt(range) },
    ],
    tableHeaders: ['Statistic', 'Value'],
    tableRows: [
      ['N (valid)', String(values.length)],
      ['Missing', String(missing)],
      ['Mean', fmt(m)],
      ['Median', fmt(med)],
      ['Std Deviation', fmt(sd)],
      ['Variance', fmt(sd ** 2)],
      ['Min', fmt(min)],
      ['Max', fmt(max)],
      ['Range', fmt(range)],
    ],
    chartData: histogramBins(values),
    chartTitle: `Distribution of ${col}`,
    chartColor: '#6366f1',
    interpretation: `The variable "${col}" has a mean of ${fmt(m)} and standard deviation of ${fmt(sd)}, with values ranging from ${fmt(min)} to ${fmt(max)}.`,
    academicText: `Descriptive statistics for the variable ${col} revealed a mean of ${fmt(m)} (SD = ${fmt(sd)}), with a range of ${fmt(min)} to ${fmt(max)} (N = ${values.length}${missing > 0 ? `, ${missing} missing` : ''}).`,
  };
}

export function runFrequency(dataset: ParsedDataset, col: string): AnalysisResult {
  const values = dataset.rows.map(r => r[col] ?? '').filter(v => v.trim() !== '');
  const total = values.length;
  if (total === 0) throw new Error(`No values found in "${col}".`);

  const freq = new Map<string, number>();
  values.forEach(v => freq.set(v, (freq.get(v) ?? 0) + 1));
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]);

  const tableRows = sorted.map(([val, count]) => [val, String(count), `${((count / total) * 100).toFixed(1)}%`]);
  const chartData = sorted.slice(0, 15).map(([name, value]) => ({ name, value }));
  const topVal = sorted[0][0];
  const topCount = sorted[0][1];

  return {
    analysisType: 'frequency',
    title: `Frequency Table: ${col}`,
    summary: [
      { label: 'Total responses', value: String(total) },
      { label: 'Unique categories', value: String(sorted.length) },
      { label: 'Most frequent', value: `"${topVal}" (n=${topCount}, ${((topCount / total) * 100).toFixed(1)}%)` },
    ],
    tableHeaders: ['Value', 'Count', 'Percentage'],
    tableRows,
    chartData,
    chartTitle: `Frequency: ${col}`,
    chartColor: '#14b8a6',
    interpretation: `The most frequent category in "${col}" is "${topVal}" (n=${topCount}, ${((topCount / total) * 100).toFixed(1)}%).`,
    academicText: `A frequency analysis of the variable ${col} (N=${total}) revealed ${sorted.length} distinct categories. The most frequently occurring category was "${topVal}" (n=${topCount}, ${((topCount / total) * 100).toFixed(1)}%).`,
  };
}

export function runCrossTabs(dataset: ParsedDataset, rowCol: string, colCol: string): AnalysisResult {
  const rowVals = dataset.rows.map(r => r[rowCol] ?? '');
  const colVals = dataset.rows.map(r => r[colCol] ?? '');

  const rowCats = [...new Set(rowVals.filter(v => v))].sort();
  const colCats = [...new Set(colVals.filter(v => v))].sort();

  if (rowCats.length === 0 || colCats.length === 0) throw new Error('Not enough categories for cross-tabulation.');
  if (rowCats.length > 20 || colCats.length > 20) throw new Error('Too many categories (max 20 per variable) for cross-tabulation.');

  const matrix: number[][] = rowCats.map(() => colCats.map(() => 0));
  rowVals.forEach((rv, i) => {
    const ri = rowCats.indexOf(rv);
    const ci = colCats.indexOf(colVals[i]);
    if (ri >= 0 && ci >= 0) matrix[ri][ci]++;
  });

  const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = colCats.map((_, ci) => matrix.reduce((a, row) => a + row[ci], 0));
  const N = rowTotals.reduce((a, b) => a + b, 0);

  const tableHeaders = [rowCol, ...colCats, 'Total'];
  const tableRows = rowCats.map((rc, ri) => [rc, ...matrix[ri].map(String), String(rowTotals[ri])]);
  tableRows.push(['Total', ...colTotals.map(String), String(N)]);

  return {
    analysisType: 'crosstab',
    title: `Cross-Tabulation: ${rowCol} × ${colCol}`,
    summary: [
      { label: 'N', value: String(N) },
      { label: 'Row variable', value: rowCol },
      { label: 'Column variable', value: colCol },
      { label: 'Row categories', value: String(rowCats.length) },
      { label: 'Column categories', value: String(colCats.length) },
    ],
    tableHeaders,
    tableRows,
    interpretation: `Cross-tabulation of "${rowCol}" (${rowCats.length} categories) by "${colCol}" (${colCats.length} categories), N=${N}.`,
    academicText: `A cross-tabulation was conducted between ${rowCol} and ${colCol} (N=${N}). Results are presented in the contingency table above.`,
  };
}

export function runCorrelation(dataset: ParsedDataset, xCol: string, yCol: string): AnalysisResult {
  const paired = dataset.rows
    .map(r => [parseFloat(r[xCol] ?? ''), parseFloat(r[yCol] ?? '')])
    .filter(([x, y]) => !isNaN(x) && !isNaN(y)) as [number, number][];

  const n = paired.length;
  if (n < 3) throw new Error('Pearson correlation requires at least 3 complete pairs.');

  const xs = paired.map(p => p[0]);
  const ys = paired.map(p => p[1]);

  const r: number = jStat.corrcoeff(xs, ys);
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const p: number = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const ciLower = Math.tanh(z - 1.96 * se);
  const ciUpper = Math.tanh(z + 1.96 * se);

  const strength = Math.abs(r) < 0.1 ? 'negligible' : Math.abs(r) < 0.3 ? 'weak' : Math.abs(r) < 0.5 ? 'moderate' : Math.abs(r) < 0.7 ? 'strong' : 'very strong';
  const direction = r >= 0 ? 'positive' : 'negative';
  const sig = p < 0.05;

  const fmt = (n: number) => isNaN(n) ? 'N/A' : n.toFixed(3);

  return {
    analysisType: 'correlation',
    title: `Pearson Correlation: ${xCol} × ${yCol}`,
    summary: [
      { label: 'N (pairs)', value: String(n) },
      { label: 'Pearson r', value: fmt(r) },
      { label: 'r² (variance explained)', value: fmt(r * r) },
      { label: 't-statistic', value: fmt(t) },
      { label: 'p-value', value: p < 0.001 ? '< 0.001' : fmt(p) },
      { label: '95% CI', value: `[${fmt(ciLower)}, ${fmt(ciUpper)}]` },
    ],
    tableHeaders: ['Statistic', 'Value'],
    tableRows: [
      ['N', String(n)],
      ['Pearson r', fmt(r)],
      ['r²', fmt(r * r)],
      ['t', fmt(t)],
      ['p-value', p < 0.001 ? '< 0.001' : fmt(p)],
      ['95% CI lower', fmt(ciLower)],
      ['95% CI upper', fmt(ciUpper)],
    ],
    chartData: [
      { name: xCol, value: parseFloat(mean(xs).toFixed(2)) },
      { name: yCol, value: parseFloat(mean(ys).toFixed(2)) },
    ],
    chartTitle: 'Variable Means',
    chartColor: '#8b5cf6',
    interpretation: `There is a ${strength} ${direction} correlation between "${xCol}" and "${yCol}" (r = ${fmt(r)}, p ${p < 0.001 ? '< 0.001' : fmt(p)}). The relationship is${sig ? '' : ' not'} statistically significant at α = 0.05.`,
    academicText: `A Pearson product-moment correlation was conducted to examine the relationship between ${xCol} and ${yCol}. Results indicated a ${strength} ${direction} correlation, r(${n - 2}) = ${fmt(r)}, p ${p < 0.001 ? '< 0.001' : '= ' + fmt(p)}, 95% CI [${fmt(ciLower)}, ${fmt(ciUpper)}], r² = ${fmt(r * r)}.`,
  };
}

export function runCronbach(dataset: ParsedDataset, itemCols: string[]): AnalysisResult {
  if (itemCols.length < 2) throw new Error("Cronbach's Alpha requires at least 2 items.");

  const data = dataset.rows.map(row => itemCols.map(col => parseFloat(row[col] ?? ''))).filter(row => row.every(v => !isNaN(v)));

  if (data.length < 2) throw new Error('Not enough complete rows for Cronbach\'s Alpha.');

  const result = calculateCronbachAlpha(data);
  const fmt = (n: number) => n.toFixed(3);

  const tableRows = itemCols.map(col => {
    const vals = data.map(r => r[itemCols.indexOf(col)]);
    const m = mean(vals);
    const sd = sampleStd(vals, m);
    return [col, fmt(m), fmt(sd)];
  });

  return {
    analysisType: 'cronbach',
    title: "Cronbach's Alpha: Internal Consistency",
    summary: [
      { label: "Cronbach's α", value: fmt(result.alpha) },
      { label: 'N respondents', value: String(data.length) },
      { label: 'N items', value: String(itemCols.length) },
      { label: 'Interpretation', value: result.interpretation },
    ],
    tableHeaders: ['Item', 'Mean', 'Std Dev'],
    tableRows,
    chartData: itemCols.map(col => {
      const vals = data.map(r => r[itemCols.indexOf(col)]);
      return { name: col.replace(/^likert_/, '').replace(/_/g, ' '), value: parseFloat(mean(vals).toFixed(2)) };
    }),
    chartTitle: 'Item Means',
    chartColor: '#f59e0b',
    interpretation: `Cronbach's α = ${fmt(result.alpha)} (${result.interpretation}) across ${itemCols.length} items and ${data.length} respondents.`,
    academicText: result.academicText,
  };
}

export function runKappa(dataset: ParsedDataset, rater1Col: string, rater2Col: string): AnalysisResult {
  const pairs = dataset.rows
    .map(r => [r[rater1Col] ?? '', r[rater2Col] ?? ''] as [string, string])
    .filter(([a, b]) => a.trim() && b.trim());

  if (pairs.length < 2) throw new Error("Cohen's Kappa requires at least 2 rated items.");

  const { matrix, categories, skippedRows } = buildCohenMatrixFromPairs(pairs);
  const result = calculateCohensKappa(matrix);
  const fmt = (n: number) => n.toFixed(3);

  const tableHeaders = [rater1Col + ' \\ ' + rater2Col, ...categories, 'Row Total'];
  const tableRows = categories.map((cat, ri) => [
    cat,
    ...matrix[ri].map(String),
    String(matrix[ri].reduce((a, b) => a + b, 0)),
  ]);
  const colTotals = categories.map((_, ci) => matrix.reduce((a, row) => a + row[ci], 0));
  tableRows.push(['Col Total', ...colTotals.map(String), String(pairs.length)]);

  return {
    analysisType: 'kappa',
    title: "Cohen's Kappa: Inter-Rater Reliability",
    summary: [
      { label: "Cohen's κ", value: fmt(result.kappa) },
      { label: 'N items rated', value: String(result.totalItems) },
      { label: 'Observed agreement', value: fmt(result.observedAgreement) },
      { label: 'Expected agreement', value: fmt(result.expectedAgreement) },
      { label: 'Interpretation', value: result.interpretation },
      ...(skippedRows > 0 ? [{ label: 'Skipped rows (incomplete)', value: String(skippedRows) }] : []),
    ],
    tableHeaders,
    tableRows,
    chartData: categories.map((cat, i) => ({ name: cat, value: matrix[i][i] })),
    chartTitle: 'Agreements per Category',
    chartColor: '#10b981',
    interpretation: `Cohen's κ = ${fmt(result.kappa)}: ${result.interpretation}. Observed agreement = ${fmt(result.observedAgreement)}.`,
    academicText: result.academicText,
  };
}

export function runLikert(dataset: ParsedDataset, itemCols: string[]): AnalysisResult {
  if (itemCols.length < 2) throw new Error('Likert analysis requires at least 2 items.');

  const itemStats = itemCols.map(col => {
    const vals = dataset.rows.map(r => parseFloat(r[col] ?? '')).filter(n => !isNaN(n));
    const m = mean(vals);
    const sd = sampleStd(vals, m);
    return { col, n: vals.length, mean: m, sd };
  });

  const allVals = itemStats.flatMap(s => Array.from({ length: s.n }, () => s.mean));
  const overallMean = mean(itemStats.map(s => s.mean));
  const fmt = (n: number) => isNaN(n) ? 'N/A' : n.toFixed(2);

  return {
    analysisType: 'likert',
    title: 'Likert Scale Analysis',
    summary: [
      { label: 'N items', value: String(itemCols.length) },
      { label: 'Overall mean', value: fmt(overallMean) },
      { label: 'Min item mean', value: fmt(Math.min(...itemStats.map(s => s.mean))) },
      { label: 'Max item mean', value: fmt(Math.max(...itemStats.map(s => s.mean))) },
    ],
    tableHeaders: ['Item', 'N', 'Mean', 'Std Dev'],
    tableRows: itemStats.map(s => [s.col, String(s.n), fmt(s.mean), fmt(s.sd)]),
    chartData: itemStats.map(s => ({
      name: s.col.replace(/^likert_/, '').replace(/_/g, ' '),
      value: parseFloat(fmt(s.mean)),
    })),
    chartTitle: 'Mean Score per Item',
    chartColor: '#f97316',
    interpretation: `Across ${itemCols.length} Likert items, the overall mean response is ${fmt(overallMean)} out of 5.`,
    academicText: `A Likert scale analysis was conducted across ${itemCols.length} items. Item means ranged from ${fmt(Math.min(...itemStats.map(s => s.mean)))} to ${fmt(Math.max(...itemStats.map(s => s.mean)))} with an overall mean of ${fmt(overallMean)}.`,
  };

  void allVals;
}

export function runTTest(dataset: ParsedDataset, valueCol: string, groupCol: string): AnalysisResult {
  const groups = new Map<string, number[]>();
  dataset.rows.forEach(row => {
    const val = parseFloat(row[valueCol] ?? '');
    const grp = row[groupCol] ?? '';
    if (!isNaN(val) && grp.trim()) {
      if (!groups.has(grp)) groups.set(grp, []);
      groups.get(grp)!.push(val);
    }
  });

  const groupNames = [...groups.keys()];
  if (groupNames.length < 2) throw new Error('T-Test requires exactly 2 groups. Only 1 group found.');
  if (groupNames.length > 2) throw new Error(`T-Test requires exactly 2 groups. Found ${groupNames.length}. Choose a binary grouping variable.`);

  const [g1Name, g2Name] = groupNames;
  const g1 = groups.get(g1Name)!;
  const g2 = groups.get(g2Name)!;

  if (g1.length < 2 || g2.length < 2) throw new Error('Each group needs at least 2 observations.');

  const m1 = mean(g1);
  const m2 = mean(g2);
  const sd1 = sampleStd(g1, m1);
  const sd2 = sampleStd(g2, m2);
  const v1 = sd1 ** 2;
  const v2 = sd2 ** 2;
  const n1 = g1.length;
  const n2 = g2.length;

  const se = Math.sqrt(v1 / n1 + v2 / n2);
  const t = (m1 - m2) / se;
  const df = ((v1 / n1 + v2 / n2) ** 2) / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  const p: number = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
  const pooledSd = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  const cohenD = Math.abs(m1 - m2) / pooledSd;

  const effectLabel = cohenD < 0.2 ? 'negligible' : cohenD < 0.5 ? 'small' : cohenD < 0.8 ? 'medium' : 'large';
  const sig = p < 0.05;
  const fmt = (n: number) => isNaN(n) ? 'N/A' : n.toFixed(3);

  return {
    analysisType: 'ttest',
    title: `Independent T-Test: ${valueCol} by ${groupCol}`,
    summary: [
      { label: `Mean (${g1Name})`, value: fmt(m1) },
      { label: `Mean (${g2Name})`, value: fmt(m2) },
      { label: 'Mean difference', value: fmt(m1 - m2) },
      { label: 't-statistic', value: fmt(t) },
      { label: 'df (Welch)', value: fmt(df) },
      { label: 'p-value', value: p < 0.001 ? '< 0.001' : fmt(p) },
      { label: "Cohen's d", value: fmt(cohenD) },
      { label: 'Effect size', value: effectLabel },
    ],
    tableHeaders: ['Statistic', g1Name, g2Name],
    tableRows: [
      ['N', String(n1), String(n2)],
      ['Mean', fmt(m1), fmt(m2)],
      ['Std Dev', fmt(sd1), fmt(sd2)],
    ],
    chartData: [
      { name: g1Name, value: parseFloat(fmt(m1)) },
      { name: g2Name, value: parseFloat(fmt(m2)) },
    ],
    chartTitle: `Group Means: ${valueCol}`,
    chartColor: '#3b82f6',
    interpretation: `The ${g1Name} group (M=${fmt(m1)}, SD=${fmt(sd1)}) and ${g2Name} group (M=${fmt(m2)}, SD=${fmt(sd2)}) differ${sig ? ' significantly' : ''} (t=${fmt(t)}, p${p < 0.001 ? ' < 0.001' : ' = ' + fmt(p)}). Effect size: Cohen's d = ${fmt(cohenD)} (${effectLabel}).`,
    academicText: `An independent samples t-test (Welch's) was conducted to compare ${valueCol} between the ${g1Name} and ${g2Name} groups. The ${g1Name} group (n=${n1}, M=${fmt(m1)}, SD=${fmt(sd1)}) ${sig ? 'significantly differed from' : 'did not significantly differ from'} the ${g2Name} group (n=${n2}, M=${fmt(m2)}, SD=${fmt(sd2)}), t(${fmt(df)}) = ${fmt(t)}, p ${p < 0.001 ? '< 0.001' : '= ' + fmt(p)}, d = ${fmt(cohenD)} (${effectLabel} effect).`,
  };
}

export function runAnalysis(
  type: AnalysisType,
  dataset: ParsedDataset,
  vars: Record<string, string | string[]>
): AnalysisResult {
  switch (type) {
    case 'descriptive': return runDescriptive(dataset, vars.col as string);
    case 'frequency': return runFrequency(dataset, vars.col as string);
    case 'crosstab': return runCrossTabs(dataset, vars.row as string, vars.col as string);
    case 'correlation': return runCorrelation(dataset, vars.x as string, vars.y as string);
    case 'cronbach': return runCronbach(dataset, vars.items as string[]);
    case 'kappa': return runKappa(dataset, vars.rater1 as string, vars.rater2 as string);
    case 'likert': return runLikert(dataset, vars.items as string[]);
    case 'ttest': return runTTest(dataset, vars.value as string, vars.group as string);
  }
}

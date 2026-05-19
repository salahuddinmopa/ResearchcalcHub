export interface RiskItem {
  name: string;
  likelihood: number;
  impact: number;
}

export interface RiskAssessment extends RiskItem {
  score: number;
  category: 'Low' | 'Moderate' | 'High' | 'Critical';
  interpretation: string;
  strategy: string;
}

export function classifyRisk(score: number): Pick<RiskAssessment, 'category' | 'interpretation' | 'strategy'> {
  if (score >= 17) {
    return {
      category: 'Critical',
      interpretation: 'Immediate attention is required because both likelihood and/or impact are very high.',
      strategy: 'Avoid, transfer, or urgently mitigate. Assign an owner and monitor frequently.',
    };
  }
  if (score >= 10) {
    return {
      category: 'High',
      interpretation: 'The risk is significant and should be actively managed.',
      strategy: 'Develop a mitigation plan, reduce likelihood or impact, and review regularly.',
    };
  }
  if (score >= 5) {
    return {
      category: 'Moderate',
      interpretation: 'The risk is meaningful but may be managed through routine controls.',
      strategy: 'Monitor and prepare contingency actions if the risk increases.',
    };
  }
  return {
    category: 'Low',
    interpretation: 'The risk is currently low priority.',
    strategy: 'Accept or monitor with minimal intervention.',
  };
}

export function calculateRiskMatrix(items: RiskItem[]) {
  if (items.length === 0) throw new Error('Add at least one risk.');
  const risks = items.map(item => {
    if (!item.name.trim()) throw new Error('Every risk needs a name.');
    if (item.likelihood < 1 || item.likelihood > 5 || item.impact < 1 || item.impact > 5) {
      throw new Error('Likelihood and impact scores must be between 1 and 5.');
    }
    const score = item.likelihood * item.impact;
    return { ...item, score, ...classifyRisk(score) };
  });
  const summary = risks.reduce<Record<RiskAssessment['category'], number>>((acc, risk) => {
    acc[risk.category] += 1;
    return acc;
  }, { Low: 0, Moderate: 0, High: 0, Critical: 0 });
  const steps = risks.map(risk => `${risk.name}: likelihood ${risk.likelihood} × impact ${risk.impact} = ${risk.score} (${risk.category})`);
  const academicText = `A risk matrix assessment was conducted for ${risks.length} risk(s). The assessment identified ${summary.Critical} critical, ${summary.High} high, ${summary.Moderate} moderate, and ${summary.Low} low risk(s), using likelihood × impact scores on a 1-5 scale.`;
  return { risks, summary, steps, academicText };
}

export interface StakeholderItem {
  name: string;
  power: number;
  interest: number;
}

export interface StakeholderAssessment extends StakeholderItem {
  group: 'Manage closely' | 'Keep satisfied' | 'Keep informed' | 'Monitor';
  priorityScore: number;
}

export function calculateStakeholderPriority(items: StakeholderItem[]) {
  if (items.length === 0) throw new Error('Add at least one stakeholder.');
  const stakeholders = items.map(item => {
    if (!item.name.trim()) throw new Error('Every stakeholder needs a name.');
    if (item.power < 1 || item.power > 5 || item.interest < 1 || item.interest > 5) {
      throw new Error('Power and interest scores must be between 1 and 5.');
    }
    const highPower = item.power >= 3;
    const highInterest = item.interest >= 3;
    const group = highPower && highInterest
      ? 'Manage closely'
      : highPower
        ? 'Keep satisfied'
        : highInterest
          ? 'Keep informed'
          : 'Monitor';
    return { ...item, group, priorityScore: item.power * item.interest };
  }).sort((a, b) => b.priorityScore - a.priorityScore);
  const steps = stakeholders.map(item => `${item.name}: power ${item.power}, interest ${item.interest} -> ${item.group}`);
  const academicText = `Stakeholder priority mapping was conducted for ${stakeholders.length} stakeholder(s) using 1-5 power and interest scores. The highest priority stakeholder was ${stakeholders[0]?.name || 'N/A'}, classified as "${stakeholders[0]?.group || 'N/A'}".`;
  return { stakeholders, steps, academicText };
}

const RI: Record<number, number> = { 1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

export function calculateAHPWeights(criteria: string[], matrix: number[][]) {
  const n = criteria.length;
  if (n < 2) throw new Error('AHP requires at least two criteria.');
  if (matrix.length !== n || matrix.some(row => row.length !== n)) throw new Error('Pairwise matrix must match the number of criteria.');
  if (criteria.some(criteriaName => !criteriaName.trim())) throw new Error('Every criterion needs a name.');
  if (matrix.some(row => row.some(value => !Number.isFinite(value) || value <= 0))) throw new Error('Pairwise values must be positive numbers.');

  // AHP approximation: normalize each pairwise-comparison column, then average rows for priorities.
  const columnSums = Array.from({ length: n }, (_, col) => matrix.reduce((sum, row) => sum + row[col], 0));
  const normalized = matrix.map(row => row.map((value, col) => value / columnSums[col]));
  const weights = normalized.map(row => row.reduce((sum, value) => sum + value, 0) / n);
  // Consistency ratio compares the estimated principal eigenvalue against Saaty's random index.
  const weightedSum = matrix.map(row => row.reduce((sum, value, col) => sum + value * weights[col], 0));
  const consistencyVector = weightedSum.map((value, index) => value / weights[index]);
  const lambdaMax = consistencyVector.reduce((sum, value) => sum + value, 0) / n;
  const ci = n <= 2 ? 0 : (lambdaMax - n) / (n - 1);
  const ri = RI[n] ?? 1.49;
  const cr = ri === 0 ? 0 : ci / ri;
  const rankings = criteria
    .map((name, index) => ({ name, weight: weights[index], rank: 0 }))
    .sort((a, b) => b.weight - a.weight)
    .map((item, index) => ({ ...item, rank: index + 1 }));
  const steps = [
    `Column sums: ${columnSums.map(value => value.toFixed(4)).join(', ')}`,
    `Normalize each matrix cell by its column sum.`,
    `Criteria weights are row averages of the normalized matrix.`,
    `lambda max = ${lambdaMax.toFixed(4)}, CI = ${ci.toFixed(4)}, RI = ${ri}, CR = ${cr.toFixed(4)}`,
  ];
  const academicText = `AHP pairwise comparison analysis produced criterion weights for ${n} criteria. The highest ranked criterion was ${rankings[0].name} (${(rankings[0].weight * 100).toFixed(1)}%). The consistency ratio was ${cr.toFixed(3)}, indicating ${cr <= 0.1 ? 'acceptable' : 'potentially inconsistent'} judgments.`;
  return { weights, rankings, lambdaMax, ci, ri, cr, isConsistent: cr <= 0.1, steps, academicText };
}

export interface DelphiItem {
  label: string;
  ratings: number[];
}

function sortedMedian(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * p;
  const low = Math.floor(pos);
  const high = Math.ceil(pos);
  return sorted[low] + (pos - low) * (sorted[high] - sorted[low]);
}

export function calculateDelphiConsensus(items: DelphiItem[], scaleMax: number, iqrThreshold: number) {
  if (items.length === 0) throw new Error('Add at least one Delphi item.');
  const results = items.map(item => {
    if (!item.label.trim()) throw new Error('Every Delphi item needs a label.');
    if (item.ratings.length < 3) throw new Error('Each Delphi item needs at least three expert ratings.');
    if (item.ratings.some(value => !Number.isFinite(value) || value < 1 || value > scaleMax)) {
      throw new Error(`Expert ratings must be between 1 and ${scaleMax}.`);
    }
    const mean = item.ratings.reduce((sum, value) => sum + value, 0) / item.ratings.length;
    const median = sortedMedian(item.ratings);
    // Delphi consensus is commonly judged by dispersion; IQR <= threshold means expert convergence.
    const q1 = percentile(item.ratings, 0.25);
    const q3 = percentile(item.ratings, 0.75);
    const iqr = q3 - q1;
    return { ...item, mean, median, q1, q3, iqr, consensus: iqr <= iqrThreshold };
  }).sort((a, b) => b.mean - a.mean);
  const steps = results.map(item => `${item.label}: mean ${item.mean.toFixed(2)}, median ${item.median.toFixed(2)}, IQR ${item.iqr.toFixed(2)} -> ${item.consensus ? 'consensus' : 'no consensus'}`);
  const academicText = `Delphi consensus was assessed using an IQR threshold of ${iqrThreshold}. Consensus was achieved for ${results.filter(item => item.consensus).length} of ${results.length} item(s). Items were ranked by mean expert rating.`;
  return { items: results, overallConsensus: results.every(item => item.consensus), steps, academicText };
}

export interface DecisionMatrixInput {
  options: string[];
  criteria: string[];
  weights: number[];
  scores: number[][];
}

export function calculateDecisionMatrix(input: DecisionMatrixInput) {
  const { options, criteria, weights, scores } = input;
  if (options.length < 2) throw new Error('Add at least two options.');
  if (criteria.length < 1) throw new Error('Add at least one criterion.');
  if (options.some(option => !option.trim()) || criteria.some(criterion => !criterion.trim())) throw new Error('Options and criteria must have names.');
  if (weights.some(weight => !Number.isFinite(weight) || weight <= 0)) throw new Error('Criteria weights must be positive numbers.');
  if (scores.length !== options.length || scores.some(row => row.length !== criteria.length)) throw new Error('Score table must match options and criteria.');
  if (scores.some(row => row.some(score => !Number.isFinite(score) || score < 0))) throw new Error('Scores must be non-negative numbers.');

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const normalizedWeights = weights.map(weight => weight / totalWeight);
  const results = options.map((option, optionIndex) => {
    const total = scores[optionIndex].reduce((sum, score, criterionIndex) => sum + score * normalizedWeights[criterionIndex], 0);
    return { option, total, rank: 0 };
  }).sort((a, b) => b.total - a.total).map((item, index) => ({ ...item, rank: index + 1 }));
  const steps = results.map(item => `${item.option}: weighted total = ${item.total.toFixed(4)} (rank ${item.rank})`);
  const academicText = `A weighted decision matrix was calculated for ${options.length} options across ${criteria.length} criteria. The highest ranked option was ${results[0].option}, with a weighted total score of ${results[0].total.toFixed(3)}.`;
  return { results, normalizedWeights, bestOption: results[0], steps, academicText };
}

import { jStat } from 'jstat';
import type { CsvRow } from './types';

/**
 * Compute Cronbach's Alpha for a set of items (variables) in the dataset.
 * Returns the alpha coefficient.
 */
export function cronbachAlpha(
  data: CsvRow[],
  variables: string[]
): number {
  if (variables.length === 0) return 0;
  // Extract matrix of item scores
  const scores = data.map(row =>
    variables.map(v => Number(row[v] ?? 0))
  );
  const itemCount = variables.length;
  const participantCount = scores.length;

  // Sum of variances for each item
  let sumItemVar = 0;
  for (let i = 0; i < itemCount; i++) {
    const itemValues = scores.map(s => s[i]);
    const varItem = jStat.variance(itemValues, true);
    sumItemVar += varItem;
  }

  // Total score for each participant
  const totalScores = scores.map(row => row.reduce((a, b) => a + b, 0));
  const totalVar = jStat.variance(totalScores, true);

  // Cronbach's Alpha formula
  const alpha = (itemCount / (itemCount - 1)) * (1 - sumItemVar / totalVar);
  return alpha;
}

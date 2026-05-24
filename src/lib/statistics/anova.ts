import { jStat } from 'jstat';

export interface ANOVAResult {
  groups: string[];
  fStatistic: number;
  pValue: number;
}

/**
 * One‑way ANOVA test.
 * `groupsData` is an object where each key is the group name and the value is an array of numeric observations.
 */
export function anova(groupsData: Record<string, number[]>): ANOVAResult {
  const groups = Object.keys(groupsData);
  const arrays = groups.map(g => groupsData[g]);
  const f = jStat.anovaftest(...arrays);
  const k = groups.length;
  const N = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const p = 1 - jStat.centralF.cdf(f, dfBetween, dfWithin);
  return { groups, fStatistic: f, pValue: p };
}

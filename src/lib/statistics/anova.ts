import { jStat } from 'jstat';

export interface ANOVAResult {
  groups: string[];
  fStatistic: number;
  pValue: number;
  dfBetween: number;
  dfWithin: number;
  etaSquared: number;
  omegaSquared: number;
}

export function anova(groupsData: Record<string, number[]>): ANOVAResult {
  const groups = Object.keys(groupsData);
  const arrays = groups.map(g => groupsData[g]);
  const N = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const grandMean = arrays.flat().reduce((a: number, b: number) => a + b, 0) / N;

  const ssBetween = arrays.reduce((ss, arr) => {
    const gMean = arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
    return ss + arr.length * (gMean - grandMean) ** 2;
  }, 0);

  const ssWithin = arrays.reduce((ss, arr) => {
    const gMean = arr.reduce((a: number, b: number) => a + b, 0) / arr.length;
    return ss + arr.reduce((s: number, v: number) => s + (v - gMean) ** 2, 0);
  }, 0);

  const ssTotal = ssBetween + ssWithin;
  const k = groups.length;
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const f = msBetween / msWithin;
  const p = 1 - jStat.centralF.cdf(f, dfBetween, dfWithin);

  // η² = SSbetween / SStotal
  const etaSquared = ssTotal > 0 ? ssBetween / ssTotal : 0;
  // ω² = (SSbetween − dfBetween × MSwithin) / (SStotal + MSwithin)
  const omegaSquared = ssTotal > 0
    ? (ssBetween - dfBetween * msWithin) / (ssTotal + msWithin)
    : 0;

  return { groups, fStatistic: f, pValue: p, dfBetween, dfWithin, etaSquared, omegaSquared };
}

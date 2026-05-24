export interface FrequencyResult {
  variable: string;
  counts: Record<string, number>;
  count: number;
  distinct: number;
  min: number | undefined;
  max: number | undefined;
  mean?: number;
  median?: number;
  mode?: string[];
}

export function frequencies(data: any[], variables: string[]): FrequencyResult[] {
  return variables.map((v) => {
    const counts: Record<string, number> = {};
    const values: any[] = [];
    data.forEach((row) => {
      const val = row[v] !== undefined ? row[v] : undefined;
      const key = String(val);
      counts[key] = (counts[key] ?? 0) + 1;
      values.push(val);
    });
    const numericVals = values.filter((x) => typeof x === 'number') as number[];
    const count = values.length;
    const distinct = Object.keys(counts).length;
    const min = numericVals.length ? Math.min(...numericVals) : undefined;
    const max = numericVals.length ? Math.max(...numericVals) : undefined;
    const mean = numericVals.length ? numericVals.reduce((a, b) => a + b, 0) / numericVals.length : undefined;
    const sorted = numericVals.slice().sort((a, b) => a - b);
    const median = numericVals.length
      ? numericVals.length % 2 === 0
        ? (sorted[numericVals.length / 2 - 1] + sorted[numericVals.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]
      : undefined;
    // mode calculation
    let maxCount = 0;
    const mode: string[] = [];
    Object.entries(counts).forEach(([k, c]) => {
      if (c > maxCount) {
        maxCount = c;
        mode.length = 0;
        mode.push(k);
      } else if (c === maxCount) {
        mode.push(k);
      }
    });
    return {
      variable: v,
      counts,
      count,
      distinct,
      min,
      max,
      mean,
      median,
      mode: mode.length ? mode : undefined,
    };
  });
}

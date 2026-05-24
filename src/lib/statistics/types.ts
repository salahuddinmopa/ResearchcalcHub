export type CsvRow = Record<string, string | number | boolean | null>;

export function numericCol(data: CsvRow[], col: string): number[] {
  return data
    .map(r => r[col])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
}

import type { ParsedDataset } from './dataParsing';

export type ColumnType = 'numeric' | 'categorical' | 'likert' | 'text' | 'id';

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  missingCount: number;
  uniqueCount: number;
  uniqueValues: string[];
  numericValues: number[];
}

const LIKERT_LABELS = new Set([
  'strongly disagree', 'disagree', 'neutral', 'agree', 'strongly agree',
  'never', 'rarely', 'sometimes', 'often', 'always',
  'very dissatisfied', 'dissatisfied', 'satisfied', 'very satisfied',
]);

export function detectColumnTypes(dataset: ParsedDataset): ColumnInfo[] {
  const { headers, rows } = dataset;

  return headers.map(name => {
    const values = rows.map(r => r[name] ?? '');
    const nonEmpty = values.filter(v => v !== '' && v.toLowerCase() !== 'na' && v.toLowerCase() !== 'n/a' && v.toLowerCase() !== 'null');
    const missingCount = values.length - nonEmpty.length;
    const uniqueSet = new Set(nonEmpty);
    const uniqueValues = [...uniqueSet].slice(0, 30);
    const uniqueCount = uniqueSet.size;

    const numerics = nonEmpty.map(v => parseFloat(v)).filter(n => !isNaN(n));
    const allNumeric = numerics.length === nonEmpty.length && nonEmpty.length > 0;

    let type: ColumnType = 'categorical';

    const nameLower = name.toLowerCase();

    if (allNumeric) {
      const allInt = numerics.every(n => Number.isInteger(n));
      if (allInt && uniqueCount <= 7 && numerics.every(n => n >= 1 && n <= 7)) {
        type = 'likert';
      } else {
        type = 'numeric';
      }
    } else if (nonEmpty.some(v => LIKERT_LABELS.has(v.toLowerCase()))) {
      type = 'likert';
    } else if (uniqueCount >= nonEmpty.length * 0.8 || uniqueCount > 100) {
      const avgLen = nonEmpty.reduce((s, v) => s + v.length, 0) / Math.max(nonEmpty.length, 1);
      type = avgLen > 30 ? 'text' : 'categorical';
    } else {
      type = 'categorical';
    }

    if ((nameLower === 'id' || nameLower.endsWith('_id') || nameLower.startsWith('id_')) && uniqueCount === values.length) {
      type = 'id';
    }

    return { name, type, missingCount, uniqueCount, uniqueValues, numericValues: numerics };
  });
}

export function columnsOfType(columns: ColumnInfo[], ...types: ColumnType[]): ColumnInfo[] {
  const typeSet = new Set(types);
  return columns.filter(c => typeSet.has(c.type));
}

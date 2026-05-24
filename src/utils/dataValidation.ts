import type { ParsedDataset } from './dataParsing';
import type { ColumnInfo } from './dataTypeDetection';

export interface ValidationWarning {
  level: 'error' | 'warning' | 'info';
  message: string;
}

const MISSING_THRESHOLD = 0.3;

export function validateDataset(dataset: ParsedDataset, columns: ColumnInfo[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const { rows, headers, rowCount } = dataset;

  if (rowCount === 0) {
    warnings.push({ level: 'error', message: 'Dataset has no data rows.' });
    return warnings;
  }

  if (headers.length === 0) {
    warnings.push({ level: 'error', message: 'No column headers detected.' });
    return warnings;
  }

  if (rowCount < 5) {
    warnings.push({ level: 'warning', message: `Only ${rowCount} rows found. Statistical results may not be reliable with fewer than 5 observations.` });
  }

  if (rowCount > 10000) {
    warnings.push({ level: 'info', message: `Large dataset (${rowCount.toLocaleString()} rows). Analysis may take a moment.` });
  }

  columns.forEach(col => {
    const rate = col.missingCount / rowCount;
    if (rate >= MISSING_THRESHOLD) {
      warnings.push({ level: 'warning', message: `Column "${col.name}" has ${(rate * 100).toFixed(0)}% missing values.` });
    }
  });

  columns.forEach(col => {
    if (col.type === 'text') {
      const maxLen = rows.reduce((m, r) => Math.max(m, (r[col.name] ?? '').length), 0);
      if (maxLen > 5000) {
        warnings.push({ level: 'warning', message: `Column "${col.name}" contains very long text (${maxLen} chars). It may be a qualitative text field.` });
      }
    }
  });

  const emptyHeaders = headers.filter(h => !h.trim());
  if (emptyHeaders.length > 0) {
    warnings.push({ level: 'warning', message: `${emptyHeaders.length} column(s) have blank header names and were auto-labelled.` });
  }

  return warnings;
}

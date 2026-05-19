export interface CsvExport {
  filename: string;
  headers: string[];
  rows: string[][];
}

export function escapeCsvCell(value: string) {
  const text = value ?? '';
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv({ filename, headers, rows }: CsvExport) {
  const csv = [headers, ...rows]
    .map(row => row.map(cell => escapeCsvCell(String(cell))).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function resultToText({
  calculatorName,
  formula,
  results,
  interpretation,
  academicText,
  steps,
  inputs,
  disclaimer,
}: {
  calculatorName: string;
  formula: string;
  results: { label: string; value: string }[];
  interpretation: string;
  academicText?: string;
  steps?: string[];
  inputs?: { label: string; value: string }[];
  disclaimer?: string;
}) {
  return [
    calculatorName,
    '',
    'Inputs:',
    ...(inputs?.length ? inputs.map(item => `${item.label}: ${item.value}`) : ['Not captured']),
    '',
    'Formula:',
    formula,
    '',
    'Results:',
    ...results.map(item => `${item.label}: ${item.value}`),
    '',
    `Interpretation: ${interpretation}`,
    ...(academicText ? ['', 'Academic reporting text:', academicText] : []),
    ...(steps?.length ? ['', 'Step-by-step calculation:', ...steps.map((step, index) => `${index + 1}. ${step}`)] : []),
    ...(disclaimer ? ['', 'Disclaimer:', disclaimer] : []),
  ].join('\n');
}

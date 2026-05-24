import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedDataset {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
  colCount: number;
  source: 'file' | 'paste' | 'sample';
  fileName?: string;
}

export interface FileValidationResult {
  ok: boolean;
  error?: string;
}

const ALLOWED_EXTENSIONS = new Set(['.csv', '.txt', '.xlsx']);
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.js', '.html', '.php', '.bat', '.cmd',
  '.zip', '.rar', '.msi', '.scr', '.vbs', '.sh', '.ps1',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function validateFileSecure(file: File): FileValidationResult {
  const name = file.name.toLowerCase();
  const dotIdx = name.lastIndexOf('.');
  const ext = dotIdx >= 0 ? name.slice(dotIdx) : '';
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { ok: false, error: `File type "${ext}" is blocked for security reasons.` };
  }
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { ok: false, error: `"${ext}" is not supported. Upload CSV, TXT, or XLSX only.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.` };
  }
  if (file.size === 0) {
    return { ok: false, error: 'File is empty.' };
  }
  return { ok: true };
}

function deduplicateHeaders(raw: string[]): string[] {
  const seen = new Map<string, number>();
  return raw.map(h => {
    const key = h.trim() || 'Column';
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}_${count + 1}`;
  });
}

function toRows(headers: string[], data: string[][]): Record<string, string>[] {
  return data.map(row => Object.fromEntries(headers.map((h, i) => [h, (row[i] ?? '').trim()])));
}

function parseTextFile(file: File): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (result: any) => {
        const data = result.data as string[][];
        if (data.length < 2) {
          reject(new Error('File needs at least one header row and one data row.'));
          return;
        }
        const headers = deduplicateHeaders(data[0].map((h: any) => String(h)));
        const rows = toRows(headers, data.slice(1).map((r: any[]) => r.map((c: any) => String(c))));
        resolve({ headers, rows, rowCount: rows.length, colCount: headers.length, source: 'file', fileName: file.name });
      },
      error: (err: any) => reject(new Error(err?.message ?? String(err))),
    });
  });
}

async function parseXLSXFile(file: File): Promise<ParsedDataset> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][];
  if (data.length < 2) throw new Error('Excel file needs at least a header row and one data row.');
  const headers = deduplicateHeaders((data[0] as unknown[]).map(h => String(h).trim()));
  const rows = toRows(headers, (data.slice(1) as unknown[][]).map(r => r.map(c => String(c))));
  return { headers, rows, rowCount: rows.length, colCount: headers.length, source: 'file', fileName: file.name };
}

export function parseFile(file: File): Promise<ParsedDataset> {
  return file.name.toLowerCase().endsWith('.xlsx') ? parseXLSXFile(file) : parseTextFile(file);
}

export function parsePastedTable(text: string): ParsedDataset {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('Paste at least a header row and one data row.');
  const delim = lines[0].includes('\t') ? '\t' : lines[0].includes(',') ? ',' : ';';
  const raw = lines.map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, '')));
  const headers = deduplicateHeaders(raw[0]);
  const rows = toRows(headers, raw.slice(1));
  return { headers, rows, rowCount: rows.length, colCount: headers.length, source: 'paste' };
}

export const SAMPLE_DATASET: ParsedDataset = {
  source: 'sample',
  fileName: 'sample_research_dataset.csv',
  headers: [
    'participant_id', 'gender', 'age', 'education_level', 'group', 'training_received',
    'satisfaction', 'confidence_score', 'performance_score', 'pre_test_score', 'post_test_score',
    'likert_q1_governance', 'likert_q2_policy', 'likert_q3_risk', 'likert_q4_training', 'likert_q5_ai_oversight',
    'coder1_theme', 'coder2_theme', 'qualitative_response',
  ],
  rows: [
    { participant_id: 'P001', gender: 'Male', age: '28', education_level: "Bachelor's", group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '72', performance_score: '78', pre_test_score: '55', post_test_score: '74', likert_q1_governance: '4', likert_q2_policy: '3', likert_q3_risk: '4', likert_q4_training: '3', likert_q5_ai_oversight: '4', coder1_theme: 'AI Governance', coder2_theme: 'AI Governance', qualitative_response: 'Training was very helpful for my understanding of AI policy.' },
    { participant_id: 'P002', gender: 'Female', age: '34', education_level: "Master's", group: 'Control', training_received: 'No', satisfaction: '3', confidence_score: '58', performance_score: '62', pre_test_score: '48', post_test_score: '52', likert_q1_governance: '3', likert_q2_policy: '4', likert_q3_risk: '3', likert_q4_training: '2', likert_q5_ai_oversight: '3', coder1_theme: 'Policy', coder2_theme: 'AI Governance', qualitative_response: 'I felt uncertain about how AI policy applies to my work.' },
    { participant_id: 'P003', gender: 'Male', age: '41', education_level: 'PhD', group: 'Treatment', training_received: 'Yes', satisfaction: '5', confidence_score: '88', performance_score: '91', pre_test_score: '70', post_test_score: '88', likert_q1_governance: '5', likert_q2_policy: '5', likert_q3_risk: '4', likert_q4_training: '5', likert_q5_ai_oversight: '5', coder1_theme: 'AI Governance', coder2_theme: 'AI Governance', qualitative_response: 'Excellent training. Covered risk management and governance in depth.' },
    { participant_id: 'P004', gender: 'Female', age: '26', education_level: "Bachelor's", group: 'Control', training_received: 'No', satisfaction: '2', confidence_score: '45', performance_score: '51', pre_test_score: '40', post_test_score: '44', likert_q1_governance: '2', likert_q2_policy: '2', likert_q3_risk: '2', likert_q4_training: '1', likert_q5_ai_oversight: '2', coder1_theme: 'Risk Management', coder2_theme: 'Risk Management', qualitative_response: 'Lacked confidence applying concepts without training support.' },
    { participant_id: 'P005', gender: 'Male', age: '38', education_level: "Master's", group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '79', performance_score: '83', pre_test_score: '62', post_test_score: '81', likert_q1_governance: '4', likert_q2_policy: '4', likert_q3_risk: '5', likert_q4_training: '4', likert_q5_ai_oversight: '4', coder1_theme: 'Policy', coder2_theme: 'Policy', qualitative_response: 'The risk assessment module was the most useful part of the course.' },
    { participant_id: 'P006', gender: 'Female', age: '29', education_level: 'PhD', group: 'Treatment', training_received: 'Yes', satisfaction: '5', confidence_score: '91', performance_score: '94', pre_test_score: '74', post_test_score: '93', likert_q1_governance: '5', likert_q2_policy: '5', likert_q3_risk: '5', likert_q4_training: '5', likert_q5_ai_oversight: '5', coder1_theme: 'AI Governance', coder2_theme: 'AI Governance', qualitative_response: 'This training exceeded expectations. Highly recommended for policymakers.' },
    { participant_id: 'P007', gender: 'Male', age: '45', education_level: 'Diploma', group: 'Control', training_received: 'No', satisfaction: '3', confidence_score: '61', performance_score: '65', pre_test_score: '50', post_test_score: '53', likert_q1_governance: '3', likert_q2_policy: '3', likert_q3_risk: '3', likert_q4_training: '3', likert_q5_ai_oversight: '2', coder1_theme: 'Training', coder2_theme: 'Policy', qualitative_response: 'Some concepts were unclear without a formal training background.' },
    { participant_id: 'P008', gender: 'Female', age: '32', education_level: "Master's", group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '75', performance_score: '80', pre_test_score: '60', post_test_score: '78', likert_q1_governance: '4', likert_q2_policy: '3', likert_q3_risk: '4', likert_q4_training: '4', likert_q5_ai_oversight: '3', coder1_theme: 'Risk Management', coder2_theme: 'Risk Management', qualitative_response: 'Good balance between theory and practical risk management skills.' },
    { participant_id: 'P009', gender: 'Male', age: '23', education_level: "Bachelor's", group: 'Control', training_received: 'No', satisfaction: '2', confidence_score: '49', performance_score: '54', pre_test_score: '42', post_test_score: '46', likert_q1_governance: '2', likert_q2_policy: '3', likert_q3_risk: '2', likert_q4_training: '2', likert_q5_ai_oversight: '2', coder1_theme: 'Policy', coder2_theme: 'Policy', qualitative_response: 'I struggled to understand the governance framework independently.' },
    { participant_id: 'P010', gender: 'Female', age: '50', education_level: 'PhD', group: 'Treatment', training_received: 'Yes', satisfaction: '5', confidence_score: '93', performance_score: '96', pre_test_score: '78', post_test_score: '95', likert_q1_governance: '5', likert_q2_policy: '5', likert_q3_risk: '5', likert_q4_training: '5', likert_q5_ai_oversight: '5', coder1_theme: 'AI Governance', coder2_theme: 'Ethics', qualitative_response: 'Outstanding program. Ethical dimensions of AI were well articulated.' },
    { participant_id: 'P011', gender: 'Male', age: '37', education_level: "Master's", group: 'Control', training_received: 'No', satisfaction: '3', confidence_score: '63', performance_score: '67', pre_test_score: '52', post_test_score: '55', likert_q1_governance: '3', likert_q2_policy: '3', likert_q3_risk: '3', likert_q4_training: '2', likert_q5_ai_oversight: '3', coder1_theme: 'Training', coder2_theme: 'Training', qualitative_response: 'Without training, governance concepts seemed abstract and distant.' },
    { participant_id: 'P012', gender: 'Female', age: '42', education_level: "Bachelor's", group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '77', performance_score: '82', pre_test_score: '63', post_test_score: '80', likert_q1_governance: '4', likert_q2_policy: '4', likert_q3_risk: '4', likert_q4_training: '3', likert_q5_ai_oversight: '4', coder1_theme: 'Policy', coder2_theme: 'Policy', qualitative_response: 'Training helped me connect AI policy to my professional role.' },
    { participant_id: 'P013', gender: 'Male', age: '31', education_level: 'Diploma', group: 'Control', training_received: 'No', satisfaction: '2', confidence_score: '52', performance_score: '56', pre_test_score: '43', post_test_score: '47', likert_q1_governance: '2', likert_q2_policy: '2', likert_q3_risk: '3', likert_q4_training: '2', likert_q5_ai_oversight: '1', coder1_theme: 'Risk Management', coder2_theme: 'Risk Management', qualitative_response: 'Need more structured guidance before applying these ideas in practice.' },
    { participant_id: 'P014', gender: 'Female', age: '27', education_level: "Master's", group: 'Treatment', training_received: 'Yes', satisfaction: '5', confidence_score: '85', performance_score: '89', pre_test_score: '68', post_test_score: '87', likert_q1_governance: '5', likert_q2_policy: '4', likert_q3_risk: '5', likert_q4_training: '5', likert_q5_ai_oversight: '5', coder1_theme: 'Ethics', coder2_theme: 'Ethics', qualitative_response: 'The ethics module was highly relevant to my research on AI bias.' },
    { participant_id: 'P015', gender: 'Male', age: '55', education_level: 'PhD', group: 'Control', training_received: 'No', satisfaction: '3', confidence_score: '66', performance_score: '70', pre_test_score: '56', post_test_score: '58', likert_q1_governance: '3', likert_q2_policy: '4', likert_q3_risk: '3', likert_q4_training: '3', likert_q5_ai_oversight: '3', coder1_theme: 'AI Governance', coder2_theme: 'AI Governance', qualitative_response: 'Prior experience helped but formal training would still be beneficial.' },
    { participant_id: 'P016', gender: 'Female', age: '33', education_level: "Bachelor's", group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '80', performance_score: '84', pre_test_score: '65', post_test_score: '82', likert_q1_governance: '4', likert_q2_policy: '5', likert_q3_risk: '4', likert_q4_training: '4', likert_q5_ai_oversight: '4', coder1_theme: 'Policy', coder2_theme: 'Policy', qualitative_response: 'Now feel equipped to implement AI governance in my organisation.' },
    { participant_id: 'P017', gender: 'Male', age: '48', education_level: 'Diploma', group: 'Control', training_received: 'No', satisfaction: '2', confidence_score: '54', performance_score: '58', pre_test_score: '45', post_test_score: '48', likert_q1_governance: '2', likert_q2_policy: '2', likert_q3_risk: '2', likert_q4_training: '1', likert_q5_ai_oversight: '2', coder1_theme: 'Training', coder2_theme: 'Risk Management', qualitative_response: 'Without guidance the material felt overwhelming and hard to apply.' },
    { participant_id: 'P018', gender: 'Female', age: '36', education_level: "Master's", group: 'Treatment', training_received: 'Yes', satisfaction: '5', confidence_score: '87', performance_score: '90', pre_test_score: '69', post_test_score: '88', likert_q1_governance: '5', likert_q2_policy: '5', likert_q3_risk: '5', likert_q4_training: '4', likert_q5_ai_oversight: '5', coder1_theme: 'Ethics', coder2_theme: 'Ethics', qualitative_response: 'A well-structured program balancing regulatory and ethical perspectives.' },
    { participant_id: 'P019', gender: 'Male', age: '22', education_level: "Bachelor's", group: 'Control', training_received: 'No', satisfaction: '3', confidence_score: '57', performance_score: '60', pre_test_score: '46', post_test_score: '50', likert_q1_governance: '3', likert_q2_policy: '2', likert_q3_risk: '3', likert_q4_training: '3', likert_q5_ai_oversight: '2', coder1_theme: 'Risk Management', coder2_theme: 'Policy', qualitative_response: 'I understand the basics but need more practice with real-world cases.' },
    { participant_id: 'P020', gender: 'Female', age: '44', education_level: 'PhD', group: 'Treatment', training_received: 'Yes', satisfaction: '4', confidence_score: '82', performance_score: '86', pre_test_score: '67', post_test_score: '84', likert_q1_governance: '4', likert_q2_policy: '4', likert_q3_risk: '4', likert_q4_training: '4', likert_q5_ai_oversight: '4', coder1_theme: 'AI Governance', coder2_theme: 'AI Governance', qualitative_response: 'Training reinforced my knowledge and provided useful new frameworks.' },
  ],
  rowCount: 20,
  colCount: 19,
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  pageUrl: string;
  calculatorName?: string;
  resultSummary?: string;
}

export interface HistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const CALCULATOR_LIST = [
  { name: "Cohen's Kappa", path: '/calculators/cohens-kappa', description: 'Inter-rater reliability for categorical data' },
  { name: "Fleiss' Kappa", path: '/calculators/fleiss-kappa', description: 'Multi-rater reliability across multiple raters' },
  { name: "Cronbach's Alpha", path: '/calculators/cronbach-alpha', description: 'Internal consistency / reliability of a scale' },
  { name: 'Sample Size', path: '/calculators/sample-size', description: 'Determine required sample size for a study' },
  { name: 'Likert Scale', path: '/calculators/likert-scale', description: 'Analyse Likert-scale survey data' },
  { name: 'Correlation', path: '/calculators/correlation', description: 'Pearson and Spearman correlation analysis' },
  { name: 'Standard Deviation', path: '/calculators/standard-deviation', description: 'Measure spread and variability of data' },
  { name: 'Mean / Median / Mode', path: '/calculators/mean-median-mode', description: 'Descriptive statistics' },
  { name: 'Z-Score', path: '/calculators/z-score', description: 'Standardise values and compare distributions' },
  { name: 'Confidence Interval', path: '/calculators/confidence-interval', description: 'Estimate population parameters' },
  { name: 'Maturity Model Score', path: '/calculators/maturity-model', description: 'Assess organisational maturity levels' },
  { name: 'AHP Weight', path: '/calculators/ahp-weight', description: 'Analytic Hierarchy Process priority weighting' },
  { name: 'Delphi Consensus', path: '/calculators/delphi-consensus', description: 'Measure expert consensus across rounds' },
  { name: 'Risk Matrix', path: '/calculators/risk-matrix', description: 'Risk likelihood × impact assessment' },
  { name: 'Decision Matrix', path: '/calculators/decision-matrix', description: 'Weighted decision-making tool' },
  { name: 'Weighted Scoring', path: '/calculators/weighted-scoring', description: 'Score and rank options with weights' },
  { name: 'Survey Response Rate', path: '/calculators/survey-response-rate', description: 'Calculate survey response and completion rates' },
  { name: 'Inter-Coder Agreement', path: '/calculators/inter-coder-agreement', description: 'Agreement between coders or raters' },
  { name: 'Qualitative Thematic Analysis', path: '/calculators/qualitative-thematic-analysis', description: 'Step-by-step guided thematic analysis' },
  { name: 'Data Upload Workspace', path: '/data-upload', description: 'Upload CSV/Excel data for statistical analysis' },
  { name: 'Stat Analyzer', path: '/stat-analyzer', description: 'Advanced statistical analysis of uploaded datasets' },
];

export const STARTER_QUESTIONS = [
  'Which calculator should I use?',
  'Explain my result',
  'How do I upload data?',
  'Help me with research analysis',
  'How do I export my report?',
];

export const FREE_MESSAGE_LIMIT = 20;
export const MAX_HISTORY_MESSAGES = 10;

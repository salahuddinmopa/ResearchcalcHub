import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, CheckCircle2, Clock, FileText, Target,
  TrendingUp, AlertCircle, BookOpen, BarChart3,
  Download, Copy, ChevronDown, ChevronUp,
  ExternalLink, Info, ClipboardList, GraduationCap,
  ChevronRight, CheckSquare, Square, Lock, Trash2,
  LayoutDashboard, List, Wrench, RefreshCw
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ResearchType =
  | 'phd-thesis' | 'mphil-thesis' | 'masters-dissertation'
  | 'journal-article' | 'systematic-review' | 'survey-research'
  | 'qualitative-research' | 'mixed-methods';

type ResearchMethod =
  | 'quantitative' | 'qualitative' | 'mixed-methods'
  | 'systematic-review' | 'design-science' | 'case-study' | 'experimental';

type PhaseStatus = 'not-started' | 'in-progress' | 'completed';
type ActiveTab = 'dashboard' | 'timeline' | 'checklist' | 'tools';

interface ResearchProject {
  id: string;
  title: string;
  researchType: ResearchType;
  researchMethod: ResearchMethod;
  startDate: string;
  submissionDate: string;
  supervisor: string;
  topic: string;
  createdAt: string;
}

interface ToolLink {
  name: string;
  path: string;
  description: string;
}

interface ResearchPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  startDate: string;
  endDate: string;
  status: PhaseStatus;
  progress: number;
  notes: string;
  color: string;
  tools: ToolLink[];
}

interface PlannerData {
  project: ResearchProject;
  phases: ResearchPhase[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RESEARCH_TYPES: { value: ResearchType; label: string }[] = [
  { value: 'phd-thesis', label: 'PhD Thesis' },
  { value: 'mphil-thesis', label: 'MPhil Thesis' },
  { value: 'masters-dissertation', label: "Master's Dissertation" },
  { value: 'journal-article', label: 'Journal Article' },
  { value: 'systematic-review', label: 'Systematic Review' },
  { value: 'survey-research', label: 'Survey Research' },
  { value: 'qualitative-research', label: 'Qualitative Research' },
  { value: 'mixed-methods', label: 'Mixed Methods Research' },
];

const RESEARCH_METHODS: { value: ResearchMethod; label: string }[] = [
  { value: 'quantitative', label: 'Quantitative' },
  { value: 'qualitative', label: 'Qualitative' },
  { value: 'mixed-methods', label: 'Mixed Methods' },
  { value: 'systematic-review', label: 'Systematic Review' },
  { value: 'design-science', label: 'Design Science' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'experimental', label: 'Experimental' },
];

const TOOL_SETS: Record<string, ToolLink[]> = {
  literature: [
    { name: 'Research Toolkit', path: '/research-toolkit', description: 'Curated workflows and tools for literature review' },
    { name: 'Weighted Scoring', path: '/calculators/weighted-scoring', description: 'Score and compare studies systematically' },
  ],
  methodology: [
    { name: 'Sample Size Calculator', path: '/calculators/sample-size', description: 'Calculate minimum required sample size' },
    { name: 'Survey Response Rate', path: '/calculators/survey-response-rate', description: 'Estimate expected response rates' },
    { name: 'Likert Scale Calculator', path: '/calculators/likert-scale', description: 'Analyse Likert scale responses' },
    { name: 'Margin of Error', path: '/calculators/margin-of-error', description: 'Calculate margin of error for surveys' },
  ],
  reliability: [
    { name: "Cronbach's Alpha", path: '/calculators/cronbach-alpha', description: 'Internal consistency of scales' },
    { name: "Cohen's Kappa", path: '/calculators/cohens-kappa', description: 'Inter-rater reliability — 2 raters' },
    { name: "Fleiss' Kappa", path: '/calculators/fleiss-kappa', description: 'Inter-rater reliability — 3+ raters' },
    { name: 'Inter-Coder Agreement', path: '/calculators/inter-coder-agreement', description: 'Qualitative coding agreement' },
  ],
  statistics: [
    { name: 'StatAnalyzer Pro', path: '/stat-analyzer', description: 'Upload CSV data and run full statistical analysis' },
    { name: 'Correlation Calculator', path: '/calculators/correlation', description: 'Pearson and Spearman correlation' },
    { name: 'Confidence Interval', path: '/calculators/confidence-interval', description: 'Estimate population parameters' },
    { name: 'Mean / Median / Mode', path: '/calculators/mean-median-mode', description: 'Descriptive statistics' },
    { name: 'Standard Deviation', path: '/calculators/standard-deviation', description: 'Measure data variability' },
    { name: 'Z-Score Calculator', path: '/calculators/z-score', description: 'Standardise and compare data values' },
  ],
  qualitative: [
    { name: 'Qualitative Thematic Analysis', path: '/calculators/qualitative-thematic-analysis', description: 'Guided 6-step thematic coding workflow' },
    { name: "Cohen's Kappa", path: '/calculators/cohens-kappa', description: 'Agreement between two coders' },
    { name: "Fleiss' Kappa", path: '/calculators/fleiss-kappa', description: 'Agreement across 3+ coders' },
  ],
  governance: [
    { name: 'Maturity Model Score', path: '/calculators/maturity-model', description: 'Score maturity across domains' },
    { name: 'AHP Weight Calculator', path: '/calculators/ahp-weight', description: 'Derive criteria weights via pairwise comparison' },
    { name: 'Delphi Consensus', path: '/calculators/delphi-consensus', description: 'Expert panel consensus metrics' },
    { name: 'Governance Readiness', path: '/calculators/governance-readiness', description: 'Assess governance maturity' },
    { name: 'Decision Matrix', path: '/calculators/decision-matrix', description: 'Multi-criteria decision analysis' },
    { name: 'Capability Score', path: '/calculators/capability-score', description: 'Assess organisational capability levels' },
  ],
  risk: [
    { name: 'Risk Matrix', path: '/calculators/risk-matrix', description: 'Assess risk likelihood and impact' },
    { name: 'Stakeholder Matrix', path: '/calculators/stakeholder-matrix', description: 'Map stakeholder interest and influence' },
  ],
};

type PhaseDefinition = {
  id: string; name: string; description: string;
  weight: number; color: string; toolSets: string[];
};

const PHASE_DEFINITIONS: Record<string, PhaseDefinition[]> = {
  'phd-thesis': [
    { id: 'topic-selection', name: 'Topic Selection', description: 'Identify and refine the research topic and scope', weight: 3, color: 'blue', toolSets: [] },
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem, questions, and objectives', weight: 4, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Conduct a comprehensive review of existing literature', weight: 15, color: 'purple', toolSets: ['literature'] },
    { id: 'research-gap', name: 'Research Gap Development', description: 'Identify and articulate the research gap', weight: 5, color: 'violet', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design the research methodology and theoretical framework', weight: 8, color: 'teal', toolSets: ['methodology'] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit the ethics application', weight: 7, color: 'orange', toolSets: [] },
    { id: 'instrument-development', name: 'Instrument Development', description: 'Develop survey, interview, or measurement instruments', weight: 5, color: 'amber', toolSets: ['methodology', 'reliability'] },
    { id: 'data-collection', name: 'Data Collection', description: 'Collect primary data from participants or sources', weight: 12, color: 'green', toolSets: ['methodology'] },
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyse collected data using appropriate methods', weight: 12, color: 'cyan', toolSets: ['statistics', 'qualitative', 'reliability'] },
    { id: 'findings-discussion', name: 'Findings & Discussion', description: 'Interpret results and discuss implications', weight: 10, color: 'blue', toolSets: ['governance', 'risk'] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write and revise the thesis document', weight: 12, color: 'slate', toolSets: [] },
    { id: 'supervisor-review', name: 'Supervisor Review', description: 'Submit draft for supervisor feedback and revision', weight: 5, color: 'rose', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final formatting, proofreading, and submission', weight: 2, color: 'emerald', toolSets: [] },
  ],
  'mphil-thesis': [
    { id: 'topic-selection', name: 'Topic Selection', description: 'Identify and refine the research topic', weight: 4, color: 'blue', toolSets: [] },
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem, questions, and objectives', weight: 5, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Comprehensive review of existing literature', weight: 18, color: 'purple', toolSets: ['literature'] },
    { id: 'research-gap', name: 'Research Gap Development', description: 'Identify and articulate the research gap', weight: 6, color: 'violet', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design the research methodology', weight: 10, color: 'teal', toolSets: ['methodology'] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit ethics application', weight: 6, color: 'orange', toolSets: [] },
    { id: 'data-collection', name: 'Data Collection', description: 'Collect data from participants or sources', weight: 15, color: 'green', toolSets: ['methodology'] },
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyse collected data', weight: 14, color: 'cyan', toolSets: ['statistics', 'qualitative', 'reliability'] },
    { id: 'findings-discussion', name: 'Findings & Discussion', description: 'Interpret results and discuss implications', weight: 10, color: 'blue', toolSets: ['governance'] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write and revise the thesis', weight: 7, color: 'slate', toolSets: [] },
    { id: 'supervisor-review', name: 'Supervisor Review', description: 'Supervisor feedback and revision', weight: 3, color: 'rose', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final formatting and submission', weight: 2, color: 'emerald', toolSets: [] },
  ],
  'masters-dissertation': [
    { id: 'topic-selection', name: 'Topic Selection', description: 'Identify and refine the research topic', weight: 5, color: 'blue', toolSets: [] },
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem, questions, and objectives', weight: 5, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Comprehensive review of existing literature', weight: 20, color: 'purple', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design the research methodology', weight: 10, color: 'teal', toolSets: ['methodology'] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit ethics application', weight: 5, color: 'orange', toolSets: [] },
    { id: 'data-collection', name: 'Data Collection', description: 'Collect data from participants', weight: 15, color: 'green', toolSets: ['methodology'] },
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyse collected data', weight: 15, color: 'cyan', toolSets: ['statistics', 'qualitative', 'reliability'] },
    { id: 'findings-discussion', name: 'Findings & Discussion', description: 'Interpret results and discuss implications', weight: 12, color: 'blue', toolSets: ['governance'] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write and revise the dissertation', weight: 10, color: 'slate', toolSets: [] },
    { id: 'supervisor-review', name: 'Supervisor Review', description: 'Supervisor feedback and revision', weight: 1, color: 'rose', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final formatting and submission', weight: 2, color: 'emerald', toolSets: [] },
  ],
  'journal-article': [
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem and contribution', weight: 8, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Review existing literature and identify gap', weight: 20, color: 'purple', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design the research methodology', weight: 10, color: 'teal', toolSets: ['methodology'] },
    { id: 'data-collection', name: 'Data Collection', description: 'Collect data', weight: 15, color: 'green', toolSets: ['methodology'] },
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyse collected data', weight: 15, color: 'cyan', toolSets: ['statistics', 'qualitative', 'reliability'] },
    { id: 'writing', name: 'Writing & Discussion', description: 'Write manuscript including findings and discussion', weight: 20, color: 'slate', toolSets: [] },
    { id: 'peer-review', name: 'Peer Review & Revision', description: 'Submit to journal and respond to reviewer feedback', weight: 10, color: 'rose', toolSets: [] },
    { id: 'submission', name: 'Final Submission', description: 'Prepare final manuscript for publication', weight: 2, color: 'emerald', toolSets: [] },
  ],
  'systematic-review': [
    { id: 'protocol', name: 'Protocol Development', description: 'Define review protocol, scope, and inclusion/exclusion criteria', weight: 10, color: 'blue', toolSets: [] },
    { id: 'search-strategy', name: 'Search Strategy', description: 'Develop database search terms and strategy', weight: 8, color: 'indigo', toolSets: [] },
    { id: 'database-search', name: 'Database Search', description: 'Execute searches across multiple databases', weight: 5, color: 'teal', toolSets: [] },
    { id: 'title-abstract-screening', name: 'Title/Abstract Screening', description: 'Screen titles and abstracts for eligibility', weight: 12, color: 'purple', toolSets: ['reliability'] },
    { id: 'full-text-review', name: 'Full-text Review', description: 'Review full texts of eligible studies', weight: 12, color: 'violet', toolSets: ['reliability'] },
    { id: 'data-extraction', name: 'Data Extraction', description: 'Extract data from included studies', weight: 12, color: 'cyan', toolSets: ['reliability'] },
    { id: 'quality-assessment', name: 'Quality Assessment', description: 'Assess methodological quality of included studies', weight: 10, color: 'orange', toolSets: ['reliability'] },
    { id: 'data-synthesis', name: 'Data Synthesis', description: 'Synthesise findings across studies', weight: 12, color: 'green', toolSets: ['statistics', 'literature'] },
    { id: 'writing', name: 'Writing & Reporting', description: 'Write review following PRISMA guidelines', weight: 14, color: 'slate', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final formatting and submission', weight: 5, color: 'emerald', toolSets: [] },
  ],
  'survey-research': [
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem, questions, and hypotheses', weight: 8, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Review existing literature to ground the study', weight: 15, color: 'purple', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design survey methodology and sampling strategy', weight: 10, color: 'teal', toolSets: ['methodology'] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit ethics application', weight: 6, color: 'orange', toolSets: [] },
    { id: 'instrument-development', name: 'Survey Instrument Development', description: 'Develop and pilot test the survey instrument', weight: 10, color: 'amber', toolSets: ['methodology', 'reliability'] },
    { id: 'data-collection', name: 'Data Collection', description: 'Distribute survey and collect responses', weight: 15, color: 'green', toolSets: ['methodology'] },
    { id: 'data-analysis', name: 'Data Analysis', description: 'Analyse survey data', weight: 15, color: 'cyan', toolSets: ['statistics', 'reliability'] },
    { id: 'findings-discussion', name: 'Findings & Discussion', description: 'Interpret and discuss findings', weight: 10, color: 'blue', toolSets: ['governance'] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write the research report or paper', weight: 8, color: 'slate', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final submission', weight: 3, color: 'emerald', toolSets: [] },
  ],
  'qualitative-research': [
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem and qualitative research questions', weight: 8, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Review existing literature and theoretical frameworks', weight: 15, color: 'purple', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design qualitative methodology', weight: 10, color: 'teal', toolSets: [] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit ethics application', weight: 7, color: 'orange', toolSets: [] },
    { id: 'instrument-development', name: 'Interview/Protocol Development', description: 'Develop interview guides and observation protocols', weight: 8, color: 'amber', toolSets: ['reliability'] },
    { id: 'data-collection', name: 'Data Collection', description: 'Conduct interviews, observations, or document analysis', weight: 18, color: 'green', toolSets: [] },
    { id: 'data-analysis', name: 'Qualitative Analysis', description: 'Code, categorise, and thematically analyse data', weight: 16, color: 'cyan', toolSets: ['qualitative', 'reliability'] },
    { id: 'findings-discussion', name: 'Findings & Discussion', description: 'Interpret themes and discuss implications', weight: 10, color: 'blue', toolSets: [] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write the qualitative research report', weight: 5, color: 'slate', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final submission', weight: 3, color: 'emerald', toolSets: [] },
  ],
  'mixed-methods': [
    { id: 'topic-selection', name: 'Topic Selection', description: 'Identify and refine the research topic', weight: 3, color: 'blue', toolSets: [] },
    { id: 'problem-objectives', name: 'Research Problem & Objectives', description: 'Define research problem and mixed-methods rationale', weight: 4, color: 'indigo', toolSets: [] },
    { id: 'literature-review', name: 'Literature Review', description: 'Review covering both quantitative and qualitative literature', weight: 14, color: 'purple', toolSets: ['literature'] },
    { id: 'methodology-design', name: 'Methodology Design', description: 'Design the mixed-methods framework', weight: 8, color: 'teal', toolSets: ['methodology'] },
    { id: 'ethics-approval', name: 'Ethics Approval', description: 'Prepare and submit ethics application', weight: 6, color: 'orange', toolSets: [] },
    { id: 'instrument-development', name: 'Instrument Development', description: 'Develop quantitative and qualitative instruments', weight: 6, color: 'amber', toolSets: ['methodology', 'reliability'] },
    { id: 'quantitative-collection', name: 'Quantitative Data Collection', description: 'Collect quantitative data', weight: 8, color: 'green', toolSets: ['methodology'] },
    { id: 'qualitative-collection', name: 'Qualitative Data Collection', description: 'Collect qualitative data', weight: 8, color: 'emerald', toolSets: [] },
    { id: 'quantitative-analysis', name: 'Quantitative Analysis', description: 'Analyse quantitative data statistically', weight: 10, color: 'cyan', toolSets: ['statistics', 'reliability'] },
    { id: 'qualitative-analysis', name: 'Qualitative Analysis', description: 'Code and thematically analyse qualitative data', weight: 10, color: 'teal', toolSets: ['qualitative', 'reliability'] },
    { id: 'integration', name: 'Data Integration & Discussion', description: 'Integrate quantitative and qualitative findings', weight: 10, color: 'blue', toolSets: ['governance'] },
    { id: 'final-writing', name: 'Final Writing', description: 'Write the research report or thesis', weight: 10, color: 'slate', toolSets: [] },
    { id: 'submission', name: 'Submission', description: 'Final submission', weight: 3, color: 'emerald', toolSets: [] },
  ],
};

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; bar: string; light: string }> = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    bar: 'bg-blue-500',    light: 'bg-blue-100' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200',  bar: 'bg-indigo-500',  light: 'bg-indigo-100' },
  purple:  { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  bar: 'bg-purple-500',  light: 'bg-purple-100' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  bar: 'bg-violet-500',  light: 'bg-violet-100' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    bar: 'bg-teal-500',    light: 'bg-teal-100' },
  orange:  { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  bar: 'bg-orange-500',  light: 'bg-orange-100' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: 'bg-amber-500',   light: 'bg-amber-100' },
  green:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200',   bar: 'bg-green-500',   light: 'bg-green-100' },
  cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    bar: 'bg-cyan-500',    light: 'bg-cyan-100' },
  slate:   { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   bar: 'bg-slate-500',   light: 'bg-slate-100' },
  rose:    { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    bar: 'bg-rose-500',    light: 'bg-rose-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500', light: 'bg-emerald-100' },
};

function getColors(color: string) {
  return COLOR_MAP[color] ?? COLOR_MAP['blue'];
}

const STATUS_LABELS: Record<PhaseStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
}

function generatePhases(project: ResearchProject): ResearchPhase[] {
  const templates = PHASE_DEFINITIONS[project.researchType] ?? PHASE_DEFINITIONS['phd-thesis'];
  const totalDays = Math.max(1, daysBetween(project.startDate, project.submissionDate));
  let cursor = new Date(project.startDate);

  return templates.map((t, i) => {
    const phaseDays = Math.max(1, Math.round((t.weight / 100) * totalDays));
    const phaseStart = new Date(cursor);
    const phaseEnd = addDays(cursor, phaseDays);
    cursor = new Date(phaseEnd);

    const tools: ToolLink[] = [];
    const seen = new Set<string>();
    for (const setKey of t.toolSets) {
      for (const tool of (TOOL_SETS[setKey] ?? [])) {
        if (!seen.has(tool.path)) { seen.add(tool.path); tools.push(tool); }
      }
    }

    return {
      id: t.id, name: t.name, description: t.description,
      order: i + 1,
      startDate: phaseStart.toISOString().split('T')[0],
      endDate: phaseEnd.toISOString().split('T')[0],
      status: 'not-started' as PhaseStatus,
      progress: 0, notes: '',
      color: t.color, tools,
    };
  });
}

function calcOverallProgress(phases: ResearchPhase[]): number {
  if (!phases.length) return 0;
  return Math.round(phases.reduce((s, p) => s + p.progress, 0) / phases.length);
}

function isOverdue(phase: ResearchPhase): boolean {
  return phase.status !== 'completed' && new Date(phase.endDate) < new Date();
}

function getNextMilestone(phases: ResearchPhase[]): ResearchPhase | null {
  return phases.find(p => p.status !== 'completed') ?? null;
}

function exportToCsv(project: ResearchProject, phases: ResearchPhase[]): void {
  const rows = [
    ['Phase', 'Description', 'Start Date', 'End Date', 'Status', 'Progress (%)', 'Notes'],
    ...phases.map(p => [
      p.name, p.description, formatDate(p.startDate), formatDate(p.endDate),
      STATUS_LABELS[p.status], String(p.progress), p.notes.replace(/,/g, ';'),
    ]),
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title.replace(/\s+/g, '-')}-research-plan.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToText(project: ResearchProject, phases: ResearchPhase[]): string {
  const typLabel = RESEARCH_TYPES.find(t => t.value === project.researchType)?.label ?? project.researchType;
  const methodLabel = RESEARCH_METHODS.find(m => m.value === project.researchMethod)?.label ?? project.researchMethod;
  return [
    'RESEARCH PROJECT PLAN',
    '=====================',
    '',
    `Project: ${project.title}`,
    `Type: ${typLabel}`,
    `Method: ${methodLabel}`,
    `Start: ${formatDate(project.startDate)}`,
    `Submission: ${formatDate(project.submissionDate)}`,
    project.supervisor ? `Supervisor: ${project.supervisor}` : '',
    project.topic ? `Topic: ${project.topic}` : '',
    '',
    'PHASES',
    '------',
    ...phases.map(p =>
      `\nPhase ${p.order}: ${p.name}\n  ${p.description}\n  ${formatDate(p.startDate)} → ${formatDate(p.endDate)}\n  Status: ${STATUS_LABELS[p.status]}  |  Progress: ${p.progress}%${p.notes ? `\n  Notes: ${p.notes}` : ''}`
    ),
    '',
    'ACADEMIC OVERVIEW',
    '-----------------',
    `This ${typLabel.toLowerCase()}, titled "${project.title}", is planned across ${phases.length} phases, ` +
    `including ${phases.slice(0, -1).map(p => p.name.toLowerCase()).join(', ')}, and ${phases[phases.length - 1]?.name.toLowerCase() ?? 'submission'}. ` +
    `The research employs a ${methodLabel.toLowerCase()} approach, with data collection and analysis forming the core of the investigation. ` +
    `The project is scheduled from ${formatDate(project.startDate)} to ${formatDate(project.submissionDate)}.`,
    '',
    'Generated by ResearchCalcHub',
  ].filter(l => l !== undefined).join('\n');
}

const STORAGE_KEY = 'researchCalcHub.planner';

function loadFromStorage(): PlannerData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlannerData) : null;
  } catch { return null; }
}

function saveToStorage(data: PlannerData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ─── Setup Form ───────────────────────────────────────────────────────────────

interface SetupFormProps {
  onCreated: (data: PlannerData) => void;
}

function SetupForm({ onCreated }: SetupFormProps) {
  const [title, setTitle] = useState('');
  const [researchType, setResearchType] = useState<ResearchType>('phd-thesis');
  const [researchMethod, setResearchMethod] = useState<ResearchMethod>('quantitative');
  const [startDate, setStartDate] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Please enter a project title.');
    if (!startDate) return setError('Please select a start date.');
    if (!submissionDate) return setError('Please select a target submission date.');
    if (new Date(submissionDate) <= new Date(startDate))
      return setError('Submission date must be after start date.');

    const project: ResearchProject = {
      id: Date.now().toString(),
      title: title.trim(),
      researchType, researchMethod, startDate, submissionDate,
      supervisor: supervisor.trim(), topic: topic.trim(),
      createdAt: new Date().toISOString(),
    };
    const phases = generatePhases(project);
    const data: PlannerData = { project, phases };
    saveToStorage(data);
    onCreated(data);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="w-4 h-4" />
            Research Project Planner
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Plan your research project</h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Enter your project details to auto-generate a phased research timeline with recommended tools at each stage.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Project data is saved locally in your browser. Do not enter confidential or sensitive information unless you are comfortable storing it locally.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Project title */}
          <div>
            <label className="label">Project Title <span className="text-red-500">*</span></label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input-field mt-1" placeholder="e.g. AI Governance Maturity in Healthcare Organisations"
            />
          </div>

          {/* Type & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Research Type <span className="text-red-500">*</span></label>
              <select
                value={researchType}
                onChange={e => setResearchType(e.target.value as ResearchType)}
                className="input-field mt-1"
              >
                {RESEARCH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Research Method <span className="text-red-500">*</span></label>
              <select
                value={researchMethod}
                onChange={e => setResearchMethod(e.target.value as ResearchMethod)}
                className="input-field mt-1"
              >
                {RESEARCH_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date <span className="text-red-500">*</span></label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field mt-1" />
            </div>
            <div>
              <label className="label">Target Submission Date <span className="text-red-500">*</span></label>
              <input type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} className="input-field mt-1" />
            </div>
          </div>

          {/* Optional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Supervisor Name <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} className="input-field mt-1" placeholder="e.g. Prof. Jane Smith" />
            </div>
            <div>
              <label className="label">Research Topic/Keywords <span className="text-slate-400 font-normal">(optional)</span></label>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} className="input-field mt-1" placeholder="e.g. AI governance, healthcare" />
            </div>
          </div>

          {error && (
            <div className="flex gap-2 items-center bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center text-base py-3">
            Generate Research Plan
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ phases, project }: { phases: ResearchPhase[]; project: ResearchProject }) {
  const overall = calcOverallProgress(phases);
  const completed = phases.filter(p => p.status === 'completed').length;
  const inProgress = phases.filter(p => p.status === 'in-progress').length;
  const overdue = phases.filter(isOverdue).length;
  const daysLeft = daysBetween(new Date().toISOString().split('T')[0], project.submissionDate);
  const next = getNextMilestone(phases);

  const typLabel = RESEARCH_TYPES.find(t => t.value === project.researchType)?.label ?? '';
  const methodLabel = RESEARCH_METHODS.find(m => m.value === project.researchMethod)?.label ?? '';

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Overall Progress', value: `${overall}%`, icon: TrendingUp, color: 'indigo' },
          { label: 'Completed', value: `${completed}/${phases.length}`, icon: CheckCircle2, color: 'green' },
          { label: 'In Progress', value: String(inProgress), icon: Clock, color: 'blue' },
          { label: 'Overdue', value: String(overdue), icon: AlertCircle, color: overdue > 0 ? 'red' : 'slate' },
          { label: 'Days Remaining', value: daysLeft > 0 ? String(daysLeft) : 'Overdue', icon: Calendar, color: daysLeft > 0 ? 'teal' : 'red' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-${stat.color}-100`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
            </div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Project Progress</span>
          <span className="text-sm font-bold text-indigo-700">{overall}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-teal-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overall}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>{formatDate(project.startDate)}</span>
          <span>{formatDate(project.submissionDate)}</span>
        </div>
      </div>

      {/* Next milestone */}
      {next && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 items-start">
          <Target className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-sm font-semibold text-indigo-800">Next Milestone: {next.name}</div>
            <div className="text-xs text-indigo-600 mt-0.5">{next.description}</div>
            <div className="text-xs text-indigo-500 mt-1">{formatDate(next.startDate)} → {formatDate(next.endDate)}</div>
          </div>
        </div>
      )}

      {/* Phase cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Research Phases</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {phases.map(phase => {
            const c = getColors(phase.color);
            const overdueBadge = isOverdue(phase);
            return (
              <div key={phase.id} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className={`text-xs font-medium ${c.text}`}>Phase {phase.order}</span>
                    <div className="font-semibold text-slate-900 text-sm mt-0.5">{phase.name}</div>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                    phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                    phase.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {STATUS_LABELS[phase.status]}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{formatDate(phase.startDate)} → {formatDate(phase.endDate)}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white/60 rounded-full h-2">
                    <div className={`${c.bar} h-2 rounded-full transition-all`} style={{ width: `${phase.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 w-8 text-right">{phase.progress}%</span>
                </div>
                {overdueBadge && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" /> Overdue
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic overview */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">Academic Overview</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          This {typLabel.toLowerCase()}, titled <em>"{project.title}"</em>, is planned across {phases.length} phases,
          including {phases.slice(0, -1).map(p => p.name.toLowerCase()).join(', ')}, and {phases[phases.length - 1]?.name.toLowerCase() ?? 'submission'}.
          The research employs a {methodLabel.toLowerCase()} approach, with data collection and analysis forming the core of the investigation.
          The project is scheduled from {formatDate(project.startDate)} to {formatDate(project.submissionDate)}.
          {project.supervisor ? ` Supervised by ${project.supervisor}.` : ''}
        </p>
      </div>
    </div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({ phases, project }: { phases: ResearchPhase[]; project: ResearchProject }) {
  const totalDays = Math.max(1, daysBetween(project.startDate, project.submissionDate));
  const todayOffset = Math.min(100, Math.max(0,
    (daysBetween(project.startDate, new Date().toISOString().split('T')[0]) / totalDays) * 100
  ));

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-xs text-amber-800">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Timeline shows phases proportionally across your project duration. Today is marked with a vertical line.</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 overflow-x-auto">
        {/* Date axis */}
        <div className="flex justify-between text-xs text-slate-400 mb-2 min-w-[500px]">
          <span>{formatDate(project.startDate)}</span>
          <span>{formatDate(project.submissionDate)}</span>
        </div>

        {/* Gantt rows */}
        <div className="relative min-w-[500px] space-y-2">
          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 pointer-events-none"
            style={{ left: `${todayOffset}%` }}
          >
            <div className="absolute -top-5 left-1 text-[10px] text-red-500 font-medium whitespace-nowrap">Today</div>
          </div>

          {phases.map(phase => {
            const c = getColors(phase.color);
            const leftPct = (daysBetween(project.startDate, phase.startDate) / totalDays) * 100;
            const widthPct = Math.max(1, (daysBetween(phase.startDate, phase.endDate) / totalDays) * 100);

            return (
              <div key={phase.id} className="flex items-center gap-3 h-9">
                <div className="w-36 shrink-0 text-xs text-slate-600 font-medium truncate text-right pr-2">{phase.name}</div>
                <div className="flex-1 relative h-7 bg-slate-50 rounded-lg">
                  <div
                    className={`absolute top-0.5 h-6 rounded-md ${c.bar} opacity-90 flex items-center px-2 overflow-hidden`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: '4px' }}
                    title={`${phase.name}: ${formatDate(phase.startDate)} → ${formatDate(phase.endDate)}`}
                  >
                    {widthPct > 8 && (
                      <span className="text-[10px] text-white font-medium truncate">{phase.progress}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {phases.map(phase => {
            const c = getColors(phase.color);
            return (
              <div key={phase.id} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm shrink-0 ${c.bar}`} />
                <span className="text-xs text-slate-600 truncate">{phase.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────

interface ChecklistTabProps {
  phases: ResearchPhase[];
  onUpdate: (id: string, updates: Partial<ResearchPhase>) => void;
}

function ChecklistTab({ phases, onUpdate }: ChecklistTabProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function cycleStatus(phase: ResearchPhase) {
    const next: Record<PhaseStatus, PhaseStatus> = {
      'not-started': 'in-progress',
      'in-progress': 'completed',
      'completed': 'not-started',
    };
    const newStatus = next[phase.status];
    const newProgress = newStatus === 'completed' ? 100 : newStatus === 'not-started' ? 0 : phase.progress;
    onUpdate(phase.id, { status: newStatus, progress: newProgress });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500 mb-4">
        Click the checkbox to cycle status. Expand each phase to update progress and add notes.
      </p>
      {phases.map(phase => {
        const c = getColors(phase.color);
        const isExp = expanded.has(phase.id);
        const overdueBadge = isOverdue(phase);

        return (
          <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              {/* Status toggle */}
              <button
                onClick={() => cycleStatus(phase)}
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  phase.status === 'completed' ? 'bg-green-500 border-green-500' :
                  phase.status === 'in-progress' ? 'border-blue-400' : 'border-slate-300'
                }`}
                title={`Current: ${STATUS_LABELS[phase.status]} — click to cycle`}
              >
                {phase.status === 'completed' && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                {phase.status === 'in-progress' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                {phase.status === 'not-started' && <Square className="w-3 h-3 text-slate-300" />}
              </button>

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>Phase {phase.order}</span>
                  <span className={`font-medium text-sm ${phase.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {phase.name}
                  </span>
                  {overdueBadge && (
                    <span className="text-xs text-red-600 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{formatDate(phase.startDate)} → {formatDate(phase.endDate)}</div>
              </div>

              {/* Progress mini */}
              <div className="hidden sm:flex items-center gap-2 w-24">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className={`${c.bar} h-1.5 rounded-full`} style={{ width: `${phase.progress}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-7 text-right">{phase.progress}%</span>
              </div>

              {/* Expand toggle */}
              <button onClick={() => toggleExpand(phase.id)} className="text-slate-400 hover:text-slate-600 p-1">
                {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expanded details */}
            {isExp && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4 bg-slate-50">
                <p className="text-xs text-slate-600">{phase.description}</p>

                {/* Status selector */}
                <div>
                  <label className="label text-xs">Status</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {(['not-started', 'in-progress', 'completed'] as PhaseStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => onUpdate(phase.id, {
                          status: s,
                          progress: s === 'completed' ? 100 : s === 'not-started' ? 0 : phase.progress,
                        })}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          phase.status === s
                            ? s === 'completed' ? 'bg-green-500 text-white border-green-500'
                            : s === 'in-progress' ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-slate-500 text-white border-slate-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress slider */}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="label text-xs">Progress</label>
                    <span className="text-xs font-medium text-slate-700">{phase.progress}%</span>
                  </div>
                  <input
                    type="range" min={0} max={100} step={5}
                    value={phase.progress}
                    onChange={e => onUpdate(phase.id, { progress: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="label text-xs">Notes</label>
                  <textarea
                    value={phase.notes}
                    onChange={e => onUpdate(phase.id, { notes: e.target.value })}
                    placeholder="Add notes, blockers, or reminders for this phase…"
                    rows={2}
                    className="input-field mt-1 text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tools Tab ────────────────────────────────────────────────────────────────

function ToolsTab({ phases }: { phases: ResearchPhase[] }) {
  const phasesWithTools = phases.filter(p => p.tools.length > 0);

  if (!phasesWithTools.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <Wrench className="w-8 h-8 mx-auto mb-3 text-slate-300" />
        No tool recommendations available for this project type.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        ResearchCalcHub tools recommended for each research phase. Open them in a new tab to use alongside your planner.
      </p>
      {phasesWithTools.map(phase => {
        const c = getColors(phase.color);
        return (
          <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`px-5 py-3 ${c.bg} border-b ${c.border} flex items-center gap-2`}>
              <BookOpen className={`w-4 h-4 ${c.text}`} />
              <span className={`font-semibold text-sm ${c.text}`}>Phase {phase.order}: {phase.name}</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {phase.tools.map(tool => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
                >
                  <BarChart3 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 group-hover:text-indigo-700 flex items-center gap-1">
                      {tool.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{tool.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResearchProjectPlannerPage() {
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const data = loadFromStorage();
    if (data) setPlannerData(data);
  }, []);

  function handleCreated(data: PlannerData) {
    setPlannerData(data);
    setActiveTab('dashboard');
  }

  function handleUpdatePhase(phaseId: string, updates: Partial<ResearchPhase>) {
    if (!plannerData) return;
    const phases = plannerData.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p);
    const data = { ...plannerData, phases };
    setPlannerData(data);
    saveToStorage(data);
  }

  function handleReset() {
    if (!window.confirm('Delete this project and start a new one? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setPlannerData(null);
  }

  async function handleCopy() {
    if (!plannerData) return;
    try {
      await navigator.clipboard.writeText(exportToText(plannerData.project, plannerData.phases));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  // No project yet
  if (!plannerData) {
    return <SetupForm onCreated={handleCreated} />;
  }

  const { project, phases } = plannerData;
  const typLabel = RESEARCH_TYPES.find(t => t.value === project.researchType)?.label ?? '';
  const overall = calcOverallProgress(phases);

  const TABS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timeline', label: 'Timeline', icon: BarChart3 },
    { id: 'checklist', label: 'Checklist', icon: ClipboardList },
    { id: 'tools', label: 'Recommended Tools', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Project header */}
      <div className="bg-gradient-to-r from-indigo-600 to-teal-600 text-white print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-indigo-200" />
                <span className="text-indigo-200 text-sm font-medium">{typLabel}</span>
              </div>
              <h1 className="text-xl font-bold">{project.title}</h1>
              {(project.supervisor || project.topic) && (
                <div className="text-indigo-200 text-sm mt-1 flex flex-wrap gap-3">
                  {project.supervisor && <span>Supervisor: {project.supervisor}</span>}
                  {project.topic && <span>Topic: {project.topic}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{overall}%</div>
                <div className="text-indigo-200 text-xs">Complete</div>
              </div>
              <button onClick={handleReset} className="btn-secondary text-sm flex items-center gap-1.5 bg-white/10 text-white border-white/30 hover:bg-white/20">
                <RefreshCw className="w-3.5 h-3.5" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 print:hidden sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Content area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <DashboardTab phases={phases} project={project} />}
            {activeTab === 'timeline' && <TimelineTab phases={phases} project={project} />}
            {activeTab === 'checklist' && <ChecklistTab phases={phases} onUpdate={handleUpdatePhase} />}
            {activeTab === 'tools' && <ToolsTab phases={phases} />}
          </div>

          {/* Sidebar */}
          <div className="lg:w-64 shrink-0 space-y-4">
            {/* Export */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <Download className="w-4 h-4" /> Export
              </h3>
              <div className="space-y-2">
                <button onClick={handleCopy} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center">
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Plan Text'}
                </button>
                <button onClick={() => exportToCsv(project, phases)} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center">
                  <FileText className="w-3.5 h-3.5" />
                  Download CSV
                </button>
                <button onClick={() => window.print()} className="w-full btn-secondary text-sm flex items-center gap-2 justify-center">
                  <Download className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Project info */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Details</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex gap-2"><Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>Start: {formatDate(project.startDate)}</span></div>
                <div className="flex gap-2"><Target className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>Submit: {formatDate(project.submissionDate)}</span></div>
                <div className="flex gap-2"><List className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>{phases.length} phases</span></div>
                <div className="flex gap-2"><Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /><span>{daysBetween(project.startDate, project.submissionDate)} days total</span></div>
              </div>
            </div>

            {/* Privacy */}
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>Saved locally in your browser. No data is sent to any server.</span>
            </div>

            {/* Reset */}
            <button onClick={handleReset} className="w-full flex items-center gap-2 justify-center text-xs text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Delete Project &amp; Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

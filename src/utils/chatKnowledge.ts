import { calculators } from '../data/calculators';
import type { Calculator } from '../types';

const PLATFORM_TOOLS = [
  {
    name: 'Data Upload Workspace',
    path: '/data-upload',
    category: 'Tools',
    description: 'Upload CSV or Excel datasets for analysis across calculators and Stat Analyzer Pro.',
    tags: ['upload', 'csv', 'excel', 'xlsx', 'data import', 'dataset', 'file upload', 'upload data'],
  },
  {
    name: 'Stat Analyzer Pro',
    path: '/stat-analyzer',
    category: 'Tools',
    description: 'Advanced statistical analysis on uploaded datasets — t-test, ANOVA, chi-square, Pearson correlation, regression, descriptive statistics, frequency tables, correlation matrix.',
    tags: ['stat analyzer', 't-test', 'ANOVA', 'chi-square', 'regression', 'correlation matrix', 'descriptive stats', 'hypothesis testing', 'compare groups', 'inferential statistics'],
  },
];

export function getCalculatorKnowledgeBase(): string {
  const active = calculators.filter((c: Calculator) => c.status === 'active');

  const byCategory = new Map<string, Calculator[]>();
  for (const calc of active) {
    const list = byCategory.get(calc.category) ?? [];
    list.push(calc);
    byCategory.set(calc.category, list);
  }

  const lines: string[] = [];

  for (const [category, calcs] of byCategory) {
    lines.push(`[${category}]`);
    for (const calc of calcs) {
      const keywords = [
        ...calc.tags,
        ...(calc.researchMethods ?? []),
        ...(calc.useCases ?? []),
      ].slice(0, 8).join(', ');
      lines.push(`- ${calc.name} (${calc.path}) — ${calc.description} Keywords: ${keywords}`);
    }
    lines.push('');
  }

  lines.push('[Tools]');
  for (const tool of PLATFORM_TOOLS) {
    lines.push(`- ${tool.name} (${tool.path}) — ${tool.description} Keywords: ${tool.tags.join(', ')}`);
  }

  return lines.join('\n');
}

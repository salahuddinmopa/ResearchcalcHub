import React from 'react';
import { Link } from 'react-router-dom';

interface Tool {
  title: string;
  description: string;
  path: string;
  badge?: string;
  badgeColor?: string;
}

interface ScenarioCard {
  scenario: string;
  description: string;
  tools: { label: string; path: string }[];
}

const TOOLS: Tool[] = [
  {
    title: 'StatAnalyzer Pro',
    description: 'Upload CSV data and run descriptive stats, t-tests, ANOVA, correlation, regression, chi-square, Mann-Whitney U, and Cronbach Alpha in one place.',
    path: '/stat-analyzer',
    badge: 'Beta',
    badgeColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Qualitative Thematic Analysis',
    description: 'Guided 6-step workflow for coding interview transcripts, focus group notes, and open-ended survey responses.',
    path: '/calculators/qualitative-thematic-analysis',
    badge: 'AI-assisted',
    badgeColor: 'bg-teal-100 text-teal-700',
  },
  {
    title: "Cohen's Kappa",
    description: 'Inter-rater reliability between two coders, corrected for chance agreement.',
    path: '/calculators/cohens-kappa',
  },
  {
    title: "Fleiss' Kappa",
    description: 'Inter-rater reliability across three or more raters.',
    path: '/calculators/fleiss-kappa',
  },
  {
    title: "Cronbach's Alpha",
    description: 'Internal consistency of multi-item survey scales and questionnaires.',
    path: '/calculators/cronbach-alpha',
  },
  {
    title: 'Delphi Consensus',
    description: 'IQR, CV, and median-based consensus metrics for expert panel rounds.',
    path: '/calculators/delphi-consensus',
  },
  {
    title: 'AHP Weight Calculator',
    description: 'Pairwise comparison weights with consistency ratio check.',
    path: '/calculators/ahp-weight',
  },
  {
    title: 'Maturity Model Score',
    description: 'Domain-level and overall maturity scoring across a 0–4 scale.',
    path: '/calculators/maturity-model',
  },
];

const SCENARIOS: ScenarioCard[] = [
  {
    scenario: 'Survey Research Design',
    description: 'Planning a questionnaire study? Work through these in order.',
    tools: [
      { label: 'Sample Size', path: '/calculators/sample-size' },
      { label: 'Margin of Error', path: '/calculators/margin-of-error' },
      { label: 'Survey Response Rate', path: '/calculators/survey-response-rate' },
      { label: 'Likert Scale Analysis', path: '/calculators/likert-scale' },
      { label: "Cronbach's Alpha", path: '/calculators/cronbach-alpha' },
    ],
  },
  {
    scenario: 'Quantitative Data Analysis',
    description: 'Have numeric data? Start with descriptives and work toward inferential tests.',
    tools: [
      { label: 'StatAnalyzer Pro', path: '/stat-analyzer' },
      { label: 'Mean / Median / Mode', path: '/calculators/mean-median-mode' },
      { label: 'Standard Deviation', path: '/calculators/standard-deviation' },
      { label: 'Correlation (Pearson r)', path: '/calculators/correlation' },
      { label: 'Confidence Interval', path: '/calculators/confidence-interval' },
    ],
  },
  {
    scenario: 'Qualitative & Mixed Methods',
    description: 'Coding transcripts and need to report reliability?',
    tools: [
      { label: 'Thematic Analysis Tool', path: '/calculators/qualitative-thematic-analysis' },
      { label: "Cohen's Kappa", path: '/calculators/cohens-kappa' },
      { label: "Fleiss' Kappa", path: '/calculators/fleiss-kappa' },
      { label: 'Inter-Coder Agreement', path: '/calculators/inter-coder-agreement' },
    ],
  },
  {
    scenario: 'Expert Panel & Decision Research',
    description: 'Running a Delphi study or multi-criteria analysis?',
    tools: [
      { label: 'Delphi Consensus', path: '/calculators/delphi-consensus' },
      { label: 'AHP Weight Calculator', path: '/calculators/ahp-weight' },
      { label: 'Decision Matrix', path: '/calculators/decision-matrix' },
      { label: 'Weighted Scoring', path: '/calculators/weighted-scoring' },
    ],
  },
  {
    scenario: 'Organisational & Governance Assessment',
    description: 'Evaluating maturity, capability, or readiness?',
    tools: [
      { label: 'Maturity Model Score', path: '/calculators/maturity-model' },
      { label: 'Capability Score', path: '/calculators/capability-score' },
      { label: 'Governance Readiness', path: '/calculators/governance-readiness' },
      { label: 'AI Governance Readiness', path: '/calculators/ai-governance-readiness' },
      { label: 'Cybersecurity Maturity', path: '/calculators/cybersecurity-maturity-mini' },
    ],
  },
];

const REPORTING: { label: string; text: string }[] = [
  {
    label: 'Sample Size',
    text: 'A minimum sample size of n = [X] was calculated using a 95% confidence level, 5% margin of error, and a conservative population proportion of 0.50.',
  },
  {
    label: "Cohen's Kappa",
    text: 'Inter-rater reliability was assessed using Cohen\'s Kappa (κ = [X]), indicating [substantial/moderate] agreement between coders (Landis & Koch, 1977).',
  },
  {
    label: "Cronbach's Alpha",
    text: 'Internal consistency of the scale was acceptable (α = [X]), exceeding the recommended threshold of 0.70 (Nunnally, 1978).',
  },
  {
    label: 'Delphi Consensus',
    text: 'Consensus was defined as an interquartile range ≤ 1.0 and ≥ 70% of responses within one scale unit of the median (Hsu & Sandford, 2007).',
  },
  {
    label: 'Pearson r',
    text: 'A Pearson correlation revealed a [strong/moderate/weak] [positive/negative] relationship between [X] and [Y], r([n−2]) = [r], p = [p].',
  },
];

export default function ResearchToolkitPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Research Toolkit</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            All statistical tools, qualitative analysis aids, and reporting templates in one place.
            Find the right tool for your research phase.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">

        {/* Featured Tools */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map(tool => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 group-hover:text-indigo-700 text-sm leading-snug">
                    {tool.title}
                  </span>
                  {tool.badge && (
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Research Scenarios */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">By Research Scenario</h2>
          <p className="text-sm text-slate-500 mb-6">Not sure where to start? Pick the scenario that matches your study.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SCENARIOS.map(s => (
              <div key={s.scenario} className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-1">{s.scenario}</h3>
                <p className="text-xs text-slate-500 mb-3">{s.description}</p>
                <ol className="space-y-1.5">
                  {s.tools.map((t, i) => (
                    <li key={t.path} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <Link to={t.path} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Reporting Templates */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reporting Templates</h2>
          <p className="text-sm text-slate-500 mb-6">Copy-paste these into your methods or results section. Replace [bracketed] values.</p>
          <div className="space-y-3">
            {REPORTING.map(r => (
              <div key={r.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{r.label}</div>
                <p className="text-sm text-slate-800 font-mono leading-relaxed bg-slate-50 rounded px-3 py-2 border border-slate-100">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Reference */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Reference: Which Test?</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Research Question', 'Variable Types', 'Test / Tool'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  ['Difference between two independent groups?', 'Numeric outcome, 2 groups', 'Independent T-Test'],
                  ['Difference before and after (same group)?', 'Numeric, paired measures', 'Paired T-Test'],
                  ['Difference across 3+ groups?', 'Numeric outcome, categorical grouping', 'One-Way ANOVA'],
                  ['Relationship between two numeric variables?', 'Both numeric', 'Pearson Correlation'],
                  ['Predict Y from X?', 'Both numeric', 'Linear Regression'],
                  ['Association between two categorical variables?', 'Both categorical', 'Chi-Square'],
                  ['Non-parametric alternative to independent T-test?', 'Ordinal or non-normal numeric', 'Mann-Whitney U'],
                  ['Agreement between two raters?', 'Categorical codes', "Cohen's Kappa"],
                  ['Scale reliability (multi-item)?', 'Ordinal/numeric items', "Cronbach's Alpha"],
                  ['Expert consensus over rounds?', 'Rating scales', 'Delphi Consensus'],
                  ['Weight multiple criteria?', 'Subjective scores', 'AHP / Weighted Scoring'],
                ].map(([q, v, t], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-4 py-2.5 text-slate-700">{q}</td>
                    <td className="px-4 py-2.5 text-slate-500">{v}</td>
                    <td className="px-4 py-2.5 font-medium text-indigo-700">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

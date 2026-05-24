export type CyberFieldType = 'number' | 'select' | 'password';

export interface CyberField {
  key: string;
  label: string;
  type?: CyberFieldType;
  options?: { label: string; value: string }[];
}

export interface CyberCalculation {
  summary: { label: string; value: string; highlight?: boolean }[];
  interpretation: string;
  steps: string[];
  academicText: string;
}

export interface CyberCalculatorConfig {
  id: string;
  title: string;
  explanation: string;
  formula: string;
  fields: CyberField[];
  example: Record<string, string>;
  related: string[];
  tags: string[];
  calculate: (values: Record<string, string>) => CyberCalculation;
}

const scoreOptions = [
  { label: '1 - Very low', value: '1' },
  { label: '2 - Low', value: '2' },
  { label: '3 - Moderate', value: '3' },
  { label: '4 - High', value: '4' },
  { label: '5 - Very high', value: '5' },
];

const controlOptions = [
  { label: 'Implemented', value: 'implemented' },
  { label: 'Partially implemented', value: 'partial' },
  { label: 'Not implemented', value: 'not' },
  { label: 'Not applicable', value: 'na' },
];

function num(values: Record<string, string>, key: string) {
  const value = Number(values[key]);
  if (!Number.isFinite(value)) throw new Error('Please complete all required fields.');
  return value;
}

function category(score: number, max = 100) {
  const pct = score / max * 100;
  if (pct < 25) return 'Low';
  if (pct < 50) return 'Moderate';
  if (pct < 75) return 'High';
  return 'Critical';
}

function treatment(riskCategory: string) {
  if (riskCategory === 'Low') return 'Accept';
  if (riskCategory === 'Moderate') return 'Mitigate';
  if (riskCategory === 'High') return 'Transfer or mitigate';
  return 'Avoid or urgently mitigate';
}

function readinessLevel(score: number) {
  if (score < 40) return 'Initial';
  if (score < 60) return 'Developing';
  if (score < 80) return 'Managed';
  return 'Optimised';
}

export const cybersecurityCalculators: CyberCalculatorConfig[] = [
  {
    id: 'cyber-risk-score',
    title: 'Cyber Risk Score Calculator',
    explanation: 'Estimate preliminary cyber risk from threat, vulnerability, asset value, impact, and control effectiveness.',
    formula: 'Risk = threat x vulnerability x asset value x impact x (1 - control effectiveness)',
    fields: [
      { key: 'threat', label: 'Threat Likelihood', type: 'select', options: scoreOptions },
      { key: 'vulnerability', label: 'Vulnerability Level', type: 'select', options: scoreOptions },
      { key: 'asset', label: 'Asset Value', type: 'select', options: scoreOptions },
      { key: 'impact', label: 'Impact Level', type: 'select', options: scoreOptions },
      { key: 'control', label: 'Control Effectiveness', type: 'select', options: scoreOptions },
    ],
    example: { threat: '4', vulnerability: '3', asset: '5', impact: '4', control: '2' },
    related: ['incident-severity', 'security-control-compliance'],
    tags: ['cyber risk', 'risk assessment', 'threat', 'vulnerability', 'controls'],
    calculate: values => {
      const threat = num(values, 'threat'), vulnerability = num(values, 'vulnerability'), asset = num(values, 'asset'), impact = num(values, 'impact'), control = num(values, 'control');
      const raw = threat * vulnerability * asset * impact;
      const controlReduction = control / 5;
      const score = raw * (1 - controlReduction);
      const max = 5 ** 4;
      const riskCategory = category(score, max);
      return {
        summary: [{ label: 'Cyber Risk Score', value: `${score.toFixed(1)} / ${max}`, highlight: true }, { label: 'Risk Category', value: riskCategory }, { label: 'Suggested Treatment', value: treatment(riskCategory) }],
        interpretation: `This preliminary assessment indicates ${riskCategory.toLowerCase()} cyber risk. Results are educational and should be validated through professional assessment.`,
        steps: [`Raw risk = ${threat} x ${vulnerability} x ${asset} x ${impact} = ${raw}`, `Control reduction = ${control}/5 = ${controlReduction.toFixed(2)}`, `Adjusted risk = ${raw} x (1 - ${controlReduction.toFixed(2)}) = ${score.toFixed(1)}`],
        academicText: `A preliminary cyber risk score of ${score.toFixed(1)} out of ${max} was estimated, corresponding to a ${riskCategory.toLowerCase()} risk category. This result should be interpreted as an educational screening estimate, not a substitute for a professional cybersecurity audit.`,
      };
    },
  },
  {
    id: 'incident-severity',
    title: 'Incident Severity Calculator',
    explanation: 'Estimate incident severity and response urgency using sensitivity, scale, criticality, impact, and recovery urgency.',
    formula: 'Severity = average(data sensitivity, affected users, system criticality, business impact, recovery urgency)',
    fields: [
      { key: 'sensitivity', label: 'Data Sensitivity', type: 'select', options: scoreOptions },
      { key: 'users', label: 'Affected Users Scale', type: 'select', options: scoreOptions },
      { key: 'criticality', label: 'System Criticality', type: 'select', options: scoreOptions },
      { key: 'impact', label: 'Business Impact', type: 'select', options: scoreOptions },
      { key: 'urgency', label: 'Recovery Urgency', type: 'select', options: scoreOptions },
    ],
    example: { sensitivity: '5', users: '4', criticality: '4', impact: '5', urgency: '4' },
    related: ['cyber-risk-score', 'ai-threat-detection-governance'],
    tags: ['incident response', 'severity', 'breach', 'priority', 'timeline'],
    calculate: values => {
      const scores = ['sensitivity', 'users', 'criticality', 'impact', 'urgency'].map(key => num(values, key));
      const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
      const severity = avg < 2 ? 'Low' : avg < 3 ? 'Moderate' : avg < 4 ? 'High' : 'Critical';
      const timeline = severity === 'Critical' ? 'Immediate response, target triage within 1 hour' : severity === 'High' ? 'Same-day response, target triage within 4 hours' : severity === 'Moderate' ? 'Respond within 1 business day' : 'Monitor and handle through normal support workflow';
      return {
        summary: [{ label: 'Severity Level', value: severity, highlight: true }, { label: 'Response Priority', value: severity === 'Critical' ? 'P1' : severity === 'High' ? 'P2' : severity === 'Moderate' ? 'P3' : 'P4' }, { label: 'Timeline', value: timeline }],
        interpretation: `The incident is preliminarily classified as ${severity.toLowerCase()} severity.`,
        steps: [`Average score = (${scores.join(' + ')}) / 5 = ${avg.toFixed(2)}`, `Severity mapped from average score = ${severity}`],
        academicText: `The incident severity estimate was ${severity}, based on an average score of ${avg.toFixed(2)} across five incident impact dimensions. This is a preliminary educational triage estimate.`,
      };
    },
  },
  {
    id: 'security-control-compliance',
    title: 'Security Control Compliance Score Calculator',
    explanation: 'Score a small control checklist using implemented, partial, not implemented, and not applicable statuses.',
    formula: 'Compliance = achieved points / applicable points x 100',
    fields: ['Access Control', 'Backup & Recovery', 'Logging & Monitoring', 'Incident Response', 'Security Training', 'Patch Management'].map((label, index) => ({ key: `control${index + 1}`, label, type: 'select' as const, options: controlOptions })),
    example: { control1: 'implemented', control2: 'partial', control3: 'implemented', control4: 'not', control5: 'partial', control6: 'implemented' },
    related: ['cyber-risk-score', 'ai-risk-assessment'],
    tags: ['security controls', 'compliance', 'audit checklist', 'control maturity'],
    calculate: values => {
      const labels = ['Access Control', 'Backup & Recovery', 'Logging & Monitoring', 'Incident Response', 'Security Training', 'Patch Management'];
      const points: Record<string, number | null> = { implemented: 1, partial: 0.5, not: 0, na: null };
      const rows = labels.map((label, index) => ({ label, status: values[`control${index + 1}`] || 'not' }));
      const applicable = rows.filter(row => points[row.status] !== null);
      const achieved = applicable.reduce((sum, row) => sum + Number(points[row.status]), 0);
      const compliance = applicable.length ? achieved / applicable.length * 100 : 0;
      const weak = applicable.filter(row => row.status !== 'implemented').map(row => row.label);
      return {
        summary: [{ label: 'Compliance', value: `${compliance.toFixed(1)}%`, highlight: true }, { label: 'Weak Areas', value: weak.length ? weak.join(', ') : 'None identified' }],
        interpretation: compliance >= 80 ? 'Control implementation appears strong for this checklist.' : compliance >= 60 ? 'Control implementation is moderate and needs improvement.' : 'Control implementation is weak and should be prioritised.',
        steps: [`Achieved points = ${achieved}`, `Applicable controls = ${applicable.length}`, `Compliance = ${achieved} / ${applicable.length} x 100 = ${compliance.toFixed(1)}%`],
        academicText: `The preliminary security control compliance score was ${compliance.toFixed(1)}%. Weak or partially implemented areas were: ${weak.length ? weak.join(', ') : 'none identified'}. This does not replace a formal audit.`,
      };
    },
  },
  {
    id: 'ai-risk-assessment',
    title: 'AI Risk Assessment Calculator',
    explanation: 'Estimate AI system risk from data, transparency, oversight, bias, security, and operational impact factors.',
    formula: 'AI risk = average(sensitivity, low transparency, weak oversight, bias risk, security risk, operational impact)',
    fields: [
      { key: 'data', label: 'Data Sensitivity', type: 'select', options: scoreOptions },
      { key: 'transparency', label: 'Low Model Transparency', type: 'select', options: scoreOptions },
      { key: 'oversight', label: 'Weak Human Oversight', type: 'select', options: scoreOptions },
      { key: 'bias', label: 'Bias Risk', type: 'select', options: scoreOptions },
      { key: 'security', label: 'Security Risk', type: 'select', options: scoreOptions },
      { key: 'impact', label: 'Operational Impact', type: 'select', options: scoreOptions },
    ],
    example: { data: '4', transparency: '3', oversight: '3', bias: '4', security: '3', impact: '4' },
    related: ['ai-threat-detection-governance', 'ai-governance-readiness'],
    tags: ['ai governance', 'ai risk', 'bias', 'human oversight', 'model transparency'],
    calculate: values => {
      const scores = ['data', 'transparency', 'oversight', 'bias', 'security', 'impact'].map(key => num(values, key));
      const avg = scores.reduce((sum, value) => sum + value, 0) / scores.length;
      const riskCategory = avg < 2 ? 'Low' : avg < 3 ? 'Moderate' : avg < 4 ? 'High' : 'Critical';
      const recommendation = riskCategory === 'Low' ? 'Maintain documentation and periodic review.' : riskCategory === 'Moderate' ? 'Strengthen governance controls before wider deployment.' : riskCategory === 'High' ? 'Require formal risk review, human oversight, and mitigation plan.' : 'Pause or restrict deployment until major controls are implemented.';
      return {
        summary: [{ label: 'AI Risk Score', value: `${avg.toFixed(2)} / 5`, highlight: true }, { label: 'Risk Category', value: riskCategory }, { label: 'Recommendation', value: recommendation }],
        interpretation: `The AI system has a preliminary ${riskCategory.toLowerCase()} governance risk profile.`,
        steps: [`Average = (${scores.join(' + ')}) / 6 = ${avg.toFixed(2)}`, `Risk category = ${riskCategory}`],
        academicText: `The AI risk assessment produced an average score of ${avg.toFixed(2)} out of 5, classified as ${riskCategory.toLowerCase()} risk. The result is educational and preliminary, not a substitute for a professional AI assurance review.`,
      };
    },
  },
  {
    id: 'ai-threat-detection-governance',
    title: 'AI-Enabled Threat Detection Governance Calculator',
    explanation: 'Assess governance readiness for AI-enabled threat detection programs.',
    formula: 'Readiness = average(capability, oversight, explainability, data governance, accountability, response integration, monitoring) x 20',
    fields: [
      { key: 'capability', label: 'AI Detection Capability', type: 'select', options: scoreOptions },
      { key: 'oversight', label: 'Human Oversight', type: 'select', options: scoreOptions },
      { key: 'explainability', label: 'Alert Explainability', type: 'select', options: scoreOptions },
      { key: 'data', label: 'Data Governance', type: 'select', options: scoreOptions },
      { key: 'accountability', label: 'Accountability Structure', type: 'select', options: scoreOptions },
      { key: 'response', label: 'Incident Response Integration', type: 'select', options: scoreOptions },
      { key: 'monitoring', label: 'Continuous Monitoring', type: 'select', options: scoreOptions },
    ],
    example: { capability: '4', oversight: '3', explainability: '3', data: '4', accountability: '2', response: '3', monitoring: '3' },
    related: ['ai-risk-assessment', 'incident-severity'],
    tags: ['ai threat detection', 'soc', 'ai governance', 'readiness', 'monitoring'],
    calculate: values => {
      const keys = ['capability', 'oversight', 'explainability', 'data', 'accountability', 'response', 'monitoring'];
      const scores = keys.map(key => num(values, key));
      const readiness = scores.reduce((sum, value) => sum + value, 0) / scores.length * 20;
      const weak = keys.filter((key, index) => scores[index] < 4).map(key => key.replace(/^\w/, char => char.toUpperCase()));
      return {
        summary: [{ label: 'Governance Readiness', value: `${readiness.toFixed(1)}%`, highlight: true }, { label: 'Maturity Level', value: readinessLevel(readiness) }, { label: 'Improve', value: weak.length ? weak.join(', ') : 'Maintain current controls' }],
        interpretation: `Governance readiness is ${readinessLevel(readiness).toLowerCase()} for AI-enabled threat detection.`,
        steps: [`Average score = (${scores.join(' + ')}) / 7`, `Readiness = average x 20 = ${readiness.toFixed(1)}%`],
        academicText: `AI-enabled threat detection governance readiness was estimated at ${readiness.toFixed(1)}%, indicating a ${readinessLevel(readiness).toLowerCase()} maturity level. This preliminary score should be supplemented by professional governance and cybersecurity review.`,
      };
    },
  },
  {
    id: 'password-strength',
    title: 'Password Strength Calculator',
    explanation: 'Estimate password strength from length, character variety, and common weakness patterns.',
    formula: 'Strength score = length points + variety points - weakness penalties',
    fields: [{ key: 'password', label: 'Password Text', type: 'password' }],
    example: { password: 'ResearchCalcHub!2026' },
    related: ['cyber-risk-score', 'security-control-compliance'],
    tags: ['password', 'strength', 'security', 'entropy', 'login'],
    calculate: values => {
      const password = values.password || '';
      if (!password) throw new Error('Please enter a password to assess.');
      let score = Math.min(40, password.length * 3);
      const checks = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
      ];
      score += checks.filter(Boolean).length * 12;
      const weaknesses: string[] = [];
      if (password.length < 12) weaknesses.push('Use at least 12 characters.');
      if (!checks[0] || !checks[1]) weaknesses.push('Mix uppercase and lowercase letters.');
      if (!checks[2]) weaknesses.push('Add numbers.');
      if (!checks[3]) weaknesses.push('Add symbols.');
      if (/(.)\1{2,}/.test(password)) { score -= 15; weaknesses.push('Avoid repeated characters.'); }
      if (/password|1234|qwerty|admin|letmein/i.test(password)) { score -= 25; weaknesses.push('Avoid common words or sequences.'); }
      score = Math.max(0, Math.min(100, score));
      const strength = score < 35 ? 'Weak' : score < 65 ? 'Moderate' : score < 85 ? 'Strong' : 'Very strong';
      return {
        summary: [{ label: 'Strength Score', value: `${score} / 100`, highlight: true }, { label: 'Strength', value: strength }, { label: 'Suggestions', value: weaknesses.length ? weaknesses.join(' ') : 'No obvious weaknesses found.' }],
        interpretation: `This password is preliminarily assessed as ${strength.toLowerCase()}.`,
        steps: [`Length and variety score calculated from password structure.`, `Weakness penalties applied where relevant.`, `Final score = ${score}/100`],
        academicText: `The password strength score was ${score} out of 100, classified as ${strength.toLowerCase()}. This educational estimate does not replace enterprise password auditing or credential security controls.`,
      };
    },
  },
  {
    id: 'cvss-score',
    title: 'CVSS 3.1 Base Score Calculator',
    explanation: 'Calculate the CVSS 3.1 base vulnerability severity score from exploitability and impact metrics.',
    formula: 'Base = Roundup(min(Impact + Exploitability, 10))',
    fields: [
      { key: 'av', label: 'Attack Vector', type: 'select', options: [{ label: 'Network (N)', value: '0.85' }, { label: 'Adjacent (A)', value: '0.62' }, { label: 'Local (L)', value: '0.55' }, { label: 'Physical (P)', value: '0.2' }] },
      { key: 'ac', label: 'Attack Complexity', type: 'select', options: [{ label: 'Low (L)', value: '0.77' }, { label: 'High (H)', value: '0.44' }] },
      { key: 'scope', label: 'Scope', type: 'select', options: [{ label: 'Unchanged (U)', value: 'U' }, { label: 'Changed (C)', value: 'C' }] },
      { key: 'pr', label: 'Privileges Required', type: 'select', options: [{ label: 'None (N)', value: 'none' }, { label: 'Low (L)', value: 'low' }, { label: 'High (H)', value: 'high' }] },
      { key: 'ui', label: 'User Interaction', type: 'select', options: [{ label: 'None (N)', value: '0.85' }, { label: 'Required (R)', value: '0.62' }] },
      { key: 'ci', label: 'Confidentiality Impact', type: 'select', options: [{ label: 'None (N)', value: '0' }, { label: 'Low (L)', value: '0.22' }, { label: 'High (H)', value: '0.56' }] },
      { key: 'ii', label: 'Integrity Impact', type: 'select', options: [{ label: 'None (N)', value: '0' }, { label: 'Low (L)', value: '0.22' }, { label: 'High (H)', value: '0.56' }] },
      { key: 'ai', label: 'Availability Impact', type: 'select', options: [{ label: 'None (N)', value: '0' }, { label: 'Low (L)', value: '0.22' }, { label: 'High (H)', value: '0.56' }] },
    ],
    example: { av: '0.85', ac: '0.77', scope: 'U', pr: 'none', ui: '0.85', ci: '0.56', ii: '0.56', ai: '0.56' },
    related: ['cyber-risk-score', 'incident-severity'],
    tags: ['cvss', 'vulnerability', 'cybersecurity', 'risk scoring', 'severity'],
    calculate: values => {
      const av = num(values, 'av'), ac = num(values, 'ac'), ui = num(values, 'ui');
      const scope = values.scope || 'U';
      const prMap: Record<string, [number, number]> = { none: [0.85, 0.85], low: [0.62, 0.50], high: [0.27, 0.08] };
      const pr = (prMap[values.pr || 'none'] ?? prMap.none)[scope === 'U' ? 0 : 1];
      const ci = num(values, 'ci'), ii = num(values, 'ii'), ai = num(values, 'ai');
      const iss = 1 - (1 - ci) * (1 - ii) * (1 - ai);
      const exploit = 8.22 * av * ac * pr * ui;
      let impact: number;
      if (scope === 'U') {
        impact = 6.42 * iss;
      } else {
        impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
      }
      let base: number;
      if (impact <= 0) {
        base = 0;
      } else if (scope === 'U') {
        base = Math.ceil(Math.min(impact + exploit, 10) * 10) / 10;
      } else {
        base = Math.ceil(Math.min(1.08 * (impact + exploit), 10) * 10) / 10;
      }
      const severity = base === 0 ? 'None' : base < 4 ? 'Low' : base < 7 ? 'Medium' : base < 9 ? 'High' : 'Critical';
      const remediation = severity === 'Critical' || severity === 'High' ? 'Prioritise immediate remediation.' : severity === 'Medium' ? 'Schedule remediation within 30 days.' : 'Address in routine maintenance cycle.';
      const avLabel = av === 0.85 ? 'Network' : av === 0.62 ? 'Adjacent' : av === 0.55 ? 'Local' : 'Physical';
      return {
        summary: [
          { label: 'CVSS 3.1 Base Score', value: base.toFixed(1), highlight: true },
          { label: 'Severity', value: severity },
          { label: 'Impact Subscore', value: impact.toFixed(2) },
          { label: 'Exploitability Subscore', value: exploit.toFixed(2) },
        ],
        interpretation: `CVSS 3.1 Base Score ${base.toFixed(1)} — ${severity}. ${remediation}`,
        steps: [
          `ISS = 1 − (1−${ci})(1−${ii})(1−${ai}) = ${iss.toFixed(4)}`,
          scope === 'U'
            ? `Impact (Scope Unchanged) = 6.42 × ${iss.toFixed(4)} = ${impact.toFixed(4)}`
            : `Impact (Scope Changed) = 7.52×(ISS−0.029) − 3.25×(ISS−0.02)^15 = ${impact.toFixed(4)}`,
          `Exploitability = 8.22 × ${av} × ${ac} × ${pr} × ${ui} = ${exploit.toFixed(4)}`,
          scope === 'U'
            ? `Base = Roundup(min(${impact.toFixed(2)} + ${exploit.toFixed(2)}, 10)) = ${base.toFixed(1)}`
            : `Base = Roundup(min(1.08 × (${impact.toFixed(2)} + ${exploit.toFixed(2)}), 10)) = ${base.toFixed(1)}`,
        ],
        academicText: `CVSS 3.1 Base Score: ${base.toFixed(1)} (${severity}). Attack Vector: ${avLabel}, Scope: ${scope === 'U' ? 'Unchanged' : 'Changed'}, Impact Subscore: ${impact.toFixed(2)}, Exploitability Subscore: ${exploit.toFixed(2)}.`,
      };
    },
  },
];

export function getCybersecurityCalculator(idOrSlug?: string) {
  return cybersecurityCalculators.find(calculator => calculator.id === idOrSlug);
}

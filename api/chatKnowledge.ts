interface CalcEntry {
  name: string;
  path: string;
  category: string;
  description: string;
  tags: string[];
}

const CALCULATORS: CalcEntry[] = [
  // ── Research Methodology ──────────────────────────────────────────────────
  { name: 'Sample Size Calculator', path: '/calculators/sample-size', category: 'Research Methodology', description: 'Calculate the minimum sample size for your survey or study based on confidence level, margin of error, and population size.', tags: ['sample size', 'survey', 'research design', 'confidence', 'margin of error', 'participants', 'how many'] },
  { name: 'Margin of Error Calculator', path: '/calculators/margin-of-error', category: 'Research Methodology', description: 'Calculate the margin of error for your survey results given sample size, confidence level, and population proportion.', tags: ['margin of error', 'survey', 'precision', 'confidence interval', 'statistics'] },
  { name: 'Survey Response Rate Calculator', path: '/calculators/survey-response-rate', category: 'Research Methodology', description: 'Calculate the response rate for your survey and assess whether it meets acceptable thresholds.', tags: ['survey', 'response rate', 'non-response bias', 'methodology', 'data quality'] },
  { name: 'Likert Scale Mean Calculator', path: '/calculators/likert-scale', category: 'Research Methodology', description: 'Calculate mean scores, standard deviations, and interpret Likert scale survey responses.', tags: ['Likert', 'survey', 'questionnaire', 'mean', 'scale', 'social science', 'Likert scale'] },
  { name: 'Weighted Scoring Calculator', path: '/calculators/weighted-scoring', category: 'Research Methodology', description: 'Calculate weighted scores for criteria, options, or alternatives using customizable weights and scores.', tags: ['weighted average', 'multi-criteria', 'decision making', 'scoring', 'evaluation'] },
  { name: 'Qualitative Thematic Analysis Tool', path: '/calculators/qualitative-thematic-analysis', category: 'Research Methodology', description: 'AI-assisted guided thematic analysis for qualitative interview, focus group, and open-ended survey data.', tags: ['qualitative', 'thematic analysis', 'interview', 'focus group', 'coding', 'open-ended', 'NVivo', 'Braun Clarke'] },

  // ── Reliability & Validity ────────────────────────────────────────────────
  { name: "Cohen's Kappa Calculator", path: '/calculators/cohens-kappa', category: 'Reliability & Validity', description: "Calculate Cohen's Kappa to measure inter-rater reliability between two raters, correcting for chance agreement.", tags: ['Cohen kappa', 'inter-rater reliability', 'two coders', 'two raters', 'coding', 'agreement', 'coder reliability'] },
  { name: "Fleiss' Kappa Calculator", path: '/calculators/fleiss-kappa', category: 'Reliability & Validity', description: "Calculate Fleiss' Kappa for inter-rater reliability among three or more raters across multiple categories.", tags: ['Fleiss kappa', 'inter-rater reliability', 'multiple raters', 'three coders', 'agreement', 'coding'] },
  { name: "Cronbach's Alpha Calculator", path: '/calculators/cronbach-alpha', category: 'Reliability & Validity', description: "Calculate Cronbach's Alpha to assess the internal consistency reliability of a multi-item scale or questionnaire.", tags: ["Cronbach's alpha", 'internal consistency', 'reliability', 'scale', 'questionnaire', 'psychometrics', 'survey reliability'] },
  { name: 'Inter-Coder Agreement Calculator', path: '/calculators/inter-coder-agreement', category: 'Reliability & Validity', description: 'Calculate percentage inter-coder agreement between two coders for qualitative content analysis.', tags: ['inter-coder agreement', 'content analysis', 'coding', 'qualitative', 'reliability', 'percentage agreement'] },

  // ── Statistics ────────────────────────────────────────────────────────────
  { name: 'Mean, Median & Mode Calculator', path: '/calculators/mean-median-mode', category: 'Statistics', description: 'Calculate mean, median, mode, range, and other descriptive statistics for your dataset.', tags: ['mean', 'median', 'mode', 'descriptive statistics', 'central tendency', 'average', 'range'] },
  { name: 'Standard Deviation Calculator', path: '/calculators/standard-deviation', category: 'Statistics', description: 'Calculate population or sample standard deviation and variance from your dataset.', tags: ['standard deviation', 'variance', 'spread', 'statistics', 'variability', 'SD'] },
  { name: 'Variance Calculator', path: '/calculators/variance', category: 'Statistics', description: 'Calculate population or sample variance and understand the spread of your data.', tags: ['variance', 'standard deviation', 'statistics', 'spread', 'ANOVA'] },
  { name: 'Z-Score Calculator', path: '/calculators/z-score', category: 'Statistics', description: 'Calculate z-scores to standardize values and determine how many standard deviations a data point is from the mean.', tags: ['z-score', 'standardization', 'normal distribution', 'outlier', 'statistics', 'standardise'] },
  { name: 'Confidence Interval Calculator', path: '/calculators/confidence-interval', category: 'Statistics', description: 'Calculate confidence intervals for population means using z-distribution or t-distribution.', tags: ['confidence interval', 'interval estimation', 'statistics', 'uncertainty', 'hypothesis testing', 'CI'] },
  { name: 'Correlation Calculator (Pearson r)', path: '/calculators/correlation', category: 'Statistics', description: 'Calculate Pearson correlation coefficient to measure the strength and direction of linear relationships between two variables.', tags: ['correlation', 'Pearson r', 'linear relationship', 'statistics', 'regression', 'association', 'relationship between variables'] },

  // ── Social Science & Decision Tools ──────────────────────────────────────
  { name: 'Risk Matrix Calculator', path: '/calculators/risk-matrix', category: 'Social Science & Decision Tools', description: 'Assess and prioritize project or research risks using a 5×5 likelihood-impact matrix.', tags: ['risk matrix', 'risk assessment', 'project management', 'likelihood', 'impact', 'decision making'] },
  { name: 'Stakeholder Priority Matrix', path: '/calculators/stakeholder-matrix', category: 'Social Science & Decision Tools', description: 'Map stakeholders on a Power-Interest grid to determine engagement strategies.', tags: ['stakeholder', 'power interest', 'engagement', 'management', 'social science', 'stakeholder analysis'] },
  { name: 'AHP Weight Calculator', path: '/calculators/ahp-weight', category: 'Social Science & Decision Tools', description: 'Calculate Analytic Hierarchy Process (AHP) weights for multi-criteria decision making, with consistency check.', tags: ['AHP', 'analytic hierarchy process', 'pairwise comparison', 'weights', 'MCDM', 'decision making', 'criteria weights'] },
  { name: 'Delphi Consensus Calculator', path: '/calculators/delphi-consensus', category: 'Social Science & Decision Tools', description: 'Measure expert consensus in Delphi studies using IQR, CV, and mean score analysis across rounds.', tags: ['Delphi', 'consensus', 'expert panel', 'IQR', 'CV', 'qualitative research', 'mixed methods'] },
  { name: 'Maturity Model Score Calculator', path: '/calculators/maturity-model', category: 'Social Science & Decision Tools', description: 'Calculate overall and domain-level maturity scores across a 0–4 maturity scale with optional domain weighting.', tags: ['maturity model', 'capability maturity', 'CMM', 'assessment', 'scoring', 'organizational'] },
  { name: 'Decision Matrix Calculator', path: '/calculators/decision-matrix', category: 'Social Science & Decision Tools', description: 'Compare options across weighted criteria and identify the best ranked alternative.', tags: ['decision matrix', 'weighted decision', 'multi-criteria', 'ranking', 'options', 'decision making'] },
  { name: 'Capability Score Calculator', path: '/calculators/capability-score', category: 'Social Science & Decision Tools', description: 'Score capability areas with optional weights to identify strengths and weak areas.', tags: ['capability', 'maturity', 'scoring', 'organisational capability', 'strengths', 'weak areas', 'governance'] },
  { name: 'Governance Readiness Calculator', path: '/calculators/governance-readiness', category: 'Social Science & Decision Tools', description: 'Assess governance readiness across policy, leadership, resources, monitoring, and accountability.', tags: ['governance', 'readiness', 'policy', 'leadership', 'accountability', 'public policy', 'institutional'] },
  { name: 'Cybersecurity Maturity Mini Calculator', path: '/calculators/cybersecurity-maturity-mini', category: 'Social Science & Decision Tools', description: 'Assess cybersecurity maturity across governance, risk, protection, detection, response, and recovery.', tags: ['cybersecurity', 'maturity', 'risk management', 'incident response', 'AI oversight', 'cyber governance'] },
  { name: 'AI Governance Readiness Calculator', path: '/calculators/ai-governance-readiness', category: 'Social Science & Decision Tools', description: 'Assess AI governance readiness across policy, oversight, data, transparency, accountability, and risk monitoring.', tags: ['AI governance', 'readiness', 'AI policy', 'human oversight', 'data governance', 'risk monitoring', 'AI adoption'] },

  // ── Math Calculators ──────────────────────────────────────────────────────
  { name: 'Percentage Calculator', path: '/calculators/percentage-calculator', category: 'Math Calculators', description: 'Calculate what percentage one number is of another.', tags: ['percentage', 'percent', 'math', 'school', 'student', 'formula'] },
  { name: 'Fraction Calculator', path: '/calculators/fraction-calculator', category: 'Math Calculators', description: 'Add, subtract, multiply, or divide two fractions.', tags: ['fraction', 'numerator', 'denominator', 'math', 'school', 'student'] },
  { name: 'Ratio Calculator', path: '/calculators/ratio-calculator', category: 'Math Calculators', description: 'Simplify a two-part ratio using the greatest common divisor.', tags: ['ratio', 'simplify', 'math', 'school', 'student'] },
  { name: 'Average Calculator', path: '/calculators/average-calculator', category: 'Math Calculators', description: 'Calculate an average from up to five values.', tags: ['average', 'mean', 'math', 'school', 'student'] },
  { name: 'Area Calculator', path: '/calculators/area-calculator', category: 'Math Calculators', description: 'Calculate rectangle, triangle, or circle area.', tags: ['area', 'geometry', 'rectangle', 'triangle', 'circle', 'math', 'school'] },
  { name: 'Volume Calculator', path: '/calculators/volume-calculator', category: 'Math Calculators', description: 'Calculate cube, cylinder, or sphere volume.', tags: ['volume', 'geometry', 'cube', 'cylinder', 'sphere', 'math', 'school'] },
  { name: 'Algebra Equation Solver', path: '/calculators/algebra-solver', category: 'Math Calculators', description: 'Solve linear equations of the form ax + b = c for x.', tags: ['algebra', 'linear equation', 'solve for x', 'math', 'school', 'student'] },
  { name: 'Quadratic Equation Calculator', path: '/calculators/quadratic-equation', category: 'Math Calculators', description: 'Solve ax² + bx + c = 0 using the quadratic formula.', tags: ['quadratic', 'equation', 'roots', 'discriminant', 'math', 'school', 'student'] },
  { name: 'Unit Converter', path: '/calculators/unit-converter', category: 'Math Calculators', description: 'Convert common length units: meters, feet, kilometers, miles.', tags: ['unit conversion', 'length', 'meters', 'feet', 'kilometers', 'miles', 'convert'] },
  { name: '2×2 Matrix Calculator', path: '/calculators/matrix-calculator', category: 'Math Calculators', description: 'Compute determinant, trace, inverse, and transpose of a 2×2 matrix.', tags: ['matrix', 'determinant', 'inverse', 'transpose', 'linear algebra', 'math'] },
  { name: 'Polynomial Derivative Calculator', path: '/calculators/derivative-calculator', category: 'Math Calculators', description: 'Differentiate a polynomial of up to four terms and evaluate the derivative at a given x.', tags: ['derivative', 'calculus', 'polynomial', 'differentiation', 'power rule', 'math'] },

  // ── Physics Calculators ───────────────────────────────────────────────────
  { name: 'Speed-Distance-Time Calculator', path: '/calculators/speed-distance-time', category: 'Physics Calculators', description: 'Calculate speed from distance and time.', tags: ['speed', 'distance', 'time', 'physics', 'mechanics', 'velocity', 'school'] },
  { name: 'Force Calculator', path: '/calculators/force-calculator', category: 'Physics Calculators', description: "Calculate force using Newton's second law (F = ma).", tags: ['force', 'mass', 'acceleration', "Newton's law", 'physics', 'school'] },
  { name: 'Work Calculator', path: '/calculators/work-calculator', category: 'Physics Calculators', description: 'Calculate work done by a force over a distance (W = Fd).', tags: ['work', 'force', 'distance', 'joules', 'physics', 'energy', 'school'] },
  { name: 'Power Calculator', path: '/calculators/power-calculator', category: 'Physics Calculators', description: 'Calculate power from work and time (P = W/t).', tags: ['power', 'work', 'time', 'watts', 'physics', 'school'] },
  { name: 'Kinetic Energy Calculator', path: '/calculators/kinetic-energy-calculator', category: 'Physics Calculators', description: 'Calculate kinetic energy from mass and velocity (KE = ½mv²).', tags: ['kinetic energy', 'mass', 'velocity', 'joules', 'physics', 'school'] },
  { name: 'Density Calculator', path: '/calculators/density-calculator', category: 'Physics Calculators', description: 'Calculate density from mass and volume.', tags: ['density', 'mass', 'volume', 'physics', 'school'] },
  { name: "Ohm's Law Calculator", path: '/calculators/ohms-law', category: 'Physics Calculators', description: 'Calculate voltage from current and resistance (V = IR).', tags: ["Ohm's law", 'voltage', 'current', 'resistance', 'electricity', 'physics', 'school'] },
  { name: 'Pressure Calculator', path: '/calculators/pressure-calculator', category: 'Physics Calculators', description: 'Calculate pressure from force and area (P = F/A).', tags: ['pressure', 'force', 'area', 'pascals', 'physics', 'school'] },

  // ── Chemistry Calculators ─────────────────────────────────────────────────
  { name: 'Mole Calculator', path: '/calculators/mole-calculator', category: 'Chemistry Calculators', description: 'Calculate moles from mass and molar mass (n = mass / molar mass).', tags: ['moles', 'mass', 'molar mass', 'chemistry', 'lab', 'school'] },
  { name: 'Molar Mass Calculator', path: '/calculators/molar-mass', category: 'Chemistry Calculators', description: 'Estimate molar mass by summing element atomic mass contributions.', tags: ['molar mass', 'atomic mass', 'molecular weight', 'chemistry', 'lab', 'school'] },
  { name: 'Dilution Calculator', path: '/calculators/dilution-calculator', category: 'Chemistry Calculators', description: 'Calculate final concentration after dilution (C1V1 = C2V2).', tags: ['dilution', 'concentration', 'C1V1', 'chemistry', 'lab', 'school'] },
  { name: 'pH Calculator', path: '/calculators/ph-calculator', category: 'Chemistry Calculators', description: 'Calculate pH from hydrogen ion concentration (pH = -log[H+]).', tags: ['pH', 'hydrogen ion', 'acid', 'base', 'chemistry', 'lab', 'school'] },
  { name: 'Concentration Calculator', path: '/calculators/concentration-calculator', category: 'Chemistry Calculators', description: 'Calculate molar concentration from moles and volume (C = n/V).', tags: ['concentration', 'molarity', 'moles', 'volume', 'chemistry', 'lab', 'school'] },
  { name: 'Gas Law Calculator', path: '/calculators/gas-law-calculator', category: 'Chemistry Calculators', description: 'Calculate pressure using the ideal gas law (PV = nRT).', tags: ['ideal gas law', 'pressure', 'volume', 'temperature', 'moles', 'chemistry', 'school'] },

  // ── Biology & Health ──────────────────────────────────────────────────────
  { name: 'BMI Calculator', path: '/calculators/bmi-calculator', category: 'Biology & Health', description: 'Estimate body mass index from height and weight (BMI = kg / m²).', tags: ['BMI', 'body mass index', 'weight', 'height', 'health', 'wellness', 'obesity', 'underweight'] },
  { name: 'BMR Calculator', path: '/calculators/bmr-calculator', category: 'Biology & Health', description: 'Estimate basal metabolic rate using the Mifflin-St Jeor equation.', tags: ['BMR', 'basal metabolic rate', 'metabolism', 'calories', 'resting energy', 'health', 'wellness'] },
  { name: 'Calorie Calculator', path: '/calculators/calorie-calculator', category: 'Biology & Health', description: 'Estimate daily maintenance calories from BMR and activity level.', tags: ['calories', 'maintenance calories', 'activity level', 'diet', 'health', 'wellness', 'daily energy'] },
  { name: 'Water Intake Calculator', path: '/calculators/water-intake', category: 'Biology & Health', description: 'Estimate daily water intake from body weight and exercise time.', tags: ['water intake', 'hydration', 'daily water', 'health', 'wellness', 'fluid'] },
  { name: 'Relative Risk Calculator', path: '/calculators/relative-risk', category: 'Biology & Health', description: 'Estimate relative risk and number needed to treat from a 2×2 contingency table.', tags: ['relative risk', 'epidemiology', 'NNT', 'odds ratio', 'public health', '2x2 table', 'RR'] },
  { name: 'Hardy-Weinberg Calculator', path: '/calculators/hardy-weinberg', category: 'Biology & Health', description: 'Calculate allele and genotype frequencies under Hardy-Weinberg equilibrium.', tags: ['Hardy-Weinberg', 'allele frequency', 'genotype', 'genetics', 'biology', 'population genetics'] },

  // ── Finance Calculators ───────────────────────────────────────────────────
  { name: 'Simple Interest Calculator', path: '/calculators/simple-interest', category: 'Finance Calculators', description: 'Calculate interest earned or paid using a fixed principal, rate, and time.', tags: ['interest', 'savings', 'principal', 'rate', 'finance', 'money'] },
  { name: 'Compound Interest Calculator', path: '/calculators/compound-interest', category: 'Finance Calculators', description: 'Estimate growth when interest is compounded over time.', tags: ['compound interest', 'investment', 'savings', 'growth', 'finance', 'money'] },
  { name: 'Loan Calculator', path: '/calculators/loan-calculator', category: 'Finance Calculators', description: 'Estimate monthly loan payment from amount, interest rate, and term.', tags: ['loan', 'monthly payment', 'repayment', 'borrow', 'finance', 'mortgage'] },
  { name: 'EMI Calculator', path: '/calculators/emi-calculator', category: 'Finance Calculators', description: 'Calculate an equated monthly instalment for a loan.', tags: ['EMI', 'installment', 'loan payment', 'monthly', 'finance'] },
  { name: 'ROI Calculator', path: '/calculators/roi-calculator', category: 'Finance Calculators', description: 'Calculate return on investment from gain and cost.', tags: ['ROI', 'return on investment', 'profit', 'finance', 'investment'] },
  { name: 'Profit Margin Calculator', path: '/calculators/profit-margin', category: 'Finance Calculators', description: 'Find profit margin from revenue and cost.', tags: ['margin', 'profit', 'business', 'revenue', 'finance'] },
  { name: 'Break-Even Calculator', path: '/calculators/break-even', category: 'Finance Calculators', description: 'Estimate how many units must be sold to cover fixed and variable costs.', tags: ['break even', 'business', 'cost', 'sales', 'finance'] },
  { name: 'Loan Repayment Calculator', path: '/calculators/loan-repayment', category: 'Finance Calculators', description: 'Estimate monthly repayments and total interest using amortisation.', tags: ['loan repayment', 'amortisation', 'monthly payment', 'interest', 'finance'] },
  { name: 'Net Present Value Calculator', path: '/calculators/npv-calculator', category: 'Finance Calculators', description: 'Calculate NPV by discounting future cash flows back to the present.', tags: ['NPV', 'net present value', 'discounted cash flow', 'investment', 'finance'] },

  // ── Cybersecurity & AI Governance ─────────────────────────────────────────
  { name: 'Cyber Risk Score Calculator', path: '/calculators/cyber-risk-score', category: 'Cybersecurity & AI Governance', description: 'Estimate preliminary cyber risk from threat, vulnerability, asset value, impact, and control effectiveness.', tags: ['cyber risk', 'cybersecurity', 'threat', 'vulnerability', 'risk score', 'governance'] },
  { name: 'Incident Severity Calculator', path: '/calculators/incident-severity', category: 'Cybersecurity & AI Governance', description: 'Estimate incident severity and response urgency from sensitivity, scale, criticality, and impact.', tags: ['incident severity', 'incident response', 'cybersecurity', 'triage', 'governance'] },
  { name: 'Security Control Compliance Score Calculator', path: '/calculators/security-control-compliance', category: 'Cybersecurity & AI Governance', description: 'Score a control checklist using implemented, partial, not implemented, and not applicable statuses.', tags: ['security control', 'compliance', 'cybersecurity', 'checklist', 'governance'] },
  { name: 'AI Risk Assessment Calculator', path: '/calculators/ai-risk-assessment', category: 'Cybersecurity & AI Governance', description: 'Estimate AI system risk from data, transparency, oversight, bias, security, and operational impact factors.', tags: ['AI risk', 'AI assessment', 'governance', 'bias', 'security', 'AI oversight'] },
  { name: 'AI-Enabled Threat Detection Governance Calculator', path: '/calculators/ai-threat-detection-governance', category: 'Cybersecurity & AI Governance', description: 'Assess governance readiness for AI-enabled threat detection programs.', tags: ['AI threat detection', 'governance', 'cybersecurity', 'AI governance', 'readiness'] },
  { name: 'Password Strength Calculator', path: '/calculators/password-strength', category: 'Cybersecurity & AI Governance', description: 'Estimate password strength from length, character variety, and common weakness patterns.', tags: ['password', 'password strength', 'security', 'cybersecurity', 'password checker'] },
  { name: 'CVSS 3.1 Base Score Calculator', path: '/calculators/cvss-score', category: 'Cybersecurity & AI Governance', description: 'Calculate the CVSS 3.1 base vulnerability severity score from exploitability and impact metrics.', tags: ['CVSS', 'vulnerability', 'severity score', 'security', 'cybersecurity', 'CVE'] },

  // ── Education Calculators ─────────────────────────────────────────────────
  { name: 'GPA Calculator', path: '/calculators/gpa-calculator', category: 'Education Calculators', description: 'Calculate GPA from course grade points and credits.', tags: ['GPA', 'grade point average', 'grades', 'credits', 'student', 'university'] },
  { name: 'CGPA Calculator', path: '/calculators/cgpa-calculator', category: 'Education Calculators', description: 'Calculate cumulative GPA from semester GPAs and credits.', tags: ['CGPA', 'cumulative GPA', 'semester', 'grades', 'student', 'university'] },
  { name: 'Exam Percentage Calculator', path: '/calculators/exam-percentage', category: 'Education Calculators', description: 'Convert marks obtained into an exam percentage.', tags: ['exam', 'marks', 'percentage', 'score', 'student', 'school'] },
  { name: 'Attendance Calculator', path: '/calculators/attendance-calculator', category: 'Education Calculators', description: 'Check current attendance and estimate classes needed to reach a target percentage.', tags: ['attendance', 'class', 'target', 'student', 'school'] },
  { name: 'Grade Calculator', path: '/calculators/grade-calculator', category: 'Education Calculators', description: 'Convert a percentage score into a letter grade.', tags: ['grade', 'letter grade', 'score', 'marks', 'student', 'school'] },
  { name: 'Study Time Planner', path: '/calculators/study-time-planner', category: 'Education Calculators', description: 'Plan daily study time from topics, hours per topic, and days available.', tags: ['study plan', 'revision', 'exam prep', 'timetable', 'student', 'school'] },
  { name: 'Education Effect Size Calculator', path: '/calculators/effect-size-education', category: 'Education Calculators', description: "Calculate Cohen's d and Hedge's g to quantify the practical significance of an educational intervention.", tags: ["effect size", "Cohen's d", "Hedge's g", 'education research', 'intervention', 'learning outcomes'] },

  // ── Everyday Life ─────────────────────────────────────────────────────────
  { name: 'Age Calculator', path: '/calculators/age-calculator', category: 'Everyday Life', description: 'Calculate age in years and days from a date of birth.', tags: ['age', 'birthday', 'date of birth', 'years old', 'how old'] },
  { name: 'Date Difference Calculator', path: '/calculators/date-difference', category: 'Everyday Life', description: 'Find the number of days between two dates.', tags: ['date difference', 'days between dates', 'calendar', 'how many days'] },
  { name: 'Time Duration Calculator', path: '/calculators/time-duration', category: 'Everyday Life', description: 'Calculate elapsed time between two times on the same day.', tags: ['time duration', 'elapsed time', 'hours', 'minutes', 'how long'] },
  { name: 'Fuel Cost Calculator', path: '/calculators/fuel-cost', category: 'Everyday Life', description: 'Estimate trip fuel cost from distance, efficiency, and fuel price.', tags: ['fuel', 'petrol', 'trip cost', 'travel', 'km', 'gas'] },
  { name: 'Discount Calculator', path: '/calculators/discount-calculator', category: 'Everyday Life', description: 'Calculate sale price after a percentage discount.', tags: ['discount', 'sale', 'shopping', 'price off', 'savings'] },
  { name: 'Tip Calculator', path: '/calculators/tip-calculator', category: 'Everyday Life', description: 'Calculate tip amount and split a bill between people.', tags: ['tip', 'restaurant', 'split bill', 'gratuity', 'dining'] },
  { name: 'Cooking Measurement Converter', path: '/calculators/cooking-measurement-converter', category: 'Everyday Life', description: 'Convert common cooking measurements: cups, tablespoons, teaspoons, ounces.', tags: ['cooking', 'recipe', 'measurement', 'kitchen', 'cups', 'tablespoons', 'convert'] },
  { name: 'Password Entropy Calculator', path: '/calculators/password-entropy', category: 'Everyday Life', description: 'Estimate the information entropy of a password to assess its theoretical strength.', tags: ['password entropy', 'password bits', 'security', 'strength', 'H = L log2 C'] },

  // ── Tools ─────────────────────────────────────────────────────────────────
  { name: 'Data Upload Workspace', path: '/data-upload', category: 'Tools', description: 'Upload CSV or Excel datasets for analysis across calculators and Stat Analyzer Pro.', tags: ['upload', 'CSV', 'excel', 'xlsx', 'data import', 'dataset', 'file upload', 'upload data', 'import file'] },
  { name: 'Stat Analyzer Pro', path: '/stat-analyzer', category: 'Tools', description: 'Advanced statistical analysis on uploaded datasets — t-test, ANOVA, chi-square, Pearson correlation, regression, descriptive statistics, frequency tables, correlation matrix.', tags: ['stat analyzer', 't-test', 'ANOVA', 'chi-square', 'regression', 'correlation matrix', 'descriptive stats', 'hypothesis testing', 'compare groups', 'inferential statistics', 'advanced stats'] },
];

export function getCalculatorKnowledgeBase(): string {
  const byCategory = new Map<string, CalcEntry[]>();
  for (const calc of CALCULATORS) {
    const list = byCategory.get(calc.category) ?? [];
    list.push(calc);
    byCategory.set(calc.category, list);
  }

  const lines: string[] = ['All available calculators and tools on ResearchCalcHub:\n'];
  for (const [category, calcs] of byCategory) {
    lines.push(`[${category}]`);
    for (const calc of calcs) {
      lines.push(`- ${calc.name} (${calc.path}) — ${calc.description} Keywords: ${calc.tags.join(', ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function findCalculatorMatches(query: string, limit = 3): CalcEntry[] {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = CALCULATORS.map(calc => {
    const haystack = [calc.name, calc.description, calc.category, ...calc.tags].join(' ').toLowerCase();
    const score = terms.reduce((acc, term) => acc + (haystack.includes(term) ? 1 : 0), 0);
    return { calc, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.calc);
}

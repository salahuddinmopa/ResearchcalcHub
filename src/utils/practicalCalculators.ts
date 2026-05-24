export type PracticalCategory = 'finance' | 'education' | 'biology' | 'everyday';
export type PracticalFieldType = 'number' | 'select' | 'date' | 'time';

export interface PracticalField {
  key: string;
  label: string;
  unit?: string;
  type?: PracticalFieldType;
  options?: { label: string; value: string }[];
}

export interface PracticalCalculation {
  summary: { label: string; value: string; highlight?: boolean }[];
  interpretation: string;
  steps: string[];
  academicText: string;
}

export interface PracticalCalculatorConfig {
  id: string;
  title: string;
  category: PracticalCategory;
  explanation: string;
  formula: string;
  fields: PracticalField[];
  example: Record<string, string>;
  related: string[];
  tags: string[];
  calculate: (values: Record<string, string>) => PracticalCalculation;
}

function required(values: Record<string, string>, key: string) {
  const raw = values[key];
  if (raw === undefined || raw.trim() === '') throw new Error('Please complete all required fields.');
  return raw;
}

function num(values: Record<string, string>, key: string) {
  const value = Number(required(values, key));
  if (!Number.isFinite(value)) throw new Error('Please enter valid numbers.');
  return value;
}

function positive(value: number, label: string) {
  if (value <= 0) throw new Error(`${label} must be greater than 0.`);
}

function dateValue(values: Record<string, string>, key: string) {
  const date = new Date(required(values, key));
  if (Number.isNaN(date.getTime())) throw new Error('Please enter valid dates.');
  return date;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits)).toString();
}

function pct(value: number) {
  return `${round(value, 2)}%`;
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((end.getTime() - start.getTime()) / 86400000);
}

export const practicalCalculators: PracticalCalculatorConfig[] = [
  {
    id: 'simple-interest',
    title: 'Simple Interest Calculator',
    category: 'finance',
    explanation: 'Calculate interest earned or paid using a fixed principal, rate, and time.',
    formula: 'Interest = principal x rate x time / 100',
    fields: [{ key: 'principal', label: 'Principal', unit: '$' }, { key: 'rate', label: 'Annual Rate', unit: '%' }, { key: 'time', label: 'Time', unit: 'years' }],
    example: { principal: '1000', rate: '5', time: '3' },
    related: ['compound-interest', 'loan-calculator'],
    tags: ['interest', 'savings', 'principal', 'rate'],
    calculate: values => {
      const p = num(values, 'principal'), r = num(values, 'rate'), t = num(values, 'time'); positive(p, 'Principal'); positive(t, 'Time');
      const interest = p * r * t / 100;
      return { summary: [{ label: 'Interest', value: money(interest), highlight: true }, { label: 'Final Amount', value: money(p + interest) }], interpretation: `You will earn or pay ${money(interest)} in simple interest.`, steps: [`Interest = ${p} x ${r}% x ${t}`, `Interest = ${money(interest)}`], academicText: `Simple interest was calculated as ${money(interest)}, giving a final amount of ${money(p + interest)}.` };
    },
  },
  {
    id: 'compound-interest',
    title: 'Compound Interest Calculator',
    category: 'finance',
    explanation: 'Estimate growth when interest is added back to the balance over time.',
    formula: 'A = P(1 + r/n)^(nt)',
    fields: [{ key: 'principal', label: 'Principal', unit: '$' }, { key: 'rate', label: 'Annual Rate', unit: '%' }, { key: 'time', label: 'Time', unit: 'years' }, { key: 'frequency', label: 'Compounds per Year' }],
    example: { principal: '1000', rate: '6', time: '5', frequency: '12' },
    related: ['simple-interest', 'roi-calculator'],
    tags: ['compound', 'investment', 'savings', 'growth'],
    calculate: values => {
      const p = num(values, 'principal'), r = num(values, 'rate') / 100, t = num(values, 'time'), n = num(values, 'frequency'); positive(p, 'Principal'); positive(t, 'Time'); positive(n, 'Frequency');
      const amount = p * (1 + r / n) ** (n * t);
      return { summary: [{ label: 'Final Amount', value: money(amount), highlight: true }, { label: 'Interest Earned', value: money(amount - p) }], interpretation: `The balance grows to ${money(amount)}.`, steps: [`A = ${p}(1 + ${round(r / n, 6)})^(${n * t})`, `A = ${money(amount)}`], academicText: `Compound interest produced a final amount of ${money(amount)} after ${t} year(s).` };
    },
  },
  {
    id: 'loan-calculator',
    title: 'Loan Calculator',
    category: 'finance',
    explanation: 'Estimate a monthly loan payment from amount, interest rate, and term.',
    formula: 'Payment = P x i(1+i)^n / ((1+i)^n - 1)',
    fields: [{ key: 'amount', label: 'Loan Amount', unit: '$' }, { key: 'rate', label: 'Annual Rate', unit: '%' }, { key: 'years', label: 'Loan Term', unit: 'years' }],
    example: { amount: '25000', rate: '7', years: '5' },
    related: ['emi-calculator', 'simple-interest'],
    tags: ['loan', 'monthly payment', 'repayment', 'borrow'],
    calculate: values => {
      const p = num(values, 'amount'), annual = num(values, 'rate'), years = num(values, 'years'); positive(p, 'Loan amount'); positive(years, 'Loan term');
      const n = years * 12, i = annual / 100 / 12;
      const payment = i === 0 ? p / n : p * i * (1 + i) ** n / ((1 + i) ** n - 1);
      return { summary: [{ label: 'Monthly Payment', value: money(payment), highlight: true }, { label: 'Total Paid', value: money(payment * n) }, { label: 'Total Interest', value: money(payment * n - p) }], interpretation: `Estimated monthly payment is ${money(payment)}.`, steps: [`Monthly rate = ${round(i * 100, 4)}%`, `Payment = ${money(payment)}`], academicText: `The loan payment estimate is ${money(payment)} per month for ${n} months.` };
    },
  },
  {
    id: 'emi-calculator',
    title: 'EMI Calculator',
    category: 'finance',
    explanation: 'Calculate an equated monthly instalment for a loan.',
    formula: 'EMI = P x r x (1+r)^n / ((1+r)^n - 1)',
    fields: [{ key: 'principal', label: 'Principal', unit: '$' }, { key: 'rate', label: 'Annual Rate', unit: '%' }, { key: 'months', label: 'Term', unit: 'months' }],
    example: { principal: '12000', rate: '8', months: '36' },
    related: ['loan-calculator', 'roi-calculator'],
    tags: ['emi', 'installment', 'loan payment', 'monthly'],
    calculate: values => {
      const p = num(values, 'principal'), r = num(values, 'rate') / 100 / 12, n = num(values, 'months'); positive(p, 'Principal'); positive(n, 'Term');
      const emi = r === 0 ? p / n : p * r * (1 + r) ** n / ((1 + r) ** n - 1);
      return { summary: [{ label: 'EMI', value: money(emi), highlight: true }, { label: 'Total Payment', value: money(emi * n) }], interpretation: `Your estimated EMI is ${money(emi)}.`, steps: [`Monthly rate = ${round(r * 100, 4)}%`, `EMI = ${money(emi)}`], academicText: `The equated monthly instalment was estimated as ${money(emi)}.` };
    },
  },
  {
    id: 'roi-calculator',
    title: 'ROI Calculator',
    category: 'finance',
    explanation: 'Calculate return on investment from gain and cost.',
    formula: 'ROI = (gain - cost) / cost x 100',
    fields: [{ key: 'gain', label: 'Final Value / Gain', unit: '$' }, { key: 'cost', label: 'Initial Cost', unit: '$' }],
    example: { gain: '1400', cost: '1000' },
    related: ['profit-margin', 'compound-interest'],
    tags: ['roi', 'return', 'investment', 'profit'],
    calculate: values => {
      const gain = num(values, 'gain'), cost = num(values, 'cost'); positive(cost, 'Cost');
      const roi = (gain - cost) / cost * 100;
      return { summary: [{ label: 'ROI', value: pct(roi), highlight: true }, { label: 'Net Return', value: money(gain - cost) }], interpretation: roi >= 0 ? 'The investment produced a positive return.' : 'The investment produced a loss.', steps: [`ROI = (${gain} - ${cost}) / ${cost} x 100`, `ROI = ${pct(roi)}`], academicText: `Return on investment was ${pct(roi)}.` };
    },
  },
  {
    id: 'profit-margin',
    title: 'Profit Margin Calculator',
    category: 'finance',
    explanation: 'Find profit margin from revenue and cost.',
    formula: 'Margin = (revenue - cost) / revenue x 100',
    fields: [{ key: 'revenue', label: 'Revenue', unit: '$' }, { key: 'cost', label: 'Cost', unit: '$' }],
    example: { revenue: '5000', cost: '3500' },
    related: ['roi-calculator', 'break-even'],
    tags: ['margin', 'profit', 'business', 'revenue'],
    calculate: values => {
      const revenue = num(values, 'revenue'), cost = num(values, 'cost'); positive(revenue, 'Revenue');
      const profit = revenue - cost, margin = profit / revenue * 100;
      return { summary: [{ label: 'Profit Margin', value: pct(margin), highlight: true }, { label: 'Profit', value: money(profit) }], interpretation: `Profit margin is ${pct(margin)}.`, steps: [`Profit = ${revenue} - ${cost} = ${profit}`, `Margin = ${pct(margin)}`], academicText: `The profit margin was ${pct(margin)}.` };
    },
  },
  {
    id: 'break-even',
    title: 'Break-Even Calculator',
    category: 'finance',
    explanation: 'Estimate how many units must be sold to cover fixed and variable costs.',
    formula: 'Break-even units = fixed costs / (price - variable cost)',
    fields: [{ key: 'fixed', label: 'Fixed Costs', unit: '$' }, { key: 'price', label: 'Price per Unit', unit: '$' }, { key: 'variable', label: 'Variable Cost per Unit', unit: '$' }],
    example: { fixed: '10000', price: '50', variable: '30' },
    related: ['profit-margin', 'roi-calculator'],
    tags: ['break even', 'business', 'cost', 'sales'],
    calculate: values => {
      const fixed = num(values, 'fixed'), price = num(values, 'price'), variable = num(values, 'variable'); const contribution = price - variable; positive(contribution, 'Contribution margin');
      const units = Math.ceil(fixed / contribution);
      return { summary: [{ label: 'Break-Even Units', value: units.toLocaleString(), highlight: true }, { label: 'Contribution per Unit', value: money(contribution) }], interpretation: `You need to sell about ${units.toLocaleString()} units to break even.`, steps: [`Contribution = ${price} - ${variable} = ${contribution}`, `Units = ${fixed} / ${contribution} = ${units}`], academicText: `The break-even point was estimated at ${units.toLocaleString()} units.` };
    },
  },
  {
    id: 'loan-repayment',
    title: 'Loan Repayment Calculator',
    category: 'finance',
    explanation: 'Estimate monthly repayments and total interest for a loan using amortisation.',
    formula: 'Payment = P × r(1+r)^n / ((1+r)^n − 1)',
    fields: [
      { key: 'principal', label: 'Loan Amount', unit: '$' },
      { key: 'rate', label: 'Annual Interest Rate', unit: '%' },
      { key: 'years', label: 'Loan Term', unit: 'years' },
    ],
    example: { principal: '20000', rate: '6.5', years: '4' },
    related: ['loan-calculator', 'compound-interest', 'npv-calculator'],
    tags: ['loan', 'repayment', 'amortisation', 'monthly payment', 'interest'],
    calculate: values => {
      const p = num(values, 'principal'), annual = num(values, 'rate'), years = num(values, 'years');
      positive(p, 'Loan amount'); positive(years, 'Loan term');
      const n = Math.round(years * 12), r = annual / 100 / 12;
      const payment = r === 0 ? p / n : p * r * (1 + r) ** n / ((1 + r) ** n - 1);
      const totalPaid = payment * n, totalInterest = totalPaid - p;
      const interestPct = totalInterest / p * 100;
      return {
        summary: [
          { label: 'Monthly Payment', value: money(payment), highlight: true },
          { label: 'Total Paid', value: money(totalPaid) },
          { label: 'Total Interest', value: money(totalInterest) },
          { label: 'Interest as % of Principal', value: pct(interestPct) },
        ],
        interpretation: `Monthly repayment is ${money(payment)}, with ${money(totalInterest)} paid in interest over ${n} months.`,
        steps: [
          `Monthly rate r = ${annual}% / 12 = ${round(r * 100, 4)}%`,
          `Payments n = ${years} × 12 = ${n}`,
          `Payment = ${p} × ${round(r, 6)} × (1 + ${round(r, 6)})^${n} / ((1 + ${round(r, 6)})^${n} − 1)`,
          `Payment = ${money(payment)}`,
          `Total paid = ${money(payment)} × ${n} = ${money(totalPaid)}`,
          `Total interest = ${money(totalPaid)} − ${money(p)} = ${money(totalInterest)}`,
        ],
        academicText: `A loan of ${money(p)} at ${round(annual, 2)}% p.a. over ${years} year(s) requires monthly repayments of ${money(payment)}, with total interest of ${money(totalInterest)}.`,
      };
    },
  },
  {
    id: 'npv-calculator',
    title: 'Net Present Value Calculator',
    category: 'finance',
    explanation: 'Calculate NPV by discounting future cash flows back to the present.',
    formula: 'NPV = Σ Ct / (1 + r)^t − C₀',
    fields: [
      { key: 'initial', label: 'Initial Investment', unit: '$' },
      { key: 'rate', label: 'Discount Rate', unit: '%' },
      { key: 'cf1', label: 'Cash Flow Year 1', unit: '$' },
      { key: 'cf2', label: 'Cash Flow Year 2', unit: '$' },
      { key: 'cf3', label: 'Cash Flow Year 3', unit: '$' },
      { key: 'cf4', label: 'Cash Flow Year 4 (optional)', unit: '$' },
      { key: 'cf5', label: 'Cash Flow Year 5 (optional)', unit: '$' },
    ],
    example: { initial: '10000', rate: '8', cf1: '3000', cf2: '4000', cf3: '5000', cf4: '', cf5: '' },
    related: ['roi-calculator', 'compound-interest', 'loan-repayment'],
    tags: ['npv', 'net present value', 'discounted cash flow', 'investment', 'finance'],
    calculate: values => {
      const c0 = num(values, 'initial'), r = num(values, 'rate') / 100;
      positive(c0, 'Initial investment');
      const cfs = [values.cf1, values.cf2, values.cf3, values.cf4, values.cf5]
        .map((v, i) => ({ t: i + 1, v: v?.trim() }))
        .filter(x => x.v !== '' && x.v !== undefined)
        .map(x => ({ t: x.t, cf: Number(x.v) }));
      if (cfs.length === 0 || cfs.some(x => !Number.isFinite(x.cf))) throw new Error('Enter at least one valid cash flow.');
      const pvs = cfs.map(({ t, cf }) => ({ t, cf, pv: cf / (1 + r) ** t }));
      const totalPV = pvs.reduce((s, x) => s + x.pv, 0);
      const npv = totalPV - c0;
      return {
        summary: [
          { label: 'NPV', value: money(npv), highlight: true },
          { label: 'Total PV of Cash Flows', value: money(totalPV) },
          { label: 'Decision', value: npv >= 0 ? 'Accept (NPV ≥ 0)' : 'Reject (NPV < 0)' },
        ],
        interpretation: npv >= 0
          ? `NPV is ${money(npv)}, suggesting the investment adds value at the given discount rate.`
          : `NPV is ${money(npv)}, suggesting the investment destroys value at the given discount rate.`,
        steps: [
          ...pvs.map(({ t, cf, pv }) => `PV Year ${t} = ${money(cf)} / (1 + ${r})^${t} = ${money(pv)}`),
          `Total PV = ${money(totalPV)}`,
          `NPV = ${money(totalPV)} − ${money(c0)} = ${money(npv)}`,
        ],
        academicText: `The net present value at a ${round(r * 100, 2)}% discount rate is ${money(npv)}, indicating the project ${npv >= 0 ? 'creates' : 'destroys'} value.`,
      };
    },
  },
  {
    id: 'relative-risk',
    title: 'Relative Risk Calculator',
    category: 'biology',
    explanation: 'Estimate relative risk and number needed to treat from a 2×2 contingency table.',
    formula: 'RR = [a/(a+b)] / [c/(c+d)]',
    fields: [
      { key: 'a', label: 'Exposed & Outcome (a)' },
      { key: 'b', label: 'Exposed & No Outcome (b)' },
      { key: 'c', label: 'Unexposed & Outcome (c)' },
      { key: 'd', label: 'Unexposed & No Outcome (d)' },
    ],
    example: { a: '30', b: '70', c: '10', d: '90' },
    related: ['hardy-weinberg', 'bmi-calculator'],
    tags: ['relative risk', 'epidemiology', 'NNT', 'odds ratio', 'public health', '2x2 table'],
    calculate: values => {
      const a = num(values, 'a'), b = num(values, 'b'), c = num(values, 'c'), d = num(values, 'd');
      if ([a, b, c, d].some(v => v < 0)) throw new Error('Cell counts cannot be negative.');
      const exposed = a + b, unexposed = c + d;
      positive(exposed, 'Exposed group total'); positive(unexposed, 'Unexposed group total');
      const rExp = a / exposed, rUnexp = c / unexposed;
      if (rUnexp === 0) throw new Error('Unexposed risk is zero — RR undefined.');
      const rr = rExp / rUnexp;
      const arr = Math.abs(rExp - rUnexp);
      const nnt = arr === 0 ? Infinity : 1 / arr;
      const rrLabel = rr > 1 ? 'Increased risk in exposed group.' : rr < 1 ? 'Decreased risk (protective).' : 'No difference in risk.';
      return {
        summary: [
          { label: 'Relative Risk (RR)', value: round(rr, 4), highlight: true },
          { label: 'Risk (Exposed)', value: pct(rExp * 100) },
          { label: 'Risk (Unexposed)', value: pct(rUnexp * 100) },
          { label: 'Absolute Risk Reduction', value: pct(arr * 100) },
          { label: 'Number Needed to Treat', value: nnt === Infinity ? '∞' : round(nnt, 1) },
        ],
        interpretation: `RR = ${round(rr, 4)}. ${rrLabel}`,
        steps: [
          `Risk (exposed) = ${a} / (${a} + ${b}) = ${pct(rExp * 100)}`,
          `Risk (unexposed) = ${c} / (${c} + ${d}) = ${pct(rUnexp * 100)}`,
          `RR = ${pct(rExp * 100)} / ${pct(rUnexp * 100)} = ${round(rr, 4)}`,
          `ARR = |${pct(rExp * 100)} − ${pct(rUnexp * 100)}| = ${pct(arr * 100)}`,
          `NNT = 1 / ${pct(arr * 100)} = ${nnt === Infinity ? '∞' : round(nnt, 1)}`,
        ],
        academicText: `The relative risk was ${round(rr, 4)} (exposed risk ${pct(rExp * 100)}, unexposed risk ${pct(rUnexp * 100)}), with an absolute risk reduction of ${pct(arr * 100)} and NNT of ${nnt === Infinity ? '∞' : round(nnt, 1)}.`,
      };
    },
  },
  {
    id: 'hardy-weinberg',
    title: 'Hardy-Weinberg Calculator',
    category: 'biology',
    explanation: 'Calculate allele and genotype frequencies under Hardy-Weinberg equilibrium.',
    formula: 'p + q = 1  |  p² + 2pq + q² = 1',
    fields: [
      {
        key: 'input', label: 'Known Frequency', type: 'select',
        options: [{ label: 'Recessive allele (q)', value: 'q' }, { label: 'Dominant allele (p)', value: 'p' }, { label: 'Recessive homozygotes (q²)', value: 'q2' }],
      },
      { key: 'value', label: 'Frequency Value (0 – 1)' },
    ],
    example: { input: 'q', value: '0.3' },
    related: ['relative-risk', 'bmi-calculator'],
    tags: ['hardy weinberg', 'allele frequency', 'genotype', 'genetics', 'biology'],
    calculate: values => {
      const type = values.input as string || 'q';
      const val = num(values, 'value');
      if (val < 0 || val > 1) throw new Error('Frequency must be between 0 and 1.');
      let q: number, p: number;
      if (type === 'q') { q = val; p = 1 - q; }
      else if (type === 'p') { p = val; q = 1 - p; }
      else { q = Math.sqrt(val); p = 1 - q; }
      const p2 = p * p, pq2 = 2 * p * q, q2 = q * q;
      return {
        summary: [
          { label: 'Dominant allele frequency (p)', value: round(p, 4) },
          { label: 'Recessive allele frequency (q)', value: round(q, 4), highlight: true },
          { label: 'Homozygous dominant (p²)', value: pct(p2 * 100) },
          { label: 'Heterozygous (2pq)', value: pct(pq2 * 100) },
          { label: 'Homozygous recessive (q²)', value: pct(q2 * 100) },
        ],
        interpretation: `At equilibrium: ${pct(p2 * 100)} homozygous dominant, ${pct(pq2 * 100)} heterozygous, ${pct(q2 * 100)} homozygous recessive.`,
        steps: [
          `q = ${round(q, 4)}, p = 1 − q = ${round(p, 4)}`,
          `p² = ${round(p, 4)}² = ${pct(p2 * 100)}`,
          `2pq = 2 × ${round(p, 4)} × ${round(q, 4)} = ${pct(pq2 * 100)}`,
          `q² = ${round(q, 4)}² = ${pct(q2 * 100)}`,
          `Check: ${pct(p2 * 100)} + ${pct(pq2 * 100)} + ${pct(q2 * 100)} = 100%`,
        ],
        academicText: `Under Hardy-Weinberg equilibrium (p = ${round(p, 4)}, q = ${round(q, 4)}), expected genotype frequencies are: homozygous dominant ${pct(p2 * 100)}, heterozygous ${pct(pq2 * 100)}, homozygous recessive ${pct(q2 * 100)}.`,
      };
    },
  },
  {
    id: 'password-entropy',
    title: 'Password Entropy Calculator',
    category: 'everyday',
    explanation: 'Estimate the information entropy of a password to assess its theoretical strength.',
    formula: 'H = L × log₂(C)',
    fields: [
      { key: 'length', label: 'Password Length', unit: 'characters' },
      {
        key: 'charset', label: 'Character Set', type: 'select',
        options: [
          { label: 'Lowercase only (26)', value: '26' },
          { label: 'Mixed case (52)', value: '52' },
          { label: 'Alphanumeric (62)', value: '62' },
          { label: 'Alphanumeric + symbols (94)', value: '94' },
          { label: 'Full ASCII printable (128)', value: '128' },
        ],
      },
    ],
    example: { length: '12', charset: '94' },
    related: ['discount-calculator', 'percentage-calculator'],
    tags: ['password', 'entropy', 'security', 'strength', 'bits'],
    calculate: values => {
      const L = num(values, 'length'), C = num(values, 'charset');
      positive(L, 'Password length');
      const H = L * Math.log2(C);
      const strength = H < 40 ? 'Very Weak' : H < 60 ? 'Weak' : H < 80 ? 'Moderate' : H < 100 ? 'Strong' : 'Very Strong';
      const crackTime = H < 40 ? 'seconds to minutes' : H < 60 ? 'hours to days' : H < 80 ? 'months to years' : H < 100 ? 'decades' : 'centuries or more (at 10¹² guesses/sec)';
      return {
        summary: [
          { label: 'Entropy', value: `${round(H, 1)} bits`, highlight: true },
          { label: 'Strength', value: strength },
          { label: 'Estimated Crack Time', value: crackTime },
          { label: 'Possible Combinations', value: `${C}^${L}` },
        ],
        interpretation: `A ${L}-character password from a pool of ${C} characters has ${round(H, 1)} bits of entropy — rated ${strength}.`,
        steps: [
          `H = L × log₂(C) = ${L} × log₂(${C})`,
          `H = ${L} × ${round(Math.log2(C), 4)} = ${round(H, 2)} bits`,
        ],
        academicText: `Password entropy was estimated as ${round(H, 1)} bits using H = L × log₂(C) where L = ${L} and C = ${C}.`,
      };
    },
  },
  {
    id: 'effect-size-education',
    title: 'Education Effect Size Calculator',
    category: 'education',
    explanation: "Calculate Cohen's d and Hedge's g to quantify the practical significance of an educational intervention.",
    formula: "d = (M₁ − M₂) / SD_pooled  |  g = d × J",
    fields: [
      { key: 'm1', label: 'Treatment Mean (M₁)' },
      { key: 'sd1', label: 'Treatment SD (SD₁)' },
      { key: 'n1', label: 'Treatment Sample Size (n₁)' },
      { key: 'm2', label: 'Control Mean (M₂)' },
      { key: 'sd2', label: 'Control SD (SD₂)' },
      { key: 'n2', label: 'Control Sample Size (n₂)' },
    ],
    example: { m1: '75', sd1: '10', n1: '30', m2: '65', sd2: '12', n2: '30' },
    related: ['exam-percentage', 'grade-calculator', 'gpa-calculator'],
    tags: ['effect size', "cohen's d", "hedge's g", 'education research', 'intervention', 'learning outcomes'],
    calculate: values => {
      const m1 = num(values, 'm1'), sd1 = num(values, 'sd1'), n1 = num(values, 'n1');
      const m2 = num(values, 'm2'), sd2 = num(values, 'sd2'), n2 = num(values, 'n2');
      positive(n1, 'Treatment n'); positive(n2, 'Control n'); positive(sd1, 'Treatment SD'); positive(sd2, 'Control SD');
      if (n1 < 2 || n2 < 2) throw new Error('Sample sizes must be at least 2.');
      const pooledVar = ((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / (n1 + n2 - 2);
      const pooledSD = Math.sqrt(pooledVar);
      const d = (m1 - m2) / pooledSD;
      const df = n1 + n2 - 2;
      const J = 1 - 3 / (4 * df - 1);
      const g = d * J;
      const absd = Math.abs(d);
      const cohenLabel = absd >= 0.8 ? 'large' : absd >= 0.5 ? 'medium' : absd >= 0.2 ? 'small' : 'negligible';
      const hattieLabel = absd >= 1.0 ? 'very influential' : absd >= 0.6 ? 'desirable' : absd >= 0.4 ? 'positive influence' : absd >= 0.2 ? 'developmental' : 'small/negligible';
      return {
        summary: [
          { label: "Cohen's d", value: round(d, 4), highlight: true },
          { label: "Hedge's g (bias-corrected)", value: round(g, 4) },
          { label: 'Pooled SD', value: round(pooledSD, 4) },
          { label: "Cohen's benchmark", value: cohenLabel },
          { label: "Hattie's influence", value: hattieLabel },
        ],
        interpretation: `Cohen's d = ${round(d, 4)} (${cohenLabel} effect). In educational terms, Hattie classifies this as a ${hattieLabel} effect.`,
        steps: [
          `SD_pooled = √(((${n1}−1)×${sd1}² + (${n2}−1)×${sd2}²) / (${n1}+${n2}−2)) = ${round(pooledSD, 4)}`,
          `d = (${m1} − ${m2}) / ${round(pooledSD, 4)} = ${round(d, 4)}`,
          `J = 1 − 3/(4×${df}−1) = ${round(J, 6)}`,
          `g = ${round(d, 4)} × ${round(J, 6)} = ${round(g, 4)}`,
        ],
        academicText: `Cohen's d = ${round(d, 4)} (${cohenLabel}), Hedge's g = ${round(g, 4)} (bias-corrected), pooled SD = ${round(pooledSD, 4)}. Using Hattie's classification, this represents a ${hattieLabel} effect on learning outcomes.`,
      };
    },
  },
  {
    id: 'gpa-calculator',
    title: 'GPA Calculator',
    category: 'education',
    explanation: 'Calculate GPA from course grade points and credits.',
    formula: 'GPA = sum(grade points x credits) / sum(credits)',
    fields: [1, 2, 3, 4].flatMap(i => [{ key: `g${i}`, label: `Course ${i} Grade Point` }, { key: `c${i}`, label: `Course ${i} Credits` }]),
    example: { g1: '4', c1: '3', g2: '3.7', c2: '3', g3: '3.3', c3: '4', g4: '3', c4: '2' },
    related: ['cgpa-calculator', 'grade-calculator'],
    tags: ['gpa', 'grades', 'credits', 'student'],
    calculate: values => weightedAverage(values, 'GPA'),
  },
  {
    id: 'cgpa-calculator',
    title: 'CGPA Calculator',
    category: 'education',
    explanation: 'Calculate cumulative GPA from semester GPAs and credits.',
    formula: 'CGPA = sum(semester GPA x credits) / sum(credits)',
    fields: [1, 2, 3, 4].flatMap(i => [{ key: `g${i}`, label: `Semester ${i} GPA` }, { key: `c${i}`, label: `Semester ${i} Credits` }]),
    example: { g1: '3.4', c1: '12', g2: '3.6', c2: '12', g3: '3.8', c3: '15', g4: '3.5', c4: '12' },
    related: ['gpa-calculator', 'grade-calculator'],
    tags: ['cgpa', 'cumulative gpa', 'semester', 'grades'],
    calculate: values => weightedAverage(values, 'CGPA'),
  },
  {
    id: 'exam-percentage',
    title: 'Exam Percentage Calculator',
    category: 'education',
    explanation: 'Convert marks obtained into an exam percentage.',
    formula: 'Percentage = marks obtained / total marks x 100',
    fields: [{ key: 'obtained', label: 'Marks Obtained' }, { key: 'total', label: 'Total Marks' }],
    example: { obtained: '82', total: '100' },
    related: ['grade-calculator', 'attendance-calculator'],
    tags: ['exam', 'marks', 'percentage', 'score'],
    calculate: values => {
      const obtained = num(values, 'obtained'), total = num(values, 'total'); positive(total, 'Total marks');
      const result = obtained / total * 100;
      return { summary: [{ label: 'Exam Percentage', value: pct(result), highlight: true }], interpretation: `Your exam percentage is ${pct(result)}.`, steps: [`${obtained} / ${total} x 100 = ${pct(result)}`], academicText: `The exam score equals ${pct(result)}.` };
    },
  },
  {
    id: 'attendance-calculator',
    title: 'Attendance Calculator',
    category: 'education',
    explanation: 'Check current attendance and estimate classes needed for a target percentage.',
    formula: 'Attendance = attended / held x 100',
    fields: [{ key: 'attended', label: 'Classes Attended' }, { key: 'held', label: 'Classes Held' }, { key: 'target', label: 'Target Attendance', unit: '%' }],
    example: { attended: '32', held: '40', target: '75' },
    related: ['study-time-planner', 'exam-percentage'],
    tags: ['attendance', 'class', 'target', 'student'],
    calculate: values => {
      const attended = num(values, 'attended'), held = num(values, 'held'), target = num(values, 'target') / 100; positive(held, 'Classes held');
      const current = attended / held * 100;
      const needed = current >= target * 100 ? 0 : Math.ceil((target * held - attended) / (1 - target));
      return { summary: [{ label: 'Current Attendance', value: pct(current), highlight: true }, { label: 'Classes Needed', value: String(Math.max(0, needed)) }], interpretation: needed ? `Attend the next ${needed} class(es) to reach the target.` : 'You already meet the target attendance.', steps: [`Attendance = ${attended} / ${held} x 100 = ${pct(current)}`], academicText: `Current attendance is ${pct(current)}.` };
    },
  },
  {
    id: 'grade-calculator',
    title: 'Grade Calculator',
    category: 'education',
    explanation: 'Convert a percentage score into a simple letter grade.',
    formula: 'Percentage = score / maximum score x 100',
    fields: [{ key: 'score', label: 'Score' }, { key: 'max', label: 'Maximum Score' }],
    example: { score: '87', max: '100' },
    related: ['exam-percentage', 'gpa-calculator'],
    tags: ['grade', 'letter grade', 'score', 'marks'],
    calculate: values => {
      const score = num(values, 'score'), max = num(values, 'max'); positive(max, 'Maximum score');
      const p = score / max * 100; const grade = p >= 85 ? 'A' : p >= 75 ? 'B' : p >= 65 ? 'C' : p >= 50 ? 'D' : 'F';
      return { summary: [{ label: 'Percentage', value: pct(p), highlight: true }, { label: 'Grade', value: grade }], interpretation: `This score maps to grade ${grade}.`, steps: [`Percentage = ${score} / ${max} x 100 = ${pct(p)}`], academicText: `The grade estimate is ${grade} based on ${pct(p)}.` };
    },
  },
  {
    id: 'study-time-planner',
    title: 'Study Time Planner',
    category: 'education',
    explanation: 'Plan daily study time from topics, hours per topic, and days available.',
    formula: 'Daily study time = topics x hours per topic / days',
    fields: [{ key: 'topics', label: 'Topics / Chapters' }, { key: 'hours', label: 'Hours per Topic' }, { key: 'days', label: 'Days Available' }],
    example: { topics: '12', hours: '2', days: '8' },
    related: ['attendance-calculator', 'exam-percentage'],
    tags: ['study plan', 'revision', 'exam prep', 'time table'],
    calculate: values => {
      const topics = num(values, 'topics'), hours = num(values, 'hours'), days = num(values, 'days'); positive(days, 'Days available');
      const daily = topics * hours / days;
      return { summary: [{ label: 'Daily Study Time', value: `${round(daily)} hours`, highlight: true }, { label: 'Total Study Time', value: `${round(topics * hours)} hours` }], interpretation: `Plan for about ${round(daily)} study hours per day.`, steps: [`Daily time = ${topics} x ${hours} / ${days} = ${round(daily)} hours`], academicText: `The study plan requires about ${round(daily)} hours per day.` };
    },
  },
  {
    id: 'bmi-calculator',
    title: 'BMI Calculator',
    category: 'biology',
    explanation: 'Estimate body mass index from height and weight.',
    formula: 'BMI = weight(kg) / height(m)^2',
    fields: [{ key: 'weight', label: 'Weight', unit: 'kg' }, { key: 'height', label: 'Height', unit: 'cm' }],
    example: { weight: '70', height: '175' },
    related: ['bmr-calculator', 'calorie-calculator'],
    tags: ['bmi', 'body mass index', 'weight', 'health'],
    calculate: values => {
      const w = num(values, 'weight'), h = num(values, 'height') / 100; positive(w, 'Weight'); positive(h, 'Height');
      const bmi = w / h ** 2; const label = bmi < 18.5 ? 'underweight' : bmi < 25 ? 'healthy range' : bmi < 30 ? 'overweight range' : 'obesity range';
      return { summary: [{ label: 'BMI', value: round(bmi), highlight: true }, { label: 'Category', value: label }], interpretation: `Your BMI is in the ${label}.`, steps: [`BMI = ${w} / ${round(h)}^2 = ${round(bmi)}`], academicText: `BMI was estimated as ${round(bmi)}.` };
    },
  },
  {
    id: 'bmr-calculator',
    title: 'BMR Calculator',
    category: 'biology',
    explanation: 'Estimate basal metabolic rate using the Mifflin-St Jeor equation.',
    formula: 'BMR = 10W + 6.25H - 5A + s',
    fields: [{ key: 'sex', label: 'Sex', type: 'select', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] }, { key: 'weight', label: 'Weight', unit: 'kg' }, { key: 'height', label: 'Height', unit: 'cm' }, { key: 'age', label: 'Age', unit: 'years' }],
    example: { sex: 'female', weight: '65', height: '165', age: '30' },
    related: ['calorie-calculator', 'bmi-calculator'],
    tags: ['bmr', 'metabolism', 'calories', 'health'],
    calculate: values => {
      const w = num(values, 'weight'), h = num(values, 'height'), a = num(values, 'age'); const s = values.sex === 'male' ? 5 : -161;
      const bmr = 10 * w + 6.25 * h - 5 * a + s;
      return { summary: [{ label: 'BMR', value: `${round(bmr)} kcal/day`, highlight: true }], interpretation: `Estimated resting energy use is ${round(bmr)} kcal/day.`, steps: [`BMR = 10(${w}) + 6.25(${h}) - 5(${a}) ${s >= 0 ? '+' : ''}${s}`, `BMR = ${round(bmr)}`], academicText: `BMR was estimated as ${round(bmr)} kcal/day.` };
    },
  },
  {
    id: 'calorie-calculator',
    title: 'Calorie Calculator',
    category: 'biology',
    explanation: 'Estimate daily maintenance calories from BMR and activity level.',
    formula: 'Calories = BMR x activity factor',
    fields: [{ key: 'bmr', label: 'BMR', unit: 'kcal/day' }, { key: 'activity', label: 'Activity Level', type: 'select', options: [{ label: 'Sedentary', value: '1.2' }, { label: 'Light', value: '1.375' }, { label: 'Moderate', value: '1.55' }, { label: 'Very active', value: '1.725' }] }],
    example: { bmr: '1450', activity: '1.55' },
    related: ['bmr-calculator', 'bmi-calculator'],
    tags: ['calories', 'maintenance', 'activity', 'diet'],
    calculate: values => {
      const bmr = num(values, 'bmr'), factor = Number(values.activity); const calories = bmr * factor;
      return { summary: [{ label: 'Maintenance Calories', value: `${round(calories)} kcal/day`, highlight: true }], interpretation: `Estimated maintenance intake is ${round(calories)} kcal/day.`, steps: [`Calories = ${bmr} x ${factor} = ${round(calories)}`], academicText: `Daily calorie needs were estimated as ${round(calories)} kcal/day.` };
    },
  },
  {
    id: 'water-intake',
    title: 'Water Intake Calculator',
    category: 'biology',
    explanation: 'Estimate daily water intake from body weight and exercise time.',
    formula: 'Water = weight x 35 ml + exercise minutes x 12 ml',
    fields: [{ key: 'weight', label: 'Weight', unit: 'kg' }, { key: 'exercise', label: 'Exercise Time', unit: 'minutes' }],
    example: { weight: '70', exercise: '30' },
    related: ['calorie-calculator', 'bmi-calculator'],
    tags: ['water', 'hydration', 'health', 'daily intake'],
    calculate: values => {
      const w = num(values, 'weight'), e = num(values, 'exercise'); const ml = w * 35 + e * 12;
      return { summary: [{ label: 'Daily Water', value: `${round(ml / 1000)} L`, highlight: true }, { label: 'Millilitres', value: `${round(ml, 0)} ml` }], interpretation: `A practical target is about ${round(ml / 1000)} litres per day.`, steps: [`Water = ${w} x 35 + ${e} x 12 = ${round(ml, 0)} ml`], academicText: `Estimated daily water intake is ${round(ml / 1000)} L.` };
    },
  },
  {
    id: 'age-calculator',
    title: 'Age Calculator',
    category: 'everyday',
    explanation: 'Calculate age in years and days from a date of birth.',
    formula: 'Age = date today - date of birth',
    fields: [{ key: 'birth', label: 'Date of Birth', type: 'date' }, { key: 'today', label: 'Date to Calculate At', type: 'date' }],
    example: { birth: '2000-01-15', today: '2026-05-19' },
    related: ['date-difference', 'time-duration'],
    tags: ['age', 'birthday', 'date of birth', 'years old'],
    calculate: values => {
      const birth = dateValue(values, 'birth'), today = dateValue(values, 'today'); const days = daysBetween(birth, today); if (days < 0) throw new Error('Calculation date must be after date of birth.');
      const years = Math.floor(days / 365.2425);
      return { summary: [{ label: 'Age', value: `${years} years`, highlight: true }, { label: 'Total Days', value: days.toLocaleString() }], interpretation: `The age is approximately ${years} years.`, steps: [`Days between dates = ${days}`, `Years = ${days} / 365.2425 = ${years}`], academicText: `Age was calculated as approximately ${years} years.` };
    },
  },
  {
    id: 'date-difference',
    title: 'Date Difference Calculator',
    category: 'everyday',
    explanation: 'Find the number of days between two dates.',
    formula: 'Difference = end date - start date',
    fields: [{ key: 'start', label: 'Start Date', type: 'date' }, { key: 'end', label: 'End Date', type: 'date' }],
    example: { start: '2026-01-01', end: '2026-05-19' },
    related: ['age-calculator', 'time-duration'],
    tags: ['date difference', 'days between dates', 'calendar'],
    calculate: values => {
      const start = dateValue(values, 'start'), end = dateValue(values, 'end'); const days = Math.abs(daysBetween(start, end));
      return { summary: [{ label: 'Difference', value: `${days} days`, highlight: true }, { label: 'Weeks', value: round(days / 7) }], interpretation: `The two dates are ${days} days apart.`, steps: [`Difference in days = ${days}`], academicText: `The date difference is ${days} days.` };
    },
  },
  {
    id: 'time-duration',
    title: 'Time Duration Calculator',
    category: 'everyday',
    explanation: 'Calculate elapsed time between two times on the same day.',
    formula: 'Duration = end time - start time',
    fields: [{ key: 'start', label: 'Start Time', type: 'time' }, { key: 'end', label: 'End Time', type: 'time' }],
    example: { start: '09:15', end: '17:45' },
    related: ['date-difference', 'study-time-planner'],
    tags: ['time duration', 'hours', 'minutes', 'elapsed time'],
    calculate: values => {
      const [sh, sm] = required(values, 'start').split(':').map(Number); const [eh, em] = required(values, 'end').split(':').map(Number);
      let minutes = eh * 60 + em - (sh * 60 + sm); if (minutes < 0) minutes += 1440;
      return { summary: [{ label: 'Duration', value: `${Math.floor(minutes / 60)}h ${minutes % 60}m`, highlight: true }, { label: 'Minutes', value: String(minutes) }], interpretation: `Elapsed time is ${Math.floor(minutes / 60)} hours and ${minutes % 60} minutes.`, steps: [`Duration = ${minutes} minutes`], academicText: `The time duration is ${minutes} minutes.` };
    },
  },
  {
    id: 'fuel-cost',
    title: 'Fuel Cost Calculator',
    category: 'everyday',
    explanation: 'Estimate trip fuel cost from distance, efficiency, and fuel price.',
    formula: 'Cost = distance / efficiency x fuel price',
    fields: [{ key: 'distance', label: 'Distance', unit: 'km' }, { key: 'efficiency', label: 'Fuel Efficiency', unit: 'km/L' }, { key: 'price', label: 'Fuel Price', unit: '$/L' }],
    example: { distance: '250', efficiency: '12', price: '2.05' },
    related: ['discount-calculator', 'tip-calculator'],
    tags: ['fuel', 'petrol', 'trip cost', 'travel'],
    calculate: values => {
      const d = num(values, 'distance'), e = num(values, 'efficiency'), price = num(values, 'price'); positive(e, 'Fuel efficiency');
      const litres = d / e, cost = litres * price;
      return { summary: [{ label: 'Fuel Cost', value: money(cost), highlight: true }, { label: 'Fuel Needed', value: `${round(litres)} L` }], interpretation: `Estimated fuel cost is ${money(cost)}.`, steps: [`Litres = ${d} / ${e} = ${round(litres)}`, `Cost = ${round(litres)} x ${price} = ${money(cost)}`], academicText: `Estimated trip fuel cost is ${money(cost)}.` };
    },
  },
  {
    id: 'discount-calculator',
    title: 'Discount Calculator',
    category: 'everyday',
    explanation: 'Calculate sale price after a percentage discount.',
    formula: 'Sale price = original price x (1 - discount / 100)',
    fields: [{ key: 'price', label: 'Original Price', unit: '$' }, { key: 'discount', label: 'Discount', unit: '%' }],
    example: { price: '120', discount: '25' },
    related: ['percentage-calculator', 'tip-calculator'],
    tags: ['discount', 'sale', 'shopping', 'price off'],
    calculate: values => {
      const price = num(values, 'price'), discount = num(values, 'discount'); const saving = price * discount / 100;
      return { summary: [{ label: 'Sale Price', value: money(price - saving), highlight: true }, { label: 'You Save', value: money(saving) }], interpretation: `Final price after discount is ${money(price - saving)}.`, steps: [`Saving = ${price} x ${discount}% = ${money(saving)}`], academicText: `The discounted price is ${money(price - saving)}.` };
    },
  },
  {
    id: 'tip-calculator',
    title: 'Tip Calculator',
    category: 'everyday',
    explanation: 'Calculate tip amount and split a bill between people.',
    formula: 'Tip = bill x tip percentage / 100',
    fields: [{ key: 'bill', label: 'Bill Amount', unit: '$' }, { key: 'tip', label: 'Tip', unit: '%' }, { key: 'people', label: 'People' }],
    example: { bill: '86', tip: '18', people: '3' },
    related: ['discount-calculator', 'fuel-cost'],
    tags: ['tip', 'restaurant', 'split bill', 'gratuity'],
    calculate: values => {
      const bill = num(values, 'bill'), tipRate = num(values, 'tip'), people = num(values, 'people'); positive(people, 'People');
      const tip = bill * tipRate / 100, total = bill + tip;
      return { summary: [{ label: 'Total Bill', value: money(total), highlight: true }, { label: 'Tip Amount', value: money(tip) }, { label: 'Per Person', value: money(total / people) }], interpretation: `Each person pays ${money(total / people)}.`, steps: [`Tip = ${bill} x ${tipRate}% = ${money(tip)}`], academicText: `The total bill including tip is ${money(total)}.` };
    },
  },
  {
    id: 'cooking-measurement-converter',
    title: 'Cooking Measurement Converter',
    category: 'everyday',
    explanation: 'Convert common cooking measurements quickly.',
    formula: 'Converted amount = amount x conversion factor',
    fields: [{ key: 'amount', label: 'Amount' }, { key: 'conversion', label: 'Conversion', type: 'select', options: [{ label: 'Cups to millilitres', value: 'cup-ml' }, { label: 'Tablespoons to millilitres', value: 'tbsp-ml' }, { label: 'Teaspoons to millilitres', value: 'tsp-ml' }, { label: 'Ounces to grams', value: 'oz-g' }] }],
    example: { amount: '2', conversion: 'cup-ml' },
    related: ['unit-converter', 'discount-calculator'],
    tags: ['cooking', 'recipe', 'measurement', 'kitchen', 'converter'],
    calculate: values => {
      const amount = num(values, 'amount'); const factors: Record<string, [number, string]> = { 'cup-ml': [240, 'ml'], 'tbsp-ml': [15, 'ml'], 'tsp-ml': [5, 'ml'], 'oz-g': [28.3495, 'g'] };
      const [factor, unit] = factors[values.conversion || 'cup-ml']; const result = amount * factor;
      return { summary: [{ label: 'Converted Amount', value: `${round(result)} ${unit}`, highlight: true }], interpretation: `Converted amount is ${round(result)} ${unit}.`, steps: [`${amount} x ${factor} = ${round(result)} ${unit}`], academicText: `The cooking measurement conversion gives ${round(result)} ${unit}.` };
    },
  },
];

function weightedAverage(values: Record<string, string>, label: string): PracticalCalculation {
  const rows = [1, 2, 3, 4]
    .map(i => ({ grade: values[`g${i}`], credits: values[`c${i}`] }))
    .filter(row => row.grade?.trim() && row.credits?.trim())
    .map(row => ({ grade: Number(row.grade), credits: Number(row.credits) }));
  if (rows.length === 0 || rows.some(row => !Number.isFinite(row.grade) || !Number.isFinite(row.credits) || row.credits <= 0)) {
    throw new Error('Enter at least one valid grade and credit row.');
  }
  const credits = rows.reduce((sum, row) => sum + row.credits, 0);
  const weighted = rows.reduce((sum, row) => sum + row.grade * row.credits, 0);
  const value = weighted / credits;
  return {
    summary: [{ label, value: round(value), highlight: true }, { label: 'Total Credits', value: round(credits) }],
    interpretation: `${label} is ${round(value)}.`,
    steps: [`Weighted points = ${round(weighted)}`, `${label} = ${round(weighted)} / ${round(credits)} = ${round(value)}`],
    academicText: `${label} was calculated as ${round(value)} from ${round(credits)} credits.`,
  };
}

export function getPracticalCalculator(idOrSlug?: string) {
  return practicalCalculators.find(calculator => calculator.id === idOrSlug);
}

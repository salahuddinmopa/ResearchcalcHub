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

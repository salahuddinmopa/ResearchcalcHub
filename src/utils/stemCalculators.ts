export type StemCategory = 'math' | 'physics' | 'chemistry';

export interface StemField {
  key: string;
  label: string;
  unit?: string;
  type?: 'number' | 'select';
  options?: { label: string; value: string }[];
}

export interface StemCalculation {
  summary: { label: string; value: string; highlight?: boolean }[];
  interpretation: string;
  steps: string[];
  academicText: string;
}

export interface StemCalculatorConfig {
  id: string;
  title: string;
  category: StemCategory;
  explanation: string;
  formula: string;
  fields: StemField[];
  example: Record<string, string>;
  related: string[];
  calculate: (values: Record<string, number | string>) => StemCalculation;
}

function num(values: Record<string, number | string>, key: string) {
  const raw = values[key];
  if (raw === undefined || String(raw).trim() === '') throw new Error('Please complete all required numeric fields.');
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error('Please complete all required numeric fields.');
  return value;
}

function positive(value: number, label: string) {
  if (value <= 0) throw new Error(`${label} must be greater than 0.`);
}

const round = (value: number, digits = 4) => Number(value.toFixed(digits)).toString();
const pct = (value: number) => `${round(value, 2)}%`;

export const stemCalculators: StemCalculatorConfig[] = [
  {
    id: 'percentage-calculator',
    title: 'Percentage Calculator',
    category: 'math',
    explanation: 'Calculate what percentage one number is of another.',
    formula: 'Percentage = (part / whole) x 100',
    fields: [{ key: 'part', label: 'Part' }, { key: 'whole', label: 'Whole' }],
    example: { part: '45', whole: '180' },
    related: ['ratio-calculator', 'average-calculator', 'unit-converter'],
    calculate: values => {
      const part = num(values, 'part'), whole = num(values, 'whole'); positive(whole, 'Whole');
      const result = (part / whole) * 100;
      return {
        summary: [{ label: 'Percentage', value: pct(result), highlight: true }],
        interpretation: `${part} is ${pct(result)} of ${whole}.`,
        steps: [`Percentage = (${part} / ${whole}) x 100`, `Percentage = ${pct(result)}`],
        academicText: `The percentage was calculated as (${part} / ${whole}) x 100 = ${pct(result)}.`,
      };
    },
  },
  {
    id: 'fraction-calculator',
    title: 'Fraction Calculator',
    category: 'math',
    explanation: 'Add, subtract, multiply, or divide two fractions.',
    formula: 'a/b op c/d',
    fields: [
      { key: 'a', label: 'Numerator 1' }, { key: 'b', label: 'Denominator 1' },
      { key: 'operation', label: 'Operation', type: 'select', options: [{ label: '+', value: 'add' }, { label: '-', value: 'subtract' }, { label: 'x', value: 'multiply' }, { label: '/', value: 'divide' }] },
      { key: 'c', label: 'Numerator 2' }, { key: 'd', label: 'Denominator 2' },
    ],
    example: { a: '2', b: '3', operation: 'add', c: '1', d: '4' },
    related: ['ratio-calculator', 'percentage-calculator'],
    calculate: values => {
      const a = num(values, 'a'), b = num(values, 'b'), c = num(values, 'c'), d = num(values, 'd'); positive(b, 'Denominator 1'); positive(d, 'Denominator 2');
      const op = String(values.operation);
      const value = op === 'add' ? a / b + c / d : op === 'subtract' ? a / b - c / d : op === 'multiply' ? (a * c) / (b * d) : (a / b) / (c / d);
      if (op === 'divide' && c === 0) throw new Error('Cannot divide by a zero fraction.');
      return {
        summary: [{ label: 'Decimal Result', value: round(value), highlight: true }],
        interpretation: `The operation result is ${round(value)} as a decimal.`,
        steps: [`Convert fractions: ${a}/${b} and ${c}/${d}`, `Apply operation "${op}"`, `Result = ${round(value)}`],
        academicText: `The fraction operation produced a decimal result of ${round(value)}.`,
      };
    },
  },
  {
    id: 'ratio-calculator',
    title: 'Ratio Calculator',
    category: 'math',
    explanation: 'Simplify a two-part ratio.',
    formula: 'Ratio = A:B, simplified by the greatest common divisor',
    fields: [{ key: 'a', label: 'Value A' }, { key: 'b', label: 'Value B' }],
    example: { a: '24', b: '36' },
    related: ['percentage-calculator', 'fraction-calculator'],
    calculate: values => {
      const a = Math.abs(num(values, 'a')), b = Math.abs(num(values, 'b')); positive(a, 'Value A'); positive(b, 'Value B');
      const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
      const g = gcd(a, b);
      return {
        summary: [{ label: 'Simplified Ratio', value: `${a / g}:${b / g}`, highlight: true }],
        interpretation: `${a}:${b} simplifies to ${a / g}:${b / g}.`,
        steps: [`GCD(${a}, ${b}) = ${g}`, `Divide both parts by ${g}`],
        academicText: `The ratio ${a}:${b} was simplified to ${a / g}:${b / g}.`,
      };
    },
  },
  {
    id: 'average-calculator',
    title: 'Average Calculator',
    category: 'math',
    explanation: 'Calculate an average from up to five values.',
    formula: 'Average = sum of values / number of values',
    fields: [1, 2, 3, 4, 5].map(i => ({ key: `v${i}`, label: `Value ${i}` })),
    example: { v1: '12', v2: '15', v3: '18', v4: '20', v5: '25' },
    related: ['mean-median-mode', 'percentage-calculator'],
    calculate: values => {
      const data = [1, 2, 3, 4, 5]
        .map(i => values[`v${i}`])
        .filter(value => value !== undefined && String(value).trim() !== '')
        .map(Number)
        .filter(Number.isFinite);
      if (data.length === 0) throw new Error('Enter at least one value.');
      const sum = data.reduce((a, b) => a + b, 0);
      const avg = sum / data.length;
      return {
        summary: [{ label: 'Average', value: round(avg), highlight: true }, { label: 'Count', value: String(data.length) }],
        interpretation: `The average of the entered values is ${round(avg)}.`,
        steps: [`Sum = ${sum}`, `Average = ${sum} / ${data.length} = ${round(avg)}`],
        academicText: `The arithmetic average was ${round(avg)} based on ${data.length} value(s).`,
      };
    },
  },
  {
    id: 'area-calculator',
    title: 'Area Calculator',
    category: 'math',
    explanation: 'Calculate rectangle, triangle, or circle area.',
    formula: 'Rectangle: l x w; Triangle: 0.5 x b x h; Circle: pi x r^2',
    fields: [
      { key: 'shape', label: 'Shape', type: 'select', options: [{ label: 'Rectangle', value: 'rectangle' }, { label: 'Triangle', value: 'triangle' }, { label: 'Circle', value: 'circle' }] },
      { key: 'a', label: 'Length/Base/Radius' }, { key: 'b', label: 'Width/Height (if needed)' },
    ],
    example: { shape: 'rectangle', a: '12', b: '8' },
    related: ['volume-calculator', 'unit-converter'],
    calculate: values => {
      const shape = String(values.shape); const a = num(values, 'a'); const b = Number(values.b || 0); positive(a, 'Primary dimension');
      const area = shape === 'circle' ? Math.PI * a * a : shape === 'triangle' ? 0.5 * a * b : a * b;
      if (shape !== 'circle') positive(b, 'Secondary dimension');
      return { summary: [{ label: 'Area', value: round(area), highlight: true }], interpretation: `The ${shape} area is ${round(area)} square units.`, steps: [`Apply ${shape} area formula`, `Area = ${round(area)}`], academicText: `The calculated ${shape} area was ${round(area)} square units.` };
    },
  },
  {
    id: 'volume-calculator',
    title: 'Volume Calculator',
    category: 'math',
    explanation: 'Calculate cube/rectangular prism, cylinder, or sphere volume.',
    formula: 'Prism: lwh; Cylinder: pi r^2 h; Sphere: 4/3 pi r^3',
    fields: [
      { key: 'shape', label: 'Shape', type: 'select', options: [{ label: 'Rectangular prism', value: 'prism' }, { label: 'Cylinder', value: 'cylinder' }, { label: 'Sphere', value: 'sphere' }] },
      { key: 'a', label: 'Length/Radius' }, { key: 'b', label: 'Width/Height' }, { key: 'c', label: 'Height (prism only)' },
    ],
    example: { shape: 'cylinder', a: '3', b: '10', c: '0' },
    related: ['area-calculator', 'unit-converter'],
    calculate: values => {
      const shape = String(values.shape); const a = num(values, 'a'), b = Number(values.b || 0), c = Number(values.c || 0); positive(a, 'Primary dimension');
      const volume = shape === 'sphere' ? (4 / 3) * Math.PI * a ** 3 : shape === 'cylinder' ? Math.PI * a ** 2 * b : a * b * c;
      if (shape === 'cylinder') positive(b, 'Height'); if (shape === 'prism') { positive(b, 'Width'); positive(c, 'Height'); }
      return { summary: [{ label: 'Volume', value: round(volume), highlight: true }], interpretation: `The ${shape} volume is ${round(volume)} cubic units.`, steps: [`Apply ${shape} volume formula`, `Volume = ${round(volume)}`], academicText: `The calculated ${shape} volume was ${round(volume)} cubic units.` };
    },
  },
  {
    id: 'quadratic-equation',
    title: 'Quadratic Equation Calculator',
    category: 'math',
    explanation: 'Solve ax^2 + bx + c = 0 using the quadratic formula.',
    formula: 'x = (-b +/- sqrt(b^2 - 4ac)) / 2a',
    fields: [{ key: 'a', label: 'a' }, { key: 'b', label: 'b' }, { key: 'c', label: 'c' }],
    example: { a: '1', b: '-3', c: '2' },
    related: ['algebra-solver', 'fraction-calculator'],
    calculate: values => {
      const a = num(values, 'a'), b = num(values, 'b'), c = num(values, 'c'); if (a === 0) throw new Error('a cannot be 0 for a quadratic equation.');
      const d = b * b - 4 * a * c;
      const roots = d >= 0 ? `${round((-b + Math.sqrt(d)) / (2 * a))}, ${round((-b - Math.sqrt(d)) / (2 * a))}` : 'Complex roots';
      return { summary: [{ label: 'Discriminant', value: round(d) }, { label: 'Roots', value: roots, highlight: true }], interpretation: d > 0 ? 'Two real roots.' : d === 0 ? 'One repeated real root.' : 'Two complex roots.', steps: [`D = b^2 - 4ac = ${round(d)}`, `Use quadratic formula`], academicText: `The quadratic equation has discriminant ${round(d)} and roots: ${roots}.` };
    },
  },
  {
    id: 'unit-converter',
    title: 'Unit Converter',
    category: 'math',
    explanation: 'Convert common length units.',
    formula: 'Converted value = value x conversion factor',
    fields: [
      { key: 'value', label: 'Value' },
      { key: 'fromTo', label: 'Conversion', type: 'select', options: [{ label: 'Meters to feet', value: 'm-ft' }, { label: 'Feet to meters', value: 'ft-m' }, { label: 'Kilometers to miles', value: 'km-mi' }, { label: 'Miles to kilometers', value: 'mi-km' }] },
    ],
    example: { value: '10', fromTo: 'm-ft' },
    related: ['area-calculator', 'volume-calculator'],
    calculate: values => {
      const value = num(values, 'value');
      const factors: Record<string, number> = { 'm-ft': 3.28084, 'ft-m': 0.3048, 'km-mi': 0.621371, 'mi-km': 1.60934 };
      const factor = factors[String(values.fromTo)];
      const converted = value * factor;
      return { summary: [{ label: 'Converted Value', value: round(converted), highlight: true }], interpretation: `Converted result is ${round(converted)}.`, steps: [`${value} x ${factor} = ${round(converted)}`], academicText: `The unit conversion produced ${round(converted)} using a factor of ${factor}.` };
    },
  },
  {
    id: 'speed-distance-time',
    title: 'Speed-Distance-Time Calculator',
    category: 'physics',
    explanation: 'Calculate speed from distance and time.',
    formula: 'speed = distance / time',
    fields: [{ key: 'distance', label: 'Distance', unit: 'm' }, { key: 'time', label: 'Time', unit: 's' }],
    example: { distance: '100', time: '12.5' },
    related: ['force-calculator', 'power-calculator'],
    calculate: values => { const d = num(values, 'distance'), t = num(values, 'time'); positive(t, 'Time'); const speed = d / t; return { summary: [{ label: 'Speed', value: `${round(speed)} m/s`, highlight: true }], interpretation: `The speed is ${round(speed)} m/s.`, steps: [`speed = ${d} / ${t} = ${round(speed)} m/s`], academicText: `Speed was calculated as distance divided by time, giving ${round(speed)} m/s.` }; },
  },
  {
    id: 'force-calculator',
    title: 'Force Calculator',
    category: 'physics',
    explanation: 'Calculate force using Newton’s second law.',
    formula: 'F = m x a',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'acceleration', label: 'Acceleration', unit: 'm/s^2' }],
    example: { mass: '10', acceleration: '2.5' },
    related: ['work-calculator', 'kinetic-energy-calculator'],
    calculate: values => { const m = num(values, 'mass'), a = num(values, 'acceleration'); const f = m * a; return { summary: [{ label: 'Force', value: `${round(f)} N`, highlight: true }], interpretation: `The force is ${round(f)} newtons.`, steps: [`F = ${m} x ${a} = ${round(f)} N`], academicText: `Force was calculated using F = ma, giving ${round(f)} N.` }; },
  },
  {
    id: 'work-calculator',
    title: 'Work Calculator',
    category: 'physics',
    explanation: 'Calculate work done by a force over a distance.',
    formula: 'W = F x d',
    fields: [{ key: 'force', label: 'Force', unit: 'N' }, { key: 'distance', label: 'Distance', unit: 'm' }],
    example: { force: '50', distance: '3' },
    related: ['force-calculator', 'power-calculator'],
    calculate: values => { const f = num(values, 'force'), d = num(values, 'distance'); const w = f * d; return { summary: [{ label: 'Work', value: `${round(w)} J`, highlight: true }], interpretation: `Work done is ${round(w)} joules.`, steps: [`W = ${f} x ${d} = ${round(w)} J`], academicText: `Work was calculated as force times distance, giving ${round(w)} J.` }; },
  },
  {
    id: 'power-calculator',
    title: 'Power Calculator',
    category: 'physics',
    explanation: 'Calculate power from work and time.',
    formula: 'P = W / t',
    fields: [{ key: 'work', label: 'Work', unit: 'J' }, { key: 'time', label: 'Time', unit: 's' }],
    example: { work: '150', time: '5' },
    related: ['work-calculator', 'speed-distance-time'],
    calculate: values => { const w = num(values, 'work'), t = num(values, 'time'); positive(t, 'Time'); const p = w / t; return { summary: [{ label: 'Power', value: `${round(p)} W`, highlight: true }], interpretation: `Power is ${round(p)} watts.`, steps: [`P = ${w} / ${t} = ${round(p)} W`], academicText: `Power was calculated as work divided by time, giving ${round(p)} W.` }; },
  },
  {
    id: 'kinetic-energy-calculator',
    title: 'Kinetic Energy Calculator',
    category: 'physics',
    explanation: 'Calculate kinetic energy from mass and velocity.',
    formula: 'KE = 0.5 x m x v^2',
    fields: [{ key: 'mass', label: 'Mass', unit: 'kg' }, { key: 'velocity', label: 'Velocity', unit: 'm/s' }],
    example: { mass: '2', velocity: '12' },
    related: ['force-calculator', 'work-calculator'],
    calculate: values => { const m = num(values, 'mass'), v = num(values, 'velocity'); const ke = 0.5 * m * v * v; return { summary: [{ label: 'Kinetic Energy', value: `${round(ke)} J`, highlight: true }], interpretation: `Kinetic energy is ${round(ke)} joules.`, steps: [`KE = 0.5 x ${m} x ${v}^2 = ${round(ke)} J`], academicText: `Kinetic energy was calculated as ${round(ke)} J.` }; },
  },
  {
    id: 'density-calculator',
    title: 'Density Calculator',
    category: 'physics',
    explanation: 'Calculate density from mass and volume.',
    formula: 'density = mass / volume',
    fields: [{ key: 'mass', label: 'Mass' }, { key: 'volume', label: 'Volume' }],
    example: { mass: '250', volume: '100' },
    related: ['pressure-calculator', 'volume-calculator'],
    calculate: values => { const m = num(values, 'mass'), v = num(values, 'volume'); positive(v, 'Volume'); const density = m / v; return { summary: [{ label: 'Density', value: round(density), highlight: true }], interpretation: `Density is ${round(density)} mass units per volume unit.`, steps: [`density = ${m} / ${v} = ${round(density)}`], academicText: `Density was calculated as mass divided by volume, giving ${round(density)}.` }; },
  },
  {
    id: 'ohms-law',
    title: 'Ohm’s Law Calculator',
    category: 'physics',
    explanation: 'Calculate voltage from current and resistance.',
    formula: 'V = I x R',
    fields: [{ key: 'current', label: 'Current', unit: 'A' }, { key: 'resistance', label: 'Resistance', unit: 'ohms' }],
    example: { current: '2', resistance: '12' },
    related: ['power-calculator'],
    calculate: values => { const i = num(values, 'current'), r = num(values, 'resistance'); const v = i * r; return { summary: [{ label: 'Voltage', value: `${round(v)} V`, highlight: true }], interpretation: `Voltage is ${round(v)} volts.`, steps: [`V = ${i} x ${r} = ${round(v)} V`], academicText: `Voltage was calculated using Ohm's law, giving ${round(v)} V.` }; },
  },
  {
    id: 'pressure-calculator',
    title: 'Pressure Calculator',
    category: 'physics',
    explanation: 'Calculate pressure from force and area.',
    formula: 'P = F / A',
    fields: [{ key: 'force', label: 'Force', unit: 'N' }, { key: 'area', label: 'Area', unit: 'm^2' }],
    example: { force: '100', area: '2' },
    related: ['force-calculator', 'area-calculator'],
    calculate: values => { const f = num(values, 'force'), a = num(values, 'area'); positive(a, 'Area'); const p = f / a; return { summary: [{ label: 'Pressure', value: `${round(p)} Pa`, highlight: true }], interpretation: `Pressure is ${round(p)} pascals.`, steps: [`P = ${f} / ${a} = ${round(p)} Pa`], academicText: `Pressure was calculated as force divided by area, giving ${round(p)} Pa.` }; },
  },
  {
    id: 'mole-calculator',
    title: 'Mole Calculator',
    category: 'chemistry',
    explanation: 'Calculate moles from mass and molar mass.',
    formula: 'n = mass / molar mass',
    fields: [{ key: 'mass', label: 'Mass', unit: 'g' }, { key: 'molarMass', label: 'Molar Mass', unit: 'g/mol' }],
    example: { mass: '18', molarMass: '18.015' },
    related: ['molar-mass', 'concentration-calculator'],
    calculate: values => { const mass = num(values, 'mass'), mm = num(values, 'molarMass'); positive(mm, 'Molar mass'); const n = mass / mm; return { summary: [{ label: 'Moles', value: `${round(n)} mol`, highlight: true }], interpretation: `Amount of substance is ${round(n)} mol.`, steps: [`n = ${mass} / ${mm} = ${round(n)} mol`], academicText: `Moles were calculated from mass divided by molar mass, giving ${round(n)} mol.` }; },
  },
  {
    id: 'molar-mass',
    title: 'Molar Mass Calculator',
    category: 'chemistry',
    explanation: 'Estimate molar mass by summing element mass contributions.',
    formula: 'M = sum(element atomic mass x atom count)',
    fields: [{ key: 'atomicMass1', label: 'Atomic Mass 1' }, { key: 'count1', label: 'Count 1' }, { key: 'atomicMass2', label: 'Atomic Mass 2' }, { key: 'count2', label: 'Count 2' }],
    example: { atomicMass1: '1.008', count1: '2', atomicMass2: '15.999', count2: '1' },
    related: ['mole-calculator', 'concentration-calculator'],
    calculate: values => { const m1 = num(values, 'atomicMass1'), c1 = num(values, 'count1'), m2 = Number(values.atomicMass2 || 0), c2 = Number(values.count2 || 0); const mm = m1 * c1 + m2 * c2; return { summary: [{ label: 'Molar Mass', value: `${round(mm)} g/mol`, highlight: true }], interpretation: `Estimated molar mass is ${round(mm)} g/mol.`, steps: [`M = ${m1} x ${c1} + ${m2} x ${c2} = ${round(mm)} g/mol`], academicText: `Molar mass was estimated as ${round(mm)} g/mol from the entered atomic mass contributions.` }; },
  },
  {
    id: 'dilution-calculator',
    title: 'Dilution Calculator',
    category: 'chemistry',
    explanation: 'Calculate final concentration after dilution.',
    formula: 'C1V1 = C2V2',
    fields: [{ key: 'c1', label: 'Initial Concentration' }, { key: 'v1', label: 'Initial Volume' }, { key: 'v2', label: 'Final Volume' }],
    example: { c1: '2', v1: '25', v2: '100' },
    related: ['concentration-calculator', 'mole-calculator'],
    calculate: values => { const c1 = num(values, 'c1'), v1 = num(values, 'v1'), v2 = num(values, 'v2'); positive(v2, 'Final volume'); const c2 = c1 * v1 / v2; return { summary: [{ label: 'Final Concentration', value: round(c2), highlight: true }], interpretation: `Final concentration is ${round(c2)}.`, steps: [`C2 = (${c1} x ${v1}) / ${v2} = ${round(c2)}`], academicText: `Using C1V1 = C2V2, the final concentration was ${round(c2)}.` }; },
  },
  {
    id: 'ph-calculator',
    title: 'pH Calculator',
    category: 'chemistry',
    explanation: 'Calculate pH from hydrogen ion concentration.',
    formula: 'pH = -log10[H+]',
    fields: [{ key: 'h', label: '[H+] concentration', unit: 'mol/L' }],
    example: { h: '0.000001' },
    related: ['concentration-calculator', 'dilution-calculator'],
    calculate: values => { const h = num(values, 'h'); positive(h, '[H+] concentration'); const ph = -Math.log10(h); return { summary: [{ label: 'pH', value: round(ph), highlight: true }], interpretation: ph < 7 ? 'Acidic solution.' : ph > 7 ? 'Basic solution.' : 'Neutral solution.', steps: [`pH = -log10(${h}) = ${round(ph)}`], academicText: `The pH was calculated as ${round(ph)} from hydrogen ion concentration.` }; },
  },
  {
    id: 'concentration-calculator',
    title: 'Concentration Calculator',
    category: 'chemistry',
    explanation: 'Calculate molar concentration from moles and volume.',
    formula: 'C = n / V',
    fields: [{ key: 'moles', label: 'Moles', unit: 'mol' }, { key: 'volume', label: 'Volume', unit: 'L' }],
    example: { moles: '0.5', volume: '2' },
    related: ['mole-calculator', 'dilution-calculator'],
    calculate: values => { const n = num(values, 'moles'), v = num(values, 'volume'); positive(v, 'Volume'); const c = n / v; return { summary: [{ label: 'Concentration', value: `${round(c)} mol/L`, highlight: true }], interpretation: `Concentration is ${round(c)} mol/L.`, steps: [`C = ${n} / ${v} = ${round(c)} mol/L`], academicText: `Concentration was calculated as moles divided by volume, giving ${round(c)} mol/L.` }; },
  },
  {
    id: 'gas-law-calculator',
    title: 'Gas Law Calculator',
    category: 'chemistry',
    explanation: 'Calculate pressure using the ideal gas law.',
    formula: 'PV = nRT, so P = nRT / V',
    fields: [{ key: 'moles', label: 'Moles', unit: 'mol' }, { key: 'temperature', label: 'Temperature', unit: 'K' }, { key: 'volume', label: 'Volume', unit: 'L' }],
    example: { moles: '1', temperature: '273.15', volume: '22.4' },
    related: ['mole-calculator', 'concentration-calculator'],
    calculate: values => { const n = num(values, 'moles'), t = num(values, 'temperature'), v = num(values, 'volume'); positive(v, 'Volume'); const r = 0.082057; const p = n * r * t / v; return { summary: [{ label: 'Pressure', value: `${round(p)} atm`, highlight: true }], interpretation: `Gas pressure is ${round(p)} atm.`, steps: [`P = (${n} x ${r} x ${t}) / ${v} = ${round(p)} atm`], academicText: `Using the ideal gas law, pressure was calculated as ${round(p)} atm.` }; },
  },
];

export function getStemCalculator(idOrSlug?: string) {
  return stemCalculators.find(calculator => calculator.id === idOrSlug);
}

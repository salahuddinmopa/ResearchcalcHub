export type Difficulty = 'Basic' | 'Intermediate' | 'Advanced';
export type UserType = 'Student' | 'Researcher' | 'Teacher' | 'Professional';
export type CalculatorStatus = 'active' | 'coming-soon';

export interface Calculator {
  id: string;
  name: string;
  slug?: string;
  shortName: string;
  category: string;
  categoryId: string;
  description: string;
  longDescription: string;
  whenToUse: string;
  difficulty: Difficulty;
  tags: string[];
  researchMethods?: string[];
  useCases?: string[];
  status: CalculatorStatus;
  formula: string;
  formulaLatex?: string;
  relatedCalculators: string[];
  userTypes: UserType[];
  path: string;
  faqs: { question: string; answer: string }[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  status: CalculatorStatus;
  calculatorIds: string[];
}

export interface CalculatorResult {
  summary: { label: string; value: string; highlight?: boolean; subtext?: string }[];
  interpretation: string;
  interpretationLevel: 'excellent' | 'good' | 'acceptable' | 'poor' | 'neutral' | 'warning';
  steps: string[];
  academicText: string;
}

export interface DecisionInput {
  id?: string;
  createdAt?: string;
  title: string;
  description?: string;
  options: string[];
  userPriorities?: string;
  urgency?: 'low' | 'medium' | 'high';
  category?: 'career' | 'business' | 'finance' | 'lifestyle' | 'tech' | 'other';
}

export interface ProConItem {
  text: string;
  impact: number; // 1 to 5 scale
  category: 'Career' | 'Financial' | 'Health/Wellbeing' | 'Time/Effort' | 'Risk' | 'Growth' | 'Relationships' | 'Strategic';
}

export interface OptionProCon {
  option: string;
  pros: ProConItem[];
  cons: ProConItem[];
  netScore: number;
  summaryTakeaway: string;
}

export interface ComparisonCriterion {
  name: string;
  weightImportance: number; // 1 to 5
  description: string;
  optionScores: Record<string, { score: number; comment: string }>; // score 1-10
  winner: string;
}

export interface OptionSWOT {
  option: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface TiebreakerVerdict {
  winner: string;
  confidenceScore: number; // 0-100
  headline: string;
  rationale: string;
  keyDifferentiator: string;
  devilsAdvocate: string;
  tenTenTen: {
    tenMinutes: string;
    tenMonths: string;
    tenYears: string;
  };
  reversibility: {
    doorType: 'Type 1 (One-Way Door)' | 'Type 2 (Two-Way Door)';
    explanation: string;
    fallbackSafetyNet: string;
  };
  immediateNextStep: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  input: DecisionInput;
  summary: string;
  verdict: TiebreakerVerdict;
  prosAndCons: OptionProCon[];
  comparisonTable: {
    criteria: ComparisonCriterion[];
    overallScores: Record<string, number>;
  };
  swotAnalysis: OptionSWOT[];
  blindSpots: string[];
}

export interface StressTestResult {
  scenario: string;
  impactSummary: string;
  newRecommendedOption: string;
  shiftsInAdvantage: string[];
  contingencyAdvice: string;
}

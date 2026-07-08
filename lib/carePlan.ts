/**
 * Nurtura care-plan engine — pure, dependency-free logic.
 *
 * Turns a recipient's clinical intake (conditions, mobility, cognition,
 * ADL/IADL independence, quality-of-life) into a personalized, rule-based
 * care plan: an overall risk level, prioritized focus areas, and concrete
 * suggested actions. No LLM required — fully deterministic and unit-tested.
 *
 * Shared by the app (onboarding preview, dashboard) and the Convex backend
 * (cached plan summary). Keep this file free of React / React Native imports.
 */

export type Mobility =
  | 'independent'
  | 'cane'
  | 'walker'
  | 'wheelchair'
  | 'bedbound';
export type FallRisk = 'low' | 'medium' | 'high';
export type CognitiveStatus = 'alert' | 'mild' | 'moderate' | 'severe';
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface AdlEntry {
  key: string;
  /** 0 = dependent, 1 = needs help, 2 = independent */
  level: number;
}

export interface QualityOfLife {
  /** each 0 (worst) .. 4 (best); `pain` is inverted (0 = no pain .. 4 = severe) */
  mood: number;
  pain: number;
  sleep: number;
  social: number;
  energy: number;
}

export interface HealthInput {
  conditions?: string[];
  allergies?: string[];
  currentMedications?: string[];
  mobility?: Mobility;
  fallRisk?: FallRisk;
  cognitiveStatus?: CognitiveStatus;
  adl?: AdlEntry[];
  iadl?: AdlEntry[];
  qualityOfLife?: QualityOfLife;
}

export interface CarePlan {
  riskLevel: RiskLevel;
  riskScore: number;
  focusAreas: string[];
  suggestions: string[];
  summary: string;
}

/** Catalog of common chronic conditions offered in intake. */
export const CONDITION_CATALOG: { key: string; label: string; emoji: string }[] = [
  { key: 'hypertension', label: 'High Blood Pressure', emoji: '🩸' },
  { key: 'diabetes', label: 'Diabetes', emoji: '💉' },
  { key: 'heart_disease', label: 'Heart Disease', emoji: '❤️' },
  { key: 'copd', label: 'COPD / Respiratory', emoji: '🫁' },
  { key: 'arthritis', label: 'Arthritis', emoji: '🦴' },
  { key: 'dementia', label: 'Dementia / Alzheimer’s', emoji: '🧠' },
  { key: 'stroke', label: 'Stroke History', emoji: '🧠' },
  { key: 'parkinsons', label: 'Parkinson’s', emoji: '🤝' },
  { key: 'cancer', label: 'Cancer', emoji: '🎗️' },
  { key: 'kidney_disease', label: 'Kidney Disease', emoji: '🫘' },
  { key: 'depression', label: 'Depression / Anxiety', emoji: '💭' },
  { key: 'osteoporosis', label: 'Osteoporosis', emoji: '🦴' },
  { key: 'vision_loss', label: 'Vision Loss', emoji: '👁️' },
  { key: 'hearing_loss', label: 'Hearing Loss', emoji: '👂' },
];

export const ADL_CATALOG: { key: string; label: string }[] = [
  { key: 'bathing', label: 'Bathing' },
  { key: 'dressing', label: 'Dressing' },
  { key: 'toileting', label: 'Toileting' },
  { key: 'transferring', label: 'Transferring' },
  { key: 'continence', label: 'Continence' },
  { key: 'feeding', label: 'Feeding' },
];

export const IADL_CATALOG: { key: string; label: string }[] = [
  { key: 'medications', label: 'Managing Medications' },
  { key: 'finances', label: 'Managing Finances' },
  { key: 'cooking', label: 'Preparing Meals' },
  { key: 'transport', label: 'Transportation' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'housekeeping', label: 'Housekeeping' },
];

const MOBILITY_SCORE: Record<Mobility, number> = {
  independent: 0,
  cane: 1,
  walker: 2,
  wheelchair: 3,
  bedbound: 4,
};

const COGNITION_SCORE: Record<CognitiveStatus, number> = {
  alert: 0,
  mild: 1,
  moderate: 3,
  severe: 4,
};

const FALL_SCORE: Record<FallRisk, number> = { low: 0, medium: 2, high: 4 };

/** Average dependence across ADL/IADL entries, scaled 0..4 (higher = more help needed). */
function dependenceScore(entries?: AdlEntry[]): number {
  if (!entries || entries.length === 0) return 0;
  const avgLevel =
    entries.reduce((sum, e) => sum + e.level, 0) / entries.length; // 0..2
  return (2 - avgLevel) * 2; // invert + scale → 0..4
}

/**
 * Generate a deterministic care plan from intake data.
 */
export function generateCarePlan(h: HealthInput): CarePlan {
  const focusAreas: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  const conditions = h.conditions ?? [];
  const has = (key: string) => conditions.includes(key);

  // --- Mobility & falls ---
  const mobScore = h.mobility ? MOBILITY_SCORE[h.mobility] : 0;
  const fallScore = h.fallRisk ? FALL_SCORE[h.fallRisk] : 0;
  score += mobScore + fallScore;
  if (h.fallRisk === 'high' || mobScore >= 2 || has('osteoporosis')) {
    focusAreas.push('Fall prevention');
    suggestions.push('Clear walking paths and add grab bars in the bathroom.');
    suggestions.push('Keep frequently used items within easy reach.');
  }

  // --- Cognition ---
  const cogScore = h.cognitiveStatus ? COGNITION_SCORE[h.cognitiveStatus] : 0;
  score += cogScore;
  if (has('dementia') || cogScore >= 1) {
    focusAreas.push('Memory & routine support');
    suggestions.push('Keep a consistent daily routine and use reminders.');
    if (cogScore >= 3 || has('dementia')) {
      suggestions.push('Label rooms/drawers and reduce clutter to limit confusion.');
    }
  }

  // --- Condition-specific ---
  if (has('diabetes')) {
    focusAreas.push('Blood sugar monitoring');
    suggestions.push('Log blood glucose readings and watch for highs/lows.');
    score += 1;
  }
  if (has('hypertension') || has('heart_disease')) {
    focusAreas.push('Heart & blood pressure');
    suggestions.push('Track blood pressure regularly and limit added salt.');
    score += 1;
  }
  if (has('copd')) {
    focusAreas.push('Respiratory care');
    suggestions.push('Monitor breathing and keep inhalers/oxygen accessible.');
    score += 1;
  }
  if (has('depression')) {
    focusAreas.push('Emotional wellbeing');
    suggestions.push('Encourage social connection and daily light activity.');
    score += 1;
  }

  // --- Medications ---
  const medCount = h.currentMedications?.length ?? 0;
  if (medCount >= 5) {
    focusAreas.push('Medication management');
    suggestions.push('Use a pill organizer; review for interactions (polypharmacy).');
    score += 2;
  } else if (medCount > 0) {
    suggestions.push('Set reminders so no medication doses are missed.');
  }

  // --- Independence (ADL/IADL) ---
  const adlDep = dependenceScore(h.adl);
  const iadlDep = dependenceScore(h.iadl);
  score += adlDep + iadlDep / 2;
  if (adlDep >= 2) {
    focusAreas.push('Daily living assistance');
    suggestions.push('Plan hands-on help with bathing, dressing, and transfers.');
  }
  if (iadlDep >= 2) {
    suggestions.push('Assist with meals, transportation, and household tasks.');
  }

  // --- Quality of life ---
  const qol = h.qualityOfLife;
  if (qol) {
    if (qol.pain >= 3) {
      focusAreas.push('Pain management');
      suggestions.push('Discuss pain control with the care provider.');
      score += 1;
    }
    if (qol.sleep <= 1) {
      suggestions.push('Improve sleep hygiene — consistent bedtime, less screen time.');
      score += 0.5;
    }
    if (qol.social <= 1) {
      suggestions.push('Schedule regular visits or calls to reduce isolation.');
    }
    if (qol.mood <= 1) {
      focusAreas.push('Emotional wellbeing');
    }
  }

  if (has('vision_loss') || has('hearing_loss')) {
    focusAreas.push('Sensory support');
    suggestions.push('Improve lighting/contrast and reduce background noise.');
  }

  // De-duplicate while preserving order.
  const uniqFocus = [...new Set(focusAreas)];
  const uniqSuggestions = [...new Set(suggestions)];

  // Risk banding from accumulated score.
  let riskLevel: RiskLevel = 'low';
  if (score >= 9) riskLevel = 'high';
  else if (score >= 4) riskLevel = 'moderate';

  if (uniqFocus.length === 0) {
    uniqFocus.push('General wellness');
    uniqSuggestions.push('Keep up regular check-ins, activity, and nutrition.');
  }

  const summary = buildSummary(riskLevel, uniqFocus);

  return {
    riskLevel,
    riskScore: Math.round(score * 10) / 10,
    focusAreas: uniqFocus,
    suggestions: uniqSuggestions,
    summary,
  };
}

function buildSummary(riskLevel: RiskLevel, focus: string[]): string {
  const band =
    riskLevel === 'high'
      ? 'higher-need'
      : riskLevel === 'moderate'
        ? 'moderate-need'
        : 'lower-need';
  const areas =
    focus.length <= 2
      ? focus.join(' and ')
      : `${focus.slice(0, -1).join(', ')}, and ${focus[focus.length - 1]}`;
  return `This is a ${band} care plan focused on ${areas.toLowerCase()}.`;
}

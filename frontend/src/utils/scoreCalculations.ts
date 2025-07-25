/**
 * SCA and CVA Score Calculation Utilities
 * Based on official SCA and CVA evaluation methodology
 */

import type { TraditionalSCAEvaluation, CVAAffectiveAssessment } from 'coffee-tracker-shared';

/**
 * SCA Cupping Protocol Score Calculation (2004 SCA Protocol)
 * Formula: Final Score = Σ(F₁...F₁₀) - (2 × Tainted cups) - (4 × Faulty cups)
 * Where F₁...F₁₀ are the ten individual attribute scores (6.00-10.00 each)
 */
export function calculateSCAScore(evaluation: TraditionalSCAEvaluation): number {
  // Ten individual attributes (6.00-10.00 points each)
  // F₁ through F₁₀ in the SCA formula (note: aroma field is not used in SCA 2004)
  const attributes = [
    evaluation.fragrance || 6,        // F₁: Fragrance/Aroma (combined orthonasal evaluation)
    evaluation.flavor || 6,           // F₂: Combined taste and retronasal aroma perception
    evaluation.aftertaste || 6,       // F₃: Persistence and quality of flavor after swallowing
    evaluation.acidity || 6,          // F₄: Perceived brightness or liveliness
    evaluation.body || 6,             // F₅: Mouthfeel weight and viscosity
    evaluation.balance || 6,          // F₆: Harmony between acidity, sweetness, body, and flavor
    evaluation.sweetness || 6,        // F₇: Gustatory or retronasal perception of sweetness
    evaluation.cleanCup || 6,         // F₈: Absence of negative particles, odors
    evaluation.uniformity || 6,       // F₉: Consistency across five cups
    evaluation.overall || 6,          // F₁₀: General impression, additional desirable characteristics
  ];

  // Sum of all ten attributes (Σ F₁...F₁₀)
  const attributeSum = attributes.reduce((sum, score) => sum + score, 0);

  // Defect penalties based on number of cups affected
  // T = number of tainted cups × 2
  // D = number of faulty cups × 4
  const taintedCups = Math.floor((evaluation.taintDefects || 0) / 2); // Convert points back to cups
  const faultyCups = Math.floor((evaluation.faultDefects || 0) / 4);   // Convert points back to cups
  
  const taintPenalty = taintedCups * 2;
  const faultPenalty = faultyCups * 4;

  // SCA Formula: Final Score = Σ(F₁...F₁₀) - (2 × Tainted cups) - (4 × Faulty cups)
  const finalScore = attributeSum - taintPenalty - faultPenalty;

  // Round to nearest 0.25 and ensure within valid range
  // Minimum possible: 10 attributes × 6.00 = 60, maximum: 10 attributes × 10.00 = 100
  return Math.max(60, Math.min(100, Math.round(finalScore * 4) / 4));
}

/**
 * CVA Affective Assessment Score Calculation
 * Official Formula: S = 0.65625 × Σhi + 52.75 - 2u - 4d
 * Where:
 * - S = Final cupping score prior to rounding (rounded to nearest 0.25)
 * - Σhi = Sum of all eight 9-point section scores from i=1 (fragrance) to i=8 (overall)
 * - hi = 9-point score of each affective section (1-9 scale, 5=neutral liking)
 * - u = Number of non-uniform cups
 * - d = Number of defective cups
 */
export function calculateCVAScore(evaluation: CVAAffectiveAssessment): number {
  // All eight sections (1-9 points each, default to 5 = neutral liking)
  // i=1 to i=8: fragrance, aroma, flavor, aftertaste, acidity, sweetness, mouthfeel, overall
  const sectionScores = [
    evaluation.fragrance || 5,  // i=1: Fragrance impression of quality
    evaluation.aroma || 5,      // i=2: Aroma impression of quality
    evaluation.flavor || 5,     // i=3: Flavor impression of quality
    evaluation.aftertaste || 5, // i=4: Aftertaste impression of quality
    evaluation.acidity || 5,    // i=5: Acidity impression of quality
    evaluation.sweetness || 5,  // i=6: Sweetness impression of quality
    evaluation.mouthfeel || 5,  // i=7: Mouthfeel impression of quality
    evaluation.overall || 5,    // i=8: Overall impression of quality
  ];

  // Sum of all eight section scores (Σhi from i=1 to i=8)
  const sumOfScores = sectionScores.reduce((sum, score) => sum + score, 0);

  // Cup penalties
  const nonUniformCups = evaluation.nonUniformCups || 0; // u
  const defectiveCups = evaluation.defectiveCups || 0; // d

  // Official CVA Formula: S = 0.65625 × Σhi + 52.75 - 2u - 4d
  const cvaScore = (0.65625 * sumOfScores) + 52.75 - (2 * nonUniformCups) - (4 * defectiveCups);

  // Round to nearest 0.25 and ensure within valid range
  return Math.max(58, Math.min(100, Math.round(cvaScore * 4) / 4));
}

/**
 * Validate SCA evaluation completeness
 * Check if enough fields are completed for a valid score calculation
 */
export function isSCAEvaluationComplete(evaluation: TraditionalSCAEvaluation): boolean {
  const requiredFields = [
    evaluation.fragrance,
    evaluation.aroma,
    evaluation.flavor,
    evaluation.aftertaste,
    evaluation.acidity,
    evaluation.body,
    evaluation.balance,
    evaluation.overall,
  ];

  // At least 6 out of 8 quality attributes should be completed
  const completedFields = requiredFields.filter(field => field !== undefined && field !== null).length;
  return completedFields >= 6;
}

/**
 * Validate CVA Affective evaluation completeness
 * Check if enough fields are completed for a valid score calculation
 */
export function isCVAEvaluationComplete(evaluation: CVAAffectiveAssessment): boolean {
  const requiredFields = [
    evaluation.fragrance,
    evaluation.aroma,
    evaluation.flavor,
    evaluation.aftertaste,
    evaluation.acidity,
    evaluation.sweetness,
    evaluation.mouthfeel,
    evaluation.overall,
  ];

  // At least 6 out of 8 sections should be completed
  const completedFields = requiredFields.filter(field => field !== undefined && field !== null).length;
  return completedFields >= 6;
}

/**
 * Get SCA score interpretation
 * Provide qualitative description of SCA score ranges
 */
export function getSCAScoreInterpretation(score: number): string {
  if (score >= 90) return 'Outstanding (90+)';
  if (score >= 85) return 'Excellent (85-89)';
  if (score >= 80) return 'Very Good (80-84)';
  if (score >= 70) return 'Good (70-79)';
  if (score >= 60) return 'Fair (60-69)';
  return 'Poor (Below 60)';
}

/**
 * Get CVA score interpretation
 * Provide qualitative description of CVA Affective Assessment score ranges
 */
export function getCVAScoreInterpretation(score: number): string {
  if (score >= 90) return 'Exceptional Quality (90+)';
  if (score >= 85) return 'Excellent Quality (85-89)';
  if (score >= 80) return 'Very High Quality (80-84)';
  if (score >= 75) return 'High Quality (75-79)';
  if (score >= 70) return 'Good Quality (70-74)';
  if (score >= 65) return 'Acceptable Quality (65-69)';
  return 'Below Standard (Below 65)';
}

/**
 * Calculate quality percentile for SCA score
 * Based on industry standards and typical score distributions
 */
export function getSCAPercentile(score: number): number {
  if (score >= 90) return 95;
  if (score >= 85) return 85;
  if (score >= 80) return 70;
  if (score >= 75) return 50;
  if (score >= 70) return 30;
  if (score >= 65) return 15;
  return 5;
}

/**
 * Calculate quality percentile for CVA score
 * Based on CVA methodology and typical score distributions
 */
export function getCVAPercentile(score: number): number {
  if (score >= 90) return 95;
  if (score >= 85) return 85;
  if (score >= 80) return 70;
  if (score >= 75) return 50;
  if (score >= 70) return 30;
  if (score >= 65) return 15;
  return 5;
}

/**
 * Format score for display (ensure proper decimal places)
 */
export function formatScore(score: number): string {
  return score.toFixed(2);
}

/**
 * Validate score range for SCA system
 */
export function isValidSCAScore(score: number): boolean {
  return score >= 60 && score <= 100;
}

/**
 * Validate score range for CVA system
 */
export function isValidCVAScore(score: number): boolean {
  return score >= 58 && score <= 100;
}

/**
 * Calculate theoretical maximum score for SCA evaluation
 */
export function getSCAMaximumScore(): number {
  // 10 attributes × 10 points each = 100 points maximum (before defects)
  return 100;
}

/**
 * Calculate theoretical maximum score for CVA evaluation
 */
export function getCVAMaximumScore(): number {
  // Official Formula: S = 0.65625 × Σhi + 52.75 - 2u - 4d
  // Maximum: 0.65625 × (8 × 9) + 52.75 - 0 - 0 = 0.65625 × 72 + 52.75 = 47.25 + 52.75 = 100
  // With perfect scores (all 9s) and no defects, theoretical max is exactly 100
  return 100;
}

/**
 * Get score color for UI display based on score range
 */
export function getScoreColor(score: number, system: 'sca' | 'cva'): string {
  const isHigh = system === 'sca' ? score >= 85 : score >= 85;
  const isMedium = system === 'sca' ? score >= 75 : score >= 75;
  const isLow = system === 'sca' ? score >= 65 : score >= 65;

  if (isHigh) return 'text-green-600 dark:text-green-400';
  if (isMedium) return 'text-yellow-600 dark:text-yellow-400';
  if (isLow) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Export all calculation functions for easy import
 */
export const ScoreCalculations = {
  sca: {
    calculate: calculateSCAScore,
    isComplete: isSCAEvaluationComplete,
    interpret: getSCAScoreInterpretation,
    percentile: getSCAPercentile,
    isValid: isValidSCAScore,
    maximum: getSCAMaximumScore,
  },
  cva: {
    calculate: calculateCVAScore,
    isComplete: isCVAEvaluationComplete,
    interpret: getCVAScoreInterpretation,
    percentile: getCVAPercentile,
    isValid: isValidCVAScore,
    maximum: getCVAMaximumScore,
  },
  common: {
    format: formatScore,
    getColor: getScoreColor,
  },
};

export default ScoreCalculations;
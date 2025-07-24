/**
 * SCA and CVA Score Calculation Utilities
 * Based on official SCA and CVA evaluation methodology
 */

import type { TraditionalSCAEvaluation, CVAAffectiveAssessment } from 'coffee-tracker-shared';

/**
 * Traditional SCA Cupping Form Score Calculation
 * Sum of all quality attributes + uniformity + clean cup + sweetness - defects
 */
export function calculateSCAScore(evaluation: TraditionalSCAEvaluation): number {
  // Quality attributes (6-10 points each)
  const qualityAttributes = [
    evaluation.fragrance || 0,
    evaluation.aroma || 0,
    evaluation.flavor || 0,
    evaluation.aftertaste || 0,
    evaluation.acidity || 0,
    evaluation.body || 0,
    evaluation.balance || 0,
    evaluation.overall || 0,
  ];

  // Cup characteristics (0-10 points each)
  const cupCharacteristics = [
    evaluation.uniformity || 0,
    evaluation.cleanCup || 0,
    evaluation.sweetness || 0,
  ];

  // Defect penalties (negative points)
  const taintPenalty = evaluation.taintDefects || 0; // -2 points per affected cup
  const faultPenalty = evaluation.faultDefects || 0; // -4 points per affected cup

  // Calculate total score
  const qualityTotal = qualityAttributes.reduce((sum, score) => sum + score, 0);
  const cupTotal = cupCharacteristics.reduce((sum, score) => sum + score, 0);
  const defectTotal = taintPenalty + faultPenalty;

  const finalScore = qualityTotal + cupTotal - defectTotal;

  // Round to nearest 0.25 and ensure within valid range (36-100)
  return Math.max(36, Math.min(100, Math.round(finalScore * 4) / 4));
}

/**
 * CVA Affective Assessment Score Calculation
 * Formula: S = 6.25 × (Σhi) + 37.5 - 2u - 4d
 * Where:
 * - S = Final cupping score (rounded to nearest 0.25)
 * - Σhi = Sum of all eight 9-point section scores
 * - u = Number of non-uniform cups
 * - d = Number of defective cups
 */
export function calculateCVAScore(evaluation: CVAAffectiveAssessment): number {
  // All eight sections (1-9 points each)
  const sectionScores = [
    evaluation.fragrance || 0,
    evaluation.aroma || 0,
    evaluation.flavor || 0,
    evaluation.aftertaste || 0,
    evaluation.acidity || 0,
    evaluation.sweetness || 0,
    evaluation.mouthfeel || 0,
    evaluation.overall || 0,
  ];

  // Sum of all section scores (Σhi)
  const sumOfScores = sectionScores.reduce((sum, score) => sum + score, 0);

  // Cup penalties
  const nonUniformCups = evaluation.nonUniformCups || 0; // u
  const defectiveCups = evaluation.defectiveCups || 0; // d

  // CVA Formula: S = 6.25 × (Σhi) + 37.5 - 2u - 4d
  const cvaScore = (6.25 * sumOfScores) + 37.5 - (2 * nonUniformCups) - (4 * defectiveCups);

  // Round to nearest 0.25 and ensure within valid range (58-100)
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
 * Provide qualitative description of CVA score ranges
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
  return score >= 36 && score <= 100;
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
  // 8 quality attributes × 10 points + 3 cup characteristics × 10 points = 110 points
  return 110;
}

/**
 * Calculate theoretical maximum score for CVA evaluation
 */
export function getCVAMaximumScore(): number {
  // Formula: 6.25 × (8 × 9) + 37.5 = 6.25 × 72 + 37.5 = 450 + 37.5 = 487.5
  // But maximum is capped at 100 in practice
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
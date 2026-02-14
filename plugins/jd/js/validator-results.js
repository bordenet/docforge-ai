/**
 * JD Validator - Result Assembly
 *
 * Functions for building validation results and UI helpers.
 */

import { getGrade as _getGrade } from '../../../shared/js/validator.js';

/**
 * Create empty result when no text provided
 */
export function createEmptyResult() {
  return {
    score: 0,
    totalScore: 0,
    grade: 'F',
    feedback: ['No content to validate'],
    deductions: [],
    wordCount: 0,
    warnings: [],
    warningCount: 0,
    isInternal: false,
    length: { score: 0, maxScore: 25, issues: ['No content'] },
    inclusivity: { score: 0, maxScore: 25, issues: ['No content'] },
    culture: { score: 0, maxScore: 25, issues: ['No content'] },
    transparency: { score: 0, maxScore: 25, issues: ['No content'] }
  };
}

/**
 * Assemble final validation result
 */
export function assembleResult(score, feedback, deductions, wordCountResult, jdValidation,
    masculineResult, extrovertResult, redFlagResult, slopResult,
    compensationResult, encouragementResult, isInternal) {
  // Category breakdowns for UI display
  const lengthDeduction = wordCountResult.penalty;
  const masculineDeduction = masculineResult.penalty;
  const extrovertDeduction = extrovertResult.penalty;
  const redFlagDeduction = redFlagResult.penalty;
  const slopDeduction = slopResult.penalty;
  const compensationDeduction = compensationResult.penalty;
  const encouragementDeduction = encouragementResult.penalty;

  const rawLength = 25 - Math.min(25, lengthDeduction);
  const rawInclusivity = Math.max(0, 25 - masculineDeduction - extrovertDeduction);
  const rawCulture = Math.max(0, 25 - redFlagDeduction - slopDeduction);
  const rawTransparency = Math.max(0, 25 - compensationDeduction - encouragementDeduction);

  const wordCount = wordCountResult.wordCount;
  const lengthIssues = lengthDeduction > 0
    ? (wordCount < 400 ? [`Short (${wordCount} words)`] : [`Long (${wordCount} words)`])
    : [];

  const inclusivityIssues = [
    ...jdValidation.warnings.filter(w => w.type === 'masculine-coded').map(w => `Masculine-coded: "${w.word}"`),
    ...jdValidation.warnings.filter(w => w.type === 'extrovert-bias').map(w => `Extrovert-bias: "${w.phrase}"`)
  ];

  const cultureIssues = [
    ...jdValidation.warnings.filter(w => w.type === 'red-flag').map(w => `Red flag: "${w.phrase}"`),
    ...(slopDeduction > 0 ? [`AI patterns detected (-${slopDeduction})`] : [])
  ];

  const transparencyIssues = [
    ...(compensationDeduction > 0 ? ['No compensation range'] : []),
    ...(encouragementDeduction > 0 ? ['Missing encouragement statement'] : [])
  ];

  return {
    score,
    totalScore: score,
    grade: _getGrade(score),
    feedback,
    deductions,
    wordCount: wordCountResult.wordCount,
    warnings: jdValidation.warnings,
    warningCount: jdValidation.warnings.length,
    isInternal,
    slopDetection: {
      ...slopResult.slopPenalty,
      deduction: slopResult.penalty,
      issues: slopResult.issues
    },
    length: { score: rawLength, maxScore: 25, issues: lengthIssues },
    inclusivity: { score: rawInclusivity, maxScore: 25, issues: inclusivityIssues },
    culture: { score: rawCulture, maxScore: 25, issues: cultureIssues },
    transparency: { score: rawTransparency, maxScore: 25, issues: transparencyIssues }
  };
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


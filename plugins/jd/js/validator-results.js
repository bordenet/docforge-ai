/**
 * JD Validator - Result Assembly
 *
 * Functions for building validation results and UI helpers.
 */

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
    grade: getGrade(score),
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

/**
 * Get letter grade from numeric score
 */
export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get Tailwind color class for score
 */
export function getScoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get label based on score for UI display
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}


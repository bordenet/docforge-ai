/**
 * JD Validator - Main Entry Point
 *
 * Validates job descriptions for inclusive language, structure, and best practices.
 * Uses penalty-based scoring (start at 100, deduct for issues).
 */

import {
  MASCULINE_CODED,
  EXTROVERT_BIAS,
  RED_FLAGS,
  SUGGESTIONS
} from './validator-config.js';

import {
  extractMandatedSections,
  isInMandatedSection
} from './validator-detection.js';

import {
  scoreWordCount,
  scoreMasculineCoded,
  scoreExtrovertBias,
  scoreRedFlags,
  scoreCompensation,
  scoreEncouragement,
  scoreSlopPenalty
} from './validator-scoring.js';

// Re-export detection functions for testing
export {
  extractMandatedSections,
  isInMandatedSection,
  detectMasculineCoded,
  detectExtrovertBias,
  detectRedFlags,
  detectCompensation,
  detectEncouragement,
  detectWordCount
} from './validator-detection.js';

// Re-export scoring functions for testing
export {
  scoreWordCount,
  scoreMasculineCoded,
  scoreExtrovertBias,
  scoreRedFlags,
  scoreCompensation,
  scoreEncouragement,
  scoreSlopPenalty
} from './validator-scoring.js';

/**
 * Validate JD content for inclusive language and red flags
 * @param {string} text - The JD text to validate
 * @returns {Object} Validation result with warnings array and valid flag
 */
export function validateJDContent(text) {
  const warnings = [];
  const { cleanText, mandatedSections } = extractMandatedSections(text);

  // Check for masculine-coded words
  MASCULINE_CODED.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(word, mandatedSections)) {
        warnings.push({
          type: 'masculine-coded',
          word,
          suggestion: SUGGESTIONS[word.toLowerCase()] || `Consider replacing "${word}" with more inclusive language`
        });
      }
    }
  });

  // Check for extrovert-bias phrases
  EXTROVERT_BIAS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        warnings.push({
          type: 'extrovert-bias',
          phrase,
          suggestion: SUGGESTIONS[phrase.toLowerCase()] || `Consider replacing "${phrase}" with more inclusive language`
        });
      }
    }
  });

  // Check for red flag phrases
  RED_FLAGS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        warnings.push({
          type: 'red-flag',
          phrase,
          suggestion: SUGGESTIONS[phrase.toLowerCase()] || `Consider replacing "${phrase}" with more positive language`
        });
      }
    }
  });

  return {
    warnings,
    valid: warnings.length === 0
  };
}

/**
 * Validate a job description and return a score with feedback
 * @param {string} text - The JD text to validate
 * @param {string} [postingType='external'] - Whether this is an 'internal' or 'external' posting
 * @returns {Object} Validation result with score, grade, and feedback
 */
export function validateDocument(text, postingType = 'external') {
  if (!text || typeof text !== 'string' || text.trim() === '') {
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

  const feedback = [];
  let score = 100;
  const deductions = [];

  // Detect internal posting
  const isInternal = postingType === 'internal' ||
                     /\*\*INTERNAL POSTING\*\*/i.test(text) ||
                     /internal posting/i.test(text);

  // Get JD content validation
  const jdValidation = validateJDContent(text);

  // Score each dimension
  const wordCountResult = scoreWordCount(text);
  feedback.push(wordCountResult.feedback);
  if (wordCountResult.penalty > 0) {
    score -= wordCountResult.penalty;
    deductions.push(wordCountResult.deduction);
  }

  const masculineResult = scoreMasculineCoded(jdValidation.warnings);
  feedback.push(masculineResult.feedback);
  if (masculineResult.penalty > 0) {
    score -= masculineResult.penalty;
    deductions.push(masculineResult.deduction);
  }

  const extrovertResult = scoreExtrovertBias(jdValidation.warnings);
  feedback.push(extrovertResult.feedback);
  if (extrovertResult.penalty > 0) {
    score -= extrovertResult.penalty;
    deductions.push(extrovertResult.deduction);
  }

  const redFlagResult = scoreRedFlags(jdValidation.warnings);
  feedback.push(redFlagResult.feedback);
  if (redFlagResult.penalty > 0) {
    score -= redFlagResult.penalty;
    deductions.push(redFlagResult.deduction);
  }

  const compensationResult = scoreCompensation(text, isInternal);
  feedback.push(compensationResult.feedback);
  if (compensationResult.penalty > 0) {
    score -= compensationResult.penalty;
    deductions.push(compensationResult.deduction);
  }

  const encouragementResult = scoreEncouragement(text);
  feedback.push(encouragementResult.feedback);
  if (encouragementResult.penalty > 0) {
    score -= encouragementResult.penalty;
    deductions.push(encouragementResult.deduction);
  }

  const slopResult = scoreSlopPenalty(text);
  if (slopResult.feedback) {
    feedback.push(slopResult.feedback);
  }
  if (slopResult.penalty > 0) {
    score -= slopResult.penalty;
    deductions.push(slopResult.deduction);
  }

  // Floor score at 0
  score = Math.max(0, score);

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
 * @param {number} score - Numeric score 0-100
 * @returns {string} Letter grade
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
 * @param {number} score - Numeric score 0-100
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score) {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get label based on score for UI display
 * @param {number} score - Numeric score 0-100
 * @returns {string} Score label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}


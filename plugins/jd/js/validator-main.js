/**
 * JD Validator - Main Validation Logic
 *
 * Core validateDocument function with dimension scoring.
 */

import {
  MASCULINE_CODED,
  EXTROVERT_BIAS,
  RED_FLAGS,
  SUGGESTIONS
} from './validator-config.js';

import { extractMandatedSections, isInMandatedSection } from './validator-detection.js';

import {
  scoreWordCount,
  scoreMasculineCoded,
  scoreExtrovertBias,
  scoreRedFlags,
  scoreCompensation,
  scoreEncouragement,
  scoreSlopPenalty
} from './validator-scoring.js';

import {
  createEmptyResult,
  assembleResult,
  getGrade,
  getScoreColor,
  getScoreLabel
} from './validator-results.js';

// Re-export UI helper functions
export { getGrade, getScoreColor, getScoreLabel } from './validator-results.js';

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
    return createEmptyResult();
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

  return assembleResult(score, feedback, deductions, wordCountResult, jdValidation,
    masculineResult, extrovertResult, redFlagResult, slopResult,
    compensationResult, encouragementResult, isInternal);
}

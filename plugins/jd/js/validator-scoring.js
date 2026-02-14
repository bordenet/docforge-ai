/**
 * JD Validator - Scoring Functions
 *
 * JD uses penalty-based scoring (start at 100, deduct for issues)
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';

/**
 * Score word count - ideal range is 400-700 words
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, wordCount, feedback, deduction }
 */
export function scoreWordCount(text) {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 400 && wordCount <= 700) {
    return {
      penalty: 0,
      maxPenalty: 15,
      wordCount,
      feedback: `✅ Good length: ${wordCount} words (ideal: 400-700)`,
      deduction: null
    };
  } if (wordCount < 400) {
    const penalty = Math.min(15, Math.floor((400 - wordCount) / 20));
    return {
      penalty,
      maxPenalty: 15,
      wordCount,
      feedback: `⚠️ Short: ${wordCount} words (aim for 400-700)`,
      deduction: `-${penalty} pts: Too short (${wordCount} words, aim for 400+)`
    };
  } 
    const penalty = Math.min(10, Math.floor((wordCount - 700) / 50));
    return {
      penalty,
      maxPenalty: 10,
      wordCount,
      feedback: `⚠️ Long: ${wordCount} words (aim for ≤700)`,
      deduction: `-${penalty} pts: Too long (${wordCount} words, aim for ≤700)`
    };
  
}

/**
 * Score masculine-coded words - penalize gender-exclusive language
 * @param {Array} warnings - Array of warning objects
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreMasculineCoded(warnings) {
  const count = warnings.filter(w => w.type === 'masculine-coded').length;

  if (count > 0) {
    const penalty = Math.min(25, count * 5);
    return {
      penalty,
      maxPenalty: 25,
      count,
      feedback: `🚨 ${count} masculine-coded word(s) found`,
      deduction: `-${penalty} pts: ${count} masculine-coded word(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 25,
    count: 0,
    feedback: '✅ No masculine-coded words',
    deduction: null
  };
}

/**
 * Score extrovert-bias phrases - penalize neurodiversity-exclusive language
 * @param {Array} warnings - Array of warning objects
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreExtrovertBias(warnings) {
  const count = warnings.filter(w => w.type === 'extrovert-bias').length;

  if (count > 0) {
    const penalty = Math.min(20, count * 5);
    return {
      penalty,
      maxPenalty: 20,
      count,
      feedback: `🚨 ${count} extrovert-bias phrase(s) found`,
      deduction: `-${penalty} pts: ${count} extrovert-bias phrase(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 20,
    count: 0,
    feedback: '✅ No extrovert-bias phrases',
    deduction: null
  };
}

/**
 * Score red flag phrases - penalize toxic culture signals
 * @param {Array} warnings - Array of warning objects
 * @returns {Object} { penalty, maxPenalty, count, feedback, deduction }
 */
export function scoreRedFlags(warnings) {
  const count = warnings.filter(w => w.type === 'red-flag').length;

  if (count > 0) {
    const penalty = Math.min(25, count * 5);
    return {
      penalty,
      maxPenalty: 25,
      count,
      feedback: `🚨 ${count} red flag phrase(s) found`,
      deduction: `-${penalty} pts: ${count} red flag phrase(s)`
    };
  }

  return {
    penalty: 0,
    maxPenalty: 25,
    count: 0,
    feedback: '✅ No red flag phrases',
    deduction: null
  };
}

/**
 * Score compensation transparency - require salary range for external postings
 * @param {string} text - The JD text to validate
 * @param {boolean} isInternal - Whether this is an internal posting
 * @returns {Object} { penalty, maxPenalty, hasCompensation, feedback, deduction, skipped }
 */
export function scoreCompensation(text, isInternal) {
  if (isInternal) {
    return {
      penalty: 0,
      maxPenalty: 10,
      hasCompensation: null,
      feedback: 'ℹ️ Internal posting - compensation check skipped',
      deduction: null,
      skipped: true
    };
  }

  const hasCompensation = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                          /salary.*\$[\d,]+/i.test(text) ||
                          /compensation.*\$[\d,]+/i.test(text) ||
                          /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i.test(text) ||
                          /[\d,]+\s*[-–—]\s*[\d,]+\s*(USD|EUR|GBP|CAD|AUD)/i.test(text) ||
                          /[€£][\d,]+\s*[-–—]\s*[€£][\d,]+/i.test(text);

  if (hasCompensation) {
    return {
      penalty: 0,
      maxPenalty: 10,
      hasCompensation: true,
      feedback: '✅ Compensation range included',
      deduction: null,
      skipped: false
    };
  }

  return {
    penalty: 10,
    maxPenalty: 10,
    hasCompensation: false,
    feedback: '⚠️ No compensation range found',
    deduction: '-10 pts: No compensation range found',
    skipped: false
  };
}

/**
 * Score encouragement statement - require "60-70%" or similar inclusive language
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, hasEncouragement, feedback, deduction }
 */
export function scoreEncouragement(text) {
  const hasEncouragement = /60[-–]70%|60\s*[-–]\s*70\s*%|60\s+to\s+70\s*%|meet.*most.*(requirements|qualifications)|we\s+encourage.*apply|don't.*meet.*all.*(qualifications|requirements)/i.test(text);

  if (hasEncouragement) {
    return {
      penalty: 0,
      maxPenalty: 5,
      hasEncouragement: true,
      feedback: '✅ Includes encouragement statement',
      deduction: null
    };
  }

  return {
    penalty: 5,
    maxPenalty: 5,
    hasEncouragement: false,
    feedback: '⚠️ Missing encouragement statement (e.g., "If you meet 60-70%...")',
    deduction: '-5 pts: Missing "60-70%" encouragement statement'
  };
}

/**
 * Score AI slop - penalize generic AI-generated language
 * @param {string} text - The JD text to validate
 * @returns {Object} { penalty, maxPenalty, slopPenalty, issues, feedback, deduction }
 */
export function scoreSlopPenalty(text) {
  const slopPenalty = getSlopPenalty(text);
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    const penalty = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues && slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }

    if (penalty > 0) {
      return {
        penalty,
        maxPenalty: 5,
        slopPenalty,
        issues: slopIssues,
        feedback: '⚠️ AI-generated language detected - consider making more authentic',
        deduction: `-${penalty} pts: AI slop detected`
      };
    }
  }

  return {
    penalty: 0,
    maxPenalty: 5,
    slopPenalty,
    issues: slopIssues,
    feedback: null,
    deduction: null
  };
}


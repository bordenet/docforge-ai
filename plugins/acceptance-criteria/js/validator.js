/**
 * Acceptance Criteria Validator - Main Entry Point
 *
 * Validates acceptance criteria for Linear-style format.
 */

import { getSlopPenalty, calculateSlopScore } from '../../../shared/js/slop-scoring.js';
import { normalizeText } from '../../../shared/js/validator.js';

import {
  scoreStructure,
  scoreClarity,
  scoreTestability,
  scoreCompleteness
} from './validator-scoring.js';

// Re-export for direct access
export { calculateSlopScore };

// Re-export detection functions for testing
export {
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness,
  detectSections
} from './validator-detection.js';

// Re-export scoring functions for testing
export {
  scoreStructure,
  scoreClarity,
  scoreTestability,
  scoreCompleteness
} from './validator-scoring.js';

/**
 * Validate a document and return comprehensive scoring results
 * @param {string} text - Document content
 * @returns {Object} Complete validation results with dimension mappings
 */
export function validateDocument(text) {
  const emptyResult = { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] };

  if (!text || typeof text !== 'string' || text.trim() === '') {
    const structure = { ...emptyResult, maxScore: 25 };
    const clarity = { ...emptyResult, maxScore: 30 };
    const testability = { ...emptyResult, maxScore: 25 };
    const completeness = { ...emptyResult, maxScore: 20 };

    return {
      totalScore: 0,
      structure,
      clarity,
      testability,
      completeness,
      // Alias for project-view.js compatibility
      businessValue: testability,
      // Dimension mappings for app.js compatibility
      dimension1: structure,
      dimension2: clarity,
      dimension3: testability,
      dimension4: completeness
    };
  }

  // Normalize text to strip invisible Unicode characters (ZWS, BOM, NBSP, etc.)
  const normalized = normalizeText(text);

  const structure = scoreStructure(normalized);
  const clarity = scoreClarity(normalized);
  const testability = scoreTestability(normalized);
  const completeness = scoreCompleteness(normalized);

  // AI slop detection - acceptance criteria must be precise and testable
  const slopPenalty = getSlopPenalty(normalized);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    structure.score + clarity.score + testability.score + completeness.score - slopDeduction
  );

  // Aggregate all issues from all dimensions for the assistant completion banner
  const allIssues = [
    ...structure.issues,
    ...clarity.issues,
    ...testability.issues,
    ...completeness.issues,
    ...slopIssues,
  ];

  return {
    totalScore,
    structure,
    clarity,
    testability,
    completeness,
    // Alias for project-view.js compatibility
    businessValue: testability,
    // Dimension mappings for app.js compatibility
    dimension1: structure,
    dimension2: clarity,
    dimension3: testability,
    dimension4: completeness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    },
    // Top-level issues array for assistant completion banner display
    issues: allIssues,
  };
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


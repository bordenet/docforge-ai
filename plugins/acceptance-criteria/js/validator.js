/**
 * Acceptance Criteria Validator - Main Entry Point
 *
 * Validates acceptance criteria for Linear-style format.
 */

import { getSlopPenalty, calculateSlopScore } from '../../../shared/js/slop-scoring.js';

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

  const structure = scoreStructure(text);
  const clarity = scoreClarity(text);
  const testability = scoreTestability(text);
  const completeness = scoreCompleteness(text);

  // AI slop detection - acceptance criteria must be precise and testable
  const slopPenalty = getSlopPenalty(text);
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
    }
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
 * @param {number} maxScore - Maximum possible score (default 100)
 * @returns {string} Tailwind color class
 */
export function getScoreColor(score, maxScore = 100) {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'text-green-400';
  if (percentage >= 60) return 'text-yellow-400';
  if (percentage >= 40) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get human-readable label for score
 * @param {number} score - Score value (0-100)
 * @returns {string} Label for the score
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}


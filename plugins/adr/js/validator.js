/**
 * ADR Validator - Main Entry Point
 * 
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import { getSlopPenalty } from '../../../shared/js/slop-detection.js';
import { scoreContext, scoreDecision, scoreConsequences, scoreStatus } from './validator-scoring.js';

// Re-export detection functions for testing
export {
  detectContext,
  detectDecision,
  detectOptions,
  detectConsequences,
  detectStatus,
  detectRationale,
  detectSections
} from './validator-detection.js';

// Re-export scoring functions for testing
export { scoreContext, scoreDecision, scoreConsequences, scoreStatus } from './validator-scoring.js';

/**
 * Validate an ADR and return comprehensive scoring results
 * @param {string} text - ADR content
 * @returns {Object} Complete validation results
 */
export function validateADR(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      totalScore: 0,
      context: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      decision: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      consequences: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      status: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension1: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension2: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension3: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension4: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      issues: ['No content to validate']
    };
  }

  const context = scoreContext(text);
  const decision = scoreDecision(text);
  const consequences = scoreConsequences(text);
  const status = scoreStatus(text);

  // AI slop detection - ADRs should be precise and technical
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (max 5 points for ADRs)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    context.score + decision.score + consequences.score + status.score - slopDeduction
  );

  return {
    totalScore,
    context,
    decision,
    consequences,
    status,
    // Dimension mappings for app.js compatibility
    dimension1: context,
    dimension2: decision,
    dimension3: consequences,
    dimension4: status,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Wrapper for validateADR - provides consistent API for UI components
 * @param {string} text - The text to validate
 * @returns {Object} Validation result with totalScore and category breakdowns
 */
export function validateDocument(text) {
  return validateADR(text);
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
 * Get color for score display
 * @param {number} score - Score value (0-100)
 * @returns {string} Color name for the score
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
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


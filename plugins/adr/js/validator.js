/**
 * ADR Validator - Main Entry Point
 * 
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';
import { normalizeText } from '../../../shared/js/validator.js';
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

  // Normalize text to strip invisible Unicode characters (ZWS, BOM, NBSP, etc.)
  const normalized = normalizeText(text);

  const context = scoreContext(normalized);
  const decision = scoreDecision(normalized);
  const consequences = scoreConsequences(normalized);
  const status = scoreStatus(normalized);

  // AI slop detection - ADRs should be precise and technical
  const slopPenalty = getSlopPenalty(normalized);
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

  // Aggregate all issues from all dimensions for the assistant completion banner
  const allIssues = [
    ...context.issues,
    ...decision.issues,
    ...consequences.issues,
    ...status.issues,
    ...slopIssues,
  ];

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
    },
    // Top-level issues array for assistant completion banner display
    issues: allIssues,
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

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


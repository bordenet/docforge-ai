/**
 * Power Statement Validator - Main Entry Point
 * 
 * Scoring Dimensions:
 * 1. Clarity (25 pts) - Plain language, conversational tone, no jargon
 * 2. Impact (25 pts) - Customer outcomes, quantified results
 * 3. Action (25 pts) - Problem clarity, solution specificity
 * 4. Specificity (25 pts) - Metrics, customer type clarity
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';
import { scoreClarity, scoreImpact, scoreAction, scoreSpecificity } from './validator-scoring.js';
import { detectVersions } from './validator-detection.js';

// Re-export detection functions for testing
export {
  detectActionVerbs,
  detectSpecificity,
  detectImpact,
  detectClarity,
  detectVersions
} from './validator-detection.js';

// Re-export scoring functions for testing
export { scoreClarity, scoreImpact, scoreAction, scoreSpecificity } from './validator-scoring.js';

/**
 * Validate a power statement and return comprehensive scoring results
 * @param {string} text - Power statement content
 * @returns {Object} Complete validation results
 */
export function validatePowerStatement(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      totalScore: 0,
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      impact: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      action: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      specificity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension1: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension2: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension3: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      dimension4: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      issues: ['No content to validate']
    };
  }

  const clarity = scoreClarity(text);
  const impact = scoreImpact(text);
  const action = scoreAction(text);
  const specificity = scoreSpecificity(text);

  // Detect Version A/B format
  const versionDetection = detectVersions(text);
  let versionBonus = 0;
  const versionStrengths = [];
  const versionIssues = [];

  if (versionDetection.hasBothVersions && versionDetection.hasStructuredContent) {
    versionBonus = 5;
    versionStrengths.push('Both Version A and Version B with structured sections (+5 bonus)');
  } else if (versionDetection.hasBothVersions) {
    versionBonus = 3;
    versionIssues.push(`Version B needs structured sections (${versionDetection.structuredSectionCount}/4 found)`);
  } else if (versionDetection.hasVersionA || versionDetection.hasVersionB) {
    versionBonus = 2;
    versionIssues.push('Include both Version A (concise) and Version B (structured)');
  } else {
    versionIssues.push('Format as Version A (paragraph) and Version B (structured sections)');
  }

  // AI slop detection
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0, Math.min(100,
    clarity.score + impact.score + action.score + specificity.score + versionBonus - slopDeduction
  ));

  return {
    totalScore,
    clarity,
    impact,
    action,
    specificity,
    // Dimension mappings for app.js compatibility
    dimension1: clarity,
    dimension2: impact,
    dimension3: action,
    dimension4: specificity,
    versionDetection: {
      ...versionDetection,
      bonus: versionBonus,
      strengths: versionStrengths,
      issues: versionIssues
    },
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Wrapper for validatePowerStatement - provides consistent API
 * @param {string} text - The text to validate
 * @returns {Object} Validation result
 */
export function validateDocument(text) {
  return validatePowerStatement(text);
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


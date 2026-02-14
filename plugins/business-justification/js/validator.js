/**
 * Business Justification Validator - Main Entry Point
 *
 * UNIFIED 4-PILLAR TAXONOMY:
 * 1. Strategic Evidence (30 pts)
 * 2. Financial Justification (25 pts)
 * 3. Options & Alternatives (25 pts)
 * 4. Execution Completeness (20 pts)
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';
import {
  scoreStrategicEvidence,
  scoreFinancialJustification,
  scoreOptionsAnalysis,
  scoreExecutionCompleteness
} from './validator-scoring.js';

// Re-export detection functions for testing
export {
  detectStrategicEvidence,
  detectFinancialJustification,
  detectOptionsAnalysis,
  detectExecutionCompleteness,
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectSections,
  detectStakeholders,
  detectTimeline,
  detectScope,
  detectSuccessMetrics
} from './validator-detection.js';

// Re-export scoring functions for testing
export {
  scoreStrategicEvidence,
  scoreFinancialJustification,
  scoreOptionsAnalysis,
  scoreExecutionCompleteness,
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness
} from './validator-scoring.js';

/**
 * Validate a business justification and return comprehensive scoring results
 * @param {string} text - Business justification content
 * @returns {Object} Complete validation results
 */
export function validateBusinessJustification(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    const emptyStrategic = { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] };
    const emptyFinancial = { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] };
    const emptyOptions = { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] };
    const emptyExecution = { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] };
    return {
      totalScore: 0,
      strategicEvidence: emptyStrategic,
      financialJustification: emptyFinancial,
      optionsAnalysis: emptyOptions,
      executionCompleteness: emptyExecution,
      problemClarity: emptyStrategic,
      solution: emptyFinancial,
      scope: emptyOptions,
      completeness: emptyExecution,
      structure: emptyStrategic,
      clarity: emptyFinancial,
      businessValue: emptyOptions,
      dimension1: emptyStrategic,
      dimension2: emptyFinancial,
      dimension3: emptyOptions,
      dimension4: emptyExecution,
      issues: ['No content to validate']
    };
  }

  // Score using unified 4-pillar taxonomy
  const strategicEvidence = scoreStrategicEvidence(text);
  const financialJustification = scoreFinancialJustification(text);
  const optionsAnalysis = scoreOptionsAnalysis(text);
  const executionCompleteness = scoreExecutionCompleteness(text);

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

  const totalScore = Math.max(0,
    strategicEvidence.score + financialJustification.score +
    optionsAnalysis.score + executionCompleteness.score - slopDeduction
  );

  return {
    totalScore,
    strategicEvidence,
    financialJustification,
    optionsAnalysis,
    executionCompleteness,
    // Legacy property names
    problemClarity: strategicEvidence,
    solution: financialJustification,
    scope: optionsAnalysis,
    completeness: executionCompleteness,
    // Aliases for app.js compatibility
    structure: strategicEvidence,
    clarity: financialJustification,
    businessValue: optionsAnalysis,
    // Dimension mappings
    dimension1: strategicEvidence,
    dimension2: financialJustification,
    dimension3: optionsAnalysis,
    dimension4: executionCompleteness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Wrapper for validateBusinessJustification - provides consistent API
 * @param {string} text - The text to validate
 * @returns {Object} Validation result
 */
export function validateDocument(text) {
  return validateBusinessJustification(text);
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


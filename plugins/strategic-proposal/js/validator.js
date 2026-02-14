/**
 * Strategic Proposal Validator - Main Entry Point
 *
 * Scoring Dimensions:
 * 1. Problem Statement (25 pts) - Clear problem definition
 * 2. Proposed Solution (25 pts) - Actionable solution
 * 3. Business Impact (25 pts) - Measurable outcomes
 * 4. Implementation Plan (25 pts) - Timeline and resources
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';
import {
  scoreProblemStatement,
  scoreProposedSolution,
  scoreBusinessImpact,
  scoreImplementationPlan
} from './validator-scoring.js';

/**
 * Validate a strategic proposal and return comprehensive scoring results
 * @param {string} text - Strategic proposal content
 * @returns {Object} Complete validation results
 */
export function validateStrategicProposal(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      problemStatement: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      proposedSolution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      businessImpact: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      implementationPlan: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      issues: ['No content to validate']
    };
  }

  const problemStatement = scoreProblemStatement(text);
  const proposedSolution = scoreProposedSolution(text);
  const businessImpact = scoreBusinessImpact(text);
  const implementationPlan = scoreImplementationPlan(text);

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
    problemStatement.score + proposedSolution.score + businessImpact.score + implementationPlan.score - slopDeduction
  );

  return {
    totalScore,
    problemStatement,
    proposedSolution,
    businessImpact,
    implementationPlan,
    // Dimension mappings for app.js compatibility
    dimension1: problemStatement,
    dimension2: proposedSolution,
    dimension3: businessImpact,
    dimension4: implementationPlan,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Alias for validateStrategicProposal - used by shared UI components
 */
export function validateDocument(text) {
  return validateStrategicProposal(text);
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
 * Get color based on score for UI display
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
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


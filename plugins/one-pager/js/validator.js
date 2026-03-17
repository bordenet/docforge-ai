/**
 * One-Pager Validator - Main Entry Point
 * 
 * Scoring Dimensions:
 * 1. Problem Clarity (30 pts) - Problem statement, cost of inaction, customer focus
 * 2. Solution Quality (25 pts) - Solution addresses problem, measurable goals, high-level
 * 3. Scope Discipline (25 pts) - In/out scope, success metrics, SMART criteria
 * 4. Completeness (20 pts) - Required sections, stakeholders, timeline
 */

import { getSlopPenalty, calculateSlopScore } from '../../../shared/js/slop-scoring.js';
import { normalizeText } from '../../../shared/js/validator.js';
import { WORD_LIMIT } from './validator-config.js';
import {
  detectCircularLogic,
  detectBaselineTarget,
  detectVagueQuantifiers
} from './validator-detection.js';
import {
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness
} from './validator-scoring.js';

// Re-export detection functions for testing/external access
export {
  detectCircularLogic,
  detectBaselineTarget,
  detectSections
} from './validator-detection.js';

export {
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectMeasurableGoals,
  detectScope,
  detectSuccessMetrics,
  detectStakeholders,
  detectTimeline,
  detectAlternatives,
  detectUrgency,
  detectDecisionNeeded,
  detectVagueQuantifiers,
  detectStakeholderTableQuality,
  detectAlternativesQuality
} from './validator-detection.js';

export {
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness
} from './validator-scoring.js';

export { calculateSlopScore };

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a one-pager and return comprehensive scoring results
 * @param {string} text - One-pager content
 * @returns {Object} Complete validation results
 */
export function validateOnePager(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      problemClarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      solution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      scope: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  // Normalize text to strip invisible Unicode characters (ZWS, BOM, NBSP, etc.)
  const normalized = normalizeText(text);

  const problemClarity = scoreProblemClarity(normalized);
  const solution = scoreSolutionQuality(normalized);
  const scope = scoreScopeDiscipline(normalized);
  const completeness = scoreCompleteness(normalized);

  // Circular logic detection - per prompts.js line 49, cap at 50 if detected
  const circularLogic = detectCircularLogic(normalized);
  const circularIssues = [];
  if (circularLogic.isCircular) {
    circularIssues.push(
      'CIRCULAR LOGIC DETECTED: Solution is just the inverse of the problem. Address the ROOT CAUSE instead.'
    );
  }

  // Baseline→Target format detection
  const baselineTarget = detectBaselineTarget(normalized);
  const baselineIssues = [];
  if (baselineTarget.hasVagueMetrics && !baselineTarget.hasBaselineTarget) {
    baselineIssues.push(
      'Vague metrics without baselines. Use [Current] → [Target] format (e.g., "100/day → 30/day")'
    );
  }

  // AI slop detection - executive summaries should be crisp and specific
  const slopPenalty = getSlopPenalty(normalized);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (max 5 points for one-pagers)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  // Vague quantifier detection (P2 improvement) - penalize TBD, "some amount", etc.
  const vagueQuantifiers = detectVagueQuantifiers(normalized);
  let vagueDeduction = 0;
  const vagueIssues = [];

  if (vagueQuantifiers.vagueTermCount > 0) {
    // Deduct up to 8 points for vague quantifiers
    vagueDeduction = Math.min(8, vagueQuantifiers.vaguenessPenalty);
    if (vagueQuantifiers.uniqueVagueTerms.length > 0) {
      vagueIssues.push(`Vague terms detected: ${vagueQuantifiers.uniqueVagueTerms.slice(0, 3).join(', ')}. Replace with specific numbers.`);
    }
  }

  // Word count enforcement - increased to 600 words for full Amazon-style structure
  const wordCount = normalized.split(/\s+/).filter(w => w.length > 0).length;
  let wordCountDeduction = 0;
  const wordCountIssues = [];
  if (wordCount > WORD_LIMIT) {
    // Deduct 5 points for every 50 words over limit, max 15 points
    wordCountDeduction = Math.min(15, Math.floor((wordCount - WORD_LIMIT) / 50) * 5);
    wordCountIssues.push(`Document is ${wordCount} words (max ${WORD_LIMIT}). Deducting ${wordCountDeduction} points.`);
  }

  const rawScore = problemClarity.score + solution.score + scope.score + completeness.score - slopDeduction - wordCountDeduction - vagueDeduction;

  // CRITICAL: Cap at 50 if circular logic detected (per prompts.js line 49)
  const isCircularCapped = circularLogic.isCircular && rawScore > 50;
  const totalScore = Math.max(0, isCircularCapped ? 50 : rawScore);

  // Aggregate all issues from all dimensions for the assistant completion banner
  const allIssues = [
    ...problemClarity.issues,
    ...solution.issues,
    ...scope.issues,
    ...completeness.issues,
    ...slopIssues,
    ...circularIssues,
    ...baselineIssues,
    ...vagueIssues,
    ...wordCountIssues,
  ];

  return {
    totalScore,
    problemClarity,
    solution,
    scope,
    completeness,
    // Dimension mappings for app.js compatibility
    dimension1: problemClarity,
    dimension2: solution,
    dimension3: scope,
    dimension4: completeness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    },
    circularLogic: {
      ...circularLogic,
      capped: isCircularCapped,
      issues: circularIssues
    },
    baselineTarget: {
      ...baselineTarget,
      issues: baselineIssues
    },
    vagueQuantifiers: {
      ...vagueQuantifiers,
      deduction: vagueDeduction,
      issues: vagueIssues
    },
    wordCount: {
      count: wordCount,
      limit: WORD_LIMIT,
      deduction: wordCountDeduction,
      issues: wordCountIssues
    },
    // Top-level issues array for assistant completion banner display
    issues: allIssues,
  };
}

/**
 * Alias for validateOnePager - used by shared UI components
 */
export function validateDocument(text) {
  return validateOnePager(text);
}

// ============================================================================
// Helper Functions for UI
// ============================================================================

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


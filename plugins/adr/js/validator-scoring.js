/**
 * ADR Validator - Scoring Functions
 *
 * Main entry point for scoring. Re-exports all scoring functions.
 *
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import { ALTERNATIVES_PATTERN } from './validator-config.js';

import {
  detectContext,
  detectDecision,
  detectOptions,
  detectRationale,
  detectDecisionDrivers
} from './validator-detection.js';

// Re-export consequences and status scoring from separate module
export { scoreConsequences, scoreStatus } from './validator-scoring-results.js';

/**
 * Score context quality (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreContext(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const contextDetection = detectContext(text);

  // Context section exists and is clear (0-10 pts)
  if (contextDetection.hasContextSection && contextDetection.hasContextLanguage) {
    score += 10;
    strengths.push('Clear context section with problem framing');
  } else if (contextDetection.hasContextLanguage) {
    score += 5;
    issues.push('Context mentioned but lacks dedicated section');
  } else {
    issues.push('Context section missing - explain the situation and problem');
  }

  // Constraints and drivers identified (0-8 pts)
  if (contextDetection.hasConstraints && contextDetection.constraintCount >= 2) {
    score += 8;
    strengths.push(`${contextDetection.constraintCount} constraints/drivers identified`);
  } else if (contextDetection.hasConstraints) {
    score += 4;
    issues.push('Some constraints mentioned - add more specific requirements and limitations');
  } else {
    issues.push('Constraints missing - list requirements, limitations, and forces');
  }

  // Business/stakeholder focus (0-5 pts) - reduced to make room for Decision Drivers
  if (contextDetection.hasBusinessFocus) {
    score += 5;
    strengths.push('Context tied to business/stakeholder needs');
  } else {
    issues.push('Add business context - explain why this matters to stakeholders');
  }

  // Decision Drivers (MADR 3.0) - bonus/penalty (0-5 pts)
  const driversDetection = detectDecisionDrivers(text);
  if (driversDetection.hasSectionHeader && driversDetection.hasMinimumDrivers) {
    score += 5;
    strengths.push(`Decision Drivers section with ${driversDetection.driversCount} drivers (MADR 3.0)`);
  } else if (driversDetection.hasSectionHeader) {
    score += 2;
    issues.push(`Decision Drivers section has only ${driversDetection.driversCount} drivers - need 3+ (MADR 3.0)`);
  } else if (driversDetection.hasDriverLanguage) {
    score += 1;
    issues.push('Decision drivers mentioned but missing dedicated section (MADR 3.0)');
  } else {
    issues.push('Missing Decision Drivers section - list 3-5 forces/constraints (MADR 3.0)');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score decision clarity (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDecision(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const decisionDetection = detectDecision(text);
  const optionsDetection = detectOptions(text);
  const rationaleDetection = detectRationale(text);

  // Decision clearly stated (0-10 pts)
  if (decisionDetection.hasDecisionSection && decisionDetection.hasClarity) {
    score += 10;
    strengths.push('Decision clearly stated with dedicated section');
  } else if (decisionDetection.hasDecisionLanguage) {
    score += 5;
    issues.push('Decision mentioned but could be clearer - use "We will..." format');
  } else {
    issues.push('Decision statement missing - clearly state what was decided');
  }

  // Vague decision penalty (-5 pts)
  if (decisionDetection.hasVagueDecision) {
    score -= 5;
    issues.push(`Vague decision detected (${decisionDetection.vagueDecisionCount} phrases) - be specific about technology/pattern choice`);
  }

  // Action verb bonus (+2 pts)
  if (decisionDetection.hasActionVerbs && decisionDetection.actionVerbCount >= 2) {
    score += 2;
    strengths.push(`Strong action verbs used (${decisionDetection.actionVerbCount})`);
  } else if (!decisionDetection.hasActionVerbs) {
    issues.push('Missing action verbs - use: adopt, implement, migrate, split, combine, establish, enforce');
  }

  // Explicit alternatives comparison pattern (0-6 pts)
  const hasExplicitAlternatives = ALTERNATIVES_PATTERN.test(text);

  if (hasExplicitAlternatives) {
    score += 6;
    strengths.push('Explicit alternatives comparison with "considered X but chose Y" format');
  } else if (optionsDetection.hasOptionsSection && optionsDetection.hasComparison) {
    score += 4;
    strengths.push('Options compared with pros/cons');
    issues.push('Use explicit format: "We considered X, Y, Z but chose..."');
  } else if (optionsDetection.hasOptionsLanguage) {
    score += 2;
    issues.push('Options mentioned but not compared - use "We considered X, Y, Z but chose..." format');
  } else {
    issues.push('Alternatives not documented - use "We considered X, Y, Z but chose..." format');
  }

  // Rationale provided (0-7 pts)
  if (rationaleDetection.hasRationaleSection || rationaleDetection.hasEvidence) {
    score += 7;
    strengths.push('Rationale explained with evidence');
  } else if (rationaleDetection.hasRationaleLanguage) {
    score += 3;
    issues.push('Some rationale provided - strengthen with evidence or data');
  } else {
    issues.push('Rationale missing - explain WHY this decision was made');
  }

  return {
    score: Math.max(0, Math.min(score, maxScore)),
    maxScore,
    issues,
    strengths
  };
}

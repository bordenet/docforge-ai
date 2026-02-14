/**
 * ADR Validator - Scoring Functions
 * 
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import {
  REQUIRED_SECTIONS,
  TEAM_PATTERNS,
  SUBSEQUENT_PATTERN,
  REVIEW_PATTERN,
  ALTERNATIVES_PATTERN
} from './validator-config.js';

import {
  detectContext,
  detectDecision,
  detectOptions,
  detectRationale,
  detectConsequences,
  detectStatus,
  detectSections
} from './validator-detection.js';

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

  // Business/stakeholder focus (0-7 pts)
  if (contextDetection.hasBusinessFocus) {
    score += 7;
    strengths.push('Context tied to business/stakeholder needs');
  } else {
    issues.push('Add business context - explain why this matters to stakeholders');
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

/**
 * Score consequences documentation (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreConsequences(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const consequencesDetection = detectConsequences(text);

  // Consequences section exists (0-5 pts)
  if (consequencesDetection.hasConsequencesSection) {
    score += 5;
    strengths.push('Dedicated consequences section');
  } else if (consequencesDetection.hasConsequencesLanguage) {
    score += 2;
    issues.push('Consequences mentioned but lack dedicated section');
  } else {
    issues.push('Consequences section missing - document impacts of this decision');
  }

  // Positive/Negative balance check (0-10 pts) - requires 3+ each
  const posCount = consequencesDetection.positiveCount || 0;
  const negCount = consequencesDetection.negativeCount || 0;
  const hasBalance = posCount >= 3 && negCount >= 3;

  if (hasBalance) {
    score += 10;
    strengths.push(`Balanced consequences: ${posCount} positive, ${negCount} negative`);
  } else if (posCount >= 2 && negCount >= 2) {
    score += 6;
    issues.push(`Need 3+ each: currently ${posCount} positive, ${negCount} negative`);
  } else if (posCount >= 1 || negCount >= 1) {
    score += 3;
    issues.push(`Imbalanced: ${posCount} positive, ${negCount} negative - need 3+ each`);
  } else {
    issues.push('Missing positive AND negative consequences - need 3+ each');
  }

  // Vague consequence penalty (-3 pts)
  if (consequencesDetection.hasVagueConsequences) {
    score -= 3;
    issues.push(`Vague consequence terms detected (${consequencesDetection.vagueConsequenceCount}) - replace "complexity"/"overhead" with specific impacts`);
  }

  // Team factors detection (0-5 pts)
  if (TEAM_PATTERNS.test(text)) {
    score += 5;
    strengths.push('Team factors addressed (training/skills/hiring)');
  } else {
    issues.push('Missing team factors - address training needs, skill gaps, hiring impact');
  }

  // Subsequent ADR detection (0-3 pts)
  if (SUBSEQUENT_PATTERN.test(text)) {
    score += 3;
    strengths.push('Subsequent ADRs/decisions identified');
  } else {
    issues.push('Missing subsequent ADRs - what decisions does this trigger?');
  }

  // After-action review timing (0-2 pts)
  if (REVIEW_PATTERN.test(text)) {
    score += 2;
    strengths.push('Review timing specified');
  } else {
    issues.push('Missing review timing - when should this decision be reassessed?');
  }

  return {
    score: Math.max(0, Math.min(score, maxScore)),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score status and completeness (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStatus(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const statusDetection = detectStatus(text);
  const sections = detectSections(text);

  // Status clearly indicated (0-10 pts)
  if (statusDetection.hasStatusSection && statusDetection.hasStatusValue) {
    score += 10;
    strengths.push(`Status: ${statusDetection.statusValues.join(', ')}`);
  } else if (statusDetection.hasStatusValue) {
    score += 5;
    issues.push('Status mentioned but lacks dedicated section');
  } else {
    issues.push('Status missing - add Proposed, Accepted, Deprecated, or Superseded');
  }

  // Date information present (0-7 pts)
  if (statusDetection.hasDate) {
    score += 7;
    strengths.push('Date information included');
  } else {
    issues.push('Date missing - add when this decision was made');
  }

  // Required sections present (0-8 pts)
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 8;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.60) {
    score += 4;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}


/**
 * Acceptance Criteria Validator - Scoring Functions
 */

import { REQUIRED_SECTIONS } from './validator-config.js';
import {
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness,
  detectSections
} from './validator-detection.js';

/**
 * Score Structure (25 pts max) - Summary, AC checkboxes, Out of Scope
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const detection = detectStructure(text);

  // Summary section (10 pts)
  if (detection.hasSummary) {
    score += 10;
    strengths.push('Summary section present');
  } else {
    issues.push('Add a Summary section describing the feature/change');
  }

  // Checkbox criteria (10 pts)
  if (detection.checkboxCount >= 3) {
    score += 10;
    strengths.push(`${detection.checkboxCount} checkbox criteria found`);
  } else if (detection.checkboxCount > 0) {
    score += 5;
    issues.push('Add more checkbox criteria (recommend 3-7)');
  } else {
    issues.push('Missing checkbox criteria - use "- [ ]" format');
  }

  // Out of Scope section (5 pts)
  if (detection.hasOutOfScope) {
    score += 5;
    strengths.push('Out of Scope section present');
  } else {
    issues.push('Add Out of Scope section to set clear boundaries');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Clarity (30 pts max) - Action verbs and measurable metrics
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const detection = detectClarity(text);

  // Action verbs (15 pts max)
  if (detection.actionVerbCount >= 5) {
    score += 15;
    strengths.push(`${detection.actionVerbCount} action verbs for testable behavior`);
  } else if (detection.actionVerbCount >= 3) {
    score += 10;
    strengths.push(`${detection.actionVerbCount} action verbs found`);
  } else if (detection.actionVerbCount > 0) {
    score += 5;
    issues.push('Add more action verbs (implement, create, display, validate, etc.)');
  } else {
    issues.push('Missing action verbs - criteria should describe testable behavior');
  }

  // Measurable metrics (15 pts max)
  if (detection.metricsCount >= 3) {
    score += 15;
    strengths.push(`${detection.metricsCount} measurable metrics with units`);
  } else if (detection.metricsCount >= 1) {
    score += 8;
    issues.push('Add more measurable metrics (time limits, percentages, counts)');
  } else {
    issues.push('No measurable metrics - add specific numbers with units');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Testability (25 pts max) - No vague terms, no anti-patterns
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreTestability(text) {
  const issues = [];
  const strengths = [];
  let score = 25; // Start with full score, deduct for issues
  const maxScore = 25;

  const detection = detectTestability(text);

  // Deduct for vague terms (up to -15 pts)
  if (detection.vagueTermCount === 0) {
    strengths.push('No vague terms - criteria are specific');
  } else if (detection.vagueTermCount <= 2) {
    score -= 5;
    issues.push(`Remove vague terms: ${detection.vagueTerms.slice(0, 2).join(', ')}`);
  } else {
    score -= 15;
    issues.push(`${detection.vagueTermCount} vague terms found: ${detection.vagueTerms.slice(0, 3).join(', ')}`);
  }

  // Deduct for user story anti-pattern (-5 pts)
  if (detection.hasUserStoryAntiPattern) {
    score -= 5;
    issues.push('Remove user story syntax - use simple checkboxes instead');
  }

  // Deduct for Gherkin anti-pattern (-5 pts)
  if (detection.hasGherkinAntiPattern) {
    score -= 5;
    issues.push('Remove Given/When/Then syntax - use simple checkboxes');
  }

  // Deduct for compound criteria (-3 pts)
  if (detection.hasCompoundCriteria) {
    score -= 3;
    issues.push('Split compound criteria (and/or) into separate items');
  }

  // Deduct for implementation details (-5 pts)
  if (detection.hasImplementationDetails) {
    score -= 5;
    issues.push(`Remove implementation details: ${detection.implementationTerms.slice(0, 3).join(', ')}`);
  }

  // Positive indicator if clean
  if (!detection.hasIssues && !detection.hasCompoundCriteria) {
    strengths.push('All criteria are binary verifiable');
  }

  return { score: Math.max(0, Math.min(score, maxScore)), maxScore, issues, strengths };
}

/**
 * Score Completeness (20 pts max) - Criterion count, error/edge cases
 * @param {string} text - Document content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const detection = detectCompleteness(text);
  const sections = detectSections(text);

  // Criterion count (8 pts) - ideal is 3-7
  if (detection.criterionCount >= 3 && detection.criterionCount <= 7) {
    score += 8;
    strengths.push(`${detection.criterionCount} criteria (ideal range 3-7)`);
  } else if (detection.criterionCount > 7) {
    score += 4;
    issues.push('Too many criteria - consider splitting into smaller stories');
  } else if (detection.criterionCount > 0) {
    score += 4;
    issues.push('Add more criteria (recommend 3-7 per story)');
  } else {
    issues.push('No checkbox criteria found');
  }

  // Error/edge cases covered (6 pts)
  if (detection.hasErrorCases && detection.hasEdgeCases) {
    score += 6;
    strengths.push('Error states and edge cases addressed');
  } else if (detection.hasErrorCases || detection.hasEdgeCases) {
    score += 3;
    issues.push('Consider adding more error/edge case handling');
  } else {
    issues.push('Add error handling and edge case criteria');
  }

  // Section completeness (6 pts)
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.9) {
    score += 6;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} sections present`);
  } else if (sectionPercentage >= 0.6) {
    score += 3;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push('Add required sections: Summary, Acceptance Criteria, Out of Scope');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}


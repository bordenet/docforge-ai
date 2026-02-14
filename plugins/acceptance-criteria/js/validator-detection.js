/**
 * Acceptance Criteria Validator - Detection Functions
 */

import {
  REQUIRED_SECTIONS,
  STRUCTURE_PATTERNS,
  CLARITY_PATTERNS,
  TESTABILITY_PATTERNS,
  COMPLETENESS_PATTERNS
} from './validator-config.js';

/**
 * Detect structure in Linear AC format (Summary, AC checkboxes, Out of Scope)
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectStructure(text) {
  const hasSummary = STRUCTURE_PATTERNS.sectionPattern.test(text);
  const checkboxMatches = text.match(STRUCTURE_PATTERNS.checkboxPattern) || [];
  const hasOutOfScope = STRUCTURE_PATTERNS.outOfScopePattern.test(text);

  return {
    hasSummary,
    hasCheckboxes: checkboxMatches.length > 0,
    checkboxCount: checkboxMatches.length,
    hasOutOfScope,
    indicators: [
      hasSummary && 'Summary section found',
      checkboxMatches.length > 0 && `${checkboxMatches.length} checkbox criteria`,
      hasOutOfScope && 'Out of Scope section found'
    ].filter(Boolean)
  };
}

/**
 * Detect clarity - action verbs and measurable metrics
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectClarity(text) {
  const actionVerbMatches = text.match(CLARITY_PATTERNS.actionVerbs) || [];
  const metricsMatches = text.match(CLARITY_PATTERNS.metricsPattern) || [];
  const thresholdMatches = text.match(CLARITY_PATTERNS.thresholdPattern) || [];

  return {
    hasActionVerbs: actionVerbMatches.length > 0,
    actionVerbCount: actionVerbMatches.length,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    hasThresholds: thresholdMatches.length > 0,
    indicators: [
      actionVerbMatches.length > 0 && `${actionVerbMatches.length} action verbs`,
      metricsMatches.length > 0 && `${metricsMatches.length} measurable metrics`,
      thresholdMatches.length > 0 && 'Specific thresholds defined'
    ].filter(Boolean)
  };
}

/**
 * Detect testability issues - vague terms and anti-patterns
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectTestability(text) {
  const vagueMatches = text.match(TESTABILITY_PATTERNS.vagueTerms) || [];
  const hasUserStory = TESTABILITY_PATTERNS.userStoryPattern.test(text);
  const hasGherkin = TESTABILITY_PATTERNS.gherkinPattern.test(text);
  const hasCompound = TESTABILITY_PATTERNS.compoundPattern.test(text);
  const implementationMatches = text.match(TESTABILITY_PATTERNS.implementationPattern) || [];

  return {
    vagueTermCount: vagueMatches.length,
    vagueTerms: [...new Set(vagueMatches.map(m => m.toLowerCase()))],
    hasUserStoryAntiPattern: hasUserStory,
    hasGherkinAntiPattern: hasGherkin,
    hasCompoundCriteria: hasCompound,
    hasImplementationDetails: implementationMatches.length > 0,
    implementationTerms: [...new Set(implementationMatches.map(m => m.toLowerCase()))],
    hasIssues: vagueMatches.length > 0 || hasUserStory || hasGherkin || implementationMatches.length > 0,
    indicators: [
      vagueMatches.length > 0 && `${vagueMatches.length} vague terms found`,
      hasUserStory && 'User story syntax detected (use checkboxes instead)',
      hasGherkin && 'Gherkin syntax detected (use simple checkboxes)',
      hasCompound && 'Compound criteria found (split into separate items)',
      implementationMatches.length > 0 && `Implementation details found: ${implementationMatches.slice(0, 3).join(', ')}`
    ].filter(Boolean)
  };
}

/**
 * Detect completeness - criterion count, error cases, edge cases
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results
 */
export function detectCompleteness(text) {
  const checkboxMatches = text.match(STRUCTURE_PATTERNS.checkboxPattern) || [];
  const errorCaseMatches = text.match(COMPLETENESS_PATTERNS.errorCasePattern) || [];
  const edgeCaseMatches = text.match(COMPLETENESS_PATTERNS.edgeCasePattern) || [];
  const permissionMatches = text.match(COMPLETENESS_PATTERNS.permissionPattern) || [];

  return {
    criterionCount: checkboxMatches.length,
    hasErrorCases: errorCaseMatches.length > 0,
    errorCaseCount: errorCaseMatches.length,
    hasEdgeCases: edgeCaseMatches.length > 0,
    edgeCaseCount: edgeCaseMatches.length,
    hasPermissions: permissionMatches.length > 0,
    indicators: [
      checkboxMatches.length >= 3 && checkboxMatches.length <= 7 && 'Good criterion count (3-7)',
      checkboxMatches.length < 3 && 'Too few criteria (add more)',
      checkboxMatches.length > 7 && 'Too many criteria (consider splitting)',
      errorCaseMatches.length > 0 && 'Error cases covered',
      edgeCaseMatches.length > 0 && 'Edge cases addressed'
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}


/**
 * One-Pager Validator Detection Functions - Sections, Stakeholders, Timeline
 * 
 * Split from validator-detection.js to keep files under 250 lines.
 */

import {
  REQUIRED_SECTIONS,
  SCOPE_PATTERNS,
  METRICS_PATTERNS,
  STAKEHOLDER_PATTERNS,
  TIMELINE_PATTERNS
} from './validator-config.js';

// ============================================================================
// Scope Detection
// ============================================================================

/**
 * Detect scope definitions in text
 * @param {string} text - Text to analyze
 * @returns {Object} Scope detection results
 */
export function detectScope(text) {
  const inScopeMatches = text.match(SCOPE_PATTERNS.inScope) || [];
  const outOfScopeMatches = text.match(SCOPE_PATTERNS.outOfScope) || [];
  const hasScopeSection = SCOPE_PATTERNS.scopeSection.test(text);

  return {
    hasInScope: inScopeMatches.length > 0,
    inScopeCount: inScopeMatches.length,
    hasOutOfScope: outOfScopeMatches.length > 0,
    outOfScopeCount: outOfScopeMatches.length,
    hasBothBoundaries: inScopeMatches.length > 0 && outOfScopeMatches.length > 0,
    hasScopeSection,
    indicators: [
      inScopeMatches.length > 0 && 'In-scope items defined',
      outOfScopeMatches.length > 0 && 'Out-of-scope items defined',
      hasScopeSection && 'Dedicated scope section'
    ].filter(Boolean)
  };
}

// ============================================================================
// Success Metrics Detection
// ============================================================================

/**
 * Detect success metrics in text
 * @param {string} text - Text to analyze
 * @returns {Object} Success metrics detection results
 */
export function detectSuccessMetrics(text) {
  const smartMatches = text.match(METRICS_PATTERNS.smart) || [];
  const quantifiedMatches = text.match(METRICS_PATTERNS.quantified) || [];
  const metricsMatches = text.match(METRICS_PATTERNS.metricsLanguage) || [];
  const hasMetricsSection = METRICS_PATTERNS.metricsSection.test(text);

  return {
    hasMetricsSection,
    hasSmart: smartMatches.length > 0,
    smartCount: smartMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    indicators: [
      hasMetricsSection && 'Dedicated metrics section',
      smartMatches.length > 0 && 'SMART criteria mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      metricsMatches.length > 0 && `${metricsMatches.length} metric references`
    ].filter(Boolean)
  };
}

// ============================================================================
// Section Detection
// ============================================================================

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

// ============================================================================
// Stakeholder Detection
// ============================================================================

/**
 * Detect stakeholders in text
 * @param {string} text - Text to analyze
 * @returns {Object} Stakeholder detection results
 */
export function detectStakeholders(text) {
  const stakeholderMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderLanguage) || [];
  const roleMatches = text.match(STAKEHOLDER_PATTERNS.roleDefinition) || [];
  const concernMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderConcerns) || [];
  const hasStakeholderSection = STAKEHOLDER_PATTERNS.stakeholderSection.test(text);

  return {
    hasStakeholderSection,
    hasStakeholders: stakeholderMatches.length > 0,
    stakeholderCount: stakeholderMatches.length,
    hasRoles: roleMatches.length > 0,
    roleCount: roleMatches.length,
    hasConcerns: concernMatches.length > 0,
    concernCount: concernMatches.length,
    indicators: [
      hasStakeholderSection && 'Dedicated stakeholder section',
      stakeholderMatches.length > 0 && `${stakeholderMatches.length} stakeholder references`,
      roleMatches.length > 0 && 'Roles/responsibilities defined',
      concernMatches.length > 0 && `${concernMatches.length} stakeholder concerns addressed (FP&A, legal, C-suite)`
    ].filter(Boolean)
  };
}

// ============================================================================
// Timeline Detection
// ============================================================================

/**
 * Detect timeline in text
 * @param {string} text - Text to analyze
 * @returns {Object} Timeline detection results
 */
export function detectTimeline(text) {
  const dateMatches = text.match(TIMELINE_PATTERNS.datePatterns) || [];
  const phasingMatches = text.match(TIMELINE_PATTERNS.phasing) || [];
  const hasTimelineSection = TIMELINE_PATTERNS.timelineSection.test(text);

  return {
    hasTimelineSection,
    hasTimeline: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasPhasing: phasingMatches.length > 0,
    phasingCount: phasingMatches.length,
    indicators: [
      hasTimelineSection && 'Dedicated timeline section',
      dateMatches.length > 0 && `${dateMatches.length} timeline references`,
      phasingMatches.length > 0 && `${phasingMatches.length} phases/milestones`
    ].filter(Boolean)
  };
}


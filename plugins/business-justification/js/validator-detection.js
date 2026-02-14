/**
 * Business Justification Validator - Detection Functions
 *
 * Main entry point that re-exports pillar detection functions
 * and provides additional helper detection functions.
 */

import {
  EVIDENCE_PATTERNS,
  OPTIONS_PATTERNS,
  REQUIRED_SECTIONS,
  STAKEHOLDER_PATTERNS,
  TIMELINE_PATTERNS,
  SCOPE_PATTERNS,
  METRICS_PATTERNS,
  SOLUTION_PATTERNS
} from './validator-config.js';

// Re-export pillar detection functions for backward compatibility
export {
  detectStrategicEvidence,
  detectFinancialJustification,
  detectOptionsAnalysis,
  detectExecutionCompleteness
} from './validator-detection-pillars.js';

// Legacy detection function aliases
export function detectProblemStatement(text) {
  return detectStrategicEvidence(text);
}

export function detectCostOfInaction(text) {
  const costMatches = text.match(OPTIONS_PATTERNS.doNothing) || [];
  const quantifiedMatches = text.match(EVIDENCE_PATTERNS.quantified) || [];
  const hasCostSection = /^(#+\s*)?(cost|impact|consequence|risk|why.now|urgency|inaction)/im.test(text);

  return {
    hasCostLanguage: costMatches.length > 0,
    costCount: costMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasCostSection,
    indicators: [
      costMatches.length > 0 && `${costMatches.length} cost/impact references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified values`,
      hasCostSection && 'Dedicated cost/impact section'
    ].filter(Boolean)
  };
}

export function detectSolution(text) {
  const hasSolutionSection = SOLUTION_PATTERNS.solutionSection.test(text);
  const solutionMatches = text.match(SOLUTION_PATTERNS.solutionLanguage) || [];
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const highlevelMatches = text.match(SOLUTION_PATTERNS.highlevel) || [];
  const implementationMatches = text.match(SOLUTION_PATTERNS.avoidImplementation) || [];

  return {
    hasSolutionSection,
    hasSolutionLanguage: solutionMatches.length > 0,
    hasMeasurable: measurableMatches.length > 0,
    isHighLevel: highlevelMatches.length > 0 && implementationMatches.length === 0,
    hasImplementationDetails: implementationMatches.length > 0,
    indicators: [
      hasSolutionSection && 'Dedicated solution section',
      solutionMatches.length > 0 && 'Solution language present',
      measurableMatches.length > 0 && 'Measurable outcomes mentioned',
      highlevelMatches.length > 0 && 'High-level approach described',
      implementationMatches.length === 0 && 'No implementation details (good)'
    ].filter(Boolean)
  };
}

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

export function detectStakeholders(text) {
  const stakeholderMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderLanguage) || [];
  const roleMatches = text.match(STAKEHOLDER_PATTERNS.roleDefinition) || [];
  const hasStakeholderSection = STAKEHOLDER_PATTERNS.stakeholderSection.test(text);

  return {
    hasStakeholderSection,
    hasStakeholders: stakeholderMatches.length > 0,
    stakeholderCount: stakeholderMatches.length,
    hasRoles: roleMatches.length > 0,
    roleCount: roleMatches.length,
    indicators: [
      hasStakeholderSection && 'Dedicated stakeholder section',
      stakeholderMatches.length > 0 && `${stakeholderMatches.length} stakeholder references`,
      roleMatches.length > 0 && 'Roles/responsibilities defined'
    ].filter(Boolean)
  };
}

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


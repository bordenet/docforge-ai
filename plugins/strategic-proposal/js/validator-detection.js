/**
 * Strategic Proposal Validator - Detection Functions
 */

import {
  REQUIRED_SECTIONS,
  PROBLEM_PATTERNS,
  SOLUTION_PATTERNS,
  IMPACT_PATTERNS,
  IMPLEMENTATION_PATTERNS,
  RISK_PATTERNS,
  METRICS_PATTERNS
} from './validator-config.js';

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem detection results
 */
export function detectProblemStatement(text) {
  const hasProblemSection = PROBLEM_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(PROBLEM_PATTERNS.problemLanguage) || [];
  const urgencyMatches = text.match(PROBLEM_PATTERNS.urgency) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const strategicMatches = text.match(PROBLEM_PATTERNS.strategicAlignment) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    hasUrgency: urgencyMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasStrategicAlignment: strategicMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      urgencyMatches.length > 0 && 'Urgency/priority established',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      strategicMatches.length > 0 && 'Strategic alignment shown'
    ].filter(Boolean)
  };
}

/**
 * Detect urgency in text (replaces cost of inaction for strategic proposals)
 * @param {string} text - Text to analyze
 * @returns {Object} Urgency detection results
 */
export function detectUrgency(text) {
  const urgencyMatches = text.match(PROBLEM_PATTERNS.urgency) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const hasUrgencySection = /^(#+\s*)?(urgency|priority|why.now|timing|window)/im.test(text);

  return {
    hasUrgencyLanguage: urgencyMatches.length > 0,
    urgencyCount: urgencyMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasUrgencySection,
    indicators: [
      urgencyMatches.length > 0 && `${urgencyMatches.length} urgency/priority references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified values`,
      hasUrgencySection && 'Dedicated urgency/timing section'
    ].filter(Boolean)
  };
}

/**
 * Detect solution in text
 * @param {string} text - Text to analyze
 * @returns {Object} Solution detection results
 */
export function detectSolution(text) {
  const hasSolutionSection = SOLUTION_PATTERNS.solutionSection.test(text);
  const solutionMatches = text.match(SOLUTION_PATTERNS.solutionLanguage) || [];
  const actionableMatches = text.match(SOLUTION_PATTERNS.actionable) || [];
  const alternativesMatches = text.match(SOLUTION_PATTERNS.alternatives) || [];
  const justificationMatches = text.match(SOLUTION_PATTERNS.justification) || [];

  return {
    hasSolutionSection,
    hasSolutionLanguage: solutionMatches.length > 0,
    hasActionable: actionableMatches.length > 0,
    hasAlternatives: alternativesMatches.length > 0,
    hasJustification: justificationMatches.length > 0,
    indicators: [
      hasSolutionSection && 'Dedicated solution section',
      solutionMatches.length > 0 && 'Solution language present',
      actionableMatches.length > 0 && 'Actionable verbs used',
      alternativesMatches.length > 0 && 'Alternatives considered',
      justificationMatches.length > 0 && 'Rationale provided'
    ].filter(Boolean)
  };
}

/**
 * Detect business impact in text
 * @param {string} text - Text to analyze
 * @returns {Object} Business impact detection results
 */
export function detectBusinessImpact(text) {
  const hasImpactSection = IMPACT_PATTERNS.impactSection.test(text);
  const impactMatches = text.match(IMPACT_PATTERNS.impactLanguage) || [];
  const quantifiedMatches = text.match(IMPACT_PATTERNS.quantified) || [];
  const financialMatches = text.match(IMPACT_PATTERNS.financialTerms) || [];
  const competitiveMatches = text.match(IMPACT_PATTERNS.competitiveTerms) || [];

  return {
    hasImpactSection,
    hasImpactLanguage: impactMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasFinancialTerms: financialMatches.length > 0,
    hasCompetitiveTerms: competitiveMatches.length > 0,
    indicators: [
      hasImpactSection && 'Dedicated impact/value section',
      impactMatches.length > 0 && 'Impact language present',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      financialMatches.length > 0 && 'Financial terms used',
      competitiveMatches.length > 0 && 'Competitive advantage mentioned'
    ].filter(Boolean)
  };
}

/**
 * Detect implementation plan in text
 * @param {string} text - Text to analyze
 * @returns {Object} Implementation detection results
 */
export function detectImplementation(text) {
  const hasImplementationSection = IMPLEMENTATION_PATTERNS.implementationSection.test(text);
  const phaseMatches = text.match(IMPLEMENTATION_PATTERNS.phaseLanguage) || [];
  const dateMatches = text.match(IMPLEMENTATION_PATTERNS.datePatterns) || [];
  const ownerMatches = text.match(IMPLEMENTATION_PATTERNS.ownershipLanguage) || [];
  const resourceMatches = text.match(IMPLEMENTATION_PATTERNS.resourceLanguage) || [];

  return {
    hasImplementationSection,
    hasPhases: phaseMatches.length > 0,
    phaseCount: phaseMatches.length,
    hasTimeline: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasOwnership: ownerMatches.length > 0,
    hasResources: resourceMatches.length > 0,
    indicators: [
      hasImplementationSection && 'Dedicated implementation section',
      phaseMatches.length > 0 && `${phaseMatches.length} phases/milestones`,
      dateMatches.length > 0 && `${dateMatches.length} timeline references`,
      ownerMatches.length > 0 && 'Ownership defined',
      resourceMatches.length > 0 && 'Resources identified'
    ].filter(Boolean)
  };
}

/**
 * Detect risks in text
 * @param {string} text - Text to analyze
 * @returns {Object} Risk detection results
 */
export function detectRisks(text) {
  const hasRiskSection = RISK_PATTERNS.riskSection.test(text);
  const riskMatches = text.match(RISK_PATTERNS.riskLanguage) || [];
  const mitigationMatches = text.match(RISK_PATTERNS.mitigationLanguage) || [];

  return {
    hasRiskSection,
    hasRisks: riskMatches.length > 0,
    riskCount: riskMatches.length,
    hasMitigation: mitigationMatches.length > 0,
    mitigationCount: mitigationMatches.length,
    indicators: [
      hasRiskSection && 'Dedicated risk section',
      riskMatches.length > 0 && `${riskMatches.length} risks identified`,
      mitigationMatches.length > 0 && 'Mitigation strategies included'
    ].filter(Boolean)
  };
}

/**
 * Detect success metrics in text
 * @param {string} text - Text to analyze
 * @returns {Object} Success metrics detection results
 */
export function detectSuccessMetrics(text) {
  const hasMetricsSection = METRICS_PATTERNS.metricsSection.test(text);
  const metricsMatches = text.match(METRICS_PATTERNS.metricsLanguage) || [];
  const quantifiedMatches = text.match(METRICS_PATTERNS.quantified) || [];
  const timeboundMatches = text.match(METRICS_PATTERNS.timebound) || [];

  return {
    hasMetricsSection,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasTimebound: timeboundMatches.length > 0,
    indicators: [
      hasMetricsSection && 'Dedicated metrics section',
      metricsMatches.length > 0 && `${metricsMatches.length} metric references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      timeboundMatches.length > 0 && 'Time-bound targets specified'
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


/**
 * Business Justification Validator - Detection Functions
 */

import {
  EVIDENCE_PATTERNS,
  FINANCIAL_PATTERNS,
  OPTIONS_PATTERNS,
  EXECUTION_PATTERNS,
  REQUIRED_SECTIONS,
  STAKEHOLDER_PATTERNS,
  TIMELINE_PATTERNS,
  SCOPE_PATTERNS,
  METRICS_PATTERNS,
  SOLUTION_PATTERNS
} from './validator-config.js';

/**
 * Detect strategic evidence in text (Pillar 1)
 * @param {string} text - Text to analyze
 * @returns {Object} Strategic evidence detection results
 */
export function detectStrategicEvidence(text) {
  const hasProblemSection = EVIDENCE_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(EVIDENCE_PATTERNS.problemLanguage) || [];
  const quantifiedMatches = text.match(EVIDENCE_PATTERNS.quantified) || [];
  const businessMatches = text.match(EVIDENCE_PATTERNS.businessFocus) || [];
  const sourceMatches = text.match(EVIDENCE_PATTERNS.sources) || [];
  const beforeAfterMatches = text.match(EVIDENCE_PATTERNS.beforeAfter) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    hasSources: sourceMatches.length > 0,
    sourceCount: sourceMatches.length,
    hasBeforeAfter: beforeAfterMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/customer focus',
      sourceMatches.length > 0 && `${sourceMatches.length} credible sources cited`,
      beforeAfterMatches.length > 0 && 'Before/after comparisons'
    ].filter(Boolean)
  };
}

/**
 * Detect financial justification in text (Pillar 2)
 * @param {string} text - Text to analyze
 * @returns {Object} Financial justification detection results
 */
export function detectFinancialJustification(text) {
  const hasFinancialSection = FINANCIAL_PATTERNS.financialSection.test(text);
  const roiMatches = text.match(FINANCIAL_PATTERNS.roiCalculation) || [];
  const roiFormulaMatches = text.match(FINANCIAL_PATTERNS.roiFormula) || [];
  const paybackMatches = text.match(FINANCIAL_PATTERNS.paybackPeriod) || [];
  const paybackTimeMatches = text.match(FINANCIAL_PATTERNS.paybackTime) || [];
  const tcoMatches = text.match(FINANCIAL_PATTERNS.tcoAnalysis) || [];
  const dollarMatches = text.match(FINANCIAL_PATTERNS.dollarAmounts) || [];

  return {
    hasFinancialSection,
    hasROI: roiMatches.length > 0,
    hasROIFormula: roiFormulaMatches.length > 0,
    hasPayback: paybackMatches.length > 0,
    hasPaybackTime: paybackTimeMatches.length > 0,
    hasTCO: tcoMatches.length > 0,
    hasDollarAmounts: dollarMatches.length > 0,
    dollarCount: dollarMatches.length,
    indicators: [
      hasFinancialSection && 'Dedicated financial section',
      roiMatches.length > 0 && 'ROI calculation mentioned',
      roiFormulaMatches.length > 0 && 'Explicit ROI formula present',
      paybackMatches.length > 0 && 'Payback period discussed',
      paybackTimeMatches.length > 0 && 'Specific payback timeline',
      tcoMatches.length > 0 && 'TCO/3-year analysis present',
      dollarMatches.length > 0 && `${dollarMatches.length} dollar amounts specified`
    ].filter(Boolean)
  };
}

/**
 * Detect options analysis in text (Pillar 3)
 * @param {string} text - Text to analyze
 * @returns {Object} Options analysis detection results
 */
export function detectOptionsAnalysis(text) {
  const hasOptionsSection = OPTIONS_PATTERNS.optionsSection.test(text);
  const doNothingMatches = text.match(OPTIONS_PATTERNS.doNothing) || [];
  const alternativeMatches = text.match(OPTIONS_PATTERNS.alternatives) || [];
  const recommendationMatches = text.match(OPTIONS_PATTERNS.recommendation) || [];
  const comparisonMatches = text.match(OPTIONS_PATTERNS.comparison) || [];
  const minimalMatches = text.match(OPTIONS_PATTERNS.minimalInvestment) || [];
  const fullMatches = text.match(OPTIONS_PATTERNS.fullInvestment) || [];

  return {
    hasOptionsSection,
    hasDoNothing: doNothingMatches.length > 0,
    doNothingCount: doNothingMatches.length,
    hasAlternatives: alternativeMatches.length > 0,
    alternativeCount: alternativeMatches.length,
    hasRecommendation: recommendationMatches.length > 0,
    hasComparison: comparisonMatches.length > 0,
    hasMinimalOption: minimalMatches.length > 0,
    hasFullOption: fullMatches.length > 0,
    indicators: [
      hasOptionsSection && 'Dedicated options section',
      doNothingMatches.length > 0 && 'Do-nothing scenario analyzed',
      alternativeMatches.length > 0 && `${alternativeMatches.length} alternatives considered`,
      recommendationMatches.length > 0 && 'Clear recommendation present',
      comparisonMatches.length > 0 && 'Comparison/trade-off analysis',
      minimalMatches.length > 0 && 'Minimal investment option considered',
      fullMatches.length > 0 && 'Full investment option considered'
    ].filter(Boolean)
  };
}

/**
 * Detect execution completeness in text (Pillar 4)
 * @param {string} text - Text to analyze
 * @returns {Object} Execution completeness detection results
 */
export function detectExecutionCompleteness(text) {
  const hasExecSummary = EXECUTION_PATTERNS.executiveSummary.test(text);
  const hasRisksSection = EXECUTION_PATTERNS.risksSection.test(text);
  const riskMatches = text.match(EXECUTION_PATTERNS.riskLanguage) || [];
  const hasStakeholderSection = EXECUTION_PATTERNS.stakeholderSection.test(text);
  const stakeholderConcernMatches = text.match(EXECUTION_PATTERNS.stakeholderConcerns) || [];
  const hasTimelineSection = EXECUTION_PATTERNS.timelineSection.test(text);
  const hasScopeSection = EXECUTION_PATTERNS.scopeSection.test(text);

  return {
    hasExecSummary,
    hasRisksSection,
    hasRiskLanguage: riskMatches.length > 0,
    riskCount: riskMatches.length,
    hasStakeholderSection,
    hasStakeholderConcerns: stakeholderConcernMatches.length > 0,
    stakeholderConcernCount: stakeholderConcernMatches.length,
    hasTimelineSection,
    hasScopeSection,
    indicators: [
      hasExecSummary && 'Executive summary present',
      hasRisksSection && 'Dedicated risks section',
      riskMatches.length > 0 && `${riskMatches.length} risk/mitigation mentions`,
      hasStakeholderSection && 'Stakeholders identified',
      stakeholderConcernMatches.length > 0 && 'Finance/HR/Legal concerns addressed',
      hasTimelineSection && 'Timeline defined',
      hasScopeSection && 'Scope boundaries set'
    ].filter(Boolean)
  };
}

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


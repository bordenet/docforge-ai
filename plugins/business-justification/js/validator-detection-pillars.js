/**
 * Business Justification Validator - Pillar Detection Functions
 *
 * Detects the 4 main pillars: Strategic Evidence, Financial Justification,
 * Options Analysis, and Execution Completeness.
 */

import {
  EVIDENCE_PATTERNS,
  FINANCIAL_PATTERNS,
  OPTIONS_PATTERNS,
  EXECUTION_PATTERNS
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


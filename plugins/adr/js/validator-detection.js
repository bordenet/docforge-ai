/**
 * ADR Validator - Detection Functions
 */

import {
  REQUIRED_SECTIONS,
  CONTEXT_PATTERNS,
  DECISION_PATTERNS,
  VAGUE_DECISION_PATTERNS,
  OPTIONS_PATTERNS,
  CONSEQUENCES_PATTERNS,
  VAGUE_CONSEQUENCE_TERMS,
  STATUS_PATTERNS,
  RATIONALE_PATTERNS,
  DECISION_DRIVERS_PATTERNS,
  CONFIRMATION_PATTERNS
} from './validator-config.js';

/**
 * Detect context section in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Context detection results
 */
export function detectContext(text) {
  const hasContextSection = CONTEXT_PATTERNS.contextSection.test(text);
  const contextMatches = text.match(CONTEXT_PATTERNS.contextLanguage) || [];
  const constraintMatches = text.match(CONTEXT_PATTERNS.constraints) || [];
  const quantifiedMatches = text.match(CONTEXT_PATTERNS.quantified) || [];
  const businessMatches = text.match(CONTEXT_PATTERNS.businessFocus) || [];

  return {
    hasContextSection,
    hasContextLanguage: contextMatches.length > 0,
    hasConstraints: constraintMatches.length > 0,
    constraintCount: constraintMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    indicators: [
      hasContextSection && 'Dedicated context section',
      contextMatches.length > 0 && 'Context framing language',
      constraintMatches.length > 0 && `${constraintMatches.length} constraints identified`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/stakeholder focus'
    ].filter(Boolean)
  };
}

/**
 * Detect decision statement in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Decision detection results
 */
export function detectDecision(text) {
  const hasDecisionSection = DECISION_PATTERNS.decisionSection.test(text);
  const decisionMatches = text.match(DECISION_PATTERNS.decisionLanguage) || [];
  const clarityMatches = text.match(DECISION_PATTERNS.clarity) || [];
  const specificityMatches = text.match(DECISION_PATTERNS.specificity) || [];
  const actionVerbMatches = text.match(DECISION_PATTERNS.actionVerbs) || [];
  const vagueDecisionMatches = text.match(VAGUE_DECISION_PATTERNS) || [];

  return {
    hasDecisionSection,
    hasDecisionLanguage: decisionMatches.length > 0,
    hasClarity: clarityMatches.length > 0,
    clarityCount: clarityMatches.length,
    hasSpecificity: specificityMatches.length > 0,
    hasActionVerbs: actionVerbMatches.length > 0,
    actionVerbCount: actionVerbMatches.length,
    hasVagueDecision: vagueDecisionMatches.length > 0,
    vagueDecisionCount: vagueDecisionMatches.length,
    indicators: [
      hasDecisionSection && 'Dedicated decision section',
      decisionMatches.length > 0 && 'Decision language present',
      clarityMatches.length > 0 && 'Clear decision statement',
      specificityMatches.length > 0 && 'Specific details provided',
      actionVerbMatches.length > 0 && `${actionVerbMatches.length} action verbs used`,
      vagueDecisionMatches.length > 0 && `⚠️ ${vagueDecisionMatches.length} vague decision phrases detected`
    ].filter(Boolean)
  };
}

/**
 * Detect options considered in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Options detection results
 */
export function detectOptions(text) {
  const hasOptionsSection = OPTIONS_PATTERNS.optionsSection.test(text);
  const optionsMatches = text.match(OPTIONS_PATTERNS.optionsLanguage) || [];
  const comparisonMatches = text.match(OPTIONS_PATTERNS.comparison) || [];
  const rejectedMatches = text.match(OPTIONS_PATTERNS.rejected) || [];

  return {
    hasOptionsSection,
    hasOptionsLanguage: optionsMatches.length > 0,
    optionsCount: optionsMatches.length,
    hasComparison: comparisonMatches.length > 0,
    comparisonCount: comparisonMatches.length,
    hasRejected: rejectedMatches.length > 0,
    indicators: [
      hasOptionsSection && 'Dedicated options section',
      optionsMatches.length > 0 && `${optionsMatches.length} options mentioned`,
      comparisonMatches.length > 0 && 'Options compared',
      rejectedMatches.length > 0 && 'Rejected options explained'
    ].filter(Boolean)
  };
}

/**
 * Detect consequences in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Consequences detection results
 */
export function detectConsequences(text) {
  const hasConsequencesSection = CONSEQUENCES_PATTERNS.consequencesSection.test(text);
  const consequencesMatches = text.match(CONSEQUENCES_PATTERNS.consequencesLanguage) || [];
  const positiveMatches = text.match(CONSEQUENCES_PATTERNS.positive) || [];
  const negativeMatches = text.match(CONSEQUENCES_PATTERNS.negative) || [];
  const neutralMatches = text.match(CONSEQUENCES_PATTERNS.neutral) || [];
  const vagueConsequenceMatches = text.match(VAGUE_CONSEQUENCE_TERMS) || [];

  return {
    hasConsequencesSection,
    hasConsequencesLanguage: consequencesMatches.length > 0,
    hasPositive: positiveMatches.length > 0,
    positiveCount: positiveMatches.length,
    hasNegative: negativeMatches.length > 0,
    negativeCount: negativeMatches.length,
    hasNeutral: neutralMatches.length > 0,
    hasBothPosNeg: positiveMatches.length > 0 && negativeMatches.length > 0,
    hasVagueConsequences: vagueConsequenceMatches.length > 0,
    vagueConsequenceCount: vagueConsequenceMatches.length,
    indicators: [
      hasConsequencesSection && 'Dedicated consequences section',
      positiveMatches.length > 0 && `${positiveMatches.length} positive consequences`,
      negativeMatches.length > 0 && `${negativeMatches.length} negative consequences`,
      neutralMatches.length > 0 && 'Neutral impacts noted',
      vagueConsequenceMatches.length > 0 && `⚠️ ${vagueConsequenceMatches.length} vague terms (complexity/overhead)`
    ].filter(Boolean)
  };
}

/**
 * Detect status in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Status detection results
 */
export function detectStatus(text) {
  const hasStatusSection = STATUS_PATTERNS.statusSection.test(text);
  const statusMatches = text.match(STATUS_PATTERNS.statusValues) || [];
  const dateMatches = text.match(STATUS_PATTERNS.datePatterns) || [];
  const supersededMatches = text.match(STATUS_PATTERNS.supersededBy) || [];

  const hasProposed = /\bproposed\b/i.test(text);
  const hasAccepted = /\baccepted\b/i.test(text);
  const hasDeprecated = /\bdeprecated\b/i.test(text);
  const hasSuperseded = /\bsuperseded\b/i.test(text);

  return {
    hasStatusSection,
    hasStatusValue: statusMatches.length > 0,
    statusValues: statusMatches,
    hasDate: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasSupersededBy: supersededMatches.length > 0,
    hasProposed,
    hasAccepted,
    hasDeprecated,
    hasSuperseded,
    indicators: [
      hasStatusSection && 'Dedicated status section',
      statusMatches.length > 0 && `Status: ${statusMatches.join(', ')}`,
      dateMatches.length > 0 && 'Date information present',
      supersededMatches.length > 0 && 'Supersession reference'
    ].filter(Boolean)
  };
}

/**
 * Detect rationale in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Rationale detection results
 */
export function detectRationale(text) {
  const hasRationaleSection = RATIONALE_PATTERNS.rationaleSection.test(text);
  const rationaleMatches = text.match(RATIONALE_PATTERNS.rationaleLanguage) || [];
  const evidenceMatches = text.match(RATIONALE_PATTERNS.evidence) || [];

  return {
    hasRationaleSection,
    hasRationaleLanguage: rationaleMatches.length > 0,
    rationaleCount: rationaleMatches.length,
    hasEvidence: evidenceMatches.length > 0,
    evidenceCount: evidenceMatches.length,
    indicators: [
      hasRationaleSection && 'Dedicated rationale section',
      rationaleMatches.length > 0 && `${rationaleMatches.length} rationale statements`,
      evidenceMatches.length > 0 && 'Evidence-based reasoning'
    ].filter(Boolean)
  };
}

/**
 * Detect decision drivers in ADR (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} Decision drivers detection results
 */
export function detectDecisionDrivers(text) {
  const hasSectionHeader = DECISION_DRIVERS_PATTERNS.sectionHeader.test(text);
  const hasSection = DECISION_DRIVERS_PATTERNS.section.test(text);
  const driverMatches = text.match(DECISION_DRIVERS_PATTERNS.driverLanguage) || [];
  const bulletMatches = text.match(DECISION_DRIVERS_PATTERNS.bulletList) || [];
  const numberedMatches = text.match(DECISION_DRIVERS_PATTERNS.numberedList) || [];

  // Extract drivers section content if present
  let driversCount = 0;
  if (hasSectionHeader) {
    const driversMatch = text.match(/^#+\s*decision\s+drivers?\b[\s\S]*?(?=^#+\s|\z)/im);
    if (driversMatch) {
      const sectionText = driversMatch[0];
      const bullets = sectionText.match(/^[\s]*[-*•]\s+.+$/gm) || [];
      const numbered = sectionText.match(/^[\s]*\d+\.\s+.+$/gm) || [];
      driversCount = bullets.length + numbered.length;
    }
  }

  return {
    hasSectionHeader,
    hasSection,
    hasDriverLanguage: driverMatches.length > 0,
    driversCount,
    hasBulletList: bulletMatches.length > 0,
    hasNumberedList: numberedMatches.length > 0,
    hasMinimumDrivers: driversCount >= 3,
    indicators: [
      hasSectionHeader && 'Dedicated Decision Drivers section',
      driversCount > 0 && `${driversCount} drivers listed`,
      driversCount >= 3 && '✓ Minimum 3 drivers (MADR 3.0)',
      driversCount < 3 && driversCount > 0 && `⚠️ Only ${driversCount} drivers (need 3+)`
    ].filter(Boolean)
  };
}

/**
 * Detect confirmation/validation section in ADR (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} Confirmation detection results
 */
export function detectConfirmation(text) {
  const hasSectionHeader = CONFIRMATION_PATTERNS.sectionHeader.test(text);
  const hasSection = CONFIRMATION_PATTERNS.section.test(text);
  const validationMatches = text.match(CONFIRMATION_PATTERNS.validationLanguage) || [];
  const measurableMatches = text.match(CONFIRMATION_PATTERNS.measurable) || [];

  return {
    hasSectionHeader,
    hasSection,
    hasValidationLanguage: validationMatches.length > 0,
    validationCount: validationMatches.length,
    hasMeasurable: measurableMatches.length > 0,
    measurableCount: measurableMatches.length,
    indicators: [
      hasSectionHeader && 'Dedicated Confirmation section',
      validationMatches.length > 0 && `${validationMatches.length} validation mechanisms`,
      measurableMatches.length > 0 && 'Measurable criteria specified'
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


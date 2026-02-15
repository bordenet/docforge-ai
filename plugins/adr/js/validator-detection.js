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
  CONFIRMATION_PATTERNS,
  Y_STATEMENT_PATTERNS,
  MADR_CONSEQUENCE_FORMAT,
  PROS_CONS_PATTERNS,
  YAML_METADATA_PATTERNS,
  MORE_INFO_PATTERNS,
  QUANTIFIED_PATTERNS,
  GOALS_PATTERNS,
  RISKS_PATTERNS,
  ADR_REFERENCE_PATTERNS,
  IMPLEMENTATION_HISTORY_PATTERNS,
  TRADEOFF_PATTERNS,
  COMPLIANCE_PATTERNS,
  TECHNICAL_CONTEXT_PATTERNS,
  REVERSIBILITY_PATTERNS,
  TEAM_CONTEXT_PATTERNS,
  ASSUMPTIONS_PATTERNS,
  SCOPE_IMPACT_PATTERNS,
  QUALITY_ATTRIBUTES_PATTERNS,
  ALTERNATIVES_DEPTH_PATTERNS,
  LINKS_PATTERNS,
  CHANGELOG_PATTERNS,
  SUPERSEDED_PATTERNS,
  SIGNOFF_PATTERNS,
  ADR_NUMBERING_PATTERNS,
  ASR_PATTERNS,
  COST_PATTERNS,
  TIMELINE_PATTERNS,
  SECURITY_PATTERNS,
  DEPENDENCIES_PATTERNS,
  DIAGRAM_PATTERNS,
  OBSERVABILITY_PATTERNS
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
    const driversMatch = text.match(/^#+\s*decision\s+drivers?\b[\s\S]*?(?=^#+\s|$)/im);
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

/**
 * Detect Y-statement format in Decision Outcome (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} Y-statement detection results
 */
export function detectYStatement(text) {
  const hasChosenOption = Y_STATEMENT_PATTERNS.chosenOption.test(text);
  const hasAltFormat = Y_STATEMENT_PATTERNS.altFormats.test(text);
  const hasJustification = Y_STATEMENT_PATTERNS.justification.test(text);

  // Extract chosen option name if present
  let chosenOptionName = null;
  const chosenMatch = text.match(Y_STATEMENT_PATTERNS.chosenOption);
  if (chosenMatch) {
    chosenOptionName = chosenMatch[1].trim();
  }

  return {
    hasChosenOption,
    hasAltFormat,
    hasYStatement: hasChosenOption || hasAltFormat,
    hasJustification,
    chosenOptionName,
    indicators: [
      hasChosenOption && 'MADR Y-statement format: "Chosen option: X, because..."',
      hasAltFormat && !hasChosenOption && 'Alternative decision format with justification',
      hasJustification && 'Strong justification pattern detected'
    ].filter(Boolean)
  };
}

/**
 * Detect MADR "Good, because" / "Bad, because" consequence format
 * @param {string} text - Text to analyze
 * @returns {Object} MADR consequence format detection results
 */
export function detectMADRConsequenceFormat(text) {
  const goodMatches = text.match(MADR_CONSEQUENCE_FORMAT.goodBecause) || [];
  const badMatches = text.match(MADR_CONSEQUENCE_FORMAT.badBecause) || [];
  const neutralMatches = text.match(MADR_CONSEQUENCE_FORMAT.neutralBecause) || [];

  const totalMADRFormat = goodMatches.length + badMatches.length + neutralMatches.length;

  return {
    goodBecauseCount: goodMatches.length,
    badBecauseCount: badMatches.length,
    neutralBecauseCount: neutralMatches.length,
    totalMADRFormat,
    hasMADRFormat: totalMADRFormat >= 2,
    hasBalancedMADR: goodMatches.length >= 1 && badMatches.length >= 1,
    indicators: [
      goodMatches.length > 0 && `${goodMatches.length} "Good, because..." items`,
      badMatches.length > 0 && `${badMatches.length} "Bad, because..." items`,
      neutralMatches.length > 0 && `${neutralMatches.length} "Neutral, because..." items`,
      totalMADRFormat >= 6 && '✓ Rich MADR consequence format (6+ items)'
    ].filter(Boolean)
  };
}

/**
 * Detect Pros and Cons of Options section (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} Pros/Cons section detection results
 */
export function detectProsConsSection(text) {
  const hasSectionHeader = PROS_CONS_PATTERNS.sectionHeader.test(text);
  const optionMatches = text.match(PROS_CONS_PATTERNS.optionSubsection) || [];
  const goodArgMatches = text.match(PROS_CONS_PATTERNS.goodArgument) || [];
  const badArgMatches = text.match(PROS_CONS_PATTERNS.badArgument) || [];

  return {
    hasSectionHeader,
    optionCount: optionMatches.length,
    goodArgumentCount: goodArgMatches.length,
    badArgumentCount: badArgMatches.length,
    hasDetailedAnalysis: hasSectionHeader && optionMatches.length >= 2,
    indicators: [
      hasSectionHeader && 'Pros and Cons of Options section present',
      optionMatches.length >= 2 && `${optionMatches.length} options analyzed`,
      goodArgMatches.length + badArgMatches.length >= 4 && 'Detailed pro/con analysis'
    ].filter(Boolean)
  };
}

/**
 * Detect YAML Front Matter metadata (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} YAML metadata detection results
 */
export function detectYAMLMetadata(text) {
  const hasFrontMatter = YAML_METADATA_PATTERNS.frontMatter.test(text);
  const hasStatus = YAML_METADATA_PATTERNS.status.test(text);
  const hasDate = YAML_METADATA_PATTERNS.date.test(text);
  const hasDecisionMakers = YAML_METADATA_PATTERNS.decisionMakers.test(text);
  const hasConsulted = YAML_METADATA_PATTERNS.consulted.test(text);
  const hasInformed = YAML_METADATA_PATTERNS.informed.test(text);

  const metadataCount = [hasStatus, hasDate, hasDecisionMakers, hasConsulted, hasInformed]
    .filter(Boolean).length;

  return {
    hasFrontMatter,
    hasStatus,
    hasDate,
    hasDecisionMakers,
    hasConsulted,
    hasInformed,
    metadataCount,
    hasRichMetadata: metadataCount >= 3,
    indicators: [
      hasFrontMatter && 'YAML front matter present',
      hasDecisionMakers && 'Decision-makers listed',
      hasConsulted && 'Consulted parties listed',
      hasInformed && 'Informed parties listed',
      metadataCount >= 4 && '✓ Rich MADR metadata (4+ fields)'
    ].filter(Boolean)
  };
}

/**
 * Detect More Information section (MADR 3.0)
 * @param {string} text - Text to analyze
 * @returns {Object} More Information section detection results
 */
export function detectMoreInfoSection(text) {
  const hasSectionHeader = MORE_INFO_PATTERNS.sectionHeader.test(text);
  const linkMatches = text.match(MORE_INFO_PATTERNS.hasLinks) || [];
  const evidenceMatches = text.match(MORE_INFO_PATTERNS.hasEvidence) || [];

  return {
    hasSectionHeader,
    linkCount: linkMatches.length,
    evidenceCount: evidenceMatches.length,
    hasLinks: linkMatches.length > 0,
    hasEvidence: evidenceMatches.length > 0,
    indicators: [
      hasSectionHeader && 'More Information section present',
      linkMatches.length > 0 && `${linkMatches.length} links to external resources`,
      evidenceMatches.length > 0 && 'Evidence/research references'
    ].filter(Boolean)
  };
}

/**
 * Detect quantified metrics in context (enhanced)
 * @param {string} text - Text to analyze
 * @returns {Object} Quantified metrics detection results
 */
export function detectQuantifiedMetrics(text) {
  const percentages = text.match(QUANTIFIED_PATTERNS.percentages) || [];
  const currency = text.match(QUANTIFIED_PATTERNS.currency) || [];
  const timeMetrics = text.match(QUANTIFIED_PATTERNS.timeMetrics) || [];
  const userMetrics = text.match(QUANTIFIED_PATTERNS.userMetrics) || [];
  const slaMetrics = text.match(QUANTIFIED_PATTERNS.slaMetrics) || [];
  const latencyMetrics = text.match(QUANTIFIED_PATTERNS.latencyMetrics) || [];

  const totalMetrics = percentages.length + currency.length + timeMetrics.length +
    userMetrics.length + slaMetrics.length + latencyMetrics.length;

  const categoryCount = [
    percentages.length > 0,
    currency.length > 0,
    timeMetrics.length > 0,
    userMetrics.length > 0,
    slaMetrics.length > 0,
    latencyMetrics.length > 0
  ].filter(Boolean).length;

  return {
    percentageCount: percentages.length,
    currencyCount: currency.length,
    timeMetricCount: timeMetrics.length,
    userMetricCount: userMetrics.length,
    slaMetricCount: slaMetrics.length,
    latencyMetricCount: latencyMetrics.length,
    totalMetrics,
    categoryCount,
    isWellQuantified: totalMetrics >= 5 && categoryCount >= 2,
    indicators: [
      percentages.length > 0 && `${percentages.length} percentage metrics`,
      currency.length > 0 && `${currency.length} currency values`,
      timeMetrics.length > 0 && `${timeMetrics.length} time metrics`,
      userMetrics.length > 0 && `${userMetrics.length} user/scale metrics`,
      latencyMetrics.length > 0 && 'Performance/latency metrics',
      totalMetrics >= 8 && '✓ Highly quantified context'
    ].filter(Boolean)
  };
}

/**
 * Detect Goals and Non-Goals sections (KEP pattern)
 * @param {string} text - Text to analyze
 * @returns {Object} Goals/Non-Goals detection results
 */
export function detectGoals(text) {
  const hasGoalsSection = GOALS_PATTERNS.goalsSection.test(text);
  const hasNonGoalsSection = GOALS_PATTERNS.nonGoalsSection.test(text);
  const goalItems = text.match(GOALS_PATTERNS.goalItems) || [];
  const nonGoalItems = text.match(GOALS_PATTERNS.nonGoalItems) || [];

  return {
    hasGoalsSection,
    hasNonGoalsSection,
    hasBothSections: hasGoalsSection && hasNonGoalsSection,
    goalItemCount: goalItems.length,
    nonGoalItemCount: nonGoalItems.length,
    indicators: [
      hasGoalsSection && 'Goals section present',
      hasNonGoalsSection && 'Non-Goals section present',
      hasGoalsSection && hasNonGoalsSection && '✓ Both Goals and Non-Goals defined (KEP pattern)'
    ].filter(Boolean)
  };
}

/**
 * Detect Risks and Mitigations (KEP pattern)
 * @param {string} text - Text to analyze
 * @returns {Object} Risks/Mitigations detection results
 */
export function detectRisks(text) {
  const hasRisksSection = RISKS_PATTERNS.risksSection.test(text);
  const riskItems = text.match(RISKS_PATTERNS.riskItem) || [];
  const mitigationItems = text.match(RISKS_PATTERNS.mitigationItem) || [];
  const riskLanguage = text.match(RISKS_PATTERNS.riskLanguage) || [];
  const mitigationLanguage = text.match(RISKS_PATTERNS.mitigationLanguage) || [];

  const hasRiskMitigationPairs = riskLanguage.length > 0 && mitigationLanguage.length > 0;

  return {
    hasRisksSection,
    hasRiskItems: riskItems.length > 0,
    hasMitigationItems: mitigationItems.length > 0,
    hasRiskLanguage: riskLanguage.length > 0,
    hasMitigationLanguage: mitigationLanguage.length > 0,
    hasRiskMitigationPairs,
    riskCount: riskLanguage.length,
    mitigationCount: mitigationLanguage.length,
    indicators: [
      hasRisksSection && 'Risks and Mitigations section present',
      hasRiskMitigationPairs && `${riskLanguage.length} risks with ${mitigationLanguage.length} mitigations`,
      hasRiskMitigationPairs && '✓ Risk/Mitigation pairs documented'
    ].filter(Boolean)
  };
}

/**
 * Detect ADR cross-references and evolution tracking
 * @param {string} text - Text to analyze
 * @returns {Object} ADR reference detection results
 */
export function detectADRReferences(text) {
  const supersededByMatches = text.match(ADR_REFERENCE_PATTERNS.supersededBy) || [];
  const supersedesMatches = text.match(ADR_REFERENCE_PATTERNS.supersedes) || [];
  const relatedMatches = text.match(ADR_REFERENCE_PATTERNS.relatedADR) || [];
  const adrReferences = text.match(ADR_REFERENCE_PATTERNS.adrReference) || [];

  const hasEvolutionTracking = supersededByMatches.length > 0 || supersedesMatches.length > 0;
  const hasRelatedADRs = relatedMatches.length > 0 || adrReferences.length > 0;

  return {
    hasSupersededBy: supersededByMatches.length > 0,
    hasSupersedes: supersedesMatches.length > 0,
    hasRelatedADRs,
    hasEvolutionTracking,
    adrReferenceCount: adrReferences.length,
    indicators: [
      supersededByMatches.length > 0 && 'Superseded-by reference present',
      supersedesMatches.length > 0 && 'Supersedes reference present',
      hasRelatedADRs && `${adrReferences.length} ADR cross-references`,
      hasEvolutionTracking && '✓ ADR evolution tracking'
    ].filter(Boolean)
  };
}

/**
 * Detect Implementation History / Timeline
 * @param {string} text - Text to analyze
 * @returns {Object} Implementation history detection results
 */
export function detectImplementationHistory(text) {
  const hasSectionHeader = IMPLEMENTATION_HISTORY_PATTERNS.sectionHeader.test(text);
  const dateEntries = text.match(IMPLEMENTATION_HISTORY_PATTERNS.dateEntry) || [];
  const milestones = text.match(IMPLEMENTATION_HISTORY_PATTERNS.milestoneLanguage) || [];

  return {
    hasSectionHeader,
    hasDateEntries: dateEntries.length > 0,
    hasMilestones: milestones.length > 0,
    dateCount: dateEntries.length,
    milestoneCount: milestones.length,
    hasRichHistory: hasSectionHeader && dateEntries.length >= 2,
    indicators: [
      hasSectionHeader && 'Implementation History section present',
      dateEntries.length > 0 && `${dateEntries.length} dated entries`,
      milestones.length > 0 && `${milestones.length} milestones referenced`
    ].filter(Boolean)
  };
}

/**
 * Detect Tradeoff/Comparison matrices
 * @param {string} text - Text to analyze
 * @returns {Object} Tradeoff matrix detection results
 */
export function detectTradeoffMatrix(text) {
  const hasMarkdownTable = TRADEOFF_PATTERNS.markdownTable.test(text);
  const hasComparisonHeader = TRADEOFF_PATTERNS.comparisonHeader.test(text);
  const hasOptionComparison = TRADEOFF_PATTERNS.optionComparison.test(text);

  // Count tables
  const tableMatches = text.match(TRADEOFF_PATTERNS.markdownTable) || [];

  return {
    hasMarkdownTable,
    hasComparisonHeader,
    hasOptionComparison,
    tableCount: tableMatches.length,
    hasStructuredComparison: hasMarkdownTable && (hasComparisonHeader || hasOptionComparison),
    indicators: [
      hasMarkdownTable && `${tableMatches.length} comparison table(s)`,
      hasComparisonHeader && 'Comparison/Tradeoff section',
      hasOptionComparison && 'Option comparison in table',
      hasMarkdownTable && hasOptionComparison && '✓ Structured option comparison'
    ].filter(Boolean)
  };
}

/**
 * Detect compliance and governance markers
 * @param {string} text - Text to analyze
 * @returns {Object} Compliance detection results
 */
export function detectCompliance(text) {
  const hasComplianceSection = COMPLIANCE_PATTERNS.complianceSection.test(text);
  const standards = text.match(COMPLIANCE_PATTERNS.standardsLanguage) || [];
  const auditLanguage = text.match(COMPLIANCE_PATTERNS.auditLanguage) || [];
  const approvalLanguage = text.match(COMPLIANCE_PATTERNS.approvalLanguage) || [];

  const hasStandards = standards.length > 0;
  const hasGovernance = auditLanguage.length > 0 || approvalLanguage.length > 0;

  return {
    hasComplianceSection,
    hasStandards,
    hasGovernance,
    standardsCount: standards.length,
    hasComplianceAwareness: hasComplianceSection || hasStandards || hasGovernance,
    indicators: [
      hasComplianceSection && 'Compliance section present',
      hasStandards && `${standards.length} standards referenced (${[...new Set(standards)].join(', ')})`,
      hasGovernance && 'Governance/approval language present',
      hasComplianceSection && hasStandards && '✓ Compliance-aware ADR'
    ].filter(Boolean)
  };
}

/**
 * Detect technical context depth
 * @param {string} text - Text to analyze
 * @returns {Object} Technical context detection results
 */
export function detectTechnicalContext(text) {
  const hasArchitectureSection = TECHNICAL_CONTEXT_PATTERNS.architectureSection.test(text);
  const diagrams = text.match(TECHNICAL_CONTEXT_PATTERNS.diagramReference) || [];
  const techStack = text.match(TECHNICAL_CONTEXT_PATTERNS.techStackLanguage) || [];
  const constraints = text.match(TECHNICAL_CONTEXT_PATTERNS.constraintLanguage) || [];
  const integrations = text.match(TECHNICAL_CONTEXT_PATTERNS.integrationLanguage) || [];

  const contextDepth = [
    hasArchitectureSection,
    diagrams.length > 0,
    techStack.length > 0,
    constraints.length > 0,
    integrations.length > 0
  ].filter(Boolean).length;

  return {
    hasArchitectureSection,
    hasDiagrams: diagrams.length > 0,
    hasTechStack: techStack.length > 0,
    hasConstraints: constraints.length > 0,
    hasIntegrations: integrations.length > 0,
    diagramCount: diagrams.length,
    contextDepth,
    hasRichTechnicalContext: contextDepth >= 3,
    indicators: [
      hasArchitectureSection && 'Architecture section present',
      diagrams.length > 0 && `${diagrams.length} diagram references`,
      techStack.length > 0 && 'Technology stack mentioned',
      constraints.length > 0 && 'Technical constraints documented',
      integrations.length > 0 && 'Integration points identified',
      contextDepth >= 3 && '✓ Rich technical context'
    ].filter(Boolean)
  };
}

/**
 * Detect decision reversibility classification
 * @param {string} text - Text to analyze
 * @returns {Object} Reversibility detection results
 */
export function detectReversibility(text) {
  const hasReversibilitySection = REVERSIBILITY_PATTERNS.reversibilitySection.test(text);
  const oneWayDoor = text.match(REVERSIBILITY_PATTERNS.oneWayDoor) || [];
  const twoWayDoor = text.match(REVERSIBILITY_PATTERNS.twoWayDoor) || [];
  const doorType = text.match(REVERSIBILITY_PATTERNS.doorTypeLanguage) || [];

  const hasClassification = oneWayDoor.length > 0 || twoWayDoor.length > 0 || doorType.length > 0;

  return {
    hasReversibilitySection,
    hasOneWayDoor: oneWayDoor.length > 0,
    hasTwoWayDoor: twoWayDoor.length > 0,
    hasDoorTypeClassification: doorType.length > 0,
    hasReversibilityAwareness: hasReversibilitySection || hasClassification,
    indicators: [
      hasReversibilitySection && 'Reversibility section present',
      oneWayDoor.length > 0 && 'One-way door (irreversible) decision identified',
      twoWayDoor.length > 0 && 'Two-way door (reversible) decision identified',
      hasClassification && '✓ Decision reversibility classified'
    ].filter(Boolean)
  };
}

/**
 * Detect team context and RACI-style ownership
 * @param {string} text - Text to analyze
 * @returns {Object} Team context detection results
 */
export function detectTeamContext(text) {
  const hasTeamSection = TEAM_CONTEXT_PATTERNS.teamSection.test(text);
  const drivers = text.match(TEAM_CONTEXT_PATTERNS.driverLanguage) || [];
  const consulted = text.match(TEAM_CONTEXT_PATTERNS.consultedLanguage) || [];
  const informed = text.match(TEAM_CONTEXT_PATTERNS.informedLanguage) || [];
  const raci = text.match(TEAM_CONTEXT_PATTERNS.raciPattern) || [];

  const hasOwnership = drivers.length > 0;
  const hasStakeholderMapping = consulted.length > 0 || informed.length > 0;
  const hasRACIPattern = raci.length > 0;

  return {
    hasTeamSection,
    hasOwnership,
    hasStakeholderMapping,
    hasRACIPattern,
    hasTeamClarity: hasTeamSection || (hasOwnership && hasStakeholderMapping),
    indicators: [
      hasTeamSection && 'Team/Ownership section present',
      hasOwnership && 'Decision driver/owner identified',
      hasStakeholderMapping && 'Stakeholder mapping (consulted/informed)',
      hasRACIPattern && 'RACI/DACI pattern detected',
      hasTeamSection && hasOwnership && '✓ Clear team accountability'
    ].filter(Boolean)
  };
}

/**
 * Detect assumptions documentation
 * @param {string} text - ADR text to analyze
 * @returns {Object} Assumptions detection result
 */
export function detectAssumptions(text) {
  const hasSection = ASSUMPTIONS_PATTERNS.assumptionsSection.test(text);
  const assumptionMatches = text.match(ASSUMPTIONS_PATTERNS.assumptionLanguage) || [];
  const constraintMatches = text.match(ASSUMPTIONS_PATTERNS.constraintAssumption) || [];

  const score = Math.min(3,
    (hasSection ? 1 : 0) +
    Math.min(1, Math.floor(assumptionMatches.length / 2)) +
    Math.min(1, constraintMatches.length > 0 ? 1 : 0)
  );

  return {
    hasSection,
    assumptionCount: assumptionMatches.length,
    constraintCount: constraintMatches.length,
    score,
    details: [
      hasSection && '✓ Assumptions section present',
      assumptionMatches.length > 0 && `Found ${assumptionMatches.length} assumption references`,
      constraintMatches.length > 0 && `Found ${constraintMatches.length} constraint references`
    ].filter(Boolean)
  };
}

/**
 * Detect decision scope and impact documentation
 * @param {string} text - ADR text to analyze
 * @returns {Object} Scope/Impact detection result
 */
export function detectScopeImpact(text) {
  const hasSection = SCOPE_IMPACT_PATTERNS.scopeSection.test(text);
  const impactMatches = text.match(SCOPE_IMPACT_PATTERNS.impactLanguage) || [];
  const boundaryMatches = text.match(SCOPE_IMPACT_PATTERNS.boundaryLanguage) || [];
  const systemsMatches = text.match(SCOPE_IMPACT_PATTERNS.systemsAffected) || [];

  const score = Math.min(3,
    (hasSection ? 1 : 0) +
    Math.min(1, Math.floor(impactMatches.length / 3)) +
    (systemsMatches.length > 0 ? 1 : 0)
  );

  return {
    hasSection,
    impactCount: impactMatches.length,
    boundaryCount: boundaryMatches.length,
    systemsAffectedCount: systemsMatches.length,
    score,
    details: [
      hasSection && '✓ Scope/Impact section present',
      impactMatches.length > 0 && `Found ${impactMatches.length} impact references`,
      systemsMatches.length > 0 && `Found ${systemsMatches.length} systems affected references`
    ].filter(Boolean)
  };
}

/**
 * Detect quality attributes (ISO 25010)
 * @param {string} text - ADR text to analyze
 * @returns {Object} Quality attributes detection result
 */
export function detectQualityAttributes(text) {
  const hasSection = QUALITY_ATTRIBUTES_PATTERNS.qualitySection.test(text);
  const perfMatches = text.match(QUALITY_ATTRIBUTES_PATTERNS.performanceLanguage) || [];
  const reliabilityMatches = text.match(QUALITY_ATTRIBUTES_PATTERNS.reliabilityLanguage) || [];
  const securityMatches = text.match(QUALITY_ATTRIBUTES_PATTERNS.securityLanguage) || [];
  const maintainMatches = text.match(QUALITY_ATTRIBUTES_PATTERNS.maintainabilityLanguage) || [];

  const attributeCategories = [
    perfMatches.length > 0,
    reliabilityMatches.length > 0,
    securityMatches.length > 0,
    maintainMatches.length > 0
  ].filter(Boolean).length;

  const score = Math.min(3,
    (hasSection ? 1 : 0) +
    Math.min(2, attributeCategories)
  );

  return {
    hasSection,
    performanceCount: perfMatches.length,
    reliabilityCount: reliabilityMatches.length,
    securityCount: securityMatches.length,
    maintainabilityCount: maintainMatches.length,
    categoriesCovered: attributeCategories,
    score,
    details: [
      hasSection && '✓ Quality attributes section present',
      perfMatches.length > 0 && 'Performance considerations documented',
      reliabilityMatches.length > 0 && 'Reliability considerations documented',
      securityMatches.length > 0 && 'Security considerations documented',
      maintainMatches.length > 0 && 'Maintainability considerations documented'
    ].filter(Boolean)
  };
}

/**
 * Detect depth of alternatives analysis
 * @param {string} text - ADR text to analyze
 * @returns {Object} Alternatives depth detection result
 */
export function detectAlternativesDepth(text) {
  const hasSection = ALTERNATIVES_DEPTH_PATTERNS.alternativesSection.test(text);
  const proConMatches = text.match(ALTERNATIVES_DEPTH_PATTERNS.proConLanguage) || [];
  const comparisonMatches = text.match(ALTERNATIVES_DEPTH_PATTERNS.comparisonLanguage) || [];
  const rejectionMatches = text.match(ALTERNATIVES_DEPTH_PATTERNS.rejectionReason) || [];

  const hasRejectionReasons = rejectionMatches.length > 0;
  const hasProsCons = proConMatches.length >= 3;
  const hasComparisons = comparisonMatches.length > 0;

  const score = Math.min(3,
    (hasSection ? 1 : 0) +
    (hasProsCons ? 1 : 0) +
    (hasRejectionReasons ? 1 : 0)
  );

  return {
    hasSection,
    proConCount: proConMatches.length,
    comparisonCount: comparisonMatches.length,
    rejectionReasonCount: rejectionMatches.length,
    hasRejectionReasons,
    score,
    details: [
      hasSection && '✓ Alternatives section present',
      hasProsCons && `Found ${proConMatches.length} pro/con references`,
      hasComparisons && `Found ${comparisonMatches.length} comparison references`,
      hasRejectionReasons && '✓ Explains why alternatives were rejected'
    ].filter(Boolean)
  };
}

/**
 * Detect links and references section
 * @param {string} text - ADR text to analyze
 * @returns {Object} Links detection result
 */
export function detectLinks(text) {
  const hasSection = LINKS_PATTERNS.linksSection.test(text);
  const markdownLinks = text.match(LINKS_PATTERNS.markdownLinks) || [];
  const urls = text.match(LINKS_PATTERNS.urlPattern) || [];
  const wikiLinks = text.match(LINKS_PATTERNS.wikiLink) || [];

  const totalLinks = markdownLinks.length + urls.length + wikiLinks.length;
  const hasRichReferences = totalLinks >= 3;

  const score = Math.min(2,
    (hasSection ? 1 : 0) +
    (hasRichReferences ? 1 : 0)
  );

  return {
    hasSection,
    markdownLinkCount: markdownLinks.length,
    urlCount: urls.length,
    wikiLinkCount: wikiLinks.length,
    totalLinks,
    hasRichReferences,
    score,
    details: [
      hasSection && '✓ Links/References section present',
      totalLinks > 0 && `Found ${totalLinks} external references`,
      hasRichReferences && '✓ Well-referenced document'
    ].filter(Boolean)
  };
}

/**
 * Detect changelog/revision history
 * @param {string} text - ADR text to analyze
 * @returns {Object} Changelog detection result
 */
export function detectChangelog(text) {
  const hasSection = CHANGELOG_PATTERNS.changelogSection.test(text);
  const versionEntries = text.match(CHANGELOG_PATTERNS.versionEntry) || [];
  const changeActions = text.match(CHANGELOG_PATTERNS.changeAction) || [];

  const hasVersionHistory = versionEntries.length >= 2;
  const hasChangeTracking = changeActions.length >= 2;

  const score = Math.min(2,
    (hasSection ? 1 : 0) +
    (hasVersionHistory && hasChangeTracking ? 1 : 0)
  );

  return {
    hasSection,
    versionCount: versionEntries.length,
    changeActionCount: changeActions.length,
    hasVersionHistory,
    hasChangeTracking,
    score,
    details: [
      hasSection && '✓ Changelog section present',
      hasVersionHistory && `Found ${versionEntries.length} version entries`,
      hasChangeTracking && 'Change actions documented'
    ].filter(Boolean)
  };
}

/**
 * Detect superseded/deprecated ADR status
 * @param {string} text - ADR text to analyze
 * @returns {Object} Superseded detection result
 */
export function detectSuperseded(text) {
  const hasSection = SUPERSEDED_PATTERNS.supersededSection.test(text);
  const supersededStatus = text.match(SUPERSEDED_PATTERNS.supersededStatus) || [];
  const supersedesOther = text.match(SUPERSEDED_PATTERNS.supersedesOther) || [];
  const adrRefs = text.match(SUPERSEDED_PATTERNS.adrNumberRef) || [];

  const hasSupersededStatus = supersededStatus.length > 0;
  const supersedesOtherADR = supersedesOther.length > 0;
  const hasADRReferences = adrRefs.length > 0;

  return {
    hasSection,
    isSuperseded: hasSupersededStatus,
    supersedesOtherADR,
    adrRefCount: adrRefs.length,
    hasADRReferences,
    details: [
      hasSupersededStatus && '⚠️ This ADR has been superseded',
      supersedesOtherADR && '✓ Supersedes previous ADR(s)',
      hasADRReferences && `References ${adrRefs.length} other ADR(s)`
    ].filter(Boolean)
  };
}

/**
 * Detect stakeholder sign-off
 * @param {string} text - ADR text to analyze
 * @returns {Object} Sign-off detection result
 */
export function detectSignoff(text) {
  const hasSection = SIGNOFF_PATTERNS.signoffSection.test(text);
  const approvalLanguage = text.match(SIGNOFF_PATTERNS.approvalLanguage) || [];
  const dateSignatures = text.match(SIGNOFF_PATTERNS.dateSignature) || [];
  const roleSignatures = text.match(SIGNOFF_PATTERNS.roleSignature) || [];

  const hasApprovals = approvalLanguage.length > 0;
  const hasDatedSignatures = dateSignatures.length > 0;
  const hasRoleSignatures = roleSignatures.length > 0;
  const hasFormalSignoff = hasSection && (hasDatedSignatures || hasRoleSignatures);

  const score = Math.min(2,
    (hasSection ? 1 : 0) +
    (hasFormalSignoff ? 1 : 0)
  );

  return {
    hasSection,
    hasApprovals,
    hasDatedSignatures,
    hasRoleSignatures,
    hasFormalSignoff,
    score,
    details: [
      hasSection && '✓ Sign-off section present',
      hasApprovals && 'Approval documented',
      hasDatedSignatures && 'Dated signatures present',
      hasRoleSignatures && 'Role-based sign-off documented',
      hasFormalSignoff && '✓ Formal stakeholder sign-off'
    ].filter(Boolean)
  };
}

/**
 * Detect ADR numbering patterns (enterprise documentation standards)
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for ADR numbering
 */
export function detectADRNumbering(text) {
  const hasTitleNumber = ADR_NUMBERING_PATTERNS.titleNumber.test(text);
  const fileMatches = text.match(ADR_NUMBERING_PATTERNS.fileNumber) || [];
  const inlineRefs = text.match(ADR_NUMBERING_PATTERNS.inlineRef) || [];

  const hasNumbering = hasTitleNumber || fileMatches.length > 0;
  const hasInlineRefs = inlineRefs.length > 1; // Multiple references suggest good cross-linking

  return {
    detected: hasNumbering,
    hasTitleNumber,
    hasFileNumbering: fileMatches.length > 0,
    hasInlineRefs,
    inlineRefCount: inlineRefs.length,
    indicators: [
      hasTitleNumber && 'ADR number in title',
      fileMatches.length > 0 && 'ADR file numbering',
      hasInlineRefs && `Cross-references ${inlineRefs.length} ADRs`,
      hasNumbering && '✓ Enterprise ADR numbering'
    ].filter(Boolean)
  };
}

/**
 * Detect Architecture Significant Requirements (ASR) patterns
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for ASRs
 */
export function detectASR(text) {
  const hasASRSection = ASR_PATTERNS.asrSection.test(text);
  const asrLanguageMatches = text.match(ASR_PATTERNS.asrLanguage) || [];
  const qualityDriverMatches = text.match(ASR_PATTERNS.qualityDrivers) || [];

  const hasASRLanguage = asrLanguageMatches.length >= 2;
  const hasQualityDrivers = qualityDriverMatches.length > 0;
  const hasASR = hasASRSection || hasASRLanguage;

  return {
    detected: hasASR,
    hasASRSection,
    hasASRLanguage,
    hasQualityDrivers,
    asrTermCount: asrLanguageMatches.length,
    indicators: [
      hasASRSection && 'ASR section present',
      hasASRLanguage && `Architecture significance language (${asrLanguageMatches.length} terms)`,
      hasQualityDrivers && 'Quality driver scenarios documented',
      hasASR && '✓ Architecture Significant Requirements identified'
    ].filter(Boolean)
  };
}

/**
 * Detect cost estimation patterns
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for cost estimation
 */
export function detectCostEstimation(text) {
  const hasCostSection = COST_PATTERNS.costSection.test(text);
  const costLanguageMatches = text.match(COST_PATTERNS.costLanguage) || [];
  const effortMatches = text.match(COST_PATTERNS.effortLanguage) || [];
  const roiMatches = text.match(COST_PATTERNS.roiLanguage) || [];

  const hasCostLanguage = costLanguageMatches.length >= 2;
  const hasEffortEstimate = effortMatches.length > 0;
  const hasROI = roiMatches.length > 0;
  const hasCostAnalysis = hasCostSection || (hasCostLanguage && hasEffortEstimate);

  return {
    detected: hasCostAnalysis,
    hasCostSection,
    hasCostLanguage,
    hasEffortEstimate,
    hasROI,
    indicators: [
      hasCostSection && 'Cost/Budget section present',
      hasCostLanguage && 'Cost analysis language',
      hasEffortEstimate && 'Effort estimation provided',
      hasROI && 'ROI/cost-benefit analysis',
      hasCostAnalysis && '✓ Cost estimation documented'
    ].filter(Boolean)
  };
}

/**
 * Detect timeline and deadline patterns
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for timelines
 */
export function detectTimeline(text) {
  const hasTimelineSection = TIMELINE_PATTERNS.timelineSection.test(text);
  const deadlineMatches = text.match(TIMELINE_PATTERNS.deadlineLanguage) || [];
  const quarterMatches = text.match(TIMELINE_PATTERNS.quarterLanguage) || [];
  const monthYearMatches = text.match(TIMELINE_PATTERNS.monthYearLanguage) || [];

  const hasDeadlines = deadlineMatches.length > 0;
  const hasQuarterRefs = quarterMatches.length > 0;
  const hasDateRefs = monthYearMatches.length > 0;
  const hasTimeline = hasTimelineSection || hasDeadlines || hasQuarterRefs || hasDateRefs;

  return {
    detected: hasTimeline,
    hasTimelineSection,
    hasDeadlines,
    hasQuarterRefs,
    hasDateRefs,
    indicators: [
      hasTimelineSection && 'Timeline section present',
      hasDeadlines && 'Deadlines documented',
      hasQuarterRefs && 'Quarter-based planning',
      hasDateRefs && 'Specific dates referenced',
      hasTimeline && '✓ Timeline awareness'
    ].filter(Boolean)
  };
}

/**
 * Detect security impact documentation
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for security patterns
 */
export function detectSecurityImpact(text) {
  const hasSecuritySection = SECURITY_PATTERNS.securitySection.test(text);
  const securityMatches = text.match(SECURITY_PATTERNS.securityLanguage) || [];
  const threatMatches = text.match(SECURITY_PATTERNS.threatLanguage) || [];
  const auditMatches = text.match(SECURITY_PATTERNS.auditLanguage) || [];

  const hasSecurityLanguage = securityMatches.length >= 2;
  const hasThreatAnalysis = threatMatches.length > 0;
  const hasAuditConsiderations = auditMatches.length > 0;
  const hasSecurityAnalysis = hasSecuritySection || (hasSecurityLanguage && hasThreatAnalysis);

  return {
    detected: hasSecurityAnalysis,
    hasSecuritySection,
    hasSecurityLanguage,
    hasThreatAnalysis,
    hasAuditConsiderations,
    securityTermCount: securityMatches.length,
    indicators: [
      hasSecuritySection && 'Security section present',
      hasSecurityLanguage && `Security considerations (${securityMatches.length} terms)`,
      hasThreatAnalysis && 'Threat analysis included',
      hasAuditConsiderations && 'Audit/compliance considerations',
      hasSecurityAnalysis && '✓ Security impact documented'
    ].filter(Boolean)
  };
}

/**
 * Detect dependencies documentation
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for dependencies
 */
export function detectDependencies(text) {
  const hasDependenciesSection = DEPENDENCIES_PATTERNS.dependenciesSection.test(text);
  const upstreamMatches = text.match(DEPENDENCIES_PATTERNS.upstreamLanguage) || [];
  const downstreamMatches = text.match(DEPENDENCIES_PATTERNS.downstreamLanguage) || [];
  const integrationMatches = text.match(DEPENDENCIES_PATTERNS.integrationLanguage) || [];

  const hasUpstreamDeps = upstreamMatches.length > 0;
  const hasDownstreamDeps = downstreamMatches.length > 0;
  const hasIntegrations = integrationMatches.length >= 2;
  const hasDependencyAnalysis = hasDependenciesSection || (hasUpstreamDeps && hasDownstreamDeps);

  return {
    detected: hasDependencyAnalysis,
    hasDependenciesSection,
    hasUpstreamDeps,
    hasDownstreamDeps,
    hasIntegrations,
    indicators: [
      hasDependenciesSection && 'Dependencies section present',
      hasUpstreamDeps && 'Upstream dependencies identified',
      hasDownstreamDeps && 'Downstream impacts documented',
      hasIntegrations && 'Integration points described',
      hasDependencyAnalysis && '✓ Dependency analysis documented'
    ].filter(Boolean)
  };
}

/**
 * Detect diagram and visual references
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for diagrams
 */
export function detectDiagrams(text) {
  const hasDiagramSection = DIAGRAM_PATTERNS.diagramSection.test(text);
  const diagramRefs = text.match(DIAGRAM_PATTERNS.diagramReference) || [];
  const diagramTypes = text.match(DIAGRAM_PATTERNS.diagramType) || [];
  const mermaidBlocks = text.match(DIAGRAM_PATTERNS.mermaidBlock) || [];

  const hasDiagramReferences = diagramRefs.length > 0;
  const hasDiagramTypes = diagramTypes.length > 0;
  const hasEmbeddedDiagrams = mermaidBlocks.length > 0;
  const hasDiagrams = hasDiagramSection || hasDiagramReferences || hasEmbeddedDiagrams;

  return {
    detected: hasDiagrams,
    hasDiagramSection,
    hasDiagramReferences,
    hasDiagramTypes,
    hasEmbeddedDiagrams,
    diagramCount: mermaidBlocks.length + diagramRefs.length,
    indicators: [
      hasDiagramSection && 'Diagrams section present',
      hasDiagramReferences && 'Diagram references included',
      hasDiagramTypes && `Specific diagram types: ${diagramTypes.join(', ')}`,
      hasEmbeddedDiagrams && 'Embedded diagrams (mermaid/plantuml)',
      hasDiagrams && '✓ Visual documentation'
    ].filter(Boolean)
  };
}

/**
 * Detect observability and monitoring patterns
 * @param {string} text - The ADR text to analyze
 * @returns {Object} - Detection results for observability
 */
export function detectObservability(text) {
  const hasObservabilitySection = OBSERVABILITY_PATTERNS.observabilitySection.test(text);
  const metricsMatches = text.match(OBSERVABILITY_PATTERNS.metricsLanguage) || [];
  const monitoringMatches = text.match(OBSERVABILITY_PATTERNS.monitoringLanguage) || [];
  const tracingMatches = text.match(OBSERVABILITY_PATTERNS.tracingLanguage) || [];

  const hasMetrics = metricsMatches.length >= 2;
  const hasMonitoring = monitoringMatches.length > 0;
  const hasTracing = tracingMatches.length > 0;
  const hasObservability = hasObservabilitySection || hasMetrics || hasMonitoring;

  return {
    detected: hasObservability,
    hasObservabilitySection,
    hasMetrics,
    hasMonitoring,
    hasTracing,
    metricsCount: metricsMatches.length,
    indicators: [
      hasObservabilitySection && 'Observability section present',
      hasMetrics && `SLO/SLI metrics defined (${metricsMatches.length} terms)`,
      hasMonitoring && 'Monitoring/alerting planned',
      hasTracing && 'Distributed tracing considered',
      hasObservability && '✓ Observability documented'
    ].filter(Boolean)
  };
}


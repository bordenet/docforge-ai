/**
 * ADR Validator - Result Scoring Functions
 *
 * Scoring for consequences and status dimensions.
 * Consequences (25 pts) - Positive and negative consequences
 * Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import {
  REQUIRED_SECTIONS,
  TEAM_PATTERNS,
  SUBSEQUENT_PATTERN,
  REVIEW_PATTERN
} from './validator-config.js';

import {
  detectConsequences,
  detectStatus,
  detectSections,
  detectConfirmation,
  detectMADRConsequenceFormat,
  detectYAMLMetadata,
  detectMoreInfoSection,
  detectRisks,
  detectADRReferences,
  detectImplementationHistory,
  detectCompliance,
  detectTeamContext,
  detectQualityAttributes,
  detectLinks,
  detectChangelog,
  detectSignoff,
  detectADRNumbering,
  detectCostEstimation,
  detectTimeline,
  detectSecurityImpact,
  detectDependencies,
  detectDiagrams,
  detectObservability
} from './validator-detection.js';

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

  // MADR "Good, because" / "Bad, because" format bonus (+2 pts)
  const madrFormatDetection = detectMADRConsequenceFormat(text);
  if (madrFormatDetection.hasMADRFormat && madrFormatDetection.hasBalancedMADR) {
    score += 2;
    strengths.push(`MADR consequence format: ${madrFormatDetection.goodBecauseCount} good, ${madrFormatDetection.badBecauseCount} bad`);
  } else if (madrFormatDetection.hasMADRFormat) {
    score += 1;
    strengths.push('MADR consequence format partially used');
  }

  // Risks and Mitigations bonus (KEP pattern, +2 pts)
  const risksDetection = detectRisks(text);
  if (risksDetection.hasRisksSection && risksDetection.hasRiskMitigationPairs) {
    score += 2;
    strengths.push(`Risks with mitigations: ${risksDetection.riskCount} risks, ${risksDetection.mitigationCount} mitigations`);
  } else if (risksDetection.hasRiskLanguage || risksDetection.hasRisksSection) {
    score += 1;
    strengths.push('Risk awareness present');
  }

  // Quality Attributes bonus (ISO 25010, +2 pts)
  const qualityDetection = detectQualityAttributes(text);
  if (qualityDetection.categoriesCovered >= 3) {
    score += 2;
    strengths.push(`Quality attributes documented (${qualityDetection.categoriesCovered} categories: performance, reliability, security, maintainability)`);
  } else if (qualityDetection.categoriesCovered >= 1) {
    score += 1;
    strengths.push('Quality considerations mentioned');
  }

  // Cost Estimation bonus (+2 pts)
  const costDetection = detectCostEstimation(text);
  if (costDetection.hasCostSection && costDetection.hasEffortEstimate) {
    score += 2;
    strengths.push('Cost and effort estimation documented');
  } else if (costDetection.hasCostAnalysis) {
    score += 1;
    strengths.push('Cost considerations addressed');
  }

  // Security Impact bonus (+2 pts)
  const securityDetection = detectSecurityImpact(text);
  if (securityDetection.hasSecuritySection && securityDetection.hasThreatAnalysis) {
    score += 2;
    strengths.push('Security impact with threat analysis');
  } else if (securityDetection.hasSecurityAnalysis) {
    score += 1;
    strengths.push('Security considerations documented');
  }

  // Dependencies bonus (+2 pts)
  const dependenciesDetection = detectDependencies(text);
  if (dependenciesDetection.hasDependenciesSection && dependenciesDetection.hasUpstreamDeps) {
    score += 2;
    strengths.push('Dependencies thoroughly documented');
  } else if (dependenciesDetection.detected) {
    score += 1;
    strengths.push('Dependency awareness present');
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

  // Required sections present (0-5 pts) - reduced to make room for Confirmation
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 5;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.60) {
    score += 3;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  // Confirmation section (MADR 3.0) - (0-3 pts)
  const confirmationDetection = detectConfirmation(text);
  if (confirmationDetection.hasSectionHeader) {
    score += 3;
    strengths.push('Confirmation section specifies validation mechanism (MADR 3.0)');
  } else if (confirmationDetection.hasValidationLanguage) {
    score += 1;
    issues.push('Validation mentioned but missing dedicated Confirmation section (MADR 3.0)');
  } else {
    issues.push('Missing Confirmation section - specify how compliance will be validated (MADR 3.0)');
  }

  // YAML Front Matter metadata bonus (MADR 3.0) - (+2 pts)
  const yamlDetection = detectYAMLMetadata(text);
  if (yamlDetection.hasRichMetadata) {
    score += 2;
    strengths.push(`Rich YAML metadata: ${yamlDetection.metadataCount} fields (MADR 3.0)`);
  } else if (yamlDetection.hasFrontMatter) {
    score += 1;
    strengths.push('YAML front matter present');
  }

  // More Information section bonus (MADR 3.0) - (+2 pts)
  const moreInfoDetection = detectMoreInfoSection(text);
  if (moreInfoDetection.hasSectionHeader && moreInfoDetection.hasLinks) {
    score += 2;
    strengths.push(`More Information section with ${moreInfoDetection.linkCount} links (MADR 3.0)`);
  } else if (moreInfoDetection.hasSectionHeader || moreInfoDetection.hasLinks) {
    score += 1;
    strengths.push('Additional references/links provided');
  }

  // ADR cross-references / evolution tracking bonus (+2 pts)
  const adrRefDetection = detectADRReferences(text);
  if (adrRefDetection.hasEvolutionTracking) {
    score += 2;
    strengths.push('ADR evolution tracking (supersedes/superseded-by references)');
  } else if (adrRefDetection.hasRelatedADRs) {
    score += 1;
    strengths.push(`ADR cross-references: ${adrRefDetection.adrReferenceCount} referenced`);
  }

  // Implementation History bonus (+2 pts)
  const historyDetection = detectImplementationHistory(text);
  if (historyDetection.hasRichHistory) {
    score += 2;
    strengths.push(`Implementation History with ${historyDetection.dateCount} dated entries`);
  } else if (historyDetection.hasSectionHeader || historyDetection.hasDateEntries) {
    score += 1;
    strengths.push('Implementation timeline present');
  }

  // Compliance/Governance bonus (+2 pts)
  const complianceDetection = detectCompliance(text);
  if (complianceDetection.hasComplianceSection && complianceDetection.hasStandards) {
    score += 2;
    strengths.push(`Compliance documented: ${complianceDetection.standardsCount} standards referenced`);
  } else if (complianceDetection.hasComplianceAwareness) {
    score += 1;
    strengths.push('Compliance/governance awareness');
  }

  // Team Context bonus (+2 pts)
  const teamDetection = detectTeamContext(text);
  if (teamDetection.hasTeamClarity) {
    score += 2;
    strengths.push('Team accountability defined (owner/consulted/informed)');
  } else if (teamDetection.hasOwnership) {
    score += 1;
    strengths.push('Decision owner identified');
  }

  // Links and References bonus (+2 pts)
  const linksDetection = detectLinks(text);
  if (linksDetection.hasRichReferences) {
    score += 2;
    strengths.push(`Well-referenced document (${linksDetection.totalLinks} links/references)`);
  } else if (linksDetection.hasSection || linksDetection.totalLinks > 0) {
    score += 1;
    strengths.push('External references included');
  }

  // Changelog/Version History bonus (+2 pts)
  const changelogDetection = detectChangelog(text);
  if (changelogDetection.hasSection && changelogDetection.hasVersionHistory) {
    score += 2;
    strengths.push(`Version history documented (${changelogDetection.versionCount} versions)`);
  } else if (changelogDetection.hasSection) {
    score += 1;
    strengths.push('Changelog section present');
  }

  // Stakeholder Sign-off bonus (+2 pts)
  const signoffDetection = detectSignoff(text);
  if (signoffDetection.hasFormalSignoff) {
    score += 2;
    strengths.push('Formal stakeholder sign-off documented');
  } else if (signoffDetection.hasSection || signoffDetection.hasApprovals) {
    score += 1;
    strengths.push('Approval process documented');
  }

  // ADR Numbering bonus (enterprise standards, +2 pts)
  const numberingDetection = detectADRNumbering(text);
  if (numberingDetection.hasTitleNumber && numberingDetection.hasInlineRefs) {
    score += 2;
    strengths.push(`Enterprise ADR numbering with ${numberingDetection.inlineRefCount} cross-references`);
  } else if (numberingDetection.detected) {
    score += 1;
    strengths.push('ADR numbering present');
  }

  // Timeline/Deadline awareness bonus (+2 pts)
  const timelineDetection = detectTimeline(text);
  if (timelineDetection.hasTimelineSection && timelineDetection.hasDeadlines) {
    score += 2;
    strengths.push('Timeline with deadlines documented');
  } else if (timelineDetection.hasTimeline) {
    score += 1;
    strengths.push('Timeline awareness present');
  }

  // Diagrams/Visual Documentation bonus (+2 pts)
  const diagramsDetection = detectDiagrams(text);
  if (diagramsDetection.hasEmbeddedDiagrams || (diagramsDetection.hasDiagramSection && diagramsDetection.hasDiagramTypes)) {
    score += 2;
    strengths.push(`Visual documentation (${diagramsDetection.diagramCount} diagrams)`);
  } else if (diagramsDetection.detected) {
    score += 1;
    strengths.push('Diagram references included');
  }

  // Observability/Monitoring bonus (+2 pts)
  const observabilityDetection = detectObservability(text);
  if (observabilityDetection.hasObservabilitySection && observabilityDetection.hasMetrics) {
    score += 2;
    strengths.push('Observability with SLOs/metrics defined');
  } else if (observabilityDetection.detected) {
    score += 1;
    strengths.push('Monitoring considerations documented');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}


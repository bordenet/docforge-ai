/**
 * PRD Validator Strategic Viability Scoring
 * Evaluates: Metric Validity, Scope Realism, Risk & Mitigation Quality, Traceability
 */

import { STRATEGIC_VIABILITY_PATTERNS } from './validator-config.js';

/**
 * Score Strategic Viability (20 pts max)
 */
export function scoreStrategicViability(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // Reset regex lastIndex for global patterns
  const resetPatterns = () => {
    Object.values(STRATEGIC_VIABILITY_PATTERNS).forEach(p => {
      if (p.global) p.lastIndex = 0;
    });
  };
  resetPatterns();

  // Metric Validity (0-6 pts): Leading indicators, counter-metrics, source of truth
  let metricValidityScore = 0;
  const leadingMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.leadingIndicator) || [];
  const counterMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.counterMetric) || [];
  const sourceMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.sourceOfTruth) || [];

  if (leadingMatches.length >= 1) {
    metricValidityScore += 2;
    strengths.push('Leading indicators defined (predictive metrics)');
  } else {
    issues.push('Add leading indicators - metrics that predict success before launch');
  }

  if (counterMatches.length >= 1) {
    metricValidityScore += 2;
    strengths.push('Counter-metrics defined to prevent perverse incentives');
  } else {
    issues.push('Add counter-metrics to guard against unintended consequences');
  }

  if (sourceMatches.length >= 2) {
    metricValidityScore += 2;
    strengths.push('Metrics have defined sources of truth');
  } else if (sourceMatches.length >= 1) {
    metricValidityScore += 1;
    issues.push('Define source of truth for all metrics (e.g., Mixpanel, Datadog)');
  } else {
    issues.push('No metric sources defined - specify where metrics are tracked');
  }
  score += metricValidityScore;

  // Scope Realism (0-5 pts): Scope vs timeline alignment
  let scopeRealismScore = 0;
  const hasKillSwitch = STRATEGIC_VIABILITY_PATTERNS.killSwitch.test(text);
  resetPatterns();
  const hasDoorType = STRATEGIC_VIABILITY_PATTERNS.doorType.test(text);
  resetPatterns();
  const hasAlternatives = STRATEGIC_VIABILITY_PATTERNS.alternativesConsidered.test(text);
  resetPatterns();
  const hasAlternativesContent = STRATEGIC_VIABILITY_PATTERNS.alternativesContent.test(text);
  resetPatterns();

  if (hasKillSwitch) {
    scopeRealismScore += 2;
    strengths.push('Hypothesis kill switch defined (pivot criteria)');
  } else {
    issues.push('Add kill switch - what data would prove this feature is a failure?');
  }

  if (hasDoorType) {
    scopeRealismScore += 2;
    strengths.push('One-way/Two-way door decisions tagged');
  } else {
    issues.push('Tag requirements as One-Way Door 🚪 (irreversible) or Two-Way Door 🔄 (reversible)');
  }

  if (hasAlternatives || hasAlternativesContent) {
    scopeRealismScore += 1;
    strengths.push('Alternatives considered and documented');
  } else {
    issues.push('Add "Alternatives Considered" section with rejected approaches');
  }
  score += scopeRealismScore;

  // Risk & Mitigation Quality (0-5 pts): Specific risks, actionable mitigations
  let riskScore = 0;
  const hasDissentingSection = STRATEGIC_VIABILITY_PATTERNS.dissentingOpinions.test(text);
  resetPatterns();
  const hasDissentingContent = STRATEGIC_VIABILITY_PATTERNS.dissentingContent.test(text);
  resetPatterns();
  const hasRiskSection = /^#+\s*(\d+\.?\d*\.?\s*)?(risk|unknown|assumption)/im.test(text);
  const hasSpecificRisks = /\b(risk\s*:|\brisk\b.*\b(that|if|when)|mitigation\s*:|contingency)/gi.test(text);

  if (hasRiskSection && hasSpecificRisks) {
    riskScore += 3;
    strengths.push('Risks documented with specific mitigations');
  } else if (hasRiskSection || hasSpecificRisks) {
    riskScore += 1;
    issues.push('Add specific mitigations for each identified risk');
  } else {
    issues.push('Add Risk section with specific risks and mitigations');
  }

  if (hasDissentingSection || hasDissentingContent) {
    riskScore += 2;
    strengths.push('Known unknowns and dissenting opinions documented');
  } else {
    issues.push('Document dissenting opinions and unresolved debates');
  }
  score += riskScore;

  // Traceability (0-4 pts): Problem → Requirement → Metric mapping
  let traceabilityScore = 0;
  const hasTraceabilitySection = STRATEGIC_VIABILITY_PATTERNS.traceabilitySection.test(text);
  resetPatterns();
  const traceabilityMatches = text.match(STRATEGIC_VIABILITY_PATTERNS.traceability) || [];

  if (hasTraceabilitySection) {
    traceabilityScore += 2;
    strengths.push('Traceability section present');
  }

  if (traceabilityMatches.length >= 3) {
    traceabilityScore += 2;
    strengths.push('Requirements traceable to problems and metrics');
  } else if (traceabilityMatches.length >= 1) {
    traceabilityScore += 1;
    issues.push('Improve traceability - link each requirement to problem and success metric');
  } else {
    issues.push('Add traceability matrix: Problem ID → Requirement ID → Metric ID');
  }
  score += traceabilityScore;

  return {
    score: Math.min(score, maxScore), maxScore, issues, strengths,
    metricValidityScore, scopeRealismScore, riskScore, traceabilityScore,
    details: {
      hasLeadingIndicators: leadingMatches.length >= 1,
      hasCounterMetrics: counterMatches.length >= 1,
      hasSourceOfTruth: sourceMatches.length >= 1,
      hasKillSwitch, hasDoorType,
      hasAlternatives: hasAlternatives || hasAlternativesContent,
      hasDissentingOpinions: hasDissentingSection || hasDissentingContent,
      hasTraceability: hasTraceabilitySection || traceabilityMatches.length >= 1,
    },
  };
}


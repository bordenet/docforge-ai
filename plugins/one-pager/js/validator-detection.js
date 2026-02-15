/**
 * One-Pager Validator Detection Functions - Core
 *
 * Detection functions for analyzing one-pager content.
 * Scope, Metrics, Sections, Stakeholders, Timeline are in validator-detection-sections.js
 */

import {
  PROBLEM_PATTERNS,
  SOLUTION_PATTERNS,
  ALTERNATIVES_PATTERNS,
  URGENCY_PATTERNS,
  DECISION_NEEDED_PATTERNS,
  VAGUE_QUANTIFIER_PATTERNS,
  STAKEHOLDER_TABLE_PATTERNS,
  ALTERNATIVES_QUALITY_PATTERNS
} from './validator-config.js';

// Re-export section-related detections from split file
export {
  detectScope,
  detectSuccessMetrics,
  detectSections,
  detectStakeholders,
  detectTimeline
} from './validator-detection-sections.js';

// ============================================================================
// Circular Logic Detection
// ============================================================================

/**
 * Detect circular logic: solution is just the inverse of the problem
 * Example: Problem: "We don't have a dashboard" → Solution: "Build a dashboard"
 * This is a CRITICAL penalty - caps score at 50 per prompts.js line 49
 * @param {string} text - Text to analyze
 * @returns {Object} Circular logic detection results
 */
export function detectCircularLogic(text) {
  const problemSection = text.match(/^(#+\s*)?(\d+\.?\d*\.?\s*)?(problem|challenge|pain.?point|context)[^#]*/im)?.[0] || '';
  const solutionSection = text.match(/^(#+\s*)?(\d+\.?\d*\.?\s*)?(solution|proposal|approach|recommendation)[^#]*/im)?.[0] || '';

  if (!problemSection || !solutionSection) {
    return { isCircular: false, confidence: 0, reason: 'Sections not found' };
  }

  const problemLower = problemSection.toLowerCase();
  const solutionLower = solutionSection.toLowerCase();

  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'we', 'our', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'that', 'this', 'these', 'those', 'it', 'its']);

  const problemNouns = problemLower.match(/\b[a-z]{4,}\b/g)?.filter(w => !commonWords.has(w)) || [];
  const actionVerbs = ['build', 'create', 'add', 'implement', 'develop', 'make', 'establish', 'introduce', 'launch'];

  let circularMatches = 0;
  for (const noun of new Set(problemNouns)) {
    for (const verb of actionVerbs) {
      const pattern = new RegExp(`\\b${verb}\\s+(?:a\\s+)?${noun}`, 'i');
      if (pattern.test(solutionLower)) {
        circularMatches++;
      }
    }
  }

  const isCircular = circularMatches >= 2;
  const confidence = Math.min(100, circularMatches * 25);

  return {
    isCircular,
    confidence,
    matchCount: circularMatches,
    reason: isCircular
      ? `Solution appears to restate the problem (${circularMatches} circular patterns)`
      : 'Solution addresses root cause'
  };
}

// ============================================================================
// Baseline/Target Detection
// ============================================================================

/**
 * Detect [Baseline] → [Target] format in metrics
 * Good: "Reduce support tickets from 100/day → 30/day"
 * Bad: "Improve user experience" (vague, no baseline or target)
 * @param {string} text - Text to analyze
 * @returns {Object} Baseline/target detection results
 */
export function detectBaselineTarget(text) {
  const arrowPatterns = text.match(/\d+[%$]?\s*[→\->]\s*\d+[%$]?/g) || [];
  const fromToPatterns = text.match(/from\s+\d+[%$]?\s+to\s+\d+[%$]?/gi) || [];
  const currentTargetPatterns = text.match(/currently?\s+\d+[%$]?.*target\s+\d+[%$]?/gi) || [];
  const bracketPatterns = text.match(/\[(?:current|baseline)[^\]]*\]\s*[→\->]\s*\[(?:target|goal)[^\]]*\]/gi) || [];
  const bracketNumberPatterns = text.match(/\[\s*\d+[%$]?[^\]]*\]\s*[→\->]\s*\[\s*\d+[%$]?[^\]]*\]/g) || [];

  const totalMatches = arrowPatterns.length + fromToPatterns.length +
                       currentTargetPatterns.length + bracketPatterns.length + bracketNumberPatterns.length;

  const vaguePatterns = text.match(/\b(improve|increase|decrease|reduce|enhance|better|more|less|faster|slower)\b(?![^.]*\d)/gi) || [];

  return {
    hasBaselineTarget: totalMatches > 0,
    baselineTargetCount: totalMatches,
    arrowPatterns: arrowPatterns.length,
    fromToPatterns: fromToPatterns.length,
    vagueMetricsCount: vaguePatterns.length,
    hasVagueMetrics: vaguePatterns.length > totalMatches,
    examples: [...arrowPatterns.slice(0, 2), ...fromToPatterns.slice(0, 2)]
  };
}

// ============================================================================
// Problem Detection
// ============================================================================

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem detection results
 */
export function detectProblemStatement(text) {
  const hasProblemSection = PROBLEM_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(PROBLEM_PATTERNS.problemLanguage) || [];
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const businessMatches = text.match(PROBLEM_PATTERNS.businessFocus) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    hasCostOfInaction: costMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      costMatches.length > 0 && 'Cost of inaction mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/customer focus'
    ].filter(Boolean)
  };
}

/**
 * Detect cost of inaction in text
 * @param {string} text - Text to analyze
 * @returns {Object} Cost of inaction detection results
 */
export function detectCostOfInaction(text) {
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const hasCostSection = /^(#+\s*)?(\d+\.?\d*\.?\s*)?(cost|impact|consequence|risk|why.now|urgency)/im.test(text);

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

// ============================================================================
// Solution Detection
// ============================================================================

/**
 * Detect solution in text
 * @param {string} text - Text to analyze
 * @returns {Object} Solution detection results
 */
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

/**
 * Detect measurable goals in text
 * @param {string} text - Text to analyze
 * @returns {Object} Measurable goals detection results
 */
export function detectMeasurableGoals(text) {
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const quantifiedMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const goalMatches = text.match(/\b(goal|objective|benefit|outcome|result)\b/gi) || [];

  return {
    hasMeasurable: measurableMatches.length > 0,
    measurableCount: measurableMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    hasGoals: goalMatches.length > 0,
    goalCount: goalMatches.length,
    indicators: [
      measurableMatches.length > 0 && `${measurableMatches.length} measurable terms`,
      goalMatches.length > 0 && `${goalMatches.length} goal/objective mentions`,
      quantifiedMatches.length > 0 && 'Quantified metrics present'
    ].filter(Boolean)
  };
}

// ============================================================================
// Alternatives Considered Detection
// ============================================================================

/**
 * Detect alternatives/options considered in text
 * Good one-pagers explain why THIS solution over alternatives (including doing nothing)
 * @param {string} text - Text to analyze
 * @returns {Object} Alternatives detection results
 */
export function detectAlternatives(text) {
  const hasAlternativesSection = ALTERNATIVES_PATTERNS.alternativesSection.test(text);
  const alternativesMatches = text.match(ALTERNATIVES_PATTERNS.alternativesLanguage) || [];
  const doNothingMatches = text.match(ALTERNATIVES_PATTERNS.doNothingOption) || [];

  return {
    hasAlternativesSection,
    hasAlternativesLanguage: alternativesMatches.length > 0,
    alternativesCount: alternativesMatches.length,
    hasDoNothingOption: doNothingMatches.length > 0,
    indicators: [
      hasAlternativesSection && 'Dedicated alternatives section',
      alternativesMatches.length > 0 && `${alternativesMatches.length} alternative/comparison mentions`,
      doNothingMatches.length > 0 && '"Do nothing" option addressed'
    ].filter(Boolean)
  };
}

// ============================================================================
// Why Now / Urgency Detection
// ============================================================================

/**
 * Detect urgency/timing justification in text
 * Strong one-pagers explain WHY NOW - what's the urgency or window?
 * @param {string} text - Text to analyze
 * @returns {Object} Urgency detection results
 */
export function detectUrgency(text) {
  const hasUrgencySection = URGENCY_PATTERNS.urgencySection.test(text);
  const urgencyMatches = text.match(URGENCY_PATTERNS.urgencyLanguage) || [];
  const timePressureMatches = text.match(URGENCY_PATTERNS.timePressure) || [];

  return {
    hasUrgencySection,
    hasUrgencyLanguage: urgencyMatches.length > 0,
    urgencyCount: urgencyMatches.length,
    hasTimePressure: timePressureMatches.length > 0,
    indicators: [
      hasUrgencySection && 'Dedicated "Why Now" section',
      urgencyMatches.length > 0 && `${urgencyMatches.length} urgency indicators`,
      timePressureMatches.length > 0 && 'Time pressure/deadline mentioned'
    ].filter(Boolean)
  };
}

// ============================================================================
// Decision Needed Detection (P1 improvement)
// ============================================================================

/**
 * Detect decision/ask/request section in text
 * Amazon one-pagers should end with a clear decision request
 * @param {string} text - Text to analyze
 * @returns {Object} Decision needed detection results
 */
export function detectDecisionNeeded(text) {
  const hasDecisionSection = DECISION_NEEDED_PATTERNS.decisionSection.test(text);
  const decisionMatches = text.match(DECISION_NEEDED_PATTERNS.decisionLanguage) || [];
  const explicitAskMatches = text.match(DECISION_NEEDED_PATTERNS.explicitAsk) || [];

  return {
    hasDecisionSection,
    hasDecisionLanguage: decisionMatches.length > 0,
    decisionCount: decisionMatches.length,
    hasExplicitAsk: explicitAskMatches.length > 0,
    indicators: [
      hasDecisionSection && 'Dedicated decision/ask section',
      decisionMatches.length > 0 && `${decisionMatches.length} decision-related terms`,
      explicitAskMatches.length > 0 && 'Explicit ask/request present'
    ].filter(Boolean)
  };
}

// ============================================================================
// Vague Quantifier Detection (P2 improvement)
// ============================================================================

/**
 * Detect vague quantifiers that should be replaced with specific numbers
 * Examples: "TBD", "some amount", "various", "approximately"
 * @param {string} text - Text to analyze
 * @returns {Object} Vague quantifier detection results
 */
export function detectVagueQuantifiers(text) {
  const vagueTermMatches = text.match(VAGUE_QUANTIFIER_PATTERNS.vagueTerms) || [];
  const wideRangeMatches = text.match(VAGUE_QUANTIFIER_PATTERNS.wideRangeIndicator) || [];

  // Count unique vague terms (case-insensitive)
  const uniqueVagueTerms = [...new Set(vagueTermMatches.map(t => t.toLowerCase()))];

  return {
    hasVagueTerms: vagueTermMatches.length > 0,
    vagueTermCount: vagueTermMatches.length,
    uniqueVagueTerms,
    hasWideRanges: wideRangeMatches.length > 0,
    wideRangeCount: wideRangeMatches.length,
    // Higher penalty = more vague
    vaguenessPenalty: Math.min(10, vagueTermMatches.length * 2 + wideRangeMatches.length * 3),
    indicators: [
      vagueTermMatches.length > 0 && `${vagueTermMatches.length} vague terms found`,
      wideRangeMatches.length > 0 && `${wideRangeMatches.length} overly wide ranges`,
      uniqueVagueTerms.length > 0 && `Vague terms: ${uniqueVagueTerms.slice(0, 3).join(', ')}`
    ].filter(Boolean)
  };
}

// ============================================================================
// Stakeholder Table Quality Detection (P4 improvement)
// ============================================================================

/**
 * Detect stakeholder table quality - RACI/DACI vs simple name lists
 * @param {string} text - Text to analyze
 * @returns {Object} Stakeholder table quality results
 */
export function detectStakeholderTableQuality(text) {
  const hasRaciTable = STAKEHOLDER_TABLE_PATTERNS.raciTable.test(text);
  const hasRoleTable = STAKEHOLDER_TABLE_PATTERNS.roleTable.test(text);
  const simpleListMatches = text.match(STAKEHOLDER_TABLE_PATTERNS.simpleList) || [];

  // Quality score: RACI/DACI > Role table > Simple list > Nothing
  let qualityScore = 0;
  let qualityLevel = 'none';

  if (hasRaciTable) {
    qualityScore = 3;
    qualityLevel = 'raci';
  } else if (hasRoleTable) {
    qualityScore = 2;
    qualityLevel = 'role-table';
  } else if (simpleListMatches.length > 0) {
    qualityScore = 1;
    qualityLevel = 'simple-list';
  }

  return {
    hasRaciTable,
    hasRoleTable,
    hasSimpleList: simpleListMatches.length > 0,
    qualityScore,
    qualityLevel,
    indicators: [
      hasRaciTable && 'RACI/DACI accountability matrix present',
      hasRoleTable && 'Role-based stakeholder table',
      simpleListMatches.length > 0 && 'Simple stakeholder list (consider adding roles)'
    ].filter(Boolean)
  };
}

// ============================================================================
// Alternatives Quality Detection (P5 improvement)
// ============================================================================

/**
 * Detect quality of alternatives section - does it include rejection rationale?
 * @param {string} text - Text to analyze
 * @returns {Object} Alternatives quality results
 */
export function detectAlternativesQuality(text) {
  const rejectionMatches = text.match(ALTERNATIVES_QUALITY_PATTERNS.rejectionRationale) || [];
  const chosenMatches = text.match(ALTERNATIVES_QUALITY_PATTERNS.chosenRationale) || [];
  const numberedMatches = text.match(ALTERNATIVES_QUALITY_PATTERNS.numberedAlternatives) || [];
  const doNothingConsequenceMatches = text.match(ALTERNATIVES_QUALITY_PATTERNS.doNothingWithConsequence) || [];

  // Quality score based on thoroughness
  let qualityScore = 0;
  if (numberedMatches.length >= 2) qualityScore += 1;  // Multiple options listed
  if (rejectionMatches.length > 0) qualityScore += 2;  // Explains why rejected
  if (chosenMatches.length > 0) qualityScore += 1;     // Explains why chosen
  if (doNothingConsequenceMatches.length > 0) qualityScore += 1; // Do nothing has consequence

  return {
    hasRejectionRationale: rejectionMatches.length > 0,
    rejectionCount: rejectionMatches.length,
    hasChosenRationale: chosenMatches.length > 0,
    hasNumberedAlternatives: numberedMatches.length > 0,
    alternativesCount: numberedMatches.length,
    hasDoNothingWithConsequence: doNothingConsequenceMatches.length > 0,
    qualityScore: Math.min(5, qualityScore),
    indicators: [
      numberedMatches.length > 0 && `${numberedMatches.length} alternatives listed`,
      rejectionMatches.length > 0 && 'Rejection rationale provided',
      chosenMatches.length > 0 && 'Explains why solution was chosen',
      doNothingConsequenceMatches.length > 0 && '"Do nothing" consequence explained'
    ].filter(Boolean)
  };
}

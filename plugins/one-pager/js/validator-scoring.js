/**
 * One-Pager Validator Scoring Functions
 * Problem Clarity (30), Solution Quality (25), Scope Discipline (25), Completeness (20)
 */

import { REQUIRED_SECTIONS } from './validator-config.js';
import {
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectMeasurableGoals,
  detectScope,
  detectSuccessMetrics,
  detectSections,
  detectStakeholders,
  detectTimeline,
  detectAlternatives,
  detectUrgency
} from './validator-detection.js';

// ============================================================================
// Problem Clarity Scoring (30 pts max)
// ============================================================================

/**
 * Score problem clarity (30 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProblemClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  // Problem statement exists and is specific (0-8 pts)
  const problemDetection = detectProblemStatement(text);
  if (problemDetection.hasProblemSection && problemDetection.hasProblemLanguage) {
    score += 8;
    strengths.push('Clear problem statement with dedicated section');
  } else if (problemDetection.hasProblemLanguage) {
    score += 5;
    issues.push('Problem mentioned but lacks dedicated section');
  } else {
    issues.push('Problem statement missing or unclear - define the specific problem');
  }

  // Cost of doing nothing present and quantified (0-10 pts)
  const costDetection = detectCostOfInaction(text);
  if (costDetection.hasCostLanguage && costDetection.isQuantified) {
    score += 10;
    strengths.push('Cost of inaction quantified with specific metrics');
  } else if (costDetection.hasCostLanguage) {
    score += 5;
    issues.push('Cost of inaction mentioned but not quantified - add numbers/percentages');
  } else {
    issues.push('Missing cost of inaction - explain impact of not solving this problem');
  }

  // Problem is customer/business focused (0-8 pts)
  if (problemDetection.hasBusinessFocus) {
    score += 8;
    strengths.push('Problem clearly tied to customer/business value');
  } else {
    issues.push('Strengthen customer/business focus - explain why this matters to stakeholders');
  }

  // Why Now / Urgency established (0-4 pts) - NEW
  const urgencyDetection = detectUrgency(text);
  if (urgencyDetection.hasUrgencySection || (urgencyDetection.hasUrgencyLanguage && urgencyDetection.hasTimePressure)) {
    score += 4;
    strengths.push('Clear urgency/timing justification ("Why Now")');
  } else if (urgencyDetection.hasUrgencyLanguage || urgencyDetection.hasTimePressure) {
    score += 2;
    issues.push('Some urgency mentioned but not clearly justified - add "Why Now" section');
  } else {
    issues.push('Missing "Why Now" - explain the urgency or timing for this initiative');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Solution Quality Scoring (25 pts max)
// ============================================================================

/**
 * Score solution quality (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreSolutionQuality(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Solution addresses stated problem (0-8 pts)
  const solutionDetection = detectSolution(text);
  const problemDetection = detectProblemStatement(text);

  if (solutionDetection.hasSolutionSection && problemDetection.hasProblemLanguage) {
    score += 8;
    strengths.push('Solution clearly addresses stated problem');
  } else if (solutionDetection.hasSolutionLanguage) {
    score += 5;
    issues.push('Solution present but connection to problem could be clearer');
  } else {
    issues.push('Solution section missing or unclear');
  }

  // Key goals/benefits are measurable (0-8 pts)
  const goalsDetection = detectMeasurableGoals(text);
  if (goalsDetection.hasMeasurable && goalsDetection.hasGoals) {
    score += 8;
    strengths.push('Goals are measurable and well-defined');
  } else if (goalsDetection.hasGoals) {
    score += 4;
    issues.push('Goals defined but not measurable - add specific metrics');
  } else {
    issues.push('Goals/benefits missing - define what success looks like');
  }

  // Solution is high-level, not implementation (0-5 pts)
  if (solutionDetection.isHighLevel && !solutionDetection.hasImplementationDetails) {
    score += 5;
    strengths.push('Solution stays at appropriate high-level');
  } else if (solutionDetection.hasImplementationDetails) {
    issues.push('Solution includes too much implementation detail - keep it high-level');
  }

  // Alternatives considered (0-4 pts) - NEW: Why this solution over others?
  const alternativesDetection = detectAlternatives(text);
  if (alternativesDetection.hasAlternativesSection && alternativesDetection.hasDoNothingOption) {
    score += 4;
    strengths.push('Alternatives considered including "do nothing" option');
  } else if (alternativesDetection.hasAlternativesLanguage) {
    score += 2;
    issues.push('Alternatives mentioned but not in dedicated section or missing "do nothing" option');
  } else {
    issues.push('No alternatives considered - explain why THIS solution over other options');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Scope Discipline Scoring (25 pts max)
// ============================================================================

/**
 * Score scope discipline (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreScopeDiscipline(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // In-scope clearly defined (0-8 pts)
  const scopeDetection = detectScope(text);
  if (scopeDetection.hasInScope && scopeDetection.hasScopeSection) {
    score += 8;
    strengths.push('In-scope items clearly defined');
  } else if (scopeDetection.hasInScope) {
    score += 4;
    issues.push('In-scope items mentioned but lack dedicated section');
  } else {
    issues.push('In-scope not clearly defined - list what you WILL do');
  }

  // Out-of-scope explicitly stated (0-9 pts)
  if (scopeDetection.hasOutOfScope) {
    score += 9;
    strengths.push('Out-of-scope explicitly defined');
  } else {
    issues.push('Out-of-scope missing - explicitly state what you WON\'T do');
  }

  // Success metrics are SMART (0-8 pts)
  const metricsDetection = detectSuccessMetrics(text);
  if (metricsDetection.hasMetricsSection && metricsDetection.hasQuantified) {
    score += 8;
    strengths.push('Success metrics are SMART and quantified');
  } else if (metricsDetection.hasMetrics) {
    score += 4;
    issues.push('Metrics present but not SMART - make them Specific, Measurable, Achievable, Relevant, Time-bound');
  } else {
    issues.push('Success metrics missing - define how you\'ll measure success');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Completeness Scoring (20 pts max)
// ============================================================================

/**
 * Score completeness (20 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // All required sections present (0-8 pts)
  const sections = detectSections(text);
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 8;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.70) {
    score += 5;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    score += 2;
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  // Stakeholders clearly identified (0-6 pts)
  const stakeholderDetection = detectStakeholders(text);
  if (stakeholderDetection.hasStakeholderSection && stakeholderDetection.hasRoles) {
    score += 6;
    strengths.push('Stakeholders and roles clearly identified');
  } else if (stakeholderDetection.hasStakeholders) {
    score += 3;
    issues.push('Stakeholders mentioned but roles not clearly defined');
  } else {
    issues.push('Stakeholders not identified - list who\'s involved and their roles');
  }

  // Timeline is realistic and phased (0-6 pts)
  const timelineDetection = detectTimeline(text);
  if (timelineDetection.hasTimelineSection && timelineDetection.hasPhasing) {
    score += 6;
    strengths.push('Timeline is phased and realistic');
  } else if (timelineDetection.hasTimeline) {
    score += 3;
    issues.push('Timeline present but lacks clear phasing');
  } else {
    issues.push('Timeline missing - provide realistic milestones and phases');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

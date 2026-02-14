/**
 * Strategic Proposal Validator - Scoring Functions
 *
 * Scoring Dimensions:
 * 1. Problem Statement (25 pts) - Clear problem definition
 * 2. Proposed Solution (25 pts) - Actionable solution
 * 3. Business Impact (25 pts) - Measurable outcomes
 * 4. Implementation Plan (25 pts) - Timeline and resources
 */

import {
  detectProblemStatement,
  detectUrgency,
  detectSolution,
  detectBusinessImpact,
  detectImplementation
} from './validator-detection.js';

/**
 * Score problem statement (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProblemStatement(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Problem statement exists and is specific (0-10 pts)
  const problemDetection = detectProblemStatement(text);
  if (problemDetection.hasProblemSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Clear problem statement with dedicated section');
  } else if (problemDetection.hasProblemLanguage) {
    score += 5;
    issues.push('Problem mentioned but lacks dedicated section');
  } else {
    issues.push('Problem statement missing - define the specific challenge or opportunity');
  }

  // Urgency/priority established (0-8 pts)
  const urgencyDetection = detectUrgency(text);
  if (urgencyDetection.hasUrgencyLanguage && urgencyDetection.isQuantified) {
    score += 8;
    strengths.push('Urgency quantified with specific metrics');
  } else if (urgencyDetection.hasUrgencyLanguage) {
    score += 4;
    issues.push('Urgency mentioned but not quantified - add timeframes or costs');
  } else {
    issues.push('Missing urgency - explain why this needs action now');
  }

  // Strategic alignment shown (0-7 pts)
  if (problemDetection.hasStrategicAlignment) {
    score += 7;
    strengths.push('Problem tied to strategic objectives');
  } else {
    issues.push('Add strategic alignment - connect to organizational goals');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score proposed solution (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProposedSolution(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Solution section with clear approach (0-10 pts)
  const solutionDetection = detectSolution(text);
  if (solutionDetection.hasSolutionSection && solutionDetection.hasSolutionLanguage) {
    score += 10;
    strengths.push('Clear solution with dedicated section');
  } else if (solutionDetection.hasSolutionLanguage) {
    score += 5;
    issues.push('Solution mentioned but lacks dedicated section');
  } else {
    issues.push('Solution section missing or unclear');
  }

  // Actionable with clear verbs (0-8 pts)
  if (solutionDetection.hasActionable) {
    score += 8;
    strengths.push('Solution is actionable with clear next steps');
  } else {
    issues.push('Add action verbs - specify what will be done');
  }

  // Rationale provided (0-7 pts)
  if (solutionDetection.hasJustification) {
    score += 7;
    strengths.push('Solution includes rationale/justification');
  } else {
    issues.push('Add rationale - explain why this approach');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score business impact (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreBusinessImpact(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Impact section with clear outcomes (0-10 pts)
  const impactDetection = detectBusinessImpact(text);
  if (impactDetection.hasImpactSection && impactDetection.hasImpactLanguage) {
    score += 10;
    strengths.push('Clear impact section with defined outcomes');
  } else if (impactDetection.hasImpactLanguage) {
    score += 5;
    issues.push('Impact mentioned but lacks dedicated section');
  } else {
    issues.push('Impact section missing - define expected outcomes');
  }

  // Quantified with specific metrics (0-10 pts)
  if (impactDetection.isQuantified && impactDetection.quantifiedCount >= 2) {
    score += 10;
    strengths.push('Impact quantified with multiple metrics');
  } else if (impactDetection.isQuantified) {
    score += 5;
    issues.push('Add more quantified metrics for impact');
  } else {
    issues.push('Quantify impact - add specific numbers, percentages, or dollar amounts');
  }

  // Financial or competitive terms (0-5 pts)
  if (impactDetection.hasFinancialTerms || impactDetection.hasCompetitiveTerms) {
    score += 5;
    strengths.push('Business value articulated (financial/competitive)');
  } else {
    issues.push('Add business value - revenue, cost, efficiency, or competitive impact');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score implementation plan (25 pts max)
 * @param {string} text - Strategic proposal content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreImplementationPlan(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Implementation section with phases (0-10 pts)
  const implDetection = detectImplementation(text);
  if (implDetection.hasImplementationSection && implDetection.hasPhases) {
    score += 10;
    strengths.push('Clear implementation plan with phases');
  } else if (implDetection.hasImplementationSection) {
    score += 5;
    issues.push('Implementation section exists but lacks clear phases');
  } else {
    issues.push('Add implementation plan - define phases and milestones');
  }

  // Timeline with dates (0-8 pts)
  if (implDetection.hasTimeline && implDetection.dateCount >= 2) {
    score += 8;
    strengths.push('Timeline includes specific dates/periods');
  } else if (implDetection.hasTimeline) {
    score += 4;
    issues.push('Add more timeline specificity');
  } else {
    issues.push('Add timeline - specify when activities will occur');
  }

  // Ownership and resources (0-7 pts)
  if (implDetection.hasOwnership && implDetection.hasResources) {
    score += 7;
    strengths.push('Ownership and resources clearly defined');
  } else if (implDetection.hasOwnership || implDetection.hasResources) {
    score += 3;
    issues.push('Define both ownership and required resources');
  } else {
    issues.push('Add ownership and resources - who and what is needed');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}


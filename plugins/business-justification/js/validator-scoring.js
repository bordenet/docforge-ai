/**
 * Business Justification Validator - Scoring Functions
 *
 * UNIFIED 4-PILLAR TAXONOMY:
 * 1. Strategic Evidence (30 pts)
 * 2. Financial Justification (25 pts)
 * 3. Options & Alternatives (25 pts)
 * 4. Execution Completeness (20 pts)
 */

import {
  detectStrategicEvidence,
  detectFinancialJustification,
  detectOptionsAnalysis,
  detectExecutionCompleteness
} from './validator-detection.js';

/**
 * Score Strategic Evidence (30 pts max) - Pillar 1
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStrategicEvidence(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const evidence = detectStrategicEvidence(text);

  // Problem statement with quantified metrics (0-12 pts)
  if (evidence.hasProblemSection && evidence.isQuantified && evidence.quantifiedCount >= 3) {
    score += 12;
    strengths.push(`Strong quantified problem statement (${evidence.quantifiedCount} metrics)`);
  } else if (evidence.hasProblemSection && evidence.isQuantified) {
    score += 8;
    issues.push('Add more quantified metrics - aim for 80/20 quant/qual ratio');
  } else if (evidence.hasProblemLanguage) {
    score += 4;
    issues.push('Problem statement lacks quantified data - add specific numbers');
  } else {
    issues.push('Problem statement missing or unclear - define with specific metrics');
  }

  // Credible sources cited (0-10 pts)
  if (evidence.hasSources && evidence.sourceCount >= 2) {
    score += 10;
    strengths.push(`${evidence.sourceCount} credible sources cited`);
  } else if (evidence.hasSources) {
    score += 5;
    issues.push('Add more sources - cite industry benchmarks or internal data with dates');
  } else {
    issues.push('No sources cited - add Gartner, Forrester, internal data, or other benchmarks');
  }

  // Business/customer focus with before/after (0-8 pts)
  if (evidence.hasBusinessFocus && evidence.hasBeforeAfter) {
    score += 8;
    strengths.push('Clear business focus with before/after comparison');
  } else if (evidence.hasBusinessFocus) {
    score += 4;
    issues.push('Add before/after comparison to show baseline vs target');
  } else {
    issues.push('Strengthen business/customer focus - explain why this matters to stakeholders');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Financial Justification (25 pts max) - Pillar 2
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreFinancialJustification(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const financial = detectFinancialJustification(text);

  // ROI calculation with explicit formula (0-10 pts)
  if (financial.hasROI && financial.hasROIFormula) {
    score += 10;
    strengths.push('ROI calculation with explicit formula');
  } else if (financial.hasROI) {
    score += 5;
    issues.push('ROI mentioned but missing explicit formula - use (Benefit - Cost) / Cost × 100');
  } else {
    issues.push('ROI calculation missing - add return on investment analysis');
  }

  // Payback period stated (0-8 pts)
  if (financial.hasPayback && financial.hasPaybackTime) {
    score += 8;
    strengths.push('Payback period specified with timeline');
  } else if (financial.hasPayback) {
    score += 4;
    issues.push('Payback period mentioned but no specific timeline - target <12 months');
  } else {
    issues.push('Payback period missing - state time to recoup investment');
  }

  // 3-year TCO analysis (0-7 pts)
  if (financial.hasTCO && financial.hasDollarAmounts) {
    score += 7;
    strengths.push('TCO analysis with dollar amounts');
  } else if (financial.hasTCO) {
    score += 4;
    issues.push('TCO mentioned but lacks specific dollar amounts');
  } else {
    issues.push('TCO missing - add 3-year view including implementation, training, ops costs');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Options & Alternatives (25 pts max) - Pillar 3
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreOptionsAnalysis(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const options = detectOptionsAnalysis(text);

  // Do-nothing scenario quantified (0-10 pts)
  if (options.hasDoNothing && options.doNothingCount >= 2) {
    score += 10;
    strengths.push('Do-nothing scenario thoroughly analyzed');
  } else if (options.hasDoNothing) {
    score += 6;
    issues.push('Do-nothing scenario mentioned - quantify the cost/risk of inaction');
  } else {
    issues.push('Do-nothing scenario missing - explain what happens if we do nothing');
  }

  // Multiple alternatives considered (0-10 pts)
  const hasInvestmentOption = options.hasMinimalOption || options.hasFullOption;
  if (options.hasAlternatives && options.alternativeCount >= 3 && hasInvestmentOption) {
    score += 10;
    strengths.push(`${options.alternativeCount} alternatives analyzed with investment options`);
  } else if (options.hasAlternatives && options.alternativeCount >= 2) {
    score += 6;
    issues.push('Add minimal or full investment option as alternative');
  } else if (options.hasAlternatives) {
    score += 3;
    issues.push('Only one alternative - add at least 3 options (do-nothing, minimal, full)');
  } else {
    issues.push('Alternatives missing - analyze at least 3 options');
  }

  // Clear recommendation with comparison (0-5 pts)
  if (options.hasRecommendation && options.hasComparison) {
    score += 5;
    strengths.push('Clear recommendation with trade-off analysis');
  } else if (options.hasRecommendation) {
    score += 3;
    issues.push('Recommendation present - add pros/cons comparison');
  } else {
    issues.push('Recommendation missing - state which option and why');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Execution Completeness (20 pts max) - Pillar 4
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreExecutionCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const execution = detectExecutionCompleteness(text);

  // Executive summary present and complete (0-6 pts)
  if (execution.hasExecSummary) {
    score += 6;
    strengths.push('Executive summary present');
  } else {
    issues.push('Executive summary missing - add TL;DR readable in 30 seconds');
  }

  // Risks identified with mitigation (0-7 pts)
  if (execution.hasRisksSection && execution.hasRiskLanguage && execution.riskCount >= 3) {
    score += 7;
    strengths.push(`${execution.riskCount} risks identified with mitigation strategies`);
  } else if (execution.hasRisksSection) {
    score += 4;
    issues.push('Risks section present - add more risks with mitigation strategies');
  } else {
    issues.push('Risks section missing - identify risks and mitigation strategies');
  }

  // Stakeholder concerns addressed (0-7 pts)
  if (execution.hasStakeholderSection && execution.hasStakeholderConcerns) {
    score += 7;
    strengths.push('Stakeholder concerns (Finance/HR/Legal) addressed');
  } else if (execution.hasStakeholderSection) {
    score += 4;
    issues.push('Stakeholders identified - address Finance, HR, Legal concerns');
  } else {
    issues.push('Stakeholder section missing - identify and address stakeholder concerns');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

// Legacy scoring function aliases
export function scoreProblemClarity(text) {
  return scoreStrategicEvidence(text);
}

export function scoreSolutionQuality(text) {
  return scoreFinancialJustification(text);
}

export function scoreScopeDiscipline(text) {
  return scoreOptionsAnalysis(text);
}

export function scoreCompleteness(text) {
  return scoreExecutionCompleteness(text);
}

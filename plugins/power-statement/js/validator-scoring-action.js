/**
 * Power Statement Validator - Action & Specificity Scoring
 * 
 * Scoring for Action (25 pts) and Specificity (25 pts) dimensions
 */

import {
  detectActionVerbs,
  detectSpecificity
} from './validator-detection.js';

/**
 * Score action (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreAction(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const actionDetection = detectActionVerbs(text);

  // Starts with strong action verb (0-15 pts)
  if (actionDetection.startsWithStrongVerb) {
    score += 15;
    strengths.push('Starts with strong action verb');
  } else if (actionDetection.startsWithWeakPattern) {
    issues.push('Replace weak opening ("was responsible for", "helped") with strong action verb');
  } else if (actionDetection.strongVerbCount > 0) {
    score += 8;
    issues.push('Move action verb to the beginning of the statement');
  } else {
    issues.push('Start with a strong action verb (Led, Developed, Achieved, etc.)');
  }

  // Uses strong verbs throughout (0-5 pts)
  if (actionDetection.strongVerbCount >= 2) {
    score += 5;
    strengths.push(`Uses ${actionDetection.strongVerbCount} strong action verbs`);
  } else if (actionDetection.strongVerbCount === 1) {
    score += 3;
  }

  // Avoids weak verbs (0-5 pts)
  if (!actionDetection.hasWeakVerbs) {
    score += 5;
    strengths.push('No weak verbs');
  } else {
    score += Math.max(0, 5 - actionDetection.weakVerbCount);
    issues.push(`Replace weak verbs: ${actionDetection.weakVerbsFound.slice(0, 3).join(', ')}`);
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score specificity (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreSpecificity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const specificityDetection = detectSpecificity(text);

  // Has quantified IMPACT metrics (0-10 pts)
  const impactMetricCount = specificityDetection.percentageCount + specificityDetection.dollarCount;
  const totalMetricCount = impactMetricCount +
                           specificityDetection.timeCount +
                           specificityDetection.quantityCount;

  if (impactMetricCount >= 1 && totalMetricCount >= 2) {
    score += 10;
    strengths.push(`${totalMetricCount} specific metrics including impact metrics (%, $)`);
  } else if (impactMetricCount >= 1) {
    score += 7;
    issues.push('Add more metrics - aim for 2+ quantified results');
  } else if (totalMetricCount >= 2) {
    score += 5;
    issues.push('Include impact metrics (%, $) not just quantities');
  } else if (specificityDetection.hasNumbers) {
    score += 3;
    issues.push('Convert numbers to impact metrics (%, $, time saved)');
  } else {
    issues.push('Add specific impact metrics (%, $, time saved)');
  }

  // Has context (0-8 pts)
  if (specificityDetection.hasContext && specificityDetection.hasTeamContext) {
    score += 8;
    strengths.push('Clear context provided');
  } else if (specificityDetection.hasContext || specificityDetection.hasTeamContext) {
    score += 5;
    issues.push('Add more context - company, team size, or scope');
  } else {
    issues.push('Add context - where did this happen? What was the scope?');
  }

  // Has time-based specificity (0-7 pts)
  if (specificityDetection.hasTimeMetrics) {
    score += 7;
    strengths.push('Includes timeframe or time-based metrics');
  } else {
    issues.push('Add timeframe - when did this happen? How long did it take?');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}


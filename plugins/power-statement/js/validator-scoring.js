/**
 * Power Statement Validator - Scoring Functions
 * 
 * Scoring Dimensions:
 * 1. Clarity (25 pts) - Plain language, conversational tone, no jargon
 * 2. Impact (25 pts) - Customer outcomes, quantified results
 * 3. Action (25 pts) - Problem clarity, solution specificity
 * 4. Specificity (25 pts) - Metrics, customer type clarity
 */

import {
  detectActionVerbs,
  detectSpecificity,
  detectImpact,
  detectClarity
} from './validator-detection.js';

/**
 * Score clarity (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const clarityDetection = detectClarity(text);

  // No filler words (0-6 pts)
  if (!clarityDetection.hasFillers) {
    score += 6;
    strengths.push('No filler words - clean, direct language');
  } else {
    score += Math.max(0, 6 - clarityDetection.fillerCount * 2);
    issues.push(`Remove filler words: ${clarityDetection.fillersFound.slice(0, 3).join(', ')}`);
  }

  // No jargon/buzzwords (0-6 pts)
  if (!clarityDetection.hasJargon) {
    score += 6;
    strengths.push('No jargon or buzzwords');
  } else {
    score += Math.max(0, 6 - clarityDetection.jargonCount * 2);
    issues.push(`Remove jargon: ${clarityDetection.jargonFound.slice(0, 3).join(', ')}`);
  }

  // Appropriate length (0-5 pts)
  if (clarityDetection.isConcise) {
    score += 5;
    strengths.push(`Good length for sales messaging (${clarityDetection.wordCount} words)`);
  } else if (clarityDetection.isTooLong) {
    score += 2;
    issues.push(`Too verbose (${clarityDetection.wordCount} words) - aim for 50-150 words`);
  } else if (clarityDetection.isTooShort) {
    score += 2;
    issues.push(`Too brief (${clarityDetection.wordCount} words) - expand to 50-150 words`);
  } else {
    score += 3;
  }

  // Active voice (0-4 pts)
  if (!clarityDetection.hasPassiveVoice) {
    score += 4;
    strengths.push('Uses active voice');
  } else {
    score += 1;
    issues.push('Rewrite in active voice - avoid "was/were + verb"');
  }

  // Uses flowing paragraphs (0-4 pts)
  if (!clarityDetection.hasBulletPoints) {
    score += 4;
    strengths.push('Uses flowing paragraphs (not bullet points)');
  } else {
    issues.push('Use flowing paragraphs instead of bullet points for sales messaging');
  }

  // Penalize vague improvement terms (-3 pts per term, max -9)
  if (clarityDetection.hasVagueImprovement) {
    const penalty = Math.min(9, clarityDetection.vagueImprovementCount * 3);
    score -= penalty;
    issues.push(`Replace vague terms with specifics: ${clarityDetection.vagueImprovementFound.slice(0, 3).join(', ')} (-${penalty} pts)`);
  }

  return {
    score: Math.max(0, Math.min(score, maxScore)),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score impact (25 pts max)
 * @param {string} text - Power statement content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreImpact(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const impactDetection = detectImpact(text);
  const specificityDetection = detectSpecificity(text);

  // Business or customer impact mentioned (0-10 pts)
  if (impactDetection.hasBusinessImpact || impactDetection.hasCustomerImpact) {
    score += 10;
    if (impactDetection.hasBusinessImpact) {
      strengths.push('Business impact clearly stated');
    }
    if (impactDetection.hasCustomerImpact) {
      strengths.push('Customer impact mentioned');
    }
  } else {
    issues.push('Add business or customer impact - what was the result?');
  }

  // Quantified impact (0-10 pts)
  if (specificityDetection.hasComparisons) {
    score += 10;
    strengths.push('Impact is quantified with comparisons');
  } else if (specificityDetection.hasPercentages || specificityDetection.hasDollarAmounts) {
    score += 8;
    strengths.push('Impact includes metrics');
  } else if (specificityDetection.hasNumbers) {
    score += 5;
    issues.push('Quantify the impact - add percentages or dollar amounts');
  } else {
    issues.push('Add quantified impact - how much did you improve/save/grow?');
  }

  // Scale/scope indicated (0-5 pts)
  if (impactDetection.hasScale || specificityDetection.hasTeamContext) {
    score += 5;
    strengths.push('Scale/scope of impact is clear');
  } else {
    issues.push('Add context about scale - team size, company scope, etc.');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

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


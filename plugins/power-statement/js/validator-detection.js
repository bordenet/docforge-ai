/**
 * Power Statement Validator - Detection Functions
 */

import {
  STRONG_ACTION_VERBS,
  WEAK_VERBS,
  FILLER_PATTERNS,
  JARGON_PATTERNS,
  VAGUE_IMPROVEMENT_PATTERNS
} from './validator-config.js';

/**
 * Detect strong action verbs in text
 * @param {string} text - Text to analyze
 * @returns {Object} Action verb detection results
 */
export function detectActionVerbs(text) {
  const words = text.toLowerCase().split(/\s+/);
  const firstWord = words[0] || '';

  const startsWithStrongVerb = STRONG_ACTION_VERBS.some(verb =>
    firstWord === verb || firstWord === verb + 'd' || firstWord === verb + 'ed'
  );

  const strongVerbsFound = STRONG_ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}(d|ed)?\\b`, 'i');
    return regex.test(text);
  });

  const weakVerbsFound = WEAK_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(text);
  });

  const startsWithWeakPattern = /^(was|were|had|have|helped|assisted|worked|participated|contributed)/i.test(text);

  return {
    startsWithStrongVerb,
    strongVerbCount: strongVerbsFound.length,
    strongVerbsFound: strongVerbsFound.slice(0, 5),
    hasWeakVerbs: weakVerbsFound.length > 0,
    weakVerbCount: weakVerbsFound.length,
    weakVerbsFound,
    startsWithWeakPattern,
    indicators: [
      startsWithStrongVerb && 'Starts with strong action verb',
      strongVerbsFound.length > 0 && `${strongVerbsFound.length} strong action verbs`,
      weakVerbsFound.length > 0 && `${weakVerbsFound.length} weak verbs detected`,
      startsWithWeakPattern && 'Starts with weak verb pattern'
    ].filter(Boolean)
  };
}

/**
 * Detect quantified metrics and specificity in text
 * @param {string} text - Text to analyze
 * @returns {Object} Specificity detection results
 */
export function detectSpecificity(text) {
  const numberMatches = text.match(/\d+(\.\d+)?/g) || [];
  const percentageMatches = text.match(/\d+(\.\d+)?%/g) || [];
  const dollarMatches = text.match(/\$[\d,]+(\.\d+)?[KMB]?|\d+(\.\d+)?\s*(million|billion|thousand)/gi) || [];
  const timeMatches = text.match(/\d+\s*(hour|day|week|month|year|minute|second)s?/gi) || [];
  const timeframeMatches = text.match(/\b(Q[1-4]\s*[-–]?\s*(Q[1-4]\s*)?\d{4}|\d+\s*(months?|quarters?|weeks?)\b|next\s+(quarter|month|year)|by\s+\w+\s+\d{4}|within\s+\d+\s+\w+)/gi) || [];
  const quantityMatches = text.match(/\d+\s*(user|customer|client|team|member|employee|project|product|feature|system|application)s?/gi) || [];
  const comparisonMatches = text.match(/\b(increased|decreased|reduced|improved|grew|doubled|tripled|halved|cut)\s+by\s+\d+/gi) || [];

  const hasContext = /\b(at|for|with|across|within)\s+[A-Z][a-zA-Z]*/i.test(text);
  const hasTeamContext = /\b(team|department|organization|company|division|corp|inc|llc)\b/gi.test(text);
  const hasTimeMetrics = timeMatches.length > 0 || timeframeMatches.length > 0;
  const timeCount = timeMatches.length + timeframeMatches.length;

  return {
    hasNumbers: numberMatches.length > 0,
    numberCount: numberMatches.length,
    hasPercentages: percentageMatches.length > 0,
    percentageCount: percentageMatches.length,
    hasDollarAmounts: dollarMatches.length > 0,
    dollarCount: dollarMatches.length,
    hasTimeMetrics,
    timeCount,
    hasTimeframes: timeframeMatches.length > 0,
    timeframeCount: timeframeMatches.length,
    hasQuantityMetrics: quantityMatches.length > 0,
    quantityCount: quantityMatches.length,
    hasComparisons: comparisonMatches.length > 0,
    comparisonCount: comparisonMatches.length,
    hasContext,
    hasTeamContext,
    indicators: [
      numberMatches.length > 0 && `${numberMatches.length} numeric values`,
      percentageMatches.length > 0 && `${percentageMatches.length} percentages`,
      dollarMatches.length > 0 && 'Dollar amounts present',
      timeMatches.length > 0 && 'Time-based metrics',
      timeframeMatches.length > 0 && 'Specific timeframes (Q1, by date, etc.)',
      comparisonMatches.length > 0 && 'Quantified comparisons',
      hasContext && 'Contextual details present',
      hasTeamContext && 'Team/org context provided'
    ].filter(Boolean)
  };
}

/**
 * Detect impact indicators in text
 * @param {string} text - Text to analyze
 * @returns {Object} Impact detection results
 */
export function detectImpact(text) {
  const businessImpactMatches = text.match(/\b(revenue|profit|cost|savings|efficiency|productivity|growth|ROI|return)\b/gi) || [];
  const customerImpactMatches = text.match(/\b(customer|user|client|satisfaction|experience|retention|acquisition|engagement|NPS)\b/gi) || [];
  const scaleMatches = text.match(/\b(company.wide|organization.wide|enterprise|global|national|regional|cross.functional)\b/gi) || [];
  const resultMatches = text.match(/\b(resulting in|leading to|which|enabling|driving|achieving|delivering)\b/gi) || [];
  const improvementMatches = text.match(/\b(improved|increased|reduced|decreased|enhanced|accelerated|streamlined|optimized)\b/gi) || [];

  return {
    hasBusinessImpact: businessImpactMatches.length > 0,
    businessImpactCount: businessImpactMatches.length,
    hasCustomerImpact: customerImpactMatches.length > 0,
    customerImpactCount: customerImpactMatches.length,
    hasScale: scaleMatches.length > 0,
    scaleCount: scaleMatches.length,
    hasResultLanguage: resultMatches.length > 0,
    resultCount: resultMatches.length,
    hasImprovementLanguage: improvementMatches.length > 0,
    improvementCount: improvementMatches.length,
    indicators: [
      businessImpactMatches.length > 0 && 'Business impact mentioned',
      customerImpactMatches.length > 0 && 'Customer impact mentioned',
      scaleMatches.length > 0 && 'Scale/scope indicated',
      resultMatches.length > 0 && 'Result language present',
      improvementMatches.length > 0 && 'Improvement language present'
    ].filter(Boolean)
  };
}

/**
 * Detect clarity issues in text
 * @param {string} text - Text to analyze
 * @returns {Object} Clarity detection results
 */
export function detectClarity(text) {
  let fillerCount = 0;
  const fillersFound = [];
  for (const pattern of FILLER_PATTERNS) {
    const matches = text.match(pattern) || [];
    fillerCount += matches.length;
    fillersFound.push(...matches);
  }

  let jargonCount = 0;
  const jargonFound = [];
  for (const pattern of JARGON_PATTERNS) {
    const matches = text.match(pattern) || [];
    jargonCount += matches.length;
    jargonFound.push(...matches);
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const isConcise = wordCount >= 50 && wordCount <= 150;
  const isTooShort = wordCount < 30;
  const isTooLong = wordCount > 200;

  const passiveMatches = text.match(/\b(am|are|is|was|were|been|being)\s+(\w+ed|achieved|led|built|won|made|done|given|taken|shown)\b/gi) || [];
  const hasPassiveVoice = passiveMatches.length > 0;

  const bulletMatches = text.match(/^\s*[-*+•◆✓✅→►▶|]\s+|^\s*\d+[.)]\s+/gm) || [];
  const hasBulletPoints = bulletMatches.length > 2;

  const vagueImprovementMatches = text.match(VAGUE_IMPROVEMENT_PATTERNS) || [];
  const hasVagueImprovement = vagueImprovementMatches.length > 0;

  return {
    hasFillers: fillerCount > 0,
    fillerCount,
    fillersFound: [...new Set(fillersFound)],
    hasJargon: jargonCount > 0,
    jargonCount,
    jargonFound: [...new Set(jargonFound)],
    wordCount,
    isConcise,
    isTooShort,
    isTooLong,
    hasPassiveVoice,
    passiveCount: passiveMatches.length,
    hasBulletPoints,
    bulletCount: bulletMatches.length,
    hasVagueImprovement,
    vagueImprovementCount: vagueImprovementMatches.length,
    vagueImprovementFound: [...new Set(vagueImprovementMatches)],
    indicators: [
      fillerCount === 0 && 'No filler words',
      jargonCount === 0 && 'No jargon/buzzwords',
      isConcise && 'Good length for sales messaging',
      !hasPassiveVoice && 'Active voice',
      !hasBulletPoints && 'Uses flowing paragraphs',
      !hasVagueImprovement && 'No vague improvement terms',
      fillerCount > 0 && `${fillerCount} filler words detected`,
      jargonCount > 0 && `${jargonCount} jargon terms detected`,
      isTooLong && 'Statement too verbose',
      isTooShort && 'Statement too brief for sales messaging',
      hasPassiveVoice && 'Passive voice detected',
      hasBulletPoints && 'Uses bullet points instead of paragraphs',
      hasVagueImprovement && `Vague terms: ${vagueImprovementMatches.slice(0, 3).join(', ')}`
    ].filter(Boolean)
  };
}

/**
 * Detect if power statement has both Version A and Version B
 * @param {string} text - Power statement content
 * @returns {Object} Version detection results
 */
export function detectVersions(text) {
  const hasVersionA = /##?\s*Version\s*A[:\s]/i.test(text);
  const hasVersionB = /##?\s*Version\s*B[:\s]/i.test(text);

  const hasChallenge = /###?\s*(The\s+)?Challenge/i.test(text);
  const hasSolution = /###?\s*(The\s+)?Solution/i.test(text);
  const hasResults = /###?\s*(Proven\s+)?Results/i.test(text);
  const hasWhyItWorks = /###?\s*Why\s+It\s+Works/i.test(text);

  const structuredSectionCount = [hasChallenge, hasSolution, hasResults, hasWhyItWorks].filter(Boolean).length;
  const hasStructuredContent = structuredSectionCount >= 3;

  return {
    hasVersionA,
    hasVersionB,
    hasBothVersions: hasVersionA && hasVersionB,
    hasStructuredContent,
    structuredSectionCount,
    indicators: [
      hasVersionA && 'Version A (concise) present',
      hasVersionB && 'Version B (structured) present',
      hasStructuredContent && `${structuredSectionCount}/4 structured sections`
    ].filter(Boolean)
  };
}


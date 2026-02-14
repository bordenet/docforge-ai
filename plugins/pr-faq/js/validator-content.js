/**
 * PR-FAQ Content Quality Scoring
 * Analyzes 5 Ws, structure, and credibility
 */

import {
  ACTION_WORDS, WHY_INDICATORS, SUPPORTING_ELEMENTS,
  BOILERPLATE_INDICATORS, TRANSITION_WORDS, THIRD_PARTY_INDICATORS
} from './validator-config.js';

/**
 * Analyze 5 Ws coverage (15 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeFiveWs(content) {
  const result = {
    score: 0,
    maxScore: 15,
    issues: [],
    strengths: [],
  };

  // Get first 2-3 paragraphs
  const paragraphs = content.split(/\n\n+/);
  let leadContent = '';
  for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
    leadContent += paragraphs[i] + ' ';
  }
  const leadContentLower = leadContent.toLowerCase();

  // WHO: Company/organization identified
  const companyPatterns = [
    /\b[A-Z][a-z]+\s+(?:Inc|Corp|Company|LLC|Ltd)/,
    /[A-Z][a-zA-Z]+\s+announced/,
    /[A-Z][a-zA-Z]+\s+today/,
    /[A-Z][a-zA-Z]+\s+launches/i,
    /\*\*[A-Z][a-zA-Z]+\*\*/,  // Bold company names like **FakeCo**
  ];
  const hasWho = companyPatterns.some(p => p.test(leadContent));

  if (hasWho) {
    result.score += 3;
    result.strengths.push('Clearly identifies WHO (company/organization)');
  } else {
    result.issues.push('WHO: Company/organization not clearly identified in lead');
  }

  // WHAT: Action clearly described
  const hasWhat = ACTION_WORDS.some(action => leadContentLower.includes(action));
  if (hasWhat) {
    result.score += 3;
    result.strengths.push('Clearly describes WHAT (action/product/service)');
  } else {
    result.issues.push('WHAT: Action or offering not clearly described');
  }

  // WHEN: Timing mentioned
  const timePatterns = [
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d/i,
    /today/i,
    /this week/i,
    /this month/i,
    /\d{4}/,
    /yesterday/i,
    /recently/i,
  ];
  const hasWhen = timePatterns.some(p => p.test(leadContent));

  if (hasWhen) {
    result.score += 3;
    result.strengths.push('Includes WHEN (timing/date)');
  } else {
    result.issues.push('WHEN: Timing or date not specified');
  }

  // WHERE: Location/market mentioned
  const wherePatterns = [
    /[A-Z][a-z]+,\s+[A-Z]{2}/,           // "Seattle, WA"
    /[A-Z]{2,},\s*[A-Z]{2}\s*[—–-]/,     // "SEATTLE, WA —" (dateline)
    /[A-Z][a-z]+\s+\([A-Z][a-z]+\s+Wire\)/,
    /headquarters/i,
    /market/i,
    /globally/i,
    /worldwide/i,
    /nation/i,
  ];
  const hasWhere = wherePatterns.some(p => p.test(leadContent));

  if (hasWhere) {
    result.score += 2;
    result.strengths.push('Mentions WHERE (location/market)');
  } else {
    result.issues.push('WHERE: Location or market context could be clearer');
  }

  // WHY: Reason/benefit explained
  const hasWhy = WHY_INDICATORS.some(indicator => leadContentLower.includes(indicator));
  if (hasWhy) {
    result.score += 4;
    result.strengths.push('Explains WHY (reason/benefit/problem solved)');
  } else {
    result.issues.push('WHY: Reason or benefit not clearly explained');
  }

  return result;
}

/**
 * Analyze document structure (10 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeStructure(content) {
  const result = {
    score: 0,
    maxScore: 10,
    issues: [],
    strengths: [],
  };

  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());

  if (paragraphs.length < 3) {
    result.issues.push('Press release too short for proper structure analysis');
    result.score = 2;
    return result;
  }

  // Lead paragraph length (widened range to 25-70 words)
  const firstPara = paragraphs[0].trim();
  const leadWords = firstPara.split(/\s+/).length;

  if (leadWords >= 25 && leadWords <= 70) {
    result.score += 3;
    result.strengths.push('Lead paragraph has appropriate length');
  } else if (leadWords > 80) {
    result.issues.push('Lead paragraph too long - should be concise');
  } else if (leadWords < 20) {
    result.issues.push('Lead paragraph too brief - lacks key details');
  }

  // Supporting details in middle
  let middleContent = '';
  const startIdx = 1;
  const endIdx = Math.max(startIdx + 1, paragraphs.length - 2);

  for (let i = startIdx; i < endIdx; i++) {
    middleContent += paragraphs[i] + ' ';
  }

  if (middleContent.length > 0) {
    const hasSupporting = SUPPORTING_ELEMENTS.some(el => middleContent.toLowerCase().includes(el));
    if (hasSupporting) {
      result.score += 3;
      result.strengths.push('Includes supporting details and context');
    } else {
      result.issues.push('Middle content lacks supporting details');
    }
  }

  // Boilerplate at end
  if (paragraphs.length >= 3) {
    const lastPara = paragraphs[paragraphs.length - 1].toLowerCase();
    const hasBoilerplate = BOILERPLATE_INDICATORS.some(ind => lastPara.includes(ind));
    if (hasBoilerplate) {
      result.score += 2;
      result.strengths.push('Includes proper company boilerplate');
    } else {
      result.issues.push('Missing company boilerplate information');
    }
  }

  // Transitions
  const hasTransitions = TRANSITION_WORDS.some(t => content.toLowerCase().includes(t));
  if (hasTransitions) {
    result.score += 2;
    result.strengths.push('Uses transitions for logical flow');
  } else if (paragraphs.length > 4) {
    result.issues.push('Consider adding transitions between sections');
  }

  return result;
}

/**
 * Analyze credibility (10 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeCredibility(content) {
  const result = {
    score: 5, // Start neutral
    maxScore: 10,
    issues: [],
    strengths: [],
  };

  const contentLower = content.toLowerCase();

  // Check for proof/evidence
  const proofIndicators = [/\d+%/, /\d+x/, /study shows/i, /research indicates/i, /data reveals/i, /according to/i, /measured/i, /demonstrated/i];
  const hasProof = proofIndicators.some(p => p.test(content));

  if (hasProof) {
    result.score += 3;
    result.strengths.push('Backs claims with data or evidence');
  } else {
    result.score -= 1;
    result.issues.push('Claims would be stronger with supporting data');
  }

  // Check for third-party validation
  const hasThirdParty = THIRD_PARTY_INDICATORS.some(ind => contentLower.includes(ind));
  if (hasThirdParty) {
    result.score += 2;
    result.strengths.push('References third-party validation');
  }

  return result;
}

/**
 * Score Content Quality dimension (20 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[], breakdown: Object}}
 */
export function scoreContentQuality(content) {
  const fiveWs = analyzeFiveWs(content);
  const structure = analyzeStructure(content);
  const credibility = analyzeCredibility(content);

  // Raw score from sub-functions (max 35), scale to 20 pts
  const rawScore = fiveWs.score + structure.score + credibility.score;
  const scaledScore = Math.round((rawScore * 20) / 35);

  return {
    score: scaledScore,
    maxScore: 20,
    issues: [...fiveWs.issues, ...structure.issues, ...credibility.issues],
    strengths: [...fiveWs.strengths, ...structure.strengths, ...credibility.strengths],
    breakdown: {
      fiveWs,
      structure,
      credibility,
    },
  };
}


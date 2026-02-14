/**
 * PR-FAQ Professional Quality Analysis Functions
 * Sub-functions for tone, readability, and marketing fluff analysis
 */

import { getSlopPenalty } from '../../../shared/js/slop-scoring.js';
import {
  HYPE_WORDS, EMOTIONAL_FLUFF, VAGUE_TERMS, TECH_JARGON,
  PASSIVE_INDICATORS
} from './validator-config.js';
import { extractQuotes } from './validator-utils.js';

/**
 * Analyze tone and readability (10 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeToneAndReadability(content) {
  const result = {
    score: 5, // Start neutral
    maxScore: 10,
    issues: [],
    strengths: [],
  };

  const contentLower = content.toLowerCase();

  // Sentence length analysis
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  let totalWords = 0;
  let longSentences = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).filter(w => w.length > 0).length;
    totalWords += words;
    if (words > 25) {
      longSentences++;
    }
  }

  if (sentences.length > 1) {
    const avgWordsPerSentence = totalWords / sentences.length;
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      result.score += 2;
      result.strengths.push('Good sentence length for readability');
    } else if (avgWordsPerSentence > 25) {
      result.issues.push('Sentences too long - break into shorter, clearer statements');
    }
  }

  if (longSentences > sentences.length / 3) {
    result.issues.push('Too many overly long sentences - impacts readability');
    result.score -= 1;
  }

  // Passive voice check
  let passiveCount = 0;
  for (const passive of PASSIVE_INDICATORS) {
    const matches = contentLower.match(new RegExp(passive, 'g'));
    passiveCount += matches ? matches.length : 0;
  }

  if (passiveCount > sentences.length / 4) {
    result.issues.push('Overuse of passive voice - use active voice for clarity');
    result.score -= 1;
  } else {
    result.score += 1;
    result.strengths.push('Good use of active voice');
  }

  // Jargon check
  let jargonCount = 0;
  for (const jargon of TECH_JARGON) {
    if (contentLower.includes(jargon)) {
      jargonCount++;
    }
  }

  if (jargonCount > 3) {
    result.issues.push('Too much technical jargon - write for broader audience');
    result.score -= 1;
  } else if (jargonCount === 0) {
    result.score += 1;
    result.strengths.push('Avoids unnecessary jargon');
  }

  // Quote quality check
  const quotes = extractQuotes(content);
  let fluffyQuotes = 0;

  for (const quote of quotes) {
    const quoteLower = quote.toLowerCase();
    if (EMOTIONAL_FLUFF.some(fluff => quoteLower.includes(fluff))) {
      fluffyQuotes++;
    }
  }

  if (quotes.length > 0) {
    if (fluffyQuotes < quotes.length / 2) {
      result.score += 1;
      result.strengths.push('Quotes provide substantive insight');
    } else {
      result.issues.push('Too many generic \'excited\' quotes - add substantive insights');
    }
  }

  return result;
}

/**
 * Analyze marketing fluff (10 pts max - starts at 10, deducts for fluff)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[], fluffWords: Array}}
 */
export function analyzeMarketingFluff(content) {
  const result = {
    score: 10,
    maxScore: 10,
    issues: [],
    strengths: [],
    fluffWords: [],
  };

  const contentLower = content.toLowerCase();

  // Hyperbolic adjectives
  let hypeCount = 0;
  for (const hype of HYPE_WORDS) {
    if (contentLower.includes(hype)) {
      hypeCount++;
      let idx = contentLower.indexOf(hype);
      while (idx !== -1) {
        result.fluffWords.push({ word: hype, index: idx });
        idx = contentLower.indexOf(hype, idx + 1);
      }
    }
  }

  if (hypeCount > 3) {
    result.score -= 3;
    result.issues.push('Excessive hyperbolic language reduces credibility');
  } else if (hypeCount > 1) {
    result.score -= 1;
    result.issues.push('Consider reducing promotional adjectives');
  } else if (hypeCount === 0) {
    result.strengths.push('Avoids hyperbolic marketing language');
  }

  // Emotional fluff in quotes
  const quotes = extractQuotes(content);
  let fluffyQuotes = 0;

  for (const quote of quotes) {
    const quoteLower = quote.toLowerCase();
    for (const fluff of EMOTIONAL_FLUFF) {
      if (quoteLower.includes(fluff)) {
        fluffyQuotes++;
        break;
      }
    }
  }

  if (quotes.length > 0) {
    const fluffRatio = fluffyQuotes / quotes.length;
    if (fluffRatio > 0.7) {
      result.score -= 3;
      result.issues.push('Most quotes are generic emotional responses');
    } else if (fluffRatio > 0.3) {
      result.score -= 1;
      result.issues.push('Some quotes lack substantive content');
    } else {
      result.strengths.push('Quotes provide meaningful insights');
    }
  }

  // Vague benefits
  let vagueCount = 0;
  for (const vague of VAGUE_TERMS) {
    if (contentLower.includes(vague)) {
      vagueCount++;
    }
  }

  if (vagueCount > 2) {
    result.score -= 2;
    result.issues.push('Vague benefit claims need specific proof points');
  } else if (vagueCount === 0) {
    result.strengths.push('Avoids vague, unsubstantiated claims');
  }

  // Check for proof
  const proofIndicators = [/\d+%/, /\d+x/, /study shows/i, /research indicates/i, /data reveals/i, /according to/i, /measured/i, /demonstrated/i];
  const hasProof = proofIndicators.some(p => p.test(content));

  if (hasProof) {
    result.strengths.push('Backs claims with data or evidence');
  } else {
    result.score -= 1;
    result.issues.push('Claims would be stronger with supporting data');
  }

  result.score = Math.max(0, result.score);

  // Apply slop penalty
  const slopPenalty = getSlopPenalty(content);
  if (slopPenalty.penalty > 0) {
    const slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    result.score = Math.max(0, result.score - slopDeduction);
    if (slopPenalty.issues.length > 0) {
      result.issues.push(...slopPenalty.issues.slice(0, 2));
    }
  }
  result.slopDetection = slopPenalty;

  return result;
}

/**
 * PR-FAQ Professional Quality Scoring
 * Main entry point - re-exports analysis functions and provides scoring
 */

import { ALL_FLUFF_PATTERNS } from './validator-config.js';
import {
  analyzeToneAndReadability,
  analyzeMarketingFluff
} from './validator-professional-analysis.js';

// Re-export analysis functions
export {
  analyzeToneAndReadability,
  analyzeMarketingFluff
} from './validator-professional-analysis.js';

/**
 * Detect fluff words and return their positions for highlighting
 * @param {string} content - Full content
 * @returns {{found: boolean, count: number, words: Array}}
 */
export function detectFluffWords(content) {
  const results = [];
  const contentLower = content.toLowerCase();

  for (const pattern of ALL_FLUFF_PATTERNS) {
    let idx = contentLower.indexOf(pattern);
    while (idx !== -1) {
      results.push({
        word: content.slice(idx, idx + pattern.length),
        start: idx,
        end: idx + pattern.length,
      });
      idx = contentLower.indexOf(pattern, idx + 1);
    }
  }

  // Sort by position
  results.sort((a, b) => a.start - b.start);
  return {
    found: results.length > 0,
    count: results.length,
    words: results
  };
}

/**
 * Score Professional Quality dimension (15 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[], fluffWords: Array, breakdown: Object}}
 */
export function scoreProfessionalQuality(content) {
  const tone = analyzeToneAndReadability(content);
  const fluff = analyzeMarketingFluff(content);

  // Raw score from sub-functions (max 20), scale to 15 pts
  const rawScore = tone.score + fluff.score;
  const scaledScore = Math.round((rawScore * 15) / 20);

  return {
    score: scaledScore,
    maxScore: 15,
    issues: [...tone.issues, ...fluff.issues],
    strengths: [...tone.strengths, ...fluff.strengths],
    fluffWords: fluff.fluffWords,
    breakdown: {
      tone,
      fluff,
    },
  };
}


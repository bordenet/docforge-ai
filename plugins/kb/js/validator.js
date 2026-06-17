/**
 * KB Article Validator — Main Entry Point
 * Phase A: validateDocument wired but scoring functions return zeros.
 * Phase B2: scoring implemented — all dimensions produce real scores.
 */

import { SECTION_PATTERNS } from './validator-config.js';
import {
  extractSection,
  detectArticleType,
  detectResolutionSteps,
} from './validator-detection.js';
import {
  scoreFindability,
  scoreResolutionQuality,
  scoreCompleteness,
  scorePrecision,
  scoreSelfService,
} from './validator-scoring.js';

// Re-export utilities for testing
export {
  extractSection,
  extractTitle,
  detectArticleType,
  detectSeverity,
  detectResolutionSteps,
  detectEscalation,
} from './validator-detection.js';

export {
  scoreFindability,
  scoreResolutionQuality,
  scoreCompleteness,
  scorePrecision,
  scoreSelfService,
} from './validator-scoring.js';

/**
 * Validate a KB article and return comprehensive scoring results.
 * @param {string} text - Article content
 * @returns {Object} Complete validation results
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    const noContent = { score: 0, issues: ['No content'], strengths: [] };
    const d1e = { ...noContent, maxScore: 20 };
    const d2e = { ...noContent, maxScore: 25 };
    const d3e = { ...noContent, maxScore: 25 };
    const d4e = { ...noContent, maxScore: 15 };
    const d5e = { ...noContent, maxScore: 15 };
    return {
      totalScore: 0,
      rawTotal: 0,
      theaterGateApplied: false,
      articleType: 'troubleshooting',
      findability: d1e,
      resolutionQuality: d2e,
      completeness: d3e,
      precision: d4e,
      selfService: d5e,
      dimension1: d1e,
      dimension2: d2e,
      dimension3: d3e,
      dimension4: d4e,
      dimension5: d5e,
      issues: ['No content'],
      strengths: [],
    };
  }

  const articleType = detectArticleType(text);
  const resolutionText = extractSection(text, SECTION_PATTERNS.resolution);
  const resSignals = detectResolutionSteps(resolutionText);

  const d1 = scoreFindability(text, articleType);
  const d2 = scoreResolutionQuality(resolutionText, resSignals, articleType);
  const d3 = scoreCompleteness(text, articleType);
  const d4 = scorePrecision(text);
  const d5 = scoreSelfService(text, articleType);

  const rawTotal = d1.score + d2.score + d3.score + d4.score + d5.score;

  // Resolution Theater Gate: cap at 49 when Resolution has zero specificity signals.
  const theaterGate = !resSignals.hasSpecificitySignals;
  const totalScore = theaterGate ? Math.min(rawTotal, 49) : rawTotal;
  const gateIssues = theaterGate
    ? ['Resolution Theater: steps contain no UI path, command, or exact value — unfollowable. Score capped at 49 until the Resolution adds concrete specificity.']
    : [];

  return {
    totalScore,
    rawTotal,
    theaterGateApplied: theaterGate,
    articleType,
    findability: d1,
    resolutionQuality: d2,
    completeness: d3,
    precision: d4,
    selfService: d5,
    // dimension1-5: independent copies for plugin-registry contract compatibility
    dimension1: { ...d1, issues: [...d1.issues], strengths: [...d1.strengths] },
    dimension2: { ...d2, issues: [...d2.issues], strengths: [...d2.strengths] },
    dimension3: { ...d3, issues: [...d3.issues], strengths: [...d3.strengths] },
    dimension4: { ...d4, issues: [...d4.issues], strengths: [...d4.strengths] },
    dimension5: { ...d5, issues: [...d5.issues], strengths: [...d5.strengths] },
    issues: [...gateIssues, ...d1.issues, ...d2.issues, ...d3.issues, ...d4.issues, ...d5.issues],
    strengths: [...d1.strengths, ...d2.strengths, ...d3.strengths, ...d4.strengths, ...d5.strengths],
  };
}

export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

export function getScoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 70) return 'yellow';
  if (score >= 50) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Ready';
  if (score >= 70) return 'Needs Polish';
  if (score >= 50) return 'Needs Work';
  return 'Incomplete';
}

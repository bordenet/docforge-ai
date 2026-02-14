/**
 * AI Slop Detection & Scoring - Main Entry Point
 *
 * Re-exports all slop detection and scoring functions.
 * Import from this file to avoid circular dependency issues.
 *
 * @module slop-index
 */

// Detection functions
export {
  detectAISlop,
  detectEmDashes,
  detectPatterns,
  detectStructuralPatterns,
  analyzeSentenceVariance,
  analyzeTypeTokenRatio
} from './slop-detection.js';

// Scoring functions
export {
  calculateSlopScore,
  getSlopPenalty
} from './slop-scoring.js';


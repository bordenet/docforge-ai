/**
 * AI Slop Detection Module
 *
 * Comprehensive detection of AI-generated content patterns.
 * Based on the detecting-ai-slop skill with document-specific enhancements.
 *
 * Detection Dimensions:
 * 1. Lexical (40 pts max) - Pattern matching for AI-typical phrases
 * 2. Structural (25 pts max) - Document structure patterns
 * 3. Semantic (20 pts max) - Hollow claims and absent constraints
 * 4. Stylometric (15 pts max) - Statistical text analysis
 *
 * @module slop-detection
 */

import {
  GENERIC_BOOSTERS,
  BUZZWORDS,
  FILLER_PHRASES,
  HEDGE_PATTERNS,
  SYCOPHANTIC_PHRASES,
  TRANSITIONAL_FILLER,
  STRUCTURAL_PATTERNS,
  MIN_SENTENCES_FOR_ANALYSIS,
  MIN_SENTENCE_VARIANCE_THRESHOLD,
  MIN_WORDS_FOR_TTR,
  TTR_WINDOW_SIZE,
  MIN_TTR_THRESHOLD,
} from './slop-patterns.js';

// Re-export patterns for backwards compatibility
export {
  GENERIC_BOOSTERS,
  BUZZWORDS,
  FILLER_PHRASES,
  HEDGE_PATTERNS,
  SYCOPHANTIC_PHRASES,
  TRANSITIONAL_FILLER,
  STRUCTURAL_PATTERNS,
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect em-dashes in text (classic AI marker)
 * @param {string} text - Text to analyze
 * @returns {number} Count of em-dashes found
 */
export function detectEmDashes(text) {
  return (text.match(/—/g) || []).length;
}

/**
 * Detect patterns in text using word boundary matching
 * @param {string} text - Text to analyze
 * @param {string[]} patterns - Array of patterns to find
 * @returns {string[]} Patterns found in text
 */
export function detectPatterns(text, patterns) {
  const found = [];
  const lowerText = text.toLowerCase();

  for (const pattern of patterns) {
    // Use includes for phrase patterns, regex for single words
    if (pattern.includes(' ')) {
      if (lowerText.includes(pattern.toLowerCase())) {
        found.push(pattern);
      }
    } else {
      const regex = new RegExp(`\\b${pattern}\\b`, 'i');
      if (regex.test(text)) {
        found.push(pattern);
      }
    }
  }

  return found;
}

/**
 * Comprehensive AI slop detection across all lexical categories
 * @param {string} text - Text to analyze
 * @returns {Object} Detection results by category
 */
export function detectAISlop(text) {
  const results = {
    genericBoosters: detectPatterns(text, GENERIC_BOOSTERS),
    buzzwords: detectPatterns(text, BUZZWORDS),
    fillerPhrases: detectPatterns(text, FILLER_PHRASES),
    hedgePatterns: detectPatterns(text, HEDGE_PATTERNS),
    sycophantic: detectPatterns(text, SYCOPHANTIC_PHRASES),
    transitionalFiller: detectPatterns(text, TRANSITIONAL_FILLER),
    emDashes: detectEmDashes(text),
    structural: detectStructuralPatterns(text),
  };

  results.totalPatterns =
    results.genericBoosters.length +
    results.buzzwords.length +
    results.fillerPhrases.length +
    results.hedgePatterns.length +
    results.sycophantic.length +
    results.transitionalFiller.length +
    results.emDashes +
    results.structural.count;

  return results;
}

/**
 * Detect structural AI patterns
 * @param {string} text - Text to analyze
 * @returns {Object} Structural pattern results
 */
export function detectStructuralPatterns(text) {
  const found = [];

  // Check for formulaic intro
  if (STRUCTURAL_PATTERNS.formulaicIntro.test(text)) {
    found.push('formulaic-introduction');
  }

  // Check for over-signposting
  const lowerText = text.toLowerCase();
  for (const phrase of STRUCTURAL_PATTERNS.overSignposting) {
    if (lowerText.includes(phrase)) {
      found.push(`over-signposting: "${phrase}"`);
      break; // Count once
    }
  }

  // Check for template sections
  if (STRUCTURAL_PATTERNS.templateSections.test(text)) {
    found.push('template-section-progression');
  }

  // Check for symmetric coverage
  const symmetricMatches = text.match(STRUCTURAL_PATTERNS.symmetricCoverage) || [];
  if (symmetricMatches.length > 0) {
    found.push('symmetric-coverage');
  }

  return {
    patterns: found,
    count: found.length,
  };
}

// ============================================================================
// Stylometric Analysis
// ============================================================================

/**
 * Calculate sentence length standard deviation
 * @param {string} text - Text to analyze
 * @returns {Object} Sentence statistics
 */
export function analyzeSentenceVariance(text) {
  // Split into sentences (period, question, exclamation)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length < MIN_SENTENCES_FOR_ANALYSIS) {
    return { variance: null, flag: false, reason: 'Too few sentences' };
  }

  // Count words in each sentence
  const lengths = sentences.map(
    (s) =>
      s
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
  );

  // Calculate mean and standard deviation
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + (len - mean) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Flag if too uniform (AI tends to produce uniform sentence lengths)
  const flag = stdDev < MIN_SENTENCE_VARIANCE_THRESHOLD;

  return {
    sentenceCount: sentences.length,
    meanLength: Math.round(mean * 10) / 10,
    stdDev: Math.round(stdDev * 10) / 10,
    flag,
    reason: flag
      ? `Low sentence variance (σ=${stdDev.toFixed(1)}, target >${MIN_SENTENCE_VARIANCE_THRESHOLD})`
      : null,
  };
}

/**
 * Calculate Type-Token Ratio (vocabulary diversity)
 * @param {string} text - Text to analyze
 * @returns {Object} TTR statistics
 */
export function analyzeTypeTokenRatio(text) {
  // Normalize: lowercase, remove punctuation
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, '');
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);

  if (words.length < MIN_WORDS_FOR_TTR) {
    return { ttr: null, flag: false, reason: 'Too few words' };
  }

  // Calculate TTR in fixed-size windows
  const ttrs = [];

  for (let i = 0; i + TTR_WINDOW_SIZE <= words.length; i += TTR_WINDOW_SIZE) {
    const windowWords = words.slice(i, i + TTR_WINDOW_SIZE);
    const unique = new Set(windowWords).size;
    ttrs.push(unique / TTR_WINDOW_SIZE);
  }

  if (ttrs.length === 0) {
    // Fallback for short text
    const unique = new Set(words).size;
    const ttr = unique / words.length;
    return {
      ttr: Math.round(ttr * 100) / 100,
      flag: ttr < MIN_TTR_THRESHOLD,
      reason: ttr < MIN_TTR_THRESHOLD ? `Low vocabulary diversity (TTR=${ttr.toFixed(2)})` : null,
    };
  }

  const avgTTR = ttrs.reduce((a, b) => a + b, 0) / ttrs.length;

  // Flag if too low (limited vocabulary) or suspiciously consistent
  const flag = avgTTR < MIN_TTR_THRESHOLD;

  return {
    ttr: Math.round(avgTTR * 100) / 100,
    wordCount: words.length,
    flag,
    reason: flag
      ? `Low vocabulary diversity (TTR=${avgTTR.toFixed(2)}, target >${MIN_TTR_THRESHOLD})`
      : null,
  };
}

// Re-export scoring functions from slop-scoring.js for backward compatibility
export { calculateSlopScore, getSlopPenalty } from './slop-scoring.js';

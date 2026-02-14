/**
 * Document Validator - Detection Functions
 *
 * Section detection, content quality analysis, and dimension scoring.
 *
 * @module validator-detection
 */

import {
  MIN_HEADINGS_FOR_STRUCTURE,
  MIN_WORDS_FOR_SUBSTANCE,
  QUANTIFIED_FULL_POINTS_THRESHOLD,
  WORD_COUNT_FULL_POINTS,
  WORD_COUNT_PARTIAL_POINTS,
  SECTION_COUNT_FULL_POINTS,
  SECTION_COUNT_PARTIAL_POINTS,
  STRUCTURE_SCORE_WEIGHT,
  QUANTIFIED_FULL_WEIGHT,
  QUANTIFIED_PARTIAL_WEIGHT,
  SUBSTANCE_FULL_WEIGHT,
  SUBSTANCE_PARTIAL_WEIGHT,
  COVERAGE_FULL_WEIGHT,
  COVERAGE_PARTIAL_WEIGHT,
  COMMON_SECTIONS,
  QUALITY_PATTERNS,
} from './validator-config.js';

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of COMMON_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

/**
 * Analyze content quality
 * @param {string} text - Text to analyze
 * @returns {Object} Quality indicators
 */
export function analyzeContentQuality(text) {
  const quantified = (text.match(QUALITY_PATTERNS.quantified) || []).length;
  const businessFocus = (text.match(QUALITY_PATTERNS.businessFocus) || []).length;
  const actionable = (text.match(QUALITY_PATTERNS.actionable) || []).length;
  const measurable = (text.match(QUALITY_PATTERNS.measurable) || []).length;
  const headingCount = (text.match(/^#+\s+.+$/gm) || []).length;
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    quantified,
    businessFocus,
    actionable,
    measurable,
    headingCount,
    wordCount,
    hasStructure: headingCount >= MIN_HEADINGS_FOR_STRUCTURE,
    hasSubstance: wordCount >= MIN_WORDS_FOR_SUBSTANCE,
  };
}

/**
 * Score a dimension based on content
 * @param {string} text - Document text
 * @param {Object} dimension - Scoring dimension config
 * @returns {Object} Score and issues
 */
export function scoreDimension(text, dimension) {
  const maxPoints = dimension.maxPoints;
  const issues = [];
  let score = 0;

  // Base score from content quality
  const quality = analyzeContentQuality(text);
  const sections = detectSections(text);

  // Points for having structure
  if (quality.hasStructure) {
    score += Math.floor(maxPoints * STRUCTURE_SCORE_WEIGHT);
  } else {
    issues.push('Add more section headings for clarity');
  }

  // Points for quantified content
  if (quality.quantified >= QUANTIFIED_FULL_POINTS_THRESHOLD) {
    score += Math.floor(maxPoints * QUANTIFIED_FULL_WEIGHT);
  } else if (quality.quantified > 0) {
    score += Math.floor(maxPoints * QUANTIFIED_PARTIAL_WEIGHT);
    issues.push('Add more quantified data (numbers, percentages, metrics)');
  } else {
    issues.push('Include specific numbers and metrics');
  }

  // Points for substance
  if (quality.wordCount >= WORD_COUNT_FULL_POINTS) {
    score += Math.floor(maxPoints * SUBSTANCE_FULL_WEIGHT);
  } else if (quality.wordCount >= WORD_COUNT_PARTIAL_POINTS) {
    score += Math.floor(maxPoints * SUBSTANCE_PARTIAL_WEIGHT);
    issues.push('Consider adding more detail');
  } else {
    issues.push('Content is too brief - add more substance');
  }

  // Points for section coverage
  if (sections.found.length >= SECTION_COUNT_FULL_POINTS) {
    score += Math.floor(maxPoints * COVERAGE_FULL_WEIGHT);
  } else if (sections.found.length >= SECTION_COUNT_PARTIAL_POINTS) {
    score += Math.floor(maxPoints * COVERAGE_PARTIAL_WEIGHT);
    issues.push(
      `Missing sections: ${sections.missing
        .slice(0, 3)
        .map((s) => s.name)
        .join(', ')}`
    );
  }

  return {
    score: Math.min(score, maxPoints),
    maxScore: maxPoints,
    issues,
  };
}


/**
 * Document Validator - Scoring Logic
 *
 * Plugin-agnostic document validation that uses plugin scoringDimensions
 * to evaluate document quality.
 *
 * @module validator
 */

import { calculateSlopScore, getSlopPenalty } from './slop-scoring.js';
import {
  MIN_HEADINGS_FOR_STRUCTURE,
  MIN_WORDS_FOR_SUBSTANCE,
  QUANTIFIED_FULL_POINTS_THRESHOLD,
  WORD_COUNT_FULL_POINTS,
  WORD_COUNT_PARTIAL_POINTS,
  SECTION_COUNT_FULL_POINTS,
  SECTION_COUNT_PARTIAL_POINTS,
  GRADE_A_THRESHOLD,
  GRADE_B_THRESHOLD,
  GRADE_C_THRESHOLD,
  GRADE_D_THRESHOLD,
  COLOR_GREEN_THRESHOLD,
  COLOR_YELLOW_THRESHOLD,
  COLOR_ORANGE_THRESHOLD,
  LABEL_EXCELLENT_THRESHOLD,
  LABEL_READY_THRESHOLD,
  LABEL_NEEDS_WORK_THRESHOLD,
  LABEL_DRAFT_THRESHOLD,
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

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Detection Functions
// ============================================================================

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
function scoreDimension(text, dimension) {
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

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Detect if text is a prompt/instructions rather than a document
 * @param {string} text - Text to check
 * @returns {Object} Detection result with isPrompt flag and indicators
 */
export function detectPrompt(text) {
  const indicators = [];

  // Check for common prompt patterns
  const promptPatterns = [
    { pattern: /^you are (a|an) /im, name: 'Role assignment ("You are a...")' },
    { pattern: /your task is to/i, name: 'Task instruction' },
    { pattern: /## (CRITICAL|IMPORTANT) INSTRUCTIONS/i, name: 'Instruction header' },
    { pattern: /<output_rules>/i, name: 'Output rules tag' },
    { pattern: /\{\{[A-Z_]+\}\}/g, name: 'Template variables ({{VAR}})' },
    { pattern: /❌ \*\*NEVER use/i, name: 'Banned language section' },
    { pattern: /## (Your Task|Context|Source Materials)/i, name: 'Prompt section headers' },
    { pattern: /COPY-PASTE READY/i, name: 'Output format instruction' },
    { pattern: /Ask me clarifying questions/i, name: 'Clarification request' },
    { pattern: /Based on the materials above/i, name: 'Reference to input materials' },
  ];

  for (const { pattern, name } of promptPatterns) {
    if (pattern.test(text)) {
      indicators.push(name);
    }
  }

  // If 3+ indicators, it's likely a prompt
  const isPrompt = indicators.length >= 3;

  return { isPrompt, indicators, indicatorCount: indicators.length };
}

/**
 * Validate a document using plugin dimensions
 * @param {string} text - Document text to validate
 * @param {Object} plugin - Plugin configuration with scoringDimensions
 * @returns {Object} Validation result with scores
 */
export function validateDocument(text, plugin) {
  if (!text || !text.trim()) {
    return createEmptyResult(plugin);
  }

  // Check if this is a prompt rather than a document
  const promptDetection = detectPrompt(text);
  if (promptDetection.isPrompt) {
    return createPromptDetectedResult(plugin, promptDetection);
  }

  // USE PLUGIN-SPECIFIC VALIDATOR IF AVAILABLE
  // Each plugin can define its own validateDocument function with domain-specific
  // scoring patterns (e.g., PRD checks for metrics, JD checks for inclusivity)
  if (plugin?.validateDocument && typeof plugin.validateDocument === 'function') {
    return plugin.validateDocument(text);
  }

  // Fall back to generic dimension-based scoring if no plugin-specific validator
  const dimensions = plugin?.scoringDimensions || getDefaultDimensions();
  const results = {};
  let totalScore = 0;
  const allIssues = [];

  // Score each dimension
  dimensions.forEach((dim, index) => {
    const dimResult = scoreDimension(text, dim);
    results[dim.name] = dimResult;
    results[`dimension${index + 1}`] = dimResult; // For app.js compatibility
    totalScore += dimResult.score;
    allIssues.push(...dimResult.issues);
  });

  // Apply slop penalty
  const slopResult = calculateSlopScore(text);
  const slopPenaltyResult = getSlopPenalty(text);
  const slopPenalty = slopPenaltyResult.penalty || 0;
  totalScore = Math.max(0, totalScore - slopPenalty);

  return {
    totalScore,
    ...results,
    slopDetection: {
      score: slopResult.score,
      severity: slopResult.severity,
      penalty: slopPenalty,
      issues: slopPenaltyResult.issues || [],
    },
    issues: allIssues,
  };
}

/**
 * Create empty result when no text provided
 */
function createEmptyResult(plugin) {
  const dimensions = plugin?.scoringDimensions || getDefaultDimensions();
  const results = { totalScore: 0, issues: ['No content to validate'] };

  dimensions.forEach((dim, index) => {
    const empty = { score: 0, maxScore: dim.maxPoints, issues: [] };
    results[dim.name] = empty;
    results[`dimension${index + 1}`] = empty;
  });

  return results;
}

/**
 * Create result when prompt is detected instead of document
 */
function createPromptDetectedResult(plugin, promptDetection) {
  const dimensions = plugin?.scoringDimensions || getDefaultDimensions();
  const mainIssue = `⚠️ This appears to be a PROMPT, not a document. Detected ${promptDetection.indicatorCount} prompt indicators: ${promptDetection.indicators.slice(0, 3).join(', ')}${promptDetection.indicators.length > 3 ? '...' : ''}`;
  const results = {
    totalScore: 0,
    issues: [mainIssue, 'Paste the AI-generated OUTPUT, not the prompt you gave to the AI.'],
    isPromptDetected: true,
  };

  dimensions.forEach((dim, index) => {
    const empty = { score: 0, maxScore: dim.maxPoints, issues: [] };
    results[dim.name] = empty;
    results[`dimension${index + 1}`] = empty;
  });

  return results;
}

/**
 * Get default dimensions if plugin not provided
 */
function getDefaultDimensions() {
  return [
    { name: 'Content Quality', maxPoints: 25, description: 'Overall content quality' },
    { name: 'Structure', maxPoints: 25, description: 'Document organization' },
    { name: 'Completeness', maxPoints: 25, description: 'Coverage of key topics' },
    { name: 'Clarity', maxPoints: 25, description: 'Clear and actionable content' },
  ];
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Get letter grade from numeric score
 * @param {number} score - Numeric score 0-100
 * @returns {string} Letter grade
 */
export function getGrade(score) {
  if (score >= GRADE_A_THRESHOLD) return 'A';
  if (score >= GRADE_B_THRESHOLD) return 'B';
  if (score >= GRADE_C_THRESHOLD) return 'C';
  if (score >= GRADE_D_THRESHOLD) return 'D';
  return 'F';
}

/**
 * Get color based on score for UI display
 * @param {number} score - Numeric score 0-100
 * @returns {string} Color name
 */
export function getScoreColor(score) {
  if (score >= COLOR_GREEN_THRESHOLD) return 'green';
  if (score >= COLOR_YELLOW_THRESHOLD) return 'yellow';
  if (score >= COLOR_ORANGE_THRESHOLD) return 'orange';
  return 'red';
}

/**
 * Get label based on score for UI display
 * @param {number} score - Numeric score 0-100
 * @returns {string} Score label
 */
export function getScoreLabel(score) {
  if (score >= LABEL_EXCELLENT_THRESHOLD) return 'Excellent';
  if (score >= LABEL_READY_THRESHOLD) return 'Ready';
  if (score >= LABEL_NEEDS_WORK_THRESHOLD) return 'Needs Work';
  if (score >= LABEL_DRAFT_THRESHOLD) return 'Draft';
  return 'Incomplete';
}

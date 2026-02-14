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
} from './validator-config.js';

// Import and re-export detection functions for backward compatibility
import {
  detectSections as _detectSections,
  analyzeContentQuality as _analyzeContentQuality,
  scoreDimension,
} from './validator-detection.js';

// Re-export for direct access
export { calculateSlopScore };
export const detectSections = _detectSections;
export const analyzeContentQuality = _analyzeContentQuality;

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

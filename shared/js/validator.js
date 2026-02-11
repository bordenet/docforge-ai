/**
 * Document Validator - Scoring Logic
 *
 * Plugin-agnostic document validation that uses plugin scoringDimensions
 * to evaluate document quality.
 *
 * @module validator
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Section Detection Patterns
// ============================================================================

const COMMON_SECTIONS = [
  { pattern: /^#+\s*(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^#+\s*(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^#+\s*(goal|objective|benefit|outcome)/im, name: 'Goals/Benefits', weight: 2 },
  { pattern: /^#+\s*(scope|in.scope|out.of.scope|boundary)/im, name: 'Scope Definition', weight: 2 },
  { pattern: /^#+\s*(success|metric|kpi|measure)/im, name: 'Success Metrics', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner|raci)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^#+\s*(timeline|milestone|phase|schedule)/im, name: 'Timeline/Milestones', weight: 1 },
  { pattern: /^#+\s*(risk|assumption|mitigation|dependency)/im, name: 'Risks/Assumptions', weight: 1 },
  { pattern: /^#+\s*(background|context|why)/im, name: 'Background/Context', weight: 1 },
  { pattern: /^#+\s*(requirement|acceptance|criteria)/im, name: 'Requirements', weight: 1 }
];

// Content quality patterns
const QUALITY_PATTERNS = {
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi,
  actionable: /\b(will|shall|must|should|enable|provide|deliver|implement|build|create)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|achieve|target|goal)\b/gi
};

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
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  return {
    quantified,
    businessFocus,
    actionable,
    measurable,
    headingCount,
    wordCount,
    hasStructure: headingCount >= 3,
    hasSubstance: wordCount >= 100
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
    score += Math.floor(maxPoints * 0.3);
  } else {
    issues.push('Add more section headings for clarity');
  }

  // Points for quantified content
  if (quality.quantified >= 3) {
    score += Math.floor(maxPoints * 0.25);
  } else if (quality.quantified > 0) {
    score += Math.floor(maxPoints * 0.15);
    issues.push('Add more quantified data (numbers, percentages, metrics)');
  } else {
    issues.push('Include specific numbers and metrics');
  }

  // Points for substance
  if (quality.wordCount >= 200) {
    score += Math.floor(maxPoints * 0.25);
  } else if (quality.wordCount >= 100) {
    score += Math.floor(maxPoints * 0.15);
    issues.push('Consider adding more detail');
  } else {
    issues.push('Content is too brief - add more substance');
  }

  // Points for section coverage
  if (sections.found.length >= 5) {
    score += Math.floor(maxPoints * 0.2);
  } else if (sections.found.length >= 3) {
    score += Math.floor(maxPoints * 0.1);
    issues.push(`Missing sections: ${sections.missing.slice(0, 3).map(s => s.name).join(', ')}`);
  }

  return {
    score: Math.min(score, maxPoints),
    maxScore: maxPoints,
    issues
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

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
      issues: slopPenaltyResult.issues || []
    },
    issues: allIssues
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
 * Get default dimensions if plugin not provided
 */
function getDefaultDimensions() {
  return [
    { name: 'Content Quality', maxPoints: 25, description: 'Overall content quality' },
    { name: 'Structure', maxPoints: 25, description: 'Document organization' },
    { name: 'Completeness', maxPoints: 25, description: 'Coverage of key topics' },
    { name: 'Clarity', maxPoints: 25, description: 'Clear and actionable content' }
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
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get color based on score for UI display
 * @param {number} score - Numeric score 0-100
 * @returns {string} Color name
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

/**
 * Get label based on score for UI display
 * @param {number} score - Numeric score 0-100
 * @returns {string} Score label
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}


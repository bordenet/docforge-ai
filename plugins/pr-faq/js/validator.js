/**
 * PR-FAQ Validator - Main Entry Point
 * Validates PR-FAQ documents with 5 scoring dimensions
 */

import { calculateSlopScore } from '../../../shared/js/slop-scoring.js';
import { stripMarkdown, extractTitle } from './validator-utils.js';
import { scoreCustomerEvidence, detectMetricsInText } from './validator-customer-evidence.js';
import { scoreStructureAndHook } from './validator-structure.js';
import { scoreContentQuality } from './validator-content.js';
import { scoreProfessionalQuality, detectFluffWords } from './validator-professional.js';
import { scoreFAQQuality } from './validator-faq.js';

// Re-export for direct access
export { calculateSlopScore, detectMetricsInText, detectFluffWords };

/**
 * Main validation entry point
 * Scoring: Structure (20), Content (20), Professional (15), Evidence (10), FAQ Quality (35)
 * @param {string} markdown - Raw PR-FAQ markdown content
 * @returns {Object} Complete validation result
 */
export function validatePRFAQ(markdown) {
  if (!markdown || markdown.trim().length === 0) {
    return {
      totalScore: 0,
      maxScore: 100,
      structure: { score: 0, maxScore: 20, issues: ['No content to analyze'], strengths: [] },
      content: { score: 0, maxScore: 20, issues: ['No content to analyze'], strengths: [] },
      professional: { score: 0, maxScore: 15, issues: ['No content to analyze'], strengths: [] },
      evidence: { score: 0, maxScore: 10, issues: ['No content to analyze'], strengths: [] },
      faqQuality: { score: 0, maxScore: 35, issues: ['No content to analyze'], strengths: [] },
      issues: ['No content to analyze'],
      strengths: [],
      fluffWords: [],
    };
  }

  // Extract title and strip markdown
  const title = extractTitle(markdown);
  const plainText = stripMarkdown(markdown);

  // Run all dimension scorers
  const structure = scoreStructureAndHook(plainText, title);
  const content = scoreContentQuality(plainText);
  const professional = scoreProfessionalQuality(plainText);
  const evidence = scoreCustomerEvidence(plainText);
  const faqQuality = scoreFAQQuality(markdown); // Use raw markdown to find FAQ sections

  // Calculate total score
  let totalScore = structure.score + content.score + professional.score + evidence.score + faqQuality.score;

  // FAQ PENALTY: If Internal FAQ is missing or contains only "softball" questions, cap at 50
  let penaltyApplied = false;
  if (faqQuality.softballPenalty || faqQuality.internalCount === 0) {
    if (totalScore > 50) {
      totalScore = 50;
      penaltyApplied = true;
    }
  }

  // Combine all issues and strengths (deduplicated)
  const allIssues = [...new Set([
    ...structure.issues,
    ...content.issues,
    ...professional.issues,
    ...evidence.issues,
    ...faqQuality.issues,
  ])];

  // Add penalty warning if applied
  if (penaltyApplied) {
    allIssues.unshift('⚠️ SCORE CAPPED AT 50: Internal FAQ is missing or contains only softball questions');
  }

  const allStrengths = [...new Set([
    ...structure.strengths,
    ...content.strengths,
    ...professional.strengths,
    ...evidence.strengths,
    ...faqQuality.strengths,
  ])];

  return {
    totalScore,
    maxScore: 100,
    structure,
    content,
    professional,
    evidence,
    faqQuality,
    // Dimension mappings for app.js compatibility
    dimension1: structure,
    dimension2: content,
    dimension3: professional,
    dimension4: evidence,
    dimension5: faqQuality,
    issues: allIssues,
    strengths: allStrengths,
    fluffWords: professional.fluffWords || [],
    penaltyApplied,
  };
}

/**
 * Wrapper for validatePRFAQ - provides consistent API for UI components
 * @param {string} text - The markdown text to validate
 * @returns {Object} Validation result with totalScore and category breakdowns
 */
export function validateDocument(text) {
  return validatePRFAQ(text);
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


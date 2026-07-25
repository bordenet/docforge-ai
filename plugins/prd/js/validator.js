/**
 * PRD Validator - Main Validation Function
 *
 * Scoring Dimensions (100 pts total):
 * 1. Document Structure (20 pts) - Section presence, organization, formatting
 * 2. Requirements Clarity (25 pts) - Precision, completeness, consistency
 * 3. User Focus (20 pts) - Personas, problem statement, alignment
 * 4. Technical Quality (15 pts) - Non-functional reqs, acceptance criteria, traceability
 * 5. Strategic Viability (20 pts) - Metric validity, scope realism, traceability
 */

import { getSlopPenalty, calculateSlopScore } from '../../../shared/js/slop-scoring.js';
import { getLengthPenalty } from '../../../shared/js/length-scoring.js';
import { normalizeText } from '../../../shared/js/validator.js';
import {
  scoreDocumentStructure,
  scoreRequirementsClarity,
  scoreUserFocus,
  scoreTechnicalQuality,
} from './validator-scoring.js';
import { scoreStrategicViability } from './validator-strategic.js';
import { detectExpansionStubs } from './validator-detection.js';

// Upper-bound word targets by declared Document Scope (see config.js formFields).
// These mirror the targets stated in the Phase 1 prompt itself, so the score
// enforces the same ceiling the LLM was asked to write to. Unset/unknown scope
// defaults to 'feature' -- the prompt's own stated default -- rather than
// inferring scope from the word count, which would let any long document
// grade itself into a bigger bucket and dodge the penalty entirely.
const SCOPE_TARGET_WORDS = {
  feature: 1500,
  epic: 3000,
  product: 6000,
};

// Re-export detection functions for external use
export {
  detectSections,
  detectVagueQualifiers,
  detectVagueLanguage,
  detectPrioritization,
  detectCustomerEvidence,
  detectScopeBoundaries,
  detectValueProposition,
  detectUserPersonas,
  detectProblemStatement,
  detectNonFunctionalRequirements,
  detectExpansionStubs,
  inferDocumentScope,
} from './validator-detection.js';

// Re-export requirements functions
export {
  countUserStories,
  countFunctionalRequirements,
  countAcceptanceCriteria,
  countMeasurableRequirements,
} from './validator-requirements.js';

// Re-export scoring functions
export {
  scoreDocumentStructure,
  scoreRequirementsClarity,
  scoreUserFocus,
  scoreTechnicalQuality,
} from './validator-scoring.js';
export { scoreStrategicViability } from './validator-strategic.js';

// Re-export slop detection for direct access
export { calculateSlopScore };

/**
 * Validate a PRD and return comprehensive scoring results
 * @param {string} text - PRD content
 * @param {Object} [formData] - Project form data; formData.documentScope selects the length target
 * @returns {Object} Complete validation results
 */
export function validatePRD(text, formData) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      userFocus: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      technical: { score: 0, maxScore: 15, issues: ['No content to validate'], strengths: [] },
      strategicViability: {
        score: 0,
        maxScore: 20,
        issues: ['No content to validate'],
        strengths: [],
      },
    };
  }

  // Normalize text to strip invisible Unicode characters (ZWS, BOM, NBSP, etc.)
  // that cause non-deterministic scoring across different copy-paste sources.
  // Without this, the same document can score 17+ points differently depending
  // on whether it was pasted from Claude, Gemini, or a rich text editor.
  const normalized = normalizeText(text);

  const structure = scoreDocumentStructure(normalized);
  const clarity = scoreRequirementsClarity(normalized);
  const userFocus = scoreUserFocus(normalized);
  const technical = scoreTechnicalQuality(normalized);
  const strategicViability = scoreStrategicViability(normalized);

  // Detect intentional expansion stubs from length checkpoint feature
  const expansionStubs = detectExpansionStubs(normalized);

  // AI slop detection (aligned with inline validator)
  const slopPenalty = getSlopPenalty(normalized);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  // Length penalty - scoped to the document's declared Document Scope so a
  // correctly-brief Feature PRD isn't compared against a Product-scope target.
  const targetWords = SCOPE_TARGET_WORDS[formData?.documentScope] || SCOPE_TARGET_WORDS.feature;
  const lengthPenalty = getLengthPenalty(normalized, targetWords, { maxPenalty: 12 });
  if (lengthPenalty.penalty > 0 && !formData?.documentScope) {
    // The standalone Validator tool (paste-a-document, no project form data) has no
    // Document Scope selector, so this always defaults to the Feature target. Disclose
    // that assumption rather than let a legitimately long Epic/Product PRD read as
    // silently "bloated" with no explanation (llm-skill-review finding, 2026-07-25).
    lengthPenalty.issues.push(
      `Scored against the Feature-scope target (${targetWords} words) because no Document Scope was declared -- ` +
        'if this is intentionally an Epic or Product-scope document, note that and re-check.'
    );
  }

  const totalScore = Math.max(
    0,
    structure.score +
      clarity.score +
      userFocus.score +
      technical.score +
      strategicViability.score -
      slopDeduction -
      lengthPenalty.penalty
  );

  // Aggregate all issues from all dimensions for the assistant completion banner
  // (views-phase.js reads validationResult.issues for improvement suggestions)
  const allIssues = [
    ...structure.issues,
    ...clarity.issues,
    ...userFocus.issues,
    ...technical.issues,
    ...strategicViability.issues,
    ...slopIssues,
    ...lengthPenalty.issues,
  ];

  return {
    totalScore,
    structure,
    clarity,
    userFocus,
    technical,
    strategicViability,
    // Dimension mappings for app.js compatibility
    dimension1: structure,
    dimension2: clarity,
    dimension3: userFocus,
    dimension4: technical,
    dimension5: strategicViability,
    vagueQualifiers: clarity.vagueQualifiers,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues,
    },
    lengthCheck: lengthPenalty,
    // Top-level issues array for assistant completion banner display
    issues: allIssues,
    // Expansion stubs from length checkpoint feature (informational, no penalty)
    expansionStubs,
  };
}

/**
 * Alias for backward compatibility with assistant UI
 */
export function validateDocument(text, formData) {
  return validatePRD(text, formData);
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';

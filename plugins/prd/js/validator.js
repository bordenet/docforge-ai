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
import { scoreDocumentStructure, scoreRequirementsClarity, scoreUserFocus, scoreTechnicalQuality } from './validator-scoring.js';
import { scoreStrategicViability } from './validator-strategic.js';

// Re-export detection functions for external use
export {
  detectSections, detectVagueQualifiers, detectVagueLanguage, detectPrioritization,
  detectCustomerEvidence, detectScopeBoundaries, detectValueProposition,
  detectUserPersonas, detectProblemStatement, detectNonFunctionalRequirements,
  detectExpansionStubs,
} from './validator-detection.js';

import { detectExpansionStubs } from './validator-detection.js';

// Re-export requirements functions
export { countUserStories, countFunctionalRequirements, countAcceptanceCriteria, countMeasurableRequirements } from './validator-requirements.js';

// Re-export scoring functions
export { scoreDocumentStructure, scoreRequirementsClarity, scoreUserFocus, scoreTechnicalQuality } from './validator-scoring.js';
export { scoreStrategicViability } from './validator-strategic.js';

// Re-export slop detection for direct access
export { calculateSlopScore };

/**
 * Validate a PRD and return comprehensive scoring results
 * @param {string} text - PRD content
 * @returns {Object} Complete validation results
 */
export function validatePRD(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      structure: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      clarity: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      userFocus: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      technical: { score: 0, maxScore: 15, issues: ['No content to validate'], strengths: [] },
      strategicViability: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
    };
  }

  const structure = scoreDocumentStructure(text);
  const clarity = scoreRequirementsClarity(text);
  const userFocus = scoreUserFocus(text);
  const technical = scoreTechnicalQuality(text);
  const strategicViability = scoreStrategicViability(text);

  // Detect intentional expansion stubs from length checkpoint feature
  const expansionStubs = detectExpansionStubs(text);

  // AI slop detection (aligned with inline validator)
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    structure.score + clarity.score + userFocus.score + technical.score + strategicViability.score - slopDeduction
  );

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
    // Expansion stubs from length checkpoint feature (informational, no penalty)
    expansionStubs,
  };
}

/**
 * Alias for backward compatibility with assistant UI
 */
export function validateDocument(text) {
  return validatePRD(text);
}

// Re-export scoring helper functions from shared module for consistency
export { getGrade, getScoreColor, getScoreLabel } from '../../../shared/js/validator.js';


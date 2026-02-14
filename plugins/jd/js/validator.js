/**
 * JD Validator - Main Entry Point
 *
 * Validates job descriptions for inclusive language, structure, and best practices.
 * Re-exports from sub-modules for backward compatibility.
 */

// Re-export detection functions for testing
export {
  extractMandatedSections,
  isInMandatedSection,
  detectMasculineCoded,
  detectExtrovertBias,
  detectRedFlags,
  detectCompensation,
  detectEncouragement,
  detectWordCount
} from './validator-detection.js';

// Re-export scoring functions for testing
export {
  scoreWordCount,
  scoreMasculineCoded,
  scoreExtrovertBias,
  scoreRedFlags,
  scoreCompensation,
  scoreEncouragement,
  scoreSlopPenalty
} from './validator-scoring.js';

// Re-export main validation functions
export {
  validateJDContent,
  validateDocument
} from './validator-main.js';

// Re-export UI helper functions
export {
  getGrade,
  getScoreColor,
  getScoreLabel
} from './validator-results.js';


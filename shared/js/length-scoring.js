/**
 * Length Scoring Module
 *
 * Penalizes documents that run well past their target length. Complements
 * slop-scoring.js: a document can be lexically clean (no buzzwords, no
 * filler phrases) and still be a bloated read because it padded out every
 * optional section instead of staying focused. For decision documents
 * (ADRs, PRDs) that readers are expected to get through quickly, length
 * itself is a quality dimension.
 *
 * @module length-scoring
 */

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate a length penalty based on how far a document's word count
 * exceeds its target ceiling. Penalty scales with how far over target the
 * document is, capped at maxPenalty so this never dominates the score the
 * way a missing required section would.
 *
 * @param {string} text - Document content
 * @param {number} targetWords - Expected upper bound for this document type/scope
 * @param {Object} [options]
 * @param {number} [options.maxPenalty] - Cap on the deduction (default 10)
 * @returns {{ penalty: number, wordCount: number, targetWords: number, ratio: number, issues: string[] }}
 */
export function getLengthPenalty(text, targetWords, options = {}) {
  const maxPenalty = options.maxPenalty ?? 10;
  const wordCount = countWords(text);
  const ratio = targetWords > 0 ? wordCount / targetWords : 0;

  let penalty = 0;
  const issues = [];

  if (ratio > 2.5) {
    penalty = maxPenalty;
    issues.push(
      `${wordCount} words -- more than 2.5x the ~${targetWords}-word target. This reads as several documents stitched together; cut ruthlessly or split it.`
    );
  } else if (ratio > 2.0) {
    penalty = Math.round(maxPenalty * 0.7);
    issues.push(
      `${wordCount} words -- over 2x the ~${targetWords}-word target. Remove sections that don't change a reader's decision.`
    );
  } else if (ratio > 1.5) {
    penalty = Math.round(maxPenalty * 0.4);
    issues.push(
      `${wordCount} words -- 1.5x the ~${targetWords}-word target. Tighten prose and drop optional sections.`
    );
  } else if (ratio > 1.2) {
    penalty = Math.round(maxPenalty * 0.2);
    issues.push(`${wordCount} words -- modestly over the ~${targetWords}-word target.`);
  }

  return { penalty, wordCount, targetWords, ratio, issues };
}

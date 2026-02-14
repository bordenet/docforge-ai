/**
 * PRD Validator Requirements Functions
 * Functions for counting and analyzing requirements
 */

import {
  USER_STORY_PATTERN,
  FUNCTIONAL_REQ_PATTERN,
  DOOR_TYPE_PATTERN,
  PROBLEM_LINK_PATTERN,
  ACCEPTANCE_CRITERIA_PATTERN,
  AC_KEYWORD_PATTERN,
  MEASURABLE_PATTERN,
} from './validator-config.js';

/**
 * Count user stories in text
 * @param {string} text - Text to analyze
 * @returns {number} Number of user stories found
 */
export function countUserStories(text) {
  const matches = text.match(USER_STORY_PATTERN) || [];
  return matches.length;
}

/**
 * Count functional requirements in text (FR1, FR2, etc.)
 * @param {string} text - Text to analyze
 * @returns {Object} Functional requirements detection results
 */
export function countFunctionalRequirements(text) {
  const frMatches = text.match(FUNCTIONAL_REQ_PATTERN) || [];
  const doorTypeMatches = text.match(DOOR_TYPE_PATTERN) || [];
  const problemLinkMatches = text.match(PROBLEM_LINK_PATTERN) || [];

  // Deduplicate FR IDs (FR1 might appear multiple times)
  const uniqueFRs = [...new Set(frMatches.map(fr => fr.toUpperCase()))];

  return {
    count: uniqueFRs.length,
    hasDoorTypes: doorTypeMatches.length > 0,
    doorTypeCount: doorTypeMatches.length,
    hasProblemLinks: problemLinkMatches.length > 0,
    problemLinkCount: problemLinkMatches.length,
    // Quality score: FRs with door types and problem links are higher quality
    qualityScore: uniqueFRs.length > 0 ? (
      (doorTypeMatches.length > 0 ? 2 : 0) +
      (problemLinkMatches.length > 0 ? 2 : 0) +
      Math.min(uniqueFRs.length, 3)
    ) : 0,
  };
}

/**
 * Count acceptance criteria in text
 * Detects both inline "given...when...then" and markdown "**Given**" bullet format
 * @param {string} text - Text to analyze
 * @returns {number} Number of acceptance criteria found
 */
export function countAcceptanceCriteria(text) {
  // Count inline given/when/then patterns
  const inlineMatches = text.match(ACCEPTANCE_CRITERIA_PATTERN) || [];
  // Count structured bullet-point Given keywords (each represents one AC)
  const bulletMatches = text.match(AC_KEYWORD_PATTERN) || [];
  // Return max to avoid double-counting same criteria in different formats
  return Math.max(inlineMatches.length, bulletMatches.length);
}

/**
 * Count measurable requirements in text
 * @param {string} text - Text to analyze
 * @returns {number} Number of measurable requirements found
 */
export function countMeasurableRequirements(text) {
  const matches = text.match(MEASURABLE_PATTERN) || [];
  return matches.length;
}


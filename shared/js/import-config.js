/**
 * Import Document Configuration Constants
 * @module import-config
 */

// ============================================================================
// Title Extraction Constants
// ============================================================================

/** Maximum lines to scan at the top of a document for title extraction */
export const TITLE_SCAN_LINE_LIMIT = 20;

/** Maximum character length for a valid title */
export const MAX_TITLE_LENGTH = 100;

/** Maximum length for first-line title candidates (shorter than full titles to filter sentences) */
export const MAX_FIRST_LINE_TITLE_LENGTH = 80;

/** Minimum length for non-empty lines to be considered as title candidates */
export const MIN_LINE_LENGTH_FOR_TITLE = 5;

// ============================================================================
// Markdown Confidence Scoring Constants
// ============================================================================

/** Points per header match (e.g., # ## ###) */
export const CONFIDENCE_HEADER_POINTS = 15;
/** Maximum points for headers */
export const CONFIDENCE_HEADER_MAX = 40;
/** Points per bold text match */
export const CONFIDENCE_BOLD_POINTS = 5;
/** Maximum points for bold text */
export const CONFIDENCE_BOLD_MAX = 20;
/** Points per italic match */
export const CONFIDENCE_ITALIC_POINTS = 3;
/** Maximum points for italic */
export const CONFIDENCE_ITALIC_MAX = 10;
/** Points per list item */
export const CONFIDENCE_LIST_POINTS = 2;
/** Maximum points for lists */
export const CONFIDENCE_LIST_MAX = 15;
/** Points per ordered list item */
export const CONFIDENCE_ORDERED_LIST_POINTS = 2;
/** Maximum points for ordered lists */
export const CONFIDENCE_ORDERED_LIST_MAX = 10;
/** Points for presence of code blocks */
export const CONFIDENCE_CODE_BLOCK_POINTS = 10;
/** Points per inline code match */
export const CONFIDENCE_INLINE_CODE_POINTS = 2;
/** Maximum points for inline code */
export const CONFIDENCE_INLINE_CODE_MAX = 10;
/** Points per link match */
export const CONFIDENCE_LINK_POINTS = 3;
/** Maximum points for links */
export const CONFIDENCE_LINK_MAX = 10;
/** Points per table row match */
export const CONFIDENCE_TABLE_POINTS = 2;
/** Maximum points for tables */
export const CONFIDENCE_TABLE_MAX = 10;
/** Points per blockquote match */
export const CONFIDENCE_QUOTE_POINTS = 2;
/** Maximum points for blockquotes */
export const CONFIDENCE_QUOTE_MAX = 5;

/** Minimum confidence score to treat text as markdown */
export const MIN_MARKDOWN_CONFIDENCE = 10;
/** Confidence threshold for adding H1 normalization */
export const H1_NORMALIZATION_THRESHOLD = 15;

// ============================================================================
// Generic Section Headers
// ============================================================================

/** Patterns that match generic section headers (not real titles) */
export const GENERIC_HEADER_PATTERNS = [
  /^problem\s*statement$/i,
  /^cost\s*of\s*doing\s*nothing$/i,
  /^proposed\s*solution$/i,
  /^key\s*goals?\/?\s*benefits?$/i,
  /^success\s*metrics?$/i,
  /^key\s*stakeholders?$/i,
  /^timeline$/i,
  /^budget\s*impact$/i,
  /^scope$/i,
  /^appendix/i,
  /^executive\s*summary$/i,
  /^overview$/i,
  /^background$/i,
  /^introduction$/i,
  /^conclusion$/i,
];

/**
 * Check if text is a generic section header (not a real title)
 * @param {string} text - Text to check
 * @returns {boolean} True if it's a generic section header
 */
export function isGenericSectionHeader(text) {
  return GENERIC_HEADER_PATTERNS.some((pattern) => pattern.test(text.trim()));
}


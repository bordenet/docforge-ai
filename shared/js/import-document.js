/**
 * Import Document Module
 * Handles importing existing documents from Word/Google Docs via paste
 * @module import-document
 */

import { logger } from './logger.js';
import {
  TITLE_SCAN_LINE_LIMIT,
  MAX_TITLE_LENGTH,
  MAX_FIRST_LINE_TITLE_LENGTH,
  MIN_LINE_LENGTH_FOR_TITLE,
  CONFIDENCE_HEADER_POINTS,
  CONFIDENCE_HEADER_MAX,
  CONFIDENCE_BOLD_POINTS,
  CONFIDENCE_BOLD_MAX,
  CONFIDENCE_ITALIC_POINTS,
  CONFIDENCE_ITALIC_MAX,
  CONFIDENCE_LIST_POINTS,
  CONFIDENCE_LIST_MAX,
  CONFIDENCE_ORDERED_LIST_POINTS,
  CONFIDENCE_ORDERED_LIST_MAX,
  CONFIDENCE_CODE_BLOCK_POINTS,
  CONFIDENCE_INLINE_CODE_POINTS,
  CONFIDENCE_INLINE_CODE_MAX,
  CONFIDENCE_LINK_POINTS,
  CONFIDENCE_LINK_MAX,
  CONFIDENCE_TABLE_POINTS,
  CONFIDENCE_TABLE_MAX,
  CONFIDENCE_QUOTE_POINTS,
  CONFIDENCE_QUOTE_MAX,
  MIN_MARKDOWN_CONFIDENCE,
  H1_NORMALIZATION_THRESHOLD,
  isGenericSectionHeader,
} from './import-config.js';

/**
 * Extract title from the BEGINNING of markdown (first N lines only)
 * This prevents grabbing titles from appendices or other sections
 * @param {string} markdown - Markdown content
 * @param {string} docType - Document type name
 * @returns {string|null} Extracted title or null
 */
export function extractTitleFromMarkdown(markdown, docType) {
  if (!markdown) return null;

  // Only look at the first N lines to avoid grabbing appendix titles
  const lines = markdown.split('\n').slice(0, TITLE_SCAN_LINE_LIMIT);
  const topContent = lines.join('\n');

  // Strategy 1: H1 header at the top (# Title)
  const h1Match = topContent.match(/^#\s+(.+?)(?:\n|$)/m);
  if (h1Match) {
    const title = h1Match[1].replace(new RegExp(`^${docType}:\\s*`, 'i'), '').trim();
    // Skip generic section headers
    if (title && title.length > 0 && !isGenericSectionHeader(title)) {
      return title;
    }
  }

  // Strategy 2: H2 header at the top (## Title) - but not section headers
  const h2Match = topContent.match(/^##\s+(.+?)(?:\n|$)/m);
  if (h2Match) {
    const title = h2Match[1].trim();
    if (
      title &&
      title.length > 0 &&
      title.length <= MAX_TITLE_LENGTH &&
      !isGenericSectionHeader(title)
    ) {
      return title;
    }
  }

  // Strategy 3: First bold text at the top (**Title** or __Title__)
  // But skip if it looks like a label (ends with :) or is a generic header
  const boldMatch = topContent.match(/^\*\*(.+?)\*\*|^__(.+?)__/m);
  if (boldMatch) {
    const title = (boldMatch[1] || boldMatch[2]).trim();
    // Skip labels (end with :) and generic headers
    if (
      title &&
      title.length > 0 &&
      title.length <= MAX_TITLE_LENGTH &&
      !title.endsWith(':') &&
      !isGenericSectionHeader(title)
    ) {
      return title;
    }
  }

  // Strategy 4: First non-empty line that looks like a title
  // Skip: section headers, labels, sentences (too long or contains periods)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^[-=*]{3,}$/.test(trimmed) || trimmed.length < MIN_LINE_LENGTH_FOR_TITLE)
      continue;
    const cleaned = trimmed
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, ' ')
      .trim();
    // Skip if:
    // - Empty or too long (probably a sentence)
    // - Ends with : (label) or . (sentence ending)
    // - Contains . followed by space (sentence with multiple clauses)
    // - Is a generic section header
    if (
      cleaned.length > 0 &&
      cleaned.length <= MAX_FIRST_LINE_TITLE_LENGTH &&
      !cleaned.endsWith(':') &&
      !cleaned.endsWith('.') &&
      !/\.\s/.test(cleaned) &&
      !isGenericSectionHeader(cleaned)
    ) {
      return cleaned;
    }
  }

  // No valid title found - return null to trigger fallback
  return null;
}

/**
 * Compute markdown confidence score (0-100)
 * Higher score = more likely to be markdown
 * @param {string} text - Text content
 * @returns {number} Confidence score 0-100
 */
function computeMarkdownConfidence(text) {
  if (!text) return 0;

  let score = 0;

  // Headers (# ## ### etc) - strong indicator
  const headerMatches = text.match(/^#{1,6}\s+/gm) || [];
  score += Math.min(headerMatches.length * CONFIDENCE_HEADER_POINTS, CONFIDENCE_HEADER_MAX);

  // Bold **text** - strong indicator
  const boldMatches = text.match(/\*\*[^*\n]+\*\*/g) || [];
  score += Math.min(boldMatches.length * CONFIDENCE_BOLD_POINTS, CONFIDENCE_BOLD_MAX);

  // Italic *text* (but not list items)
  const italicMatches = text.match(/(?<!\*)\*[^*\n]+\*(?!\*)/g) || [];
  score += Math.min(italicMatches.length * CONFIDENCE_ITALIC_POINTS, CONFIDENCE_ITALIC_MAX);

  // Unordered lists (- or * at start of line)
  const listMatches = text.match(/^\s*[-*+]\s+\S/gm) || [];
  score += Math.min(listMatches.length * CONFIDENCE_LIST_POINTS, CONFIDENCE_LIST_MAX);

  // Ordered lists (1. 2. etc)
  const orderedMatches = text.match(/^\s*\d+\.\s+/gm) || [];
  score += Math.min(
    orderedMatches.length * CONFIDENCE_ORDERED_LIST_POINTS,
    CONFIDENCE_ORDERED_LIST_MAX
  );

  // Code blocks or inline code
  if (/```/.test(text)) score += CONFIDENCE_CODE_BLOCK_POINTS;
  const inlineCodeMatches = text.match(/`[^`\n]+`/g) || [];
  score += Math.min(
    inlineCodeMatches.length * CONFIDENCE_INLINE_CODE_POINTS,
    CONFIDENCE_INLINE_CODE_MAX
  );

  // Links [text](url)
  const linkMatches = text.match(/\[[^\]]+\]\([^)]+\)/g) || [];
  score += Math.min(linkMatches.length * CONFIDENCE_LINK_POINTS, CONFIDENCE_LINK_MAX);

  // Tables |col|col|
  const tableMatches = text.match(/^\|.+\|$/gm) || [];
  score += Math.min(tableMatches.length * CONFIDENCE_TABLE_POINTS, CONFIDENCE_TABLE_MAX);

  // Blockquotes
  const quoteMatches = text.match(/^\s*>/gm) || [];
  score += Math.min(quoteMatches.length * CONFIDENCE_QUOTE_POINTS, CONFIDENCE_QUOTE_MAX);

  return Math.min(score, 100);
}

/**
 * Check if text content contains markdown syntax
 * @param {string} text - Plain text content
 * @returns {boolean} True if text contains markdown patterns
 */
function containsMarkdownSyntax(text) {
  return computeMarkdownConfidence(text) >= MIN_MARKDOWN_CONFIDENCE;
}

/**
 * Normalize markdown by adding H1 title if missing
 * If the markdown has no H1 but appears to be valid markdown,
 * prepend a title using the document type
 * @param {string} markdown - Markdown content
 * @param {string} docType - Document type name (e.g., "One-Pager")
 * @returns {string} Normalized markdown with H1 title
 */
export function normalizeMarkdown(markdown, docType) {
  if (!markdown || !markdown.trim()) return markdown;

  // Check if markdown already has an H1
  const hasH1 = /^#\s+[^#]/m.test(markdown);
  if (hasH1) {
    return markdown; // Already has H1, no normalization needed
  }

  // Compute confidence that this is markdown
  const confidence = computeMarkdownConfidence(markdown);

  // If confidence is high enough (has markdown syntax), add H1
  if (confidence >= H1_NORMALIZATION_THRESHOLD) {
    // Prepend H1 with document type
    return `# ${docType}\n\n${markdown}`;
  }

  // Low confidence - might be plain text, don't modify
  return markdown;
}

/**
 * Convert HTML to Markdown using Turndown (if available)
 * If content already contains markdown syntax, return plain text to preserve it
 * @param {string} html - HTML content from paste
 * @returns {string} Markdown content
 */
export function convertHtmlToMarkdown(html) {
  // First, extract plain text
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const plainText = temp.textContent || temp.innerText || '';

  // If the plain text contains markdown syntax, return it directly
  // This handles cases where:
  // 1. User pastes plain markdown (browser wraps in divs)
  // 2. User pastes from rich editor that preserved markdown in text
  if (containsMarkdownSyntax(plainText)) {
    return plainText.trim();
  }

  // If Turndown isn't available, return plain text
  if (typeof TurndownService === 'undefined') {
    logger.warn('Turndown not loaded, returning plain text', 'import-document');
    return plainText;
  }

  // Use Turndown for rich HTML content that has no markdown syntax
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  return turndownService.turndown(html);
}

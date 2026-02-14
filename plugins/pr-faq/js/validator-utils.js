/**
 * PR-FAQ Validator Utilities
 * Text extraction and processing functions
 */

/**
 * Extract customer quotes from text
 * @param {string} content - Text content
 * @returns {string[]} Array of quotes
 */
export function extractQuotes(content) {
  const quotes = [];

  // Quote patterns - standard and curly quotes
  const patterns = [
    /"([^"]+)"/g,           // Standard double quotes
    /\u201C([^\u201D]+)\u201D/g,  // Curly double quotes
    /'([^']+)'/g,           // Single quotes
    /\u2018([^\u2019]+)\u2019/g,  // Curly single quotes
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const quote = match[1].trim();
      // Filter out very short quotes (likely not customer testimonials)
      if (quote.length > 20) {
        quotes.push(quote);
      }
    }
  }

  return quotes;
}

/**
 * Extract press release content from markdown (handles preamble)
 * @param {string} markdown - Raw markdown content
 * @returns {string} Press release content only
 */
export function extractPressRelease(markdown) {
  // Look for "## Press Release" section marker
  const prMatch = markdown.match(/^##\s*Press\s*Release\s*$/im);
  if (prMatch) {
    const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
    let content = markdown.slice(startIdx);

    // Stop at FAQ section if present
    const faqMatch = content.match(/^##\s*FAQ/im);
    if (faqMatch) {
      content = content.slice(0, content.indexOf(faqMatch[0]));
    }
    return content.trim();
  }
  return markdown;
}

/**
 * Strip markdown formatting for text analysis
 * @param {string} markdown - Raw markdown content
 * @returns {string} Plain text content
 */
export function stripMarkdown(markdown) {
  // First extract just the press release if there's a preamble
  const prContent = extractPressRelease(markdown);

  return prContent
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract title from markdown
 * Handles: H1 headers, or first line after "## Press Release"
 * @param {string} markdown - Raw markdown content
 * @returns {string} Title or empty string
 */
export function extractTitle(markdown) {
  // First try: H1 header
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Second try: First non-empty line after "## Press Release"
  const prMatch = markdown.match(/^##\s*Press\s*Release\s*$/im);
  if (prMatch) {
    const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
    const afterPR = markdown.slice(startIdx).trim();
    const lines = afterPR.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      // First line is likely the title
      return lines[0].trim();
    }
  }

  return '';
}


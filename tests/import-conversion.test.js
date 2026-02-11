/**
 * Import Conversion Tests
 * Tests for HTML to Markdown conversion and markdown normalization
 */

import { describe, test, expect } from '@jest/globals';
import { convertHtmlToMarkdown, normalizeMarkdown } from '../shared/js/import-document.js';

describe('Import Conversion', () => {
  describe('convertHtmlToMarkdown', () => {
    test('should return plain text when Turndown is not available', () => {
      // Turndown is not available in test environment
      const html = '<p>Hello <strong>World</strong></p>';
      const result = convertHtmlToMarkdown(html);
      // Should extract text content
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    test('should handle empty HTML', () => {
      const result = convertHtmlToMarkdown('');
      expect(result).toBe('');
    });

    test('should handle complex HTML structure', () => {
      const html = `
        <h1>Title</h1>
        <p>First paragraph.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      `;
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Title');
      expect(result).toContain('First paragraph');
      expect(result).toContain('Item 1');
    });

    test('should extract text from nested elements', () => {
      const html = '<div><span><strong>Nested</strong> text</span></div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Nested');
      expect(result).toContain('text');
    });

    test('should handle special characters', () => {
      const html = '<p>Code: &lt;script&gt; &amp; symbols</p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('<script>');
      expect(result).toContain('&');
    });

    test('should preserve plain markdown without escaping', () => {
      // When user pastes markdown, browser wraps it in divs
      const html =
        '<div># My Document Title</div><div></div><div>## Section 1</div><div>Some content here.</div>';
      const result = convertHtmlToMarkdown(html);
      // Should NOT escape the # character
      expect(result).toContain('# My Document Title');
      expect(result).toContain('## Section 1');
      expect(result).not.toContain('\\#');
    });

    test('should preserve markdown lists', () => {
      const html = '<div>- Item 1</div><div>- Item 2</div><div>- Item 3</div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('- Item 1');
      expect(result).toContain('- Item 2');
    });

    test('should preserve markdown bold and italic', () => {
      const html = '<div>This is **bold** and *italic* text.</div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('**bold**');
      expect(result).toContain('*italic*');
    });

    test('should preserve markdown code blocks', () => {
      const html =
        '<div>Here is `inline code` and:</div><div>```javascript</div><div>const x = 1;</div><div>```</div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('`inline code`');
      expect(result).toContain('```');
    });

    test('should preserve markdown even when pasted from rich editor with HTML tags', () => {
      // This simulates pasting from Notion/Google Docs where the HTML has rich tags
      // but the text content still contains markdown syntax
      const html = `
        <h2>## Problem Statement</h2>
        <p>Current development hardware cannot run multiple AI agents.</p>
        <p><strong>**Measured impact:**</strong> 30 minutes of daily wait time.</p>
        <ul>
          <li>* **Productivity Loss:** 10 hours per month</li>
          <li>* **Workflow Constraint:** Single-agent limitation</li>
        </ul>
        <table><tr><td>| Option | Price |</td></tr></table>
      `;
      const result = convertHtmlToMarkdown(html);
      // Should preserve the markdown syntax, not escape it
      expect(result).toContain('## Problem Statement');
      expect(result).toContain('**Measured impact:**');
      expect(result).toContain('**Productivity Loss:**');
      expect(result).not.toContain('\\#');
      expect(result).not.toContain('\\*');
    });

    test('should preserve markdown tables', () => {
      const html =
        '<div>| Option | Price |</div><div>|----|----|</div><div>| Framework | $1,500 |</div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('| Option | Price |');
      expect(result).toContain('| Framework | $1,500 |');
    });
  });

  describe('normalizeMarkdown', () => {
    test('should add H1 title when markdown has no H1 but has markdown syntax', () => {
      const markdown = `## Problem Statement

Current development hardware cannot run multiple AI agents.

**Measured impact:** 30 minutes wasted per context switch.

- Issue 1
- Issue 2`;

      const result = normalizeMarkdown(markdown, 'One-Pager');
      expect(result).toMatch(/^# One-Pager\n\n/);
      expect(result).toContain('## Problem Statement');
    });

    test('should NOT add H1 when markdown already has H1', () => {
      const markdown = `# My Existing Title

## Problem Statement

Some content here.`;

      const result = normalizeMarkdown(markdown, 'One-Pager');
      expect(result).toBe(markdown);
      expect(result).not.toMatch(/^# One-Pager/);
    });

    test('should NOT modify plain text with low markdown confidence', () => {
      const plainText = `This is just plain text.
It has no markdown syntax at all.
Just regular sentences.`;

      const result = normalizeMarkdown(plainText, 'One-Pager');
      expect(result).toBe(plainText);
    });

    test('should add H1 when markdown has headers and bold text', () => {
      const markdown = `## Section One

**Important:** This is critical.

### Subsection

More content here.`;

      const result = normalizeMarkdown(markdown, 'ADR');
      expect(result).toMatch(/^# ADR\n\n/);
    });

    test('should add H1 when markdown has lists and code', () => {
      const markdown = `## Features

- Feature 1
- Feature 2
- Feature 3

\`\`\`javascript
const x = 1;
\`\`\``;

      const result = normalizeMarkdown(markdown, 'PRD');
      expect(result).toMatch(/^# PRD\n\n/);
    });

    test('should handle empty input', () => {
      expect(normalizeMarkdown('', 'One-Pager')).toBe('');
      expect(normalizeMarkdown(null, 'One-Pager')).toBe(null);
    });

    test('should handle user sample markdown (no H1, starts with H2)', () => {
      // This is the actual user's markdown that was causing issues
      const markdown = `## Problem Statement

Current development hardware (5-year-old Surface 4 with i7-11185G7, 16GB RAM) cannot run multiple AI agents simultaneously. A single Cursor instance consumes 2–4GB RAM during active use.

**Measured impact:** 30 minutes wasted per context switch.

## Cost of Doing Nothing

**Productivity Loss:** 2.5 hours/day × $150/hour = $375/day`;

      const result = normalizeMarkdown(markdown, 'One-Pager');
      // Should prepend H1 with document type
      expect(result).toMatch(/^# One-Pager\n\n/);
      // Original content should be preserved
      expect(result).toContain('## Problem Statement');
      expect(result).toContain('**Measured impact:**');
    });
  });
});


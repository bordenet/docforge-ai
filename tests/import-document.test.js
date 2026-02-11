/**
 * Import Document Module Tests
 * Tests for HTML to Markdown conversion and import functionality
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  convertHtmlToMarkdown,
  getImportModalHtml,
  showImportModal,
  normalizeMarkdown,
} from '../shared/js/import-document.js';

describe('Import Document Module', () => {
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

  describe('getImportModalHtml', () => {
    test('should generate modal HTML with document type', () => {
      const html = getImportModalHtml('One-Pager');
      expect(html).toContain('Import Existing One-Pager');
      expect(html).toContain('import-modal');
    });

    test('should include paste area', () => {
      const html = getImportModalHtml('PRD');
      expect(html).toContain('import-paste-area');
      expect(html).toContain('contenteditable="true"');
    });

    test('should include convert button', () => {
      const html = getImportModalHtml('ADR');
      expect(html).toContain('import-convert-btn');
      expect(html).toContain('Convert to Markdown');
    });

    test('should include preview area', () => {
      const html = getImportModalHtml('Power Statement');
      expect(html).toContain('import-preview-area');
      expect(html).toContain('import-preview-step');
    });

    test('should include save button', () => {
      const html = getImportModalHtml('PR-FAQ');
      expect(html).toContain('import-save-btn');
      expect(html).toContain('Save & Continue to Phase 2'); // Import skips to Phase 2 for review
    });

    test('should include cancel button', () => {
      const html = getImportModalHtml('Business Justification');
      expect(html).toContain('import-cancel-btn');
      expect(html).toContain('Cancel');
    });

    test('should include close button', () => {
      const html = getImportModalHtml('Strategic Proposal');
      expect(html).toContain('import-modal-close');
    });
  });

  describe('showImportModal', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    test('should add modal to document body', () => {
      const plugin = { name: 'One-Pager', dbName: 'test-db' };
      const saveProject = jest.fn();
      const onComplete = jest.fn();

      showImportModal(plugin, saveProject, onComplete);

      expect(document.getElementById('import-modal')).not.toBeNull();
    });

    test('should close modal when close button is clicked', () => {
      const plugin = { name: 'PRD', dbName: 'test-db' };
      showImportModal(plugin, jest.fn(), jest.fn());

      const closeBtn = document.getElementById('import-modal-close');
      closeBtn.click();

      expect(document.getElementById('import-modal')).toBeNull();
    });

    test('should close modal when cancel button is clicked', () => {
      const plugin = { name: 'ADR', dbName: 'test-db' };
      showImportModal(plugin, jest.fn(), jest.fn());

      const cancelBtn = document.getElementById('import-cancel-btn');
      cancelBtn.click();

      expect(document.getElementById('import-modal')).toBeNull();
    });

    test('should focus paste area on open', () => {
      const plugin = { name: 'Test', dbName: 'test-db' };
      showImportModal(plugin, jest.fn(), jest.fn());

      const pasteArea = document.getElementById('import-paste-area');
      expect(document.activeElement).toBe(pasteArea);
    });

    test('should save with currentPhase 2 and phase 1 completed when importing', async () => {
      const plugin = { name: 'One-Pager', dbName: 'test-db' };
      let savedProject = null;
      const saveProject = jest.fn().mockImplementation((dbName, data) => {
        savedProject = { id: 'test-123', ...data };
        return Promise.resolve(savedProject);
      });
      const onComplete = jest.fn();

      showImportModal(plugin, saveProject, onComplete);

      // Simulate pasting markdown
      const pasteArea = document.getElementById('import-paste-area');
      pasteArea.innerHTML = '# My Document Title\n\nSome content here.';

      // Click convert
      const convertBtn = document.getElementById('import-convert-btn');
      convertBtn.click();

      // Click save
      const saveBtn = document.getElementById('import-save-btn');
      await saveBtn.click();

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify save was called with correct structure
      expect(saveProject).toHaveBeenCalled();
      const savedData = saveProject.mock.calls[0][1];
      expect(savedData.currentPhase).toBe(2); // Should skip to Phase 2
      expect(savedData.phases[1].completed).toBe(true); // Phase 1 should be complete
      expect(savedData.phases[1].response).toContain('My Document Title'); // Content saved
      expect(savedData.isImported).toBe(true);
    });

    test('should normalize markdown and use doc type as title when no H1 present', async () => {
      const plugin = { name: 'One-Pager', dbName: 'test-db' };
      const saveProject = jest.fn().mockImplementation((dbName, data) => {
        return Promise.resolve({ id: 'test-456', ...data });
      });
      const onComplete = jest.fn();

      showImportModal(plugin, saveProject, onComplete);

      // Simulate pasting markdown that starts with a section header (like user's actual doc)
      // This markdown has NO H1 title - just starts with ## Problem Statement
      // normalizeMarkdown will add "# One-Pager" at the top
      const pasteArea = document.getElementById('import-paste-area');
      pasteArea.innerHTML = `## Problem Statement

Current development hardware (5-year-old Surface 4 with i7-11185G7, 16GB RAM) cannot run multiple AI agents simultaneously. A single Cursor instance consumes 2–4GB RAM during active use.

**Measured impact:** 30 minutes wasted per context switch.`;

      // Click convert
      const convertBtn = document.getElementById('import-convert-btn');
      convertBtn.click();

      // Click save
      const saveBtn = document.getElementById('import-save-btn');
      await saveBtn.click();

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 10));

      // normalizeMarkdown adds "# One-Pager" when no H1 is present
      // extractTitleFromMarkdown then extracts "One-Pager" from that H1
      expect(saveProject).toHaveBeenCalled();
      const savedData = saveProject.mock.calls[0][1];
      expect(savedData.title).toBe('One-Pager'); // Title extracted from auto-added H1
      expect(savedData.currentPhase).toBe(2);
      expect(savedData.phases[1].completed).toBe(true);
    });

    test('should extract proper title from H1 header', async () => {
      const plugin = { name: 'ADR', dbName: 'test-db' };
      const saveProject = jest.fn().mockImplementation((dbName, data) => {
        return Promise.resolve({ id: 'test-789', ...data });
      });
      const onComplete = jest.fn();

      showImportModal(plugin, saveProject, onComplete);

      // Simulate pasting markdown with a proper H1 title
      const pasteArea = document.getElementById('import-paste-area');
      pasteArea.innerHTML = `# Use React Query for API State Management

## Context

We need a consistent way to handle API state in our React application.

## Decision

We will use React Query for all API state management.`;

      // Click convert
      const convertBtn = document.getElementById('import-convert-btn');
      convertBtn.click();

      // Click save
      const saveBtn = document.getElementById('import-save-btn');
      await saveBtn.click();

      // Wait for async save
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify title is extracted from H1
      expect(saveProject).toHaveBeenCalled();
      const savedData = saveProject.mock.calls[0][1];
      expect(savedData.title).toBe('Use React Query for API State Management');
    });
  });
});

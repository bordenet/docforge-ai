/**
 * Import Document Module Tests
 * Tests for HTML to Markdown conversion and import functionality
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  convertHtmlToMarkdown,
  getImportModalHtml,
  showImportModal
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
      const html = '<div># My Document Title</div><div></div><div>## Section 1</div><div>Some content here.</div>';
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
      const html = '<div>Here is `inline code` and:</div><div>```javascript</div><div>const x = 1;</div><div>```</div>';
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
      const html = '<div>| Option | Price |</div><div>|----|----|</div><div>| Framework | $1,500 |</div>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('| Option | Price |');
      expect(result).toContain('| Framework | $1,500 |');
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
      expect(html).toContain('Save & Continue to Phase 1');
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
  });
});


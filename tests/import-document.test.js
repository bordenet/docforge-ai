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


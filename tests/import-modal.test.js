/**
 * Import Modal Tests
 * Tests for import modal UI generation and interaction
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { getImportModalHtml, showImportModal } from '../shared/js/import-modal.js';

describe('Import Modal', () => {
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
      expect(html).toContain('Save & Continue to Phase 2');
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
      expect(savedData.currentPhase).toBe(2);
      expect(savedData.phases[1].completed).toBe(true);
      expect(savedData.phases[1].response).toContain('My Document Title');
      expect(savedData.isImported).toBe(true);
    });

    test('should normalize markdown and use doc type as title when no H1 present', async () => {
      const plugin = { name: 'One-Pager', dbName: 'test-db' };
      const saveProject = jest.fn().mockImplementation((dbName, data) => {
        return Promise.resolve({ id: 'test-456', ...data });
      });
      const onComplete = jest.fn();

      showImportModal(plugin, saveProject, onComplete);

      // Simulate pasting markdown that starts with a section header
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
      expect(saveProject).toHaveBeenCalled();
      const savedData = saveProject.mock.calls[0][1];
      expect(savedData.title).toBe('One-Pager');
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


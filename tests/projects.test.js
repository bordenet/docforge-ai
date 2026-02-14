/**
 * Projects Module Tests
 * Tests for pure functions and async functions with IndexedDB
 */

import {
  describe, it, test, expect, beforeEach, afterAll,
} from '@jest/globals';
import {
  extractTitleFromMarkdown,
  sanitizeFilename,
  updatePhase,
  updateProject,
  importProjects,
} from '../shared/js/projects.js';
import { saveProject, getProject, clearAllProjects } from '../shared/js/storage.js';

describe('Projects Module', () => {
  describe('extractTitleFromMarkdown', () => {
    it('should return empty string for null/undefined input', () => {
      expect(extractTitleFromMarkdown(null)).toBe('');
      expect(extractTitleFromMarkdown(undefined)).toBe('');
      expect(extractTitleFromMarkdown('')).toBe('');
    });

    it('should extract H1 header as title', () => {
      const markdown = '# My Project Title\n\nSome content here.';
      expect(extractTitleFromMarkdown(markdown)).toBe('My Project Title');
    });

    it('should skip generic PRESS RELEASE header', () => {
      const markdown = '# PRESS RELEASE\n\n**Acme Corp Launches New Product**\n\nContent...';
      expect(extractTitleFromMarkdown(markdown)).toBe('Acme Corp Launches New Product');
    });

    it('should skip Press Release (case insensitive)', () => {
      const markdown = '# Press Release\n\n**Big News Today**\n\nContent...';
      expect(extractTitleFromMarkdown(markdown)).toBe('Big News Today');
    });

    it('should extract bold headline after PRESS RELEASE', () => {
      const markdown = '# PRESS RELEASE\n\n**Company Announces Major Update**\n\nDetails follow...';
      expect(extractTitleFromMarkdown(markdown)).toBe('Company Announces Major Update');
    });

    it('should extract first bold line as fallback', () => {
      const markdown = 'Some intro text\n\n**This Is The Title Here**\n\nMore content...';
      expect(extractTitleFromMarkdown(markdown)).toBe('This Is The Title Here');
    });

    it('should not use short bold text as title', () => {
      const markdown = 'Some text **bold** more text';
      expect(extractTitleFromMarkdown(markdown)).toBe('');
    });

    it('should not use bold text ending with period as title', () => {
      const markdown = '**This is a sentence that ends with a period.**';
      expect(extractTitleFromMarkdown(markdown)).toBe('');
    });

    it('should handle markdown with only content, no headers', () => {
      const markdown = 'Just some plain text without any headers or bold.';
      expect(extractTitleFromMarkdown(markdown)).toBe('');
    });

    it('should handle H1 with extra whitespace', () => {
      const markdown = '#   Spaced Title   \n\nContent';
      expect(extractTitleFromMarkdown(markdown)).toBe('Spaced Title');
    });

    it('should handle H1 in the middle of document', () => {
      const markdown = 'Some preamble\n\n# Main Title\n\nContent';
      expect(extractTitleFromMarkdown(markdown)).toBe('Main Title');
    });

    it('should prefer H1 over bold text', () => {
      const markdown = '# Title From Header\n\n**Bold Text Here**';
      expect(extractTitleFromMarkdown(markdown)).toBe('Title From Header');
    });

    it('should handle multiple bold texts, use first one that matches criteria', () => {
      // The implementation only looks at the FIRST bold match
      // Short text (< 10 chars) is rejected, so we get empty
      const markdown = '**Short** and **This Is A Longer Bold Title**';
      expect(extractTitleFromMarkdown(markdown)).toBe('');
    });

    it('should use first bold text if it meets length requirements', () => {
      const markdown = '**This Is Long Enough To Be A Title**';
      expect(extractTitleFromMarkdown(markdown)).toBe('This Is Long Enough To Be A Title');
    });

    it('should handle PR-FAQ format with section heading', () => {
      const markdown = '# PRESS RELEASE\n\n## Headline\n\n**Big Announcement From Company**';
      expect(extractTitleFromMarkdown(markdown)).toBe('Big Announcement From Company');
    });
  });

  describe('sanitizeFilename', () => {
    it('should convert to lowercase', () => {
      expect(sanitizeFilename('MyFile')).toBe('myfile');
    });

    it('should replace special characters with hyphens', () => {
      expect(sanitizeFilename('My File Name!')).toBe('my-file-name');
    });

    it('should collapse multiple hyphens', () => {
      expect(sanitizeFilename('My---File')).toBe('my-file');
    });

    it('should remove leading/trailing hyphens', () => {
      expect(sanitizeFilename('--My File--')).toBe('my-file');
    });

    it('should truncate to 50 characters', () => {
      const longName = 'a'.repeat(100);
      expect(sanitizeFilename(longName).length).toBe(50);
    });

    it('should handle null/undefined', () => {
      expect(sanitizeFilename(null)).toBe('untitled');
      expect(sanitizeFilename(undefined)).toBe('untitled');
    });

    it('should handle empty string', () => {
      expect(sanitizeFilename('')).toBe('untitled');
    });

    it('should handle string with only special characters', () => {
      // sanitizeFilename uses || 'untitled' only if the INPUT is falsy
      // For '!@#$%', it becomes '' after processing, but doesn't fallback
      const result = sanitizeFilename('!@#$%');
      expect(result).toBe('');
    });

    it('should handle unicode characters', () => {
      expect(sanitizeFilename('Café Report')).toBe('caf-report');
    });

    it('should handle numbers', () => {
      expect(sanitizeFilename('Report 2024 Q1')).toBe('report-2024-q1');
    });

    it('should handle multiple spaces', () => {
      expect(sanitizeFilename('My    Spaced    File')).toBe('my-spaced-file');
    });
  });

  // Integration tests for async functions using actual IndexedDB
  describe('updatePhase', () => {
    const TEST_DB = 'projects-test-db';

    beforeEach(async () => {
      await clearAllProjects(TEST_DB);
    });

    afterAll(async () => {
      await clearAllProjects(TEST_DB);
    });

    test('throws error for non-existent project', async () => {
      await expect(updatePhase(TEST_DB, 'non-existent', 1, 'prompt', 'response'))
        .rejects.toThrow('Project not found');
    });

    test('initializes phases object if not present', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-1', title: 'Test' });

      const updated = await updatePhase(TEST_DB, project.id, 1, 'Prompt 1', 'Response 1');

      expect(updated.phases).toBeDefined();
      expect(updated.phases[1]).toBeDefined();
      expect(updated.phases[1].prompt).toBe('Prompt 1');
      expect(updated.phases[1].response).toBe('Response 1');
      expect(updated.phases[1].completed).toBe(true);
    });

    test('stores prompt and response in phase object', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-2', title: 'Test' });

      const updated = await updatePhase(TEST_DB, project.id, 2, 'My Prompt', 'My Response');

      expect(updated.phases[2].prompt).toBe('My Prompt');
      expect(updated.phases[2].response).toBe('My Response');
    });

    test('sets completed to true when response is provided', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-3', title: 'Test' });

      const updated = await updatePhase(TEST_DB, project.id, 1, 'Prompt', 'Response');

      expect(updated.phases[1].completed).toBe(true);
    });

    test('sets completed to false when response is empty', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-4', title: 'Test' });

      const updated = await updatePhase(TEST_DB, project.id, 1, 'Prompt', '');

      expect(updated.phases[1].completed).toBe(false);
    });

    test('maintains legacy flat phase output fields', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-5', title: 'Test' });

      await updatePhase(TEST_DB, project.id, 1, 'P1', 'Output 1');
      const updated = await updatePhase(TEST_DB, project.id, 2, 'P2', 'Output 2');

      expect(updated.phase1_output).toBe('Output 1');
      expect(updated.phase2_output).toBe('Output 2');
    });

    test('auto-advances phase when response is provided', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-6', title: 'Test', currentPhase: 1 });

      const updated = await updatePhase(TEST_DB, project.id, 1, 'P1', 'Response');

      expect(updated.currentPhase).toBe(2);
      expect(updated.phase).toBe(2);
    });

    test('does not auto-advance when skipAutoAdvance is true', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-7', title: 'Test', currentPhase: 1 });

      const updated = await updatePhase(TEST_DB, project.id, 1, 'P1', 'Response', { skipAutoAdvance: true });

      expect(updated.currentPhase).toBe(1);
    });

    test('does not auto-advance from phase 3', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-8', title: 'Test', currentPhase: 3 });

      const updated = await updatePhase(TEST_DB, project.id, 3, 'P3', 'Final output');

      expect(updated.currentPhase).toBe(3);
    });

    test('does not extract title if project already has default Untitled title', async () => {
      // When saved without title, storage sets 'Untitled' as default
      const project = await saveProject(TEST_DB, { id: 'test-9' });
      expect(project.title).toBe('Untitled'); // Storage sets default

      // Since project.title is now 'Untitled' (truthy), it won't extract
      const markdown = '# Amazing Project Title\n\nContent here...';
      const updated = await updatePhase(TEST_DB, project.id, 3, 'P3', markdown);

      // Title remains 'Untitled' because condition checks !project.title
      expect(updated.title).toBe('Untitled');
    });

    test('does not overwrite existing title from phase 3', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-10', title: 'User Title' });

      const markdown = '# New Title\n\nContent...';
      const updated = await updatePhase(TEST_DB, project.id, 3, 'P3', markdown);

      expect(updated.title).toBe('User Title');
    });

    test('does not overwrite title from formData', async () => {
      const project = await saveProject(TEST_DB, { id: 'test-11', formData: { title: 'Form Title' } });

      const markdown = '# New Title\n\nContent...';
      const updated = await updatePhase(TEST_DB, project.id, 3, 'P3', markdown);

      expect(updated.title).not.toBe('New Title');
    });
  });

  describe('updateProject', () => {
    const TEST_DB = 'projects-update-test-db';

    beforeEach(async () => {
      await clearAllProjects(TEST_DB);
    });

    afterAll(async () => {
      await clearAllProjects(TEST_DB);
    });

    test('throws error for non-existent project', async () => {
      await expect(updateProject(TEST_DB, 'non-existent', { title: 'New' }))
        .rejects.toThrow('Project not found');
    });

    test('updates project with provided fields', async () => {
      const project = await saveProject(TEST_DB, { id: 'upd-1', title: 'Original' });

      const updated = await updateProject(TEST_DB, project.id, {
        title: 'Updated Title',
        description: 'New description',
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('New description');
    });

    test('preserves existing fields not in updates', async () => {
      const project = await saveProject(TEST_DB, {
        id: 'upd-2', title: 'Title', formData: { field: 'value' },
      });

      const updated = await updateProject(TEST_DB, project.id, { currentPhase: 2 });

      expect(updated.title).toBe('Title');
      expect(updated.formData.field).toBe('value');
      expect(updated.currentPhase).toBe(2);
    });
  });

  describe('importProjects', () => {
    const TEST_DB = 'projects-import-test-db';

    beforeEach(async () => {
      await clearAllProjects(TEST_DB);
    });

    afterAll(async () => {
      await clearAllProjects(TEST_DB);
    });

    // Helper to create a mock File from JSON
    function createMockFile(content, filename = 'test.json') {
      const blob = new Blob([JSON.stringify(content)], { type: 'application/json' });
      return new File([blob], filename, { type: 'application/json' });
    }

    test('imports single project format', async () => {
      const projectData = { id: 'import-1', title: 'Imported Project', name: 'Test' };
      const file = createMockFile(projectData);

      const imported = await importProjects(TEST_DB, file);

      expect(imported).toBe(1);

      const project = await getProject(TEST_DB, 'import-1');
      expect(project.title).toBe('Imported Project');
    });

    test('imports backup file format with multiple projects', async () => {
      const backupData = {
        version: '1.0',
        pluginId: 'test',
        exportedAt: new Date().toISOString(),
        projectCount: 2,
        projects: [
          { id: 'backup-1', title: 'Project 1' },
          { id: 'backup-2', title: 'Project 2' },
        ],
      };
      const file = createMockFile(backupData);

      const imported = await importProjects(TEST_DB, file);

      expect(imported).toBe(2);

      const p1 = await getProject(TEST_DB, 'backup-1');
      const p2 = await getProject(TEST_DB, 'backup-2');
      expect(p1.title).toBe('Project 1');
      expect(p2.title).toBe('Project 2');
    });

    test('rejects invalid file format', async () => {
      const invalidData = { someField: 'value', otherField: 123 };
      const file = createMockFile(invalidData);

      await expect(importProjects(TEST_DB, file)).rejects.toThrow('Invalid file format');
    });

    test('rejects invalid JSON', async () => {
      const blob = new Blob(['not valid json {'], { type: 'application/json' });
      const file = new File([blob], 'bad.json', { type: 'application/json' });

      await expect(importProjects(TEST_DB, file)).rejects.toThrow();
    });

    test('imports empty backup file (zero projects)', async () => {
      const backupData = {
        version: '1.0',
        pluginId: 'test',
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: [],
      };
      const file = createMockFile(backupData);

      const imported = await importProjects(TEST_DB, file);

      expect(imported).toBe(0);
    });

    test('accepts project with name but no title', async () => {
      // Single project format requires id and (title OR name)
      const projectData = { id: 'name-only', name: 'Project Name' };
      const file = createMockFile(projectData);

      const imported = await importProjects(TEST_DB, file);

      expect(imported).toBe(1);
    });
  });
});

/**
 * Projects Module Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  extractTitleFromMarkdown,
  updatePhase,
  updateProject,
  sanitizeFilename,
  exportProject,
  exportAllProjects,
  importProjects
} from '../shared/js/projects.js';

// Mock storage module
jest.unstable_mockModule('../shared/js/storage.js', () => ({
  saveProject: jest.fn(),
  getProject: jest.fn(),
  getAllProjects: jest.fn(),
  deleteProject: jest.fn()
}));

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
      expect(sanitizeFilename('!@#$%')).toBe('untitled');
    });
  });
});


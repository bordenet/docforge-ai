/**
 * Projects Module Tests
 * Tests for pure functions that don't require storage mocking
 */

import { describe, it, expect } from '@jest/globals';
import {
  extractTitleFromMarkdown,
  sanitizeFilename
} from '../shared/js/projects.js';

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
});


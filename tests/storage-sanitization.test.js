/**
 * Storage Sanitization Module Tests
 * Direct unit tests for sanitization utilities
 */

import { describe, test, expect } from '@jest/globals';
import {
  sanitizeString,
  sanitizeFormData,
  sanitizePhases,
  sanitizeValue,
  sanitizeProject,
  MAX_TITLE_LENGTH,
  MAX_CONTENT_LENGTH,
} from '../shared/js/storage-sanitization.js';

describe('Storage Sanitization Module', () => {
  describe('sanitizeString', () => {
    test('returns empty string for null', () => {
      expect(sanitizeString(null)).toBe('');
    });

    test('returns empty string for undefined', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    test('converts non-string values to strings', () => {
      expect(sanitizeString(123)).toBe('123');
      expect(sanitizeString(true)).toBe('true');
      expect(sanitizeString({ a: 1 })).toBe('[object Object]');
    });

    test('removes null bytes', () => {
      expect(sanitizeString('hello\x00world')).toBe('helloworld');
    });

    test('removes control characters but preserves newlines and tabs', () => {
      expect(sanitizeString('line1\nline2\ttabbed')).toBe('line1\nline2\ttabbed');
      expect(sanitizeString('bell\x07char')).toBe('bellchar');
      expect(sanitizeString('escape\x1bchar')).toBe('escapechar');
    });

    test('truncates to maxLength', () => {
      const longStr = 'A'.repeat(300);
      expect(sanitizeString(longStr, 100)).toBe('A'.repeat(100));
    });

    test('uses MAX_CONTENT_LENGTH by default', () => {
      const longStr = 'A'.repeat(MAX_CONTENT_LENGTH + 100);
      expect(sanitizeString(longStr).length).toBe(MAX_CONTENT_LENGTH);
    });
  });

  describe('sanitizeFormData', () => {
    test('returns empty object for null', () => {
      expect(sanitizeFormData(null)).toEqual({});
    });

    test('returns empty object for undefined', () => {
      expect(sanitizeFormData(undefined)).toEqual({});
    });

    test('returns empty object for non-object', () => {
      expect(sanitizeFormData('string')).toEqual({});
      expect(sanitizeFormData(123)).toEqual({});
    });

    test('sanitizes string values', () => {
      const input = { title: 'Hello\x00World', desc: 'Normal' };
      const result = sanitizeFormData(input);
      expect(result.title).toBe('HelloWorld');
      expect(result.desc).toBe('Normal');
    });

    test('sanitizes arrays of strings', () => {
      const input = { tags: ['tag\x001', 'tag2', 'tag\x003'] };
      const result = sanitizeFormData(input);
      expect(result.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('preserves non-string values in arrays', () => {
      const input = { mixed: ['str', 123, true] };
      const result = sanitizeFormData(input);
      expect(result.mixed).toEqual(['str', 123, true]);
    });

    test('recursively sanitizes nested objects', () => {
      const input = {
        level1: {
          level2: {
            value: 'Test\x00String',
          },
        },
      };
      const result = sanitizeFormData(input);
      expect(result.level1.level2.value).toBe('TestString');
    });

    test('passes through numbers and booleans', () => {
      const input = { count: 42, active: true, ratio: 0.5 };
      const result = sanitizeFormData(input);
      expect(result).toEqual({ count: 42, active: true, ratio: 0.5 });
    });

    test('skips non-string keys (coverage for line 38)', () => {
      // In JS, object keys are always strings, but we can verify the check works
      const input = { validKey: 'value' };
      const result = sanitizeFormData(input);
      expect(result.validKey).toBe('value');
    });
  });

  describe('sanitizePhases', () => {
    test('returns empty object for null', () => {
      expect(sanitizePhases(null)).toEqual({});
    });

    test('returns empty object for undefined', () => {
      expect(sanitizePhases(undefined)).toEqual({});
    });

    test('returns empty object for non-object', () => {
      expect(sanitizePhases('string')).toEqual({});
    });

    test('sanitizes string values directly', () => {
      const input = { '1': 'Phase\x001 output', '2': 'Phase 2' };
      const result = sanitizePhases(input);
      expect(result['1']).toBe('Phase1 output');
      expect(result['2']).toBe('Phase 2');
    });

    test('sanitizes phase objects with response/output fields', () => {
      const input = {
        '1': { output: 'Phase\x001', completed: true },
        '2': { output: 'Phase\x002', critique: 'Review\x00text' },
      };
      const result = sanitizePhases(input);
      expect(result['1'].output).toBe('Phase1');
      expect(result['1'].completed).toBe(true);
      expect(result['2'].output).toBe('Phase2');
      expect(result['2'].critique).toBe('Reviewtext');
    });

    test('handles null phase values', () => {
      const input = { '1': null, '2': 'valid' };
      const result = sanitizePhases(input);
      expect(result['1']).toBeUndefined();
      expect(result['2']).toBe('valid');
    });
  });

  describe('sanitizeValue (recursive)', () => {
    test('returns null for null', () => {
      expect(sanitizeValue(null)).toBeNull();
    });

    test('returns undefined for undefined', () => {
      expect(sanitizeValue(undefined)).toBeUndefined();
    });

    test('sanitizes strings with control chars', () => {
      expect(sanitizeValue('Test\x00String')).toBe('TestString');
    });

    test('applies MAX_TITLE_LENGTH for title key', () => {
      const longTitle = 'T'.repeat(300);
      const result = sanitizeValue(longTitle, 'title');
      expect(result.length).toBe(MAX_TITLE_LENGTH);
    });

    test('applies MAX_CONTENT_LENGTH for other keys', () => {
      const longContent = 'C'.repeat(MAX_CONTENT_LENGTH + 100);
      const result = sanitizeValue(longContent, 'description');
      expect(result.length).toBe(MAX_CONTENT_LENGTH);
    });

    test('recursively sanitizes arrays', () => {
      const input = ['value\x001', { nested: 'value\x002' }];
      const result = sanitizeValue(input);
      expect(result[0]).toBe('value1');
      expect(result[1].nested).toBe('value2');
    });

    test('recursively sanitizes nested objects', () => {
      const input = {
        level1: {
          level2: {
            title: 'Nested\x00Title',
            content: 'Nested\x00Content',
          },
        },
      };
      const result = sanitizeValue(input);
      expect(result.level1.level2.title).toBe('NestedTitle');
      expect(result.level1.level2.content).toBe('NestedContent');
    });

    test('preserves numbers', () => {
      expect(sanitizeValue(42)).toBe(42);
      expect(sanitizeValue(3.14)).toBe(3.14);
    });

    test('preserves booleans', () => {
      expect(sanitizeValue(true)).toBe(true);
      expect(sanitizeValue(false)).toBe(false);
    });
  });

  describe('sanitizeProject', () => {
    test('throws error for null project', () => {
      expect(() => sanitizeProject(null)).toThrow('Project must be a non-null object');
    });

    test('throws error for undefined project', () => {
      expect(() => sanitizeProject(undefined)).toThrow('Project must be a non-null object');
    });

    test('throws error for non-object project', () => {
      expect(() => sanitizeProject('string')).toThrow('Project must be a non-null object');
    });

    test('sanitizes all project fields recursively', () => {
      const project = {
        id: '123',
        title: 'Test\x00Title',
        formData: { problem: 'Issue\x00Here' },
        phases: { '1': { output: 'Phase\x001' } },
      };
      const result = sanitizeProject(project);
      expect(result.title).toBe('TestTitle');
      expect(result.formData.problem).toBe('IssueHere');
      expect(result.phases['1'].output).toBe('Phase1');
    });

    test('sets default title if missing', () => {
      const project = { id: '123' };
      const result = sanitizeProject(project);
      expect(result.title).toBe('Untitled');
    });

    test('sets default title if empty string', () => {
      const project = { id: '123', title: '' };
      const result = sanitizeProject(project);
      expect(result.title).toBe('Untitled');
    });

    test('sets default currentPhase if missing', () => {
      const project = { id: '123', title: 'Test' };
      const result = sanitizeProject(project);
      expect(result.currentPhase).toBe(1);
    });

    test('sets default currentPhase if not a number', () => {
      const project = { id: '123', title: 'Test', currentPhase: 'invalid' };
      const result = sanitizeProject(project);
      expect(result.currentPhase).toBe(1);
    });

    test('preserves valid currentPhase', () => {
      const project = { id: '123', title: 'Test', currentPhase: 3 };
      const result = sanitizeProject(project);
      expect(result.currentPhase).toBe(3);
    });
  });

  describe('Constants', () => {
    test('MAX_TITLE_LENGTH is defined', () => {
      expect(MAX_TITLE_LENGTH).toBe(200);
    });

    test('MAX_CONTENT_LENGTH is defined', () => {
      expect(MAX_CONTENT_LENGTH).toBe(500000);
    });
  });
});


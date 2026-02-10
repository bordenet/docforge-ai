/**
 * Prompt Generator Tests
 */

import { describe, it, expect } from '@jest/globals';
import { fillPromptTemplate } from '../shared/js/prompt-generator.js';

describe('Prompt Generator', () => {

  describe('fillPromptTemplate', () => {
    it('should replace single variable', () => {
      const template = 'Hello {{NAME}}!';
      const data = { name: 'World' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('Hello World!');
    });

    it('should replace multiple variables', () => {
      const template = '{{TITLE}} by {{AUTHOR}}';
      const data = { title: 'My Book', author: 'Jane Doe' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('My Book by Jane Doe');
    });

    it('should handle camelCase to UPPER_CASE conversion', () => {
      const template = 'Problem: {{PROBLEM_STATEMENT}}';
      const data = { problemStatement: 'This is the problem' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('Problem: This is the problem');
    });

    it('should leave unmatched variables unchanged', () => {
      const template = 'Hello {{NAME}}, your ID is {{USER_ID}}';
      const data = { name: 'World' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('Hello World, your ID is {{USER_ID}}');
    });

    it('should handle empty data object', () => {
      const template = 'Hello {{NAME}}!';
      const result = fillPromptTemplate(template, {});

      expect(result).toBe('Hello {{NAME}}!');
    });

    it('should handle empty template', () => {
      const result = fillPromptTemplate('', { name: 'World' });
      expect(result).toBe('');
    });

    it('should handle null template', () => {
      const result = fillPromptTemplate(null, { name: 'World' });
      expect(result).toBe('');
    });

    it('should handle complex templates with newlines', () => {
      const template = `# {{TITLE}}

## Problem
{{PROBLEM_STATEMENT}}

## Solution
{{PROPOSED_SOLUTION}}`;

      const data = {
        title: 'My Project',
        problemStatement: 'Users are frustrated',
        proposedSolution: 'Build a better UX'
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('# My Project');
      expect(result).toContain('Users are frustrated');
      expect(result).toContain('Build a better UX');
    });

    it('should handle phase response variables', () => {
      const template = `## Phase 1 Output
{{PHASE1_RESPONSE}}

## Phase 2 Improvements
{{PHASE2_RESPONSE}}`;

      const data = {
        PHASE1_RESPONSE: 'Initial draft content',
        PHASE2_RESPONSE: 'Suggested improvements'
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('Initial draft content');
      expect(result).toContain('Suggested improvements');
    });
  });
});


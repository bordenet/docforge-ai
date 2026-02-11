/**
 * Prompt Generator Template Tests
 * Tests for fillPromptTemplate function
 */

import { describe, it, expect } from '@jest/globals';
import { fillPromptTemplate } from '../shared/js/prompt-generator.js';

describe('Prompt Generator - Template Filling', () => {
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
        proposedSolution: 'Build a better UX',
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('# My Project');
      expect(result).toContain('Users are frustrated');
      expect(result).toContain('Build a better UX');
    });

    it('should handle phase response variables with RESPONSE suffix', () => {
      const template = `## Phase 1 Output
{{PHASE1_RESPONSE}}

## Phase 2 Improvements
{{PHASE2_RESPONSE}}`;

      const data = {
        PHASE1_RESPONSE: 'Initial draft content',
        PHASE2_RESPONSE: 'Suggested improvements',
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('Initial draft content');
      expect(result).toContain('Suggested improvements');
    });

    it('should handle phase output variables with OUTPUT suffix (actual template format)', () => {
      // This is the ACTUAL format used in all plugin prompt templates
      const template = `## Version 1: Initial Draft (Claude)

{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review

{{PHASE2_OUTPUT}}`;

      const data = {
        PHASE1_OUTPUT: 'This is the Phase 1 draft content from Claude',
        PHASE2_OUTPUT: 'This is the Phase 2 review from Gemini',
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('This is the Phase 1 draft content from Claude');
      expect(result).toContain('This is the Phase 2 review from Gemini');
      expect(result).not.toContain('{{PHASE1_OUTPUT}}');
      expect(result).not.toContain('{{PHASE2_OUTPUT}}');
    });

    it('should NOT leave PHASE1_OUTPUT empty when data is provided', () => {
      const template = '{{PHASE1_OUTPUT}}';
      const data = { PHASE1_OUTPUT: 'Draft content' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('Draft content');
      expect(result).not.toBe('{{PHASE1_OUTPUT}}');
    });

    it('should NOT leave PHASE2_OUTPUT empty when data is provided', () => {
      const template = '{{PHASE2_OUTPUT}}';
      const data = { PHASE2_OUTPUT: 'Review content' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('Review content');
      expect(result).not.toBe('{{PHASE2_OUTPUT}}');
    });
  });
});


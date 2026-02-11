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

    it('should replace unmatched variables with empty string', () => {
      const template = 'Hello {{NAME}}, your ID is {{USER_ID}}';
      const data = { name: 'World' };

      const result = fillPromptTemplate(template, data);

      // Unmatched variables should be replaced with empty string, not left as placeholders
      expect(result).toBe('Hello World, your ID is ');
    });

    it('should handle empty data object by replacing all variables', () => {
      const template = 'Hello {{NAME}}!';
      const result = fillPromptTemplate(template, {});

      // All variables should be replaced with empty string when no data provided
      expect(result).toBe('Hello !');
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

  describe('Placeholder Safety Check', () => {
    // These tests verify the safety check that removes unsubstituted {{PLACEHOLDER}} patterns
    // This prevents raw placeholders from reaching the LLM

    it('should remove unsubstituted UPPER_CASE placeholders', () => {
      const template = 'Hello {{NAME}}, your {{UNKNOWN_FIELD}} is ready';
      const data = { name: 'World' };

      const result = fillPromptTemplate(template, data);

      // UNKNOWN_FIELD should be removed entirely, not left as {{UNKNOWN_FIELD}}
      expect(result).toBe('Hello World, your  is ready');
      expect(result).not.toContain('{{UNKNOWN_FIELD}}');
    });

    it('should remove multiple unsubstituted placeholders', () => {
      const template = '{{TITLE}} - {{MISSING_A}} and {{MISSING_B}}';
      const data = { title: 'My Document' };

      const result = fillPromptTemplate(template, data);

      expect(result).toBe('My Document -  and ');
      expect(result).not.toContain('{{MISSING_A}}');
      expect(result).not.toContain('{{MISSING_B}}');
    });

    it('should handle template with only unsubstituted placeholders', () => {
      const template = '{{COMPLETELY_UNKNOWN}} {{ALSO_UNKNOWN}}';
      const data = {};

      const result = fillPromptTemplate(template, data);

      expect(result).toBe(' ');
      expect(result).not.toContain('{{');
      expect(result).not.toContain('}}');
    });

    it('should not affect lowercase or mixed-case placeholders (only UPPER_CASE)', () => {
      // The safety check specifically targets {{UPPER_CASE}} patterns
      // This is intentional - lowercase patterns are not standard template vars
      const template = '{{lowercase}} {{MixedCase}} {{UPPER_CASE}}';
      const data = {};

      const result = fillPromptTemplate(template, data);

      // lowercase and MixedCase are replaced by the main regex (which matches \w+)
      // UPPER_CASE is caught by the safety check
      expect(result).not.toContain('{{UPPER_CASE}}');
    });

    it('should preserve valid substitutions while removing unsubstituted ones', () => {
      const template = `# {{TITLE}}

## Context
{{CONTEXT}}

## Unknown Section
{{UNKNOWN_SECTION}}`;

      const data = {
        title: 'My Project',
        context: 'This is the context',
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('# My Project');
      expect(result).toContain('This is the context');
      expect(result).not.toContain('{{UNKNOWN_SECTION}}');
    });

    it('should handle phase output placeholders when not provided', () => {
      // This is a critical case - phase outputs might not be available yet
      const template = `## Review the following:
{{PHASE1_OUTPUT}}

## Previous critique:
{{PHASE2_OUTPUT}}`;

      const data = {
        PHASE1_OUTPUT: 'Draft content here',
        // PHASE2_OUTPUT intentionally not provided
      };

      const result = fillPromptTemplate(template, data);

      expect(result).toContain('Draft content here');
      expect(result).not.toContain('{{PHASE2_OUTPUT}}');
    });
  });
});


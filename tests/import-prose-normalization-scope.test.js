/**
 * Tests for prose normalization scoping
 * Verifies that prose fixes only apply to template content, NOT user content
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

describe('Prose Normalization Scope', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  it('should NOT modify double spaces in user imported content', async () => {
    // Template with inline placeholder that becomes empty
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Instructions

A {{COMPANY_NAME}} executive would say...

## Your Task

Do something.
`,
    });

    // User imports content with intentional double spaces
    const formData = {
      title: 'Test',
      importedContent: `# My Document

This has  intentional  double  spaces for formatting.

Code example: a  = b + c

| Column A  | Column B  |
|-----------|-----------|
| Value  1  | Value  2  |
`,
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // User's double spaces should be PRESERVED
    expect(prompt).toContain('intentional  double  spaces');
    expect(prompt).toContain('a  = b + c');
    expect(prompt).toContain('Column A  |');

    // Template's broken prose should be fixed (A  executive -> A executive)
    // Note: Since {{COMPANY_NAME}} is empty, "A {{COMPANY_NAME}} executive" becomes "A  executive"
    // This should be fixed to "A executive" in template portion only
    expect(prompt).not.toMatch(/A\s{2,}executive/);
  });

  it('should NOT modify article + double space in user code blocks', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## A {{DOCUMENT_TYPE}} Overview

Instructions here.
`,
    });

    // User imports content with "a  " pattern in code
    const formData = {
      title: 'Test',
      importedContent: `# Code Sample

\`\`\`python
a  =  1  # intentional spacing
b  =  a  + 2
\`\`\`

Also: "a  very  spaced  sentence"
`,
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // User's content should be preserved exactly
    expect(prompt).toContain('a  =  1');
    expect(prompt).toContain('a  very  spaced');
  });

  it('should fix broken prose in template AFTER user content', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Review by a {{REVIEWER_ROLE}} Expert

The {{COMPANY_NAME}} team should review this.

## Criteria

A {{DOCUMENT_TYPE}} document must include...
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# Simple User Content\n\nNo special formatting.',
      // Note: REVIEWER_ROLE, COMPANY_NAME, DOCUMENT_TYPE are not provided
      // so they become empty, creating broken prose
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Template prose with empty placeholders should be fixed:
    // "a {{REVIEWER_ROLE}} Expert" -> "a  Expert" -> "a Expert"
    // "The {{COMPANY_NAME}} team" -> "The  team" -> "The team"
    // "A {{DOCUMENT_TYPE}} document" -> "A  document" -> "A document"
    expect(prompt).not.toMatch(/\ba\s{2,}Expert/i);
    expect(prompt).not.toMatch(/\bThe\s{2,}team/i);
    expect(prompt).not.toMatch(/\bA\s{2,}document/i);
  });
});


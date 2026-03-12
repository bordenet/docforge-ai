/**
 * Tests for marker-based section stripping
 * Templates can use <!-- DOCFORGE:STRIP_FOR_IMPORT_START --> and
 * <!-- DOCFORGE:STRIP_FOR_IMPORT_END --> to mark sections to strip
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

describe('Marker-Based Section Stripping', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  it('should strip content between STRIP_FOR_IMPORT markers', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Mode Selection

Choose your mode.

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Context

**Title:** {{TITLE}}
**Problem:** {{PROBLEM}}

## INPUT DATA

**Name:** {{NAME}}
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Your Task

Do something.
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Marked sections should be stripped
    expect(prompt).not.toContain('## Context');
    expect(prompt).not.toContain('**Title:**');
    expect(prompt).not.toContain('## INPUT DATA');
    
    // Unmarked sections should remain
    expect(prompt).toContain('## Mode Selection');
    expect(prompt).toContain('## Your Task');
    
    // Markers themselves should be removed
    expect(prompt).not.toContain('DOCFORGE:STRIP_FOR_IMPORT');
  });

  it('should handle multiple marker pairs', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## First Strippable Section
Content 1
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Keep This Section

Important content.

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Second Strippable Section
Content 2
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Also Keep This

More important content.
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Both marked sections should be stripped
    expect(prompt).not.toContain('First Strippable');
    expect(prompt).not.toContain('Second Strippable');
    
    // Unmarked sections should remain
    expect(prompt).toContain('## Keep This Section');
    expect(prompt).toContain('## Also Keep This');
  });

  it('should fallback to regex stripping when no markers present', async () => {
    // Template WITHOUT markers - should use regex fallback
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context

**Title:** {{TITLE}}

## Your Task

Do something.
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Regex fallback should still strip ## Context
    expect(prompt).not.toContain('## Context');
    expect(prompt).not.toContain('**Title:**');
    expect(prompt).toContain('## Your Task');
  });

  it('should handle multiple IMPORTED_CONTENT placeholders', async () => {
    // Edge case: Template has multiple import locations
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Section A
Content A
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Middle Section

Keep this.

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Section B
Content B
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

**BEGIN WITH THE HEADLINE NOW:**
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Both marked sections should be stripped (regardless of IMPORTED_CONTENT position)
    expect(prompt).not.toContain('## Section A');
    expect(prompt).not.toContain('## Section B');
    expect(prompt).not.toContain('Content A');
    expect(prompt).not.toContain('Content B');

    // Unmarked section should remain
    expect(prompt).toContain('## Middle Section');

    // Review instruction should replace creation instruction
    expect(prompt).toContain('REVIEW THE IMPORTED DOCUMENT');
  });

  it('should NOT strip markers when isImported is false', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Context

**Title:** {{TITLE}}
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Your Task

Do something.
`,
    });

    const formData = {
      title: 'Test Document',
    };

    const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: false });

    // In creation mode, Context should remain (markers stripped but content kept)
    expect(prompt).toContain('## Context');
    expect(prompt).toContain('**Title:** Test Document');
    // Markers should be stripped regardless
    expect(prompt).not.toContain('DOCFORGE:STRIP_FOR_IMPORT');
  });
});


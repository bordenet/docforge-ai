/**
 * Tests for stripping validation warnings
 * Verifies that warnings are logged when section stripping fails
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

describe('Stripping Validation Warnings', () => {
  let consoleWarnSpy;
  let capturedWarnings;

  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
    capturedWarnings = [];
    // Spy on console.warn to capture logger output
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
      capturedWarnings.push(args.join(' '));
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should NOT warn about stripping when sections are stripped successfully', async () => {
    // Template with standard structure that WILL be stripped
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

    await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Should NOT warn about failed stripping
    const strippingWarnings = capturedWarnings.filter(msg =>
      msg.includes('Failed to strip') || msg.includes('stripping failed')
    );
    expect(strippingWarnings.length).toBe(0);
  });

  it('should warn when ## Context section cannot be stripped due to unusual structure', async () => {
    // Template with ## Context that won't match our regex
    // (no newline after ## Context, unusual structure)
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context**Title:** {{TITLE}}
## Your Task
Do something.
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Should warn about failed stripping
    const strippingWarnings = capturedWarnings.filter(msg =>
      msg.includes('Context') && msg.includes('strip')
    );
    expect(strippingWarnings.length).toBeGreaterThan(0);
  });

  it('should NOT warn for sections that do not exist in template', async () => {
    // Template without INPUT DATA section - should not warn about it
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Your Task

Do something.
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };

    await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

    // Should NOT warn about INPUT DATA since it didn't exist
    const inputDataWarnings = capturedWarnings.filter(msg =>
      msg.includes('INPUT DATA')
    );
    expect(inputDataWarnings.length).toBe(0);
  });

  // ============================================================================
  // MARKER-BASED TEMPLATE VALIDATION TESTS
  // These tests verify that validation also works for templates WITH markers
  // (Bug: original implementation only validated in regex fallback path)
  // ============================================================================

  describe('Marker-Based Template Validation', () => {
    it('should NOT warn when markers are properly paired and stripped', async () => {
      // Template with properly paired markers
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
        title: 'Test',
        importedContent: '# User Content',
      };

      await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // Should NOT warn - markers stripped correctly
      const markerWarnings = capturedWarnings.filter(msg =>
        msg.includes('marker') || msg.includes('DOCFORGE')
      );
      expect(markerWarnings.length).toBe(0);
    });

    it('should warn when END marker is missing (unclosed marker)', async () => {
      // Template with START marker but no END marker
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
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

      await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // Should warn about unclosed/unmatched markers
      const markerWarnings = capturedWarnings.filter(msg =>
        msg.toLowerCase().includes('marker') || msg.includes('unclosed') || msg.includes('unmatched')
      );
      expect(markerWarnings.length).toBeGreaterThan(0);
    });

    it('should warn when START marker is missing (orphan END marker)', async () => {
      // Template with END marker but no START marker
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context
**Title:** {{TITLE}}
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

## Your Task
Do something.
`,
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // Should warn about orphan END marker
      const markerWarnings = capturedWarnings.filter(msg =>
        msg.toLowerCase().includes('marker') || msg.includes('orphan') || msg.includes('unmatched')
      );
      expect(markerWarnings.length).toBeGreaterThan(0);
    });
  });
});


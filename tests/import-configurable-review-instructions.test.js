/**
 * Tests for configurable review instructions per plugin
 * Defect #6: Move hardcoded "REVIEW THE IMPORTED DOCUMENT..." text to plugin config
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt, DEFAULT_REVIEW_INSTRUCTION } from '../shared/js/prompt-generator.js';

describe('Configurable Review Instructions', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  it('should export DEFAULT_REVIEW_INSTRUCTION constant', () => {
    expect(DEFAULT_REVIEW_INSTRUCTION).toBeDefined();
    expect(DEFAULT_REVIEW_INSTRUCTION).toContain('REVIEW THE IMPORTED DOCUMENT');
  });

  it('should use default review instruction when plugin has no importConfig', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

**BEGIN WITH THE HEADLINE NOW:**
`,
    });

    const plugin = { id: 'test' }; // No importConfig
    const formData = { importedContent: '# User Content' };

    const prompt = await generatePrompt(plugin, 1, formData, {}, { isImported: true });

    expect(prompt).toContain(DEFAULT_REVIEW_INSTRUCTION);
  });

  it('should use plugin-specific review instruction when configured', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

**BEGIN WITH THE HEADLINE NOW:**
`,
    });

    const customInstruction = '**Analyze this PR-FAQ for strategic alignment and customer clarity. Produce an improved version.**';
    const plugin = {
      id: 'test',
      importConfig: {
        reviewInstruction: customInstruction,
      },
    };
    const formData = { importedContent: '# User Content' };

    const prompt = await generatePrompt(plugin, 1, formData, {}, { isImported: true });

    expect(prompt).toContain(customInstruction);
    expect(prompt).not.toContain(DEFAULT_REVIEW_INSTRUCTION);
  });

  it('should handle marker-based templates with custom review instructions', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Context
**Title:** {{TITLE}}
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

**BEGIN WITH THE HEADLINE NOW:**
`,
    });

    const customInstruction = '**Critique this ADR for architectural rigor.**';
    const plugin = {
      id: 'test',
      importConfig: {
        reviewInstruction: customInstruction,
      },
    };
    const formData = { importedContent: '# User Content' };

    const prompt = await generatePrompt(plugin, 1, formData, {}, { isImported: true });

    expect(prompt).toContain(customInstruction);
    expect(prompt).not.toContain('BEGIN WITH THE HEADLINE');
  });
});


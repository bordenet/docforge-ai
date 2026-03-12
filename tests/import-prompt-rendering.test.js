/**
 * Import Prompt Rendering Integration Tests
 *
 * Tests that imported documents are properly rendered in Phase 1 prompts
 * for ALL 9 document types. Verifies:
 * - IMPORTED_CONTENT placeholder is populated
 * - INPUT DATA / Context sections are stripped for imports
 * - Review-mode instructions replace creation-mode instructions
 * - No broken placeholders in prose (e.g., "A  executive")
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

// All 9 document types in DocForge
const DOCUMENT_TYPES = [
  'acceptance-criteria',
  'adr',
  'business-justification',
  'jd',
  'one-pager',
  'power-statement',
  'pr-faq',
  'prd',
  'strategic-proposal',
];

// Sample imported content for testing
const SAMPLE_IMPORTED_CONTENT = `# Sample Imported Document

## Executive Summary

This is a sample imported document for testing purposes.
It contains multiple sections and realistic content.

## Problem Statement

Users need a way to test import functionality across all document types.

## Proposed Solution

Create comprehensive integration tests that verify import behavior.

## Success Metrics

- All 9 document types pass import tests
- No empty placeholder artifacts
- Review mode instructions present
`;

/**
 * Load actual Phase 1 template from disk
 */
function loadRealTemplate(pluginId) {
  const templatePath = path.join(
    process.cwd(),
    'plugins',
    pluginId,
    'prompts',
    'phase1.md'
  );
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch {
    return null;
  }
}

describe('Import Prompt Rendering - All Document Types', () => {
  beforeEach(() => {
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };
  });

  describe.each(DOCUMENT_TYPES)('%s', (pluginId) => {
    let realTemplate;

    beforeEach(() => {
      realTemplate = loadRealTemplate(pluginId);
      if (realTemplate) {
        global.fetch = async () => ({
          ok: true,
          text: async () => realTemplate,
        });
      }
    });

    it('should have a valid Phase 1 template', () => {
      expect(realTemplate).not.toBeNull();
      expect(realTemplate).toContain('{{IMPORTED_CONTENT}}');
    });

    describe('Import Scenario (isImported: true)', () => {
      it('should inject imported content into prompt', async () => {
        if (!realTemplate) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'Test Imported Document',
          importedContent: SAMPLE_IMPORTED_CONTENT,
        };
        const options = { isImported: true };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Imported content should be present
        expect(prompt).toContain('Sample Imported Document');
        expect(prompt).toContain('Executive Summary');
        expect(prompt).toContain('Problem Statement');
      });

      it('should strip INPUT DATA or Context section with empty fields', async () => {
        if (!realTemplate) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'Test',
          importedContent: SAMPLE_IMPORTED_CONTENT,
        };
        const options = { isImported: true };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Check for INPUT DATA section (pr-faq specific)
        if (realTemplate.includes('## INPUT DATA')) {
          expect(prompt).not.toContain('## INPUT DATA');
        }

        // Should NOT contain creation-mode closing instruction (pr-faq specific)
        if (realTemplate.includes('BEGIN WITH THE HEADLINE NOW')) {
          expect(prompt).not.toContain('BEGIN WITH THE HEADLINE NOW');
        }
      });

      it('should contain review-mode instructions', async () => {
        if (!realTemplate) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'Test',
          importedContent: SAMPLE_IMPORTED_CONTENT,
        };
        const options = { isImported: true };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Should have MODE SELECTION section pointing to REVIEW MODE
        expect(prompt).toContain('REVIEW MODE');

        // If original had creation-mode closer, should have review-mode instead
        if (realTemplate.includes('BEGIN WITH THE HEADLINE NOW')) {
          expect(prompt).toContain('REVIEW THE IMPORTED DOCUMENT');
        }
      });

      it('should not have broken inline placeholders', async () => {
        if (!realTemplate) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'Test',
          importedContent: SAMPLE_IMPORTED_CONTENT,
        };
        const options = { isImported: true };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Check for broken patterns like "A  executive" (double space from empty placeholder)
        // This happens when inline placeholders like {{COMPANY_NAME}} become empty
        const brokenPatterns = [
          /\bA\s{2,}executive\b/i,
          /\bA\s{2,}customer\b/i,
          /\bA\s{2,}user\b/i,
          /\ban?\s{2,}\w+/gi, // "a  word" or "an  word" pattern
        ];

        for (const pattern of brokenPatterns) {
          expect(prompt).not.toMatch(pattern);
        }

        // Also check for consecutive empty lines (more than 3)
        expect(prompt).not.toMatch(/\n{5,}/);
      });
    });

    describe('Creation Scenario (isImported: false)', () => {
      it('should have empty IMPORTED_CONTENT section', async () => {
        if (!realTemplate) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'New Document',
          problem: 'Test problem statement',
          // Note: importedContent is NOT set
        };
        const options = { isImported: false };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Imported content should NOT appear
        expect(prompt).not.toContain(SAMPLE_IMPORTED_CONTENT);

        // MODE SELECTION should mention CREATION MODE
        expect(prompt).toContain('CREATION MODE');
      });

      it('should preserve INPUT DATA section with populated fields', async () => {
        if (!realTemplate) return;

        // Only test this for templates that have INPUT DATA
        if (!realTemplate.includes('## INPUT DATA')) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'New Document',
          productName: 'TestProduct',
          companyName: 'TestCorp',
          targetCustomer: 'Enterprise users',
          problem: 'Users struggle with manual processes',
        };
        const options = { isImported: false };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // INPUT DATA section should be present
        expect(prompt).toContain('## INPUT DATA');
      });

      it('should preserve creation-mode closing instructions', async () => {
        if (!realTemplate) return;

        // Only test for templates that have this instruction
        if (!realTemplate.includes('BEGIN WITH THE HEADLINE NOW')) return;

        const plugin = { id: pluginId };
        const formData = {
          title: 'New Document',
          productName: 'TestProduct',
        };
        const options = { isImported: false };

        const prompt = await generatePrompt(plugin, 1, formData, {}, options);

        // Creation-mode instruction should still be present
        expect(prompt).toContain('BEGIN WITH THE HEADLINE NOW');
      });
    });
  });
});

describe('Import Prompt Rendering - Edge Cases', () => {
  beforeEach(() => {
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };
  });

  it('should handle import with minimal content', async () => {
    const realTemplate = loadRealTemplate('pr-faq');
    if (!realTemplate) return;

    global.fetch = async () => ({
      ok: true,
      text: async () => realTemplate,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'Minimal',
      importedContent: '# Just a Title',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    expect(prompt).toContain('# Just a Title');
    expect(prompt).not.toContain('## INPUT DATA');
  });

  it('should handle import with special characters', async () => {
    const realTemplate = loadRealTemplate('adr');
    if (!realTemplate) return;

    global.fetch = async () => ({
      ok: true,
      text: async () => realTemplate,
    });

    const plugin = { id: 'adr' };
    const formData = {
      title: 'Special Chars',
      importedContent: '# ADR: Use {{curly}} and $pecial & <chars>',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    expect(prompt).toContain('{{curly}}');
    expect(prompt).toContain('$pecial');
    expect(prompt).toContain('<chars>');
  });

  it('should use previousResponses[1] as fallback when importedContent missing', async () => {
    const realTemplate = loadRealTemplate('one-pager');
    if (!realTemplate) return;

    global.fetch = async () => ({
      ok: true,
      text: async () => realTemplate,
    });

    const plugin = { id: 'one-pager' };
    const formData = { title: 'Fallback Test' };
    const previousResponses = {
      1: '# Content from Phase 1 Response\n\nThis is fallback content.',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, previousResponses, options);

    expect(prompt).toContain('Content from Phase 1 Response');
    expect(prompt).toContain('fallback content');
  });
});


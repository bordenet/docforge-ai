/**
 * Test: Import behavior when fallback prompt is used
 * The fallback prompt does NOT have {{IMPORTED_CONTENT}} marker
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

describe('Import with fallback prompt (no IMPORTED_CONTENT marker)', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
    // Simulate fetch failure to trigger fallback
    global.fetch = async () => ({
      ok: false,
    });
  });

  it('should inject imported content into fallback prompt (marker now exists)', async () => {
    const formData = {
      title: 'Test Document',
      importedContent: '# My Imported Content\n\nThis is user content.',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt({ id: 'nonexistent-plugin' }, 1, formData, {}, options);

    // Fallback prompt now has {{IMPORTED_CONTENT}} marker
    expect(prompt).toContain('Phase 1');
    expect(prompt).toContain('REVIEW MODE');

    // User content should now appear in fallback prompt
    expect(prompt).toContain('My Imported Content');
    expect(prompt).toContain('This is user content.');
  });

  it('should preserve ## Context in fallback prompt for non-import', async () => {
    const formData = {
      title: 'New Document',
    };
    const options = { isImported: false };

    const prompt = await generatePrompt({ id: 'nonexistent-plugin' }, 1, formData, {}, options);

    // Fallback prompt should have Context section preserved
    expect(prompt).toContain('## Context');
    expect(prompt).toContain('**Title:** New Document');
  });

});

describe('Edge case: Template with unusual structure', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  it('should handle template with multiple IMPORTED_CONTENT markers (uses first)', async () => {
    // Unusual template with multiple markers
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context
**Title:** {{TITLE}}

---

## Appendix
{{IMPORTED_CONTENT}}
`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt({ id: 'test-plugin' }, 1, formData, {}, options);

    // Should replace BOTH markers with user content
    const matches = prompt.match(/# User Content/g);
    expect(matches).not.toBeNull();
    // fillPromptTemplate replaces ALL instances of the placeholder
    expect(matches.length).toBe(2);
  });

  it('should handle template where IMPORTED_CONTENT is at the very end', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

## Instructions
Do something.

{{IMPORTED_CONTENT}}`,
    });

    const formData = {
      title: 'Test',
      importedContent: '# User Content Here',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt({ id: 'test-plugin' }, 1, formData, {}, options);

    expect(prompt).toContain('# User Content Here');
    // Instructions section should still be present
    expect(prompt).toContain('## Instructions');
  });
});


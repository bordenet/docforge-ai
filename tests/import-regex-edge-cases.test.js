/**
 * Tests for regex lookahead edge cases in section stripping
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

describe('Regex Lookahead Edge Cases', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  describe('Template ending with ## Context (no trailing content)', () => {
    it('should strip ## Context when it is the last section', async () => {
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context

**Title:** {{TITLE}}
**Problem:** {{PROBLEM}}`,
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // Context section should be stripped even at end of file
      expect(prompt).not.toContain('## Context');
      expect(prompt).not.toContain('**Title:**');
      expect(prompt).toContain('# User Content');
    });

    it('should strip ## Context when followed by no newline at EOF', async () => {
      // Template with no trailing newline
      global.fetch = async () => ({
        ok: true,
        text: async () => '# Phase 1\n\n{{IMPORTED_CONTENT}}\n\n## Context\n\n**Title:** {{TITLE}}',
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      expect(prompt).not.toContain('## Context');
    });
  });

  describe('Horizontal rules (*** instead of ---)', () => {
    it('should handle *** horizontal rules as section delimiters', async () => {
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context

**Title:** {{TITLE}}

***

## Your Task

Do something.
`,
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // Context should be stripped up to the *** rule
      expect(prompt).not.toContain('**Title:**');
      // Your Task should remain
      expect(prompt).toContain('## Your Task');
    });
  });

  describe('Nested subsections', () => {
    it('should strip ## Context including nested ### subsections', async () => {
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Context

**Title:** {{TITLE}}

### Context Details

More context info here.

### Additional Context

Even more context.

## Your Task

Do something.
`,
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      // All context subsections should be stripped
      expect(prompt).not.toContain('**Title:**');
      expect(prompt).not.toContain('### Context Details');
      expect(prompt).not.toContain('### Additional Context');
      expect(prompt).not.toContain('More context info');
      // Your Task should remain
      expect(prompt).toContain('## Your Task');
    });
  });

  describe('Multiple strippable sections', () => {
    it('should strip all sections in sequence', async () => {
      global.fetch = async () => ({
        ok: true,
        text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## INPUT DATA

**Name:** {{NAME}}

## Context

**Title:** {{TITLE}}

## OUTPUT FORMAT

<rules>Output rules here</rules>

## Your Task

Do something.
`,
      });

      const formData = {
        title: 'Test',
        importedContent: '# User Content',
      };

      const prompt = await generatePrompt({ id: 'test' }, 1, formData, {}, { isImported: true });

      expect(prompt).not.toContain('## INPUT DATA');
      expect(prompt).not.toContain('## Context');
      expect(prompt).not.toContain('## OUTPUT FORMAT');
      expect(prompt).toContain('## Your Task');
    });
  });
});


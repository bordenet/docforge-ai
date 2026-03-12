/**
 * Prompt Generator Phase Tests
 * Tests for phase output variable naming, loadPromptTemplate, and generatePrompt
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  fillPromptTemplate,
  loadPromptTemplate,
  generatePrompt,
} from '../shared/js/prompt-generator.js';

describe('Prompt Generator - Phase Output Variables', () => {
  // These tests verify the CRITICAL requirement that phase outputs are substituted
  // The templates use PHASE1_OUTPUT and PHASE2_OUTPUT (not RESPONSE)

  it('should substitute PHASE1_OUTPUT in phase 2 templates', () => {
    const phase2Template = `# Phase 2: Review

## Original Draft
{{PHASE1_OUTPUT}}

## Your Task
Review and improve the draft above.`;

    const data = {
      PHASE1_OUTPUT: '# My Document\n\nThis is the initial draft.',
    };

    const result = fillPromptTemplate(phase2Template, data);

    expect(result).toContain('# My Document');
    expect(result).toContain('This is the initial draft.');
    expect(result).not.toContain('{{PHASE1_OUTPUT}}');
  });

  it('should substitute both PHASE1_OUTPUT and PHASE2_OUTPUT in phase 3 templates', () => {
    const phase3Template = `# Phase 3: Synthesis

## Version 1: Initial Draft (Claude)
{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review
{{PHASE2_OUTPUT}}

---

## Your Synthesis
Combine the best elements.`;

    const data = {
      PHASE1_OUTPUT: 'Claude generated this initial PRD draft with all sections.',
      PHASE2_OUTPUT: 'Gemini reviewed and suggested these improvements.',
    };

    const result = fillPromptTemplate(phase3Template, data);

    expect(result).toContain('Claude generated this initial PRD draft');
    expect(result).toContain('Gemini reviewed and suggested');
    expect(result).not.toContain('{{PHASE1_OUTPUT}}');
    expect(result).not.toContain('{{PHASE2_OUTPUT}}');
  });
});

describe('Prompt Generator - loadPromptTemplate', () => {
  beforeEach(() => {
    // Mock window.location for getBasePath
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };

    // Mock fetch
    global.fetch = undefined;
  });

  it('should load template from plugin prompts directory', async () => {
    global.fetch = async (url) => {
      if (url.includes('phase1.md')) {
        return {
          ok: true,
          text: async () => '# Phase 1 Template\n\n{{TITLE}}',
        };
      }
      return { ok: false };
    };

    const template = await loadPromptTemplate('one-pager', 1);
    expect(template).toContain('Phase 1 Template');
  });

  it('should return fallback prompt when fetch fails', async () => {
    global.fetch = async () => ({ ok: false });

    const template = await loadPromptTemplate('one-pager', 1);
    expect(template).toContain('Phase 1');
    expect(template).toContain('{{TITLE}}');
  });

  it('should return fallback prompt on network error', async () => {
    global.fetch = async () => {
      throw new Error('Network error');
    };

    const template = await loadPromptTemplate('one-pager', 1);
    expect(template).toContain('Phase 1');
  });

  it('should return phase 2 fallback', async () => {
    global.fetch = async () => ({ ok: false });

    const template = await loadPromptTemplate('one-pager', 2);
    expect(template).toContain('Phase 2');
    expect(template).toContain('Alternative Perspective');
  });

  it('should return phase 3 fallback', async () => {
    global.fetch = async () => ({ ok: false });

    const template = await loadPromptTemplate('one-pager', 3);
    expect(template).toContain('Phase 3');
    expect(template).toContain('Synthesis');
  });

  it('should return unknown phase for invalid phase number', async () => {
    global.fetch = async () => ({ ok: false });

    const template = await loadPromptTemplate('one-pager', 99);
    expect(template).toBe('Unknown phase');
  });
});

describe('Prompt Generator - generatePrompt', () => {
  beforeEach(() => {
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };
  });

  it('should generate prompt with form data and previous responses', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => '# Phase 3\n\n{{TITLE}}\n\n{{PHASE1_OUTPUT}}\n\n{{PHASE2_OUTPUT}}',
    });

    const plugin = { id: 'one-pager' };
    const formData = { title: 'Test Project' };
    const previousResponses = {
      1: 'Phase 1 draft content',
      2: 'Phase 2 review content',
    };

    const prompt = await generatePrompt(plugin, 3, formData, previousResponses);

    expect(prompt).toContain('Test Project');
    expect(prompt).toContain('Phase 1 draft content');
    expect(prompt).toContain('Phase 2 review content');
  });

  it('should handle empty previous responses', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => '# Phase 1\n\n{{TITLE}}',
    });

    const plugin = { id: 'prd' };
    const formData = { title: 'My PRD' };

    const prompt = await generatePrompt(plugin, 1, formData, {});

    expect(prompt).toContain('My PRD');
  });

  it('should inject IMPORTED_CONTENT when isImported is true (CRITICAL)', async () => {
    // This tests the import flow: when user imports a document,
    // the imported content should appear in {{IMPORTED_CONTENT}} placeholder
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## MODE SELECTION
If imported content above, review it.
If empty, generate new content.

## Input Data
Title: {{TITLE}}`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'My Imported PR-FAQ',
      importedContent: '# Existing PR-FAQ\n\nThis is an imported document with full content.',
    };
    const previousResponses = {};
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, previousResponses, options);

    // The imported content MUST appear in the prompt
    expect(prompt).toContain('This is an imported document with full content.');
    expect(prompt).toContain('My Imported PR-FAQ');
    // Placeholder should be fully replaced
    expect(prompt).not.toContain('{{IMPORTED_CONTENT}}');
  });

  it('should NOT inject IMPORTED_CONTENT when isImported is false', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## Input Data
Title: {{TITLE}}`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'New PR-FAQ',
      importedContent: 'This should NOT appear',
    };
    const options = { isImported: false };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // When not imported, IMPORTED_CONTENT should be empty
    expect(prompt).not.toContain('This should NOT appear');
    expect(prompt).toContain('New PR-FAQ');
  });

  it('should fallback to phases.1.response for IMPORTED_CONTENT when importedContent missing', async () => {
    // Edge case: import flow might store content in phases.1.response instead of formData.importedContent
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1\n\n{{IMPORTED_CONTENT}}\n\nTitle: {{TITLE}}`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = { title: 'Imported via Phase Response' };
    const previousResponses = {
      1: '# My Imported Document\n\nContent from phases.1.response',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, previousResponses, options);

    // Should fallback to previousResponses[1]
    expect(prompt).toContain('Content from phases.1.response');
  });
});

describe('Prompt Generator - Import Mode Section Stripping', () => {
  beforeEach(() => {
    global.window = {
      location: {
        pathname: '/assistant/',
      },
    };
  });

  it('should strip INPUT DATA section when isImported is true and phase is 1', async () => {
    // Simulate a real Phase 1 template with INPUT DATA section
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1: Initial Draft

{{IMPORTED_CONTENT}}

## ⚠️ MODE SELECTION (READ FIRST)

**If an imported document appears above this section:**
- You are in **REVIEW MODE**.

## INPUT DATA

**Product/Feature Name**: {{PRODUCT_NAME}}
**Company Name**: {{COMPANY_NAME}}
**Target Customer**: {{TARGET_CUSTOMER}}
**Problem Being Solved**: {{PROBLEM}}

## OUTPUT FORMAT

<output_rules>
CRITICAL - Your document must be COPY-PASTE READY
</output_rules>

**BEGIN WITH THE HEADLINE NOW:**`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'Imported Document',
      importedContent: '# My Imported PR-FAQ\n\nThis is imported content.',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // INPUT DATA section should be stripped
    expect(prompt).not.toContain('## INPUT DATA');
    expect(prompt).not.toContain('**Product/Feature Name**:');
    expect(prompt).not.toContain('**Company Name**:');

    // But imported content should be present
    expect(prompt).toContain('# My Imported PR-FAQ');
    expect(prompt).toContain('This is imported content.');

    // MODE SELECTION should still be present
    expect(prompt).toContain('## ⚠️ MODE SELECTION');
  });

  it('should strip "BEGIN WITH THE HEADLINE NOW" for imports', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## INPUT DATA

**Title**: {{TITLE}}

**BEGIN WITH THE HEADLINE NOW:**`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'Test',
      importedContent: '# Imported Doc',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // Creation-mode instruction should be stripped
    expect(prompt).not.toContain('BEGIN WITH THE HEADLINE NOW');
  });

  it('should add review-mode closing instructions for imports', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## INPUT DATA

**Title**: {{TITLE}}

**BEGIN WITH THE HEADLINE NOW:**`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'Test',
      importedContent: '# Imported Doc',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // Should have review-mode instructions instead
    expect(prompt).toContain('REVIEW THE IMPORTED DOCUMENT');
  });

  it('should NOT strip INPUT DATA section when isImported is false (regression test)', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## INPUT DATA

**Product/Feature Name**: {{PRODUCT_NAME}}
**Company Name**: {{COMPANY_NAME}}

**BEGIN WITH THE HEADLINE NOW:**`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      productName: 'TestProduct',
      companyName: 'TestCorp',
    };
    const options = { isImported: false };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // INPUT DATA section should be present for creation mode
    expect(prompt).toContain('## INPUT DATA');
    expect(prompt).toContain('**Product/Feature Name**: TestProduct');
    expect(prompt).toContain('**Company Name**: TestCorp');
    expect(prompt).toContain('BEGIN WITH THE HEADLINE NOW');
  });

  it('should NOT strip INPUT DATA for phase 2 or 3 even if isImported is true', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 2

## INPUT DATA

**Previous Output**: {{PHASE1_OUTPUT}}

## Continue:`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = { title: 'Test' };
    const previousResponses = { 1: 'Phase 1 output' };
    const options = { isImported: true };

    // Phase 2 - should NOT strip
    const prompt = await generatePrompt(plugin, 2, formData, previousResponses, options);

    expect(prompt).toContain('## INPUT DATA');
  });

  it('should strip OUTPUT FORMAT section for imports', async () => {
    global.fetch = async () => ({
      ok: true,
      text: async () => `# Phase 1

{{IMPORTED_CONTENT}}

## INPUT DATA

**Title**: {{TITLE}}

## OUTPUT FORMAT

<output_rules>
CRITICAL - Start IMMEDIATELY with the headline
- NO preamble
- NO markdown code fences
</output_rules>

### Required Sections

| Section | Content |
|---------|---------|
| Headline | 8-15 words |

**BEGIN WITH THE HEADLINE NOW:**`,
    });

    const plugin = { id: 'pr-faq' };
    const formData = {
      title: 'Test',
      importedContent: '# Imported Doc',
    };
    const options = { isImported: true };

    const prompt = await generatePrompt(plugin, 1, formData, {}, options);

    // OUTPUT FORMAT section should be stripped for imports
    expect(prompt).not.toContain('## OUTPUT FORMAT');
    expect(prompt).not.toContain('<output_rules>');
    expect(prompt).not.toContain('### Required Sections');
  });
});


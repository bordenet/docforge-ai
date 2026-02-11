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
});


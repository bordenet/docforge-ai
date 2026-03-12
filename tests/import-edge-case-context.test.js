/**
 * Edge case test: User's imported document contains "## Context" heading
 * This tests whether our stripping logic accidentally removes user content
 */

import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { generatePrompt } from '../shared/js/prompt-generator.js';

function loadRealTemplate(pluginId) {
  const templatePath = path.join(
    process.cwd(),
    'plugins',
    pluginId,
    'prompts',
    'phase1.md'
  );
  return fs.readFileSync(templatePath, 'utf-8');
}

describe('CRITICAL: Import with "## Context" in user content', () => {
  beforeEach(() => {
    global.window = {
      location: { pathname: '/assistant/' },
    };
  });

  it('should NOT strip "## Context" from user imported content', async () => {
    const realTemplate = loadRealTemplate('prd');
    global.fetch = async () => ({
      ok: true,
      text: async () => realTemplate,
    });

    // User imports a document that has its own "## Context" section
    const formData = {
      title: 'Edge Case Test',
      importedContent: `# My Imported PRD

## Executive Summary

This is my imported document.

## Context

This is MY context section that I wrote - should NOT be stripped!
It contains important user-provided information.

## Problem Statement

The problem is XYZ.`,
    };

    const prompt = await generatePrompt({ id: 'prd' }, 1, formData, {}, { isImported: true });

    // User's context section MUST survive
    expect(prompt).toContain('This is MY context section that I wrote');
    expect(prompt).toContain('important user-provided information');

    // Template's Context section (with empty fields) should be stripped
    expect(prompt).not.toContain('**Document Title:**');
    expect(prompt).not.toContain('**Problems to Address:**');
  });

  it('should NOT strip "## Your Task" from user imported content', async () => {
    const realTemplate = loadRealTemplate('business-justification');
    global.fetch = async () => ({
      ok: true,
      text: async () => realTemplate,
    });

    // User imports a document that has "## Your Task" section
    const formData = {
      title: 'Edge Case Test',
      importedContent: `# My Business Justification

## Context

My context here.

## Your Task

This describes what needs to be done - user content, not template!`,
    };

    const prompt = await generatePrompt({ id: 'business-justification' }, 1, formData, {}, { isImported: true });

    // User's "Your Task" section should survive if it's in their content
    expect(prompt).toContain('This describes what needs to be done');
  });
});


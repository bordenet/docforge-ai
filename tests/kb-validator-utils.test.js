/**
 * KB Validator — Core Utility Tests (Phase A)
 * Covers: extractSection, extractTitle, detectArticleType, detectSeverity.
 * Phase B1 will add deeper fixture-based tests; Phase D adds the full suite.
 */

import { describe, it, expect } from '@jest/globals';
import {
  extractSection,
  extractTitle,
  detectArticleType,
  detectSeverity,
} from '../plugins/kb/js/validator.js';
import { SECTION_PATTERNS } from '../plugins/kb/js/validator-config.js';

// ── extractSection ─────────────────────────────────────────────────────────────

describe('extractSection', () => {
  it('returns empty string when section not found', () => {
    const text = '# Title\n\n## Summary\nSome text.';
    expect(extractSection(text, SECTION_PATTERNS.resolution)).toBe('');
  });

  it('extracts content under matching header', () => {
    const text = '# Title\n\n## Resolution\nStep 1.\nStep 2.\n\n## Other\nNope.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('Step 1.');
    expect(result).toContain('Step 2.');
    expect(result).not.toContain('Nope.');
  });

  it('stops at same-level header', () => {
    const text = '## Resolution\nDo this.\n## Verification\nCheck it.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('Do this.');
    expect(result).not.toContain('Check it.');
  });

  it('stops at shallower header', () => {
    const text = '# Title\n\n## Resolution\nDo this.\n\n# New Top Level';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('Do this.');
    expect(result).not.toContain('New Top Level');
  });

  it('does not stop at deeper header', () => {
    const text = '## Resolution\nIntro.\n### Sub-step\nDetail.\n## Other\nNo.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('Intro.');
    expect(result).toContain('Detail.');
    expect(result).not.toContain('No.');
  });

  it('excludes the matching header line itself', () => {
    const text = '## Resolution\nContent only.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).not.toMatch(/^## Resolution/m);
    expect(result).toContain('Content only.');
  });

  it('tracks fenced code blocks — does not treat # inside fence as header', () => {
    const text = [
      '## Resolution',
      '```bash',
      '# This is a bash comment, not a header',
      'openssl x509 -in cert.pem',
      '```',
      'After fence.',
    ].join('\n');
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('# This is a bash comment');
    expect(result).toContain('After fence.');
  });

  it('includes fence delimiter lines in section output', () => {
    const text = '## Resolution\n```bash\ncommand\n```\nDone.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('```bash');
    expect(result).toContain('```');
    expect(result).toContain('command');
  });

  it('handles unclosed fence — accumulates to end of document', () => {
    // Unclosed fence: inFence stays true; no subsequent header terminates the section.
    // extractSection returns everything after the section header.
    const text = '## Resolution\n```bash\nopenssl req -x509\n## Verification\nShould be included.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    // No closing fence, so Verification header is inside the "fence" and included.
    expect(result).toContain('openssl req -x509');
    expect(result).toContain('## Verification');
  });

  it('matches resolution section with alternate header text "Solution"', () => {
    const text = '## Solution\nApply the patch.';
    const result = extractSection(text, SECTION_PATTERNS.resolution);
    expect(result).toContain('Apply the patch.');
  });

  it('returns empty string on empty input', () => {
    expect(extractSection('', SECTION_PATTERNS.resolution)).toBe('');
  });
});

// ── extractTitle ───────────────────────────────────────────────────────────────

describe('extractTitle', () => {
  it('extracts H1 title text', () => {
    const text = '# SSO login fails with error\n\n## Summary\nSome text.';
    expect(extractTitle(text)).toBe('SSO login fails with error');
  });

  it('returns empty string when no H1 present', () => {
    const text = '## Section Only\nNo H1 here.';
    expect(extractTitle(text)).toBe('');
  });

  it('trims leading/trailing whitespace from title', () => {
    const text = '#   Spaced Title   \n\nContent.';
    expect(extractTitle(text)).toBe('Spaced Title');
  });

  it('returns first H1 if multiple H1s exist', () => {
    const text = '# First Title\n\n# Second Title';
    expect(extractTitle(text)).toBe('First Title');
  });

  it('does not match ## H2 as title', () => {
    const text = '## Not A Title\n# Real Title';
    // The regex /^#\s+/ with `m` flag — `##` has two `#` so it does NOT match `^#\s+`
    // because `##` is followed by another `#`, not whitespace.
    expect(extractTitle(text)).toBe('Real Title');
  });
});

// ── detectArticleType ──────────────────────────────────────────────────────────

describe('detectArticleType', () => {
  it('detects troubleshooting from metadata line', () => {
    const text = '# Title\n\n**Article type:** Troubleshooting\n\n## Summary';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });

  it('detects how-to from metadata line', () => {
    const text = '# Title\n\n**Article type:** How-To\n\n## Summary';
    expect(detectArticleType(text)).toBe('how-to');
  });

  it('metadata detection is case-insensitive', () => {
    const text = '**Article type:** TROUBLESHOOTING\n';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });

  it('falls back to title when no metadata — how-to pattern', () => {
    const text = '# Connect Salesforce via OAuth\n\n## Steps\nDo stuff.';
    expect(detectArticleType(text)).toBe('how-to');
  });

  it('falls back to title when no metadata — troubleshooting pattern', () => {
    const text = '# Error: Cannot connect to database\n\n## Summary';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });

  it('defaults to troubleshooting when neither metadata nor title pattern matches', () => {
    const text = '# Overview of the billing system\n\n## Summary';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });

  it('metadata takes priority over title pattern', () => {
    // Title says "how-to" pattern (starts with "Connect") but metadata says troubleshooting
    const text = '# Connect Salesforce\n\n**Article type:** Troubleshooting\n';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });

  it('how-to title pattern takes priority over troubleshooting title pattern', () => {
    // Title starts with "Fix" (troubleshooting) but first word is checked against howTo pattern first
    // howTo = /^(create|connect|...)/, troubleshooting = /^(why|error|cannot|can't|not working|failed|failing|unable to|fix|resolve)/
    // "Fix the SSO issue" → 'fix' matches troubleshooting, not how-to → troubleshooting
    const text = '# Fix the SSO login issue\n';
    expect(detectArticleType(text)).toBe('troubleshooting');
  });
});

// ── detectSeverity ─────────────────────────────────────────────────────────────

describe('detectSeverity', () => {
  it('detects high severity from metadata', () => {
    const text = '**Severity:** high\n';
    expect(detectSeverity(text)).toBe('high');
  });

  it('detects critical severity from metadata', () => {
    const text = '**Severity:** critical\n';
    expect(detectSeverity(text)).toBe('critical');
  });

  it('detects low severity from metadata', () => {
    const text = '**Severity:** low\n';
    expect(detectSeverity(text)).toBe('low');
  });

  it('defaults to medium when no severity metadata', () => {
    const text = '# Title\n\nNo metadata here.';
    expect(detectSeverity(text)).toBe('medium');
  });

  it('severity detection is case-insensitive', () => {
    const text = '**Severity:** HIGH\n';
    expect(detectSeverity(text)).toBe('high');
  });

  it('normalizes matched value to lowercase', () => {
    const text = '**Severity:** Medium\n';
    expect(detectSeverity(text)).toBe('medium');
  });
});

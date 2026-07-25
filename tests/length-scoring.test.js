/**
 * Length Scoring Tests
 *
 * Companion to slop-scoring.test.js-style coverage, added per llm-skill-review
 * finding (2026-07-25): this module was shipped with zero dedicated tests despite
 * silently subtracting points from every ADR/PRD score, and the Epic/Product
 * scope-target selection (the entire reason formData was threaded through three
 * files) was previously asserted only in a code comment, never executed.
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getLengthPenalty } from '../shared/js/length-scoring.js';
import { validateADR } from '../plugins/adr/js/validator.js';
import { validatePRD } from '../plugins/prd/js/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function words(n) {
  return 'word '.repeat(n).trim();
}

describe('getLengthPenalty', () => {
  const target = 100;

  test('at or under target: no penalty', () => {
    expect(getLengthPenalty(words(100), target).penalty).toBe(0);
  });

  test('boundary exactly at 1.2x: still no penalty (strict > required)', () => {
    expect(getLengthPenalty(words(120), target).penalty).toBe(0);
  });

  test('just over 1.2x: lightest penalty tier', () => {
    const result = getLengthPenalty(words(121), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(2); // round(10 * 0.2)
  });

  test('boundary exactly at 1.5x: still the 1.2x tier, not the 1.5x tier', () => {
    const result = getLengthPenalty(words(150), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(2);
  });

  test('just over 1.5x: next penalty tier', () => {
    const result = getLengthPenalty(words(151), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(4); // round(10 * 0.4)
  });

  test('boundary exactly at 2.0x: still the 1.5x tier', () => {
    const result = getLengthPenalty(words(200), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(4);
  });

  test('just over 2.0x: next penalty tier', () => {
    const result = getLengthPenalty(words(201), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(7); // round(10 * 0.7)
  });

  test('boundary exactly at 2.5x: still the 2.0x tier', () => {
    const result = getLengthPenalty(words(250), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(7);
  });

  test('just over 2.5x: full penalty, capped at maxPenalty', () => {
    const result = getLengthPenalty(words(251), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(10);
  });

  test('extreme overage never exceeds maxPenalty', () => {
    const result = getLengthPenalty(words(10000), target, { maxPenalty: 10 });
    expect(result.penalty).toBe(10);
  });

  test('maxPenalty option is respected', () => {
    const result = getLengthPenalty(words(251), target, { maxPenalty: 5 });
    expect(result.penalty).toBe(5);
  });

  test('defaults maxPenalty to 10 when not specified', () => {
    const result = getLengthPenalty(words(251), target);
    expect(result.penalty).toBe(10);
  });

  test('targetWords <= 0 does not throw and reports ratio 0', () => {
    const result = getLengthPenalty(words(50), 0);
    expect(result.penalty).toBe(0);
    expect(result.ratio).toBe(0);
  });

  test('returns wordCount and targetWords for display', () => {
    const result = getLengthPenalty(words(300), target);
    expect(result.wordCount).toBe(300);
    expect(result.targetWords).toBe(100);
  });

  test('penalized results include a human-readable issue', () => {
    const result = getLengthPenalty(words(300), target);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain('300 words');
  });
});

describe('ADR length penalty wiring', () => {
  const shortAdr = `# ADR: Use Postgres

## Status
Accepted

## Context and Problem Statement
We need a database.

## Decision Drivers
- Cost
- Team familiarity

## Considered Options
1. Postgres
2. MySQL

## Decision Outcome
We will use Postgres because the team knows it well.

## Consequences
### Positive Consequences
- Good, because team can move fast
### Negative Consequences
- Bad, because scaling writes needs more planning

## Confirmation
Validated via architecture review.
`;

  test('a concise ADR under ~550 words incurs no length penalty', () => {
    const result = validateADR(shortAdr);
    expect(result.lengthCheck).toBeDefined();
    expect(result.lengthCheck.penalty).toBe(0);
  });

  test('an ADR padded well past the target incurs a scaling length penalty', () => {
    const bloatedAdr = shortAdr.repeat(20); // ~1600 words, > 2.5x the 550-word target
    const result = validateADR(bloatedAdr);
    expect(result.lengthCheck.penalty).toBeGreaterThan(0);
    expect(result.totalScore).toBeLessThan(validateADR(shortAdr).totalScore);
    expect(result.issues.some((i) => i.includes('word'))).toBe(true);
  });
});

describe('PRD length penalty is scope-aware end to end', () => {
  const fixturePath = join(__dirname, 'fixtures', 'prd-project-verity.md');
  const fixtureContent = readFileSync(fixturePath, 'utf-8');

  test('the fixture is long enough to trigger the default (Feature-scope) penalty', () => {
    const result = validatePRD(fixtureContent);
    expect(result.lengthCheck.targetWords).toBe(1500);
    expect(result.lengthCheck.penalty).toBeGreaterThan(0);
  });

  test('declaring the same document as Product scope removes the penalty', () => {
    // This is the behavior formData threading exists to enable -- previously
    // asserted only in a code comment, never executed. See llm-skill-review
    // finding (2026-07-25).
    const result = validatePRD(fixtureContent, { documentScope: 'product' });
    expect(result.lengthCheck.targetWords).toBe(6000);
    expect(result.lengthCheck.penalty).toBe(0);
  });

  test('declaring the document as Epic scope gives an intermediate target', () => {
    const result = validatePRD(fixtureContent, { documentScope: 'epic' });
    expect(result.lengthCheck.targetWords).toBe(3000);
  });

  test('an unrecognized scope value falls back to the Feature default rather than throwing', () => {
    const result = validatePRD(fixtureContent, { documentScope: 'not-a-real-scope' });
    expect(result.lengthCheck.targetWords).toBe(1500);
  });

  test('no declared scope discloses that the Feature default was assumed', () => {
    // The standalone Validator tool has no Document Scope selector, so a legitimately
    // long Product PRD pasted there would otherwise read as silently "bloated" with
    // no explanation (llm-skill-review finding, 2026-07-25).
    const result = validatePRD(fixtureContent);
    expect(result.issues.some((i) => i.includes('no Document Scope was declared'))).toBe(true);
  });

  test('a correctly-declared scope does not carry the no-scope-declared disclosure', () => {
    const result = validatePRD(fixtureContent, { documentScope: 'product' });
    expect(result.issues.some((i) => i.includes('no Document Scope was declared'))).toBe(false);
  });
});

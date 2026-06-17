/**
 * KB Article Validator — Full Integration Tests (Phase D)
 * Covers: fixture scoring, theater gate, dual-alias contract, structure, helpers.
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel,
} from '../plugins/kb/js/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
  return readFileSync(join(__dirname, 'fixtures/kb', name), 'utf8');
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const goodTroubleshooting = loadFixture('good-troubleshooting.md');
const goodHowTo = loadFixture('good-how-to.md');
const polishedTheater = loadFixture('polished-theater.md');
const resolutionTheater = loadFixture('resolution-theater.md');
const minimal = loadFixture('minimal.md');
const vagueEscalation = loadFixture('vague-escalation.md');

// ── Empty / whitespace input ──────────────────────────────────────────────────

describe('validateDocument — empty/null input', () => {
  it('returns score 0 for empty string', () => {
    expect(validateDocument('').totalScore).toBe(0);
  });

  it('returns score 0 for whitespace-only input', () => {
    expect(validateDocument('   \n\t  ').totalScore).toBe(0);
  });

  it('returns issues=["No content"] for empty string', () => {
    expect(validateDocument('').issues).toEqual(['No content']);
  });

  it('does not throw for null input', () => {
    expect(() => validateDocument(null)).not.toThrow();
  });

  it('does not throw for undefined input', () => {
    expect(() => validateDocument(undefined)).not.toThrow();
  });
});

// ── Result structure ──────────────────────────────────────────────────────────

describe('validateDocument — result structure', () => {
  it('returns all required top-level keys', () => {
    const result = validateDocument(goodTroubleshooting);
    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('rawTotal');
    expect(result).toHaveProperty('theaterGateApplied');
    expect(result).toHaveProperty('articleType');
    expect(result).toHaveProperty('findability');
    expect(result).toHaveProperty('resolutionQuality');
    expect(result).toHaveProperty('completeness');
    expect(result).toHaveProperty('precision');
    expect(result).toHaveProperty('selfService');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('strengths');
  });

  it('returns dimension1–dimension5 aliases', () => {
    const result = validateDocument(goodTroubleshooting);
    expect(result).toHaveProperty('dimension1');
    expect(result).toHaveProperty('dimension2');
    expect(result).toHaveProperty('dimension3');
    expect(result).toHaveProperty('dimension4');
    expect(result).toHaveProperty('dimension5');
  });

  it('dimension1 score equals findability score', () => {
    const result = validateDocument(goodTroubleshooting);
    expect(result.dimension1.score).toBe(result.findability.score);
  });

  it('dimension5 score equals selfService score', () => {
    const result = validateDocument(goodTroubleshooting);
    expect(result.dimension5.score).toBe(result.selfService.score);
  });

  it('dimension aliases are independent copies (mutating one does not affect other)', () => {
    const result = validateDocument(goodTroubleshooting);
    const original = result.findability.issues.length;
    result.dimension1.issues.push('synthetic');
    expect(result.findability.issues).toHaveLength(original);
  });

  it('maxScore sums to 100 across all dimensions', () => {
    const result = validateDocument(goodTroubleshooting);
    const total = result.findability.maxScore + result.resolutionQuality.maxScore +
      result.completeness.maxScore + result.precision.maxScore + result.selfService.maxScore;
    expect(total).toBe(100);
  });
});

// ── Article type detection ────────────────────────────────────────────────────

describe('validateDocument — articleType detection', () => {
  it('detects troubleshooting from metadata', () => {
    expect(validateDocument(goodTroubleshooting).articleType).toBe('troubleshooting');
  });

  it('detects how-to from metadata', () => {
    expect(validateDocument(goodHowTo).articleType).toBe('how-to');
  });

  it('falls back to troubleshooting when no metadata or title signal', () => {
    const noMeta = '# Some random article\n\nContent here.';
    expect(validateDocument(noMeta).articleType).toBe('troubleshooting');
  });
});

// ── Good troubleshooting fixture ──────────────────────────────────────────────

describe('good-troubleshooting.md', () => {
  let result;
  beforeAll(() => { result = validateDocument(goodTroubleshooting); });

  it('scores ≥80', () => {
    expect(result.totalScore).toBeGreaterThanOrEqual(80);
  });

  it('theater gate is NOT applied', () => {
    expect(result.theaterGateApplied).toBe(false);
  });

  it('findability (D1) scores ≥15', () => {
    expect(result.findability.score).toBeGreaterThanOrEqual(15);
  });

  it('resolutionQuality (D2) scores ≥20', () => {
    expect(result.resolutionQuality.score).toBeGreaterThanOrEqual(20);
  });

  it('completeness (D3) scores ≥18', () => {
    expect(result.completeness.score).toBeGreaterThanOrEqual(18);
  });
});

// ── Good how-to fixture ───────────────────────────────────────────────────────

describe('good-how-to.md', () => {
  let result;
  beforeAll(() => { result = validateDocument(goodHowTo); });

  it('scores ≥80', () => {
    expect(result.totalScore).toBeGreaterThanOrEqual(80);
  });

  it('theater gate is NOT applied', () => {
    expect(result.theaterGateApplied).toBe(false);
  });

  it('articleType is how-to', () => {
    expect(result.articleType).toBe('how-to');
  });
});

// ── Polished theater fixture ──────────────────────────────────────────────────

describe('polished-theater.md', () => {
  let result;
  beforeAll(() => { result = validateDocument(polishedTheater); });

  it('theater gate IS applied', () => {
    expect(result.theaterGateApplied).toBe(true);
  });

  it('totalScore is ≤49', () => {
    expect(result.totalScore).toBeLessThanOrEqual(49);
  });

  it('resolutionQuality (D2) scores 0 (pure theater)', () => {
    expect(result.resolutionQuality.score).toBe(0);
  });

  it('issues array contains theater gate message', () => {
    const gateMsg = result.issues.find(i => i.includes('Resolution Theater'));
    expect(gateMsg).toBeDefined();
  });
});

// ── Resolution theater fixture ────────────────────────────────────────────────

describe('resolution-theater.md', () => {
  let result;
  beforeAll(() => { result = validateDocument(resolutionTheater); });

  it('theater gate IS applied', () => {
    expect(result.theaterGateApplied).toBe(true);
  });

  it('totalScore is ≤49', () => {
    expect(result.totalScore).toBeLessThanOrEqual(49);
  });
});

// ── Minimal fixture ───────────────────────────────────────────────────────────

describe('minimal.md', () => {
  it('scores ≤30', () => {
    expect(validateDocument(minimal).totalScore).toBeLessThanOrEqual(30);
  });
});

// ── Vague escalation fixture ──────────────────────────────────────────────────

describe('vague-escalation.md', () => {
  let result;
  beforeAll(() => { result = validateDocument(vagueEscalation); });

  it('scores ≤80 (strong D2 but penalized D3/D5)', () => {
    expect(result.totalScore).toBeLessThanOrEqual(80);
  });

  it('theater gate NOT applied (has specificity signals)', () => {
    expect(result.theaterGateApplied).toBe(false);
  });

  it('completeness (D3) penalized (missing escalation components)', () => {
    expect(result.completeness.score).toBeLessThan(20);
  });
});

// ── Helper functions ──────────────────────────────────────────────────────────

describe('getGrade', () => {
  it('≥90 → A', () => expect(getGrade(90)).toBe('A'));
  it('80 → B', () => expect(getGrade(80)).toBe('B'));
  it('70 → C', () => expect(getGrade(70)).toBe('C'));
  it('50 → D', () => expect(getGrade(50)).toBe('D'));
  it('49 → F', () => expect(getGrade(49)).toBe('F'));
});

describe('getScoreColor', () => {
  it('≥80 → green', () => expect(getScoreColor(80)).toBe('green'));
  it('70 → yellow', () => expect(getScoreColor(70)).toBe('yellow'));
  it('50 → orange', () => expect(getScoreColor(50)).toBe('orange'));
  it('49 → red', () => expect(getScoreColor(49)).toBe('red'));
});

describe('getScoreLabel', () => {
  it('≥90 → Excellent', () => expect(getScoreLabel(90)).toBe('Excellent'));
  it('80 → Ready', () => expect(getScoreLabel(80)).toBe('Ready'));
  it('70 → Needs Polish', () => expect(getScoreLabel(70)).toBe('Needs Polish'));
  it('50 → Needs Work', () => expect(getScoreLabel(50)).toBe('Needs Work'));
  it('49 → Incomplete', () => expect(getScoreLabel(49)).toBe('Incomplete'));
});

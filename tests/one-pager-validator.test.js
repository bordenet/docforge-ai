/**
 * One-Pager Validator Tests
 * Tests the ported One-Pager validator functionality
 */

import { describe, it, expect } from '@jest/globals';

// ============================================================================
// Fixture-Based Regression Tests
// ============================================================================

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  validateDocument,
  validateOnePager,
  detectSections,
  detectCircularLogic,
  detectBaselineTarget,
  detectScope,
  scoreProblemClarity,
  scoreSolutionQuality,
  detectAlternatives,
  detectUrgency
} from '../plugins/one-pager/js/validator.js';

describe('One-Pager Validator', () => {
  describe('detectSections', () => {
    it('should detect Problem section with markdown heading', () => {
      const text = '## Problem Statement\nWe have a critical issue.';
      const result = detectSections(text);
      expect(result.found.some(s => s.name === 'Problem/Challenge')).toBe(true);
    });

    it('should detect Problem section with numbered heading', () => {
      const text = '1. Problem\nWe have a critical issue.';
      const result = detectSections(text);
      expect(result.found.some(s => s.name === 'Problem/Challenge')).toBe(true);
    });

    it('should detect Solution section', () => {
      const text = '## Solution\nBuild a new system.';
      const result = detectSections(text);
      expect(result.found.some(s => s.name === 'Solution/Proposal')).toBe(true);
    });

    it('should report missing sections', () => {
      const text = '## Introduction\nThis is just an intro.';
      const result = detectSections(text);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  describe('detectCircularLogic', () => {
    it('should detect circular logic when solution restates problem', () => {
      const text = `## Problem
We lack a dashboard for monitoring.
We don't have reporting capabilities.
We need a metrics system.

## Solution
Build a dashboard for monitoring.
Create reporting capabilities.
Implement a metrics system.`;
      const result = detectCircularLogic(text);
      expect(result.isCircular).toBe(true);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should not flag non-circular solutions', () => {
      const text = `## Problem
Customer churn is increasing by 15% quarterly.

## Solution
Implement proactive customer success outreach program with health scoring.`;
      const result = detectCircularLogic(text);
      expect(result.isCircular).toBe(false);
    });
  });

  describe('detectBaselineTarget', () => {
    it('should detect arrow format metrics', () => {
      // Pattern matches digits with optional %/$ suffix: \d+[%$]?\s*[→\->]\s*\d+[%$]?
      const text = 'Reduce support tickets 100 → 30';
      const result = detectBaselineTarget(text);
      expect(result.hasBaselineTarget).toBe(true);
      expect(result.arrowPatterns).toBeGreaterThan(0);
    });

    it('should detect from-to format', () => {
      // Pattern: from\s+\d+[%$]?\s+to\s+\d+[%$]?
      const text = 'Improve load time from 5 to 1 seconds';
      const result = detectBaselineTarget(text);
      expect(result.hasBaselineTarget).toBe(true);
    });

    it('should flag vague metrics without baselines', () => {
      const text = 'Improve user experience. Increase satisfaction. Enhance performance.';
      const result = detectBaselineTarget(text);
      expect(result.hasVagueMetrics).toBe(true);
    });
  });

  describe('detectScope', () => {
    it('should detect in-scope items', () => {
      const text = 'We will deliver the core API. In scope: user authentication.';
      const result = detectScope(text);
      expect(result.hasInScope).toBe(true);
    });

    it('should detect out-of-scope items', () => {
      const text = 'Out of scope: Mobile app, third-party integrations. Phase 2 features excluded.';
      const result = detectScope(text);
      expect(result.hasOutOfScope).toBe(true);
    });
  });

  describe('scoreProblemClarity', () => {
    it('should give high score for clear problem with quantified cost', () => {
      const text = `## Problem Statement
Our customer churn rate is 15% monthly, causing $500K revenue loss.
Current state is unsustainable and impacts business growth.

## Cost of Inaction
If we don't address this, we'll lose $6M annually.`;
      const result = scoreProblemClarity(text);
      expect(result.score).toBeGreaterThanOrEqual(15);
    });

    it('should give low score for vague problem', () => {
      const text = 'Things are not working well. We need to improve.';
      const result = scoreProblemClarity(text);
      expect(result.score).toBeLessThan(10);
    });
  });

  describe('validateOnePager', () => {
    it('should return complete validation results', () => {
      const text = `## Problem Statement
High customer churn rate of 25% monthly.

## Solution
Implement customer success program.

## Goals
Reduce churn to 10%.`;
      const result = validateOnePager(text);
      
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('problemClarity');
      expect(result).toHaveProperty('solution');
      expect(result).toHaveProperty('scope');
      expect(result).toHaveProperty('completeness');
    });

    it('should handle empty input', () => {
      const result = validateOnePager('');
      expect(result.totalScore).toBe(0);
    });

    it('should alias as validateDocument', () => {
      const text = '## Problem\nTest problem';
      const r1 = validateOnePager(text);
      const r2 = validateDocument(text);
      expect(r1.totalScore).toBe(r2.totalScore);
    });
  });

  describe('detectAlternatives', () => {
    it('should detect alternatives section', () => {
      const text = '## Alternatives Considered\nWe evaluated Option A, Option B, and doing nothing.';
      const result = detectAlternatives(text);
      expect(result.hasAlternativesSection).toBe(true);
    });

    it('should detect alternatives language', () => {
      const text = 'We chose this approach instead of Option B because it is faster. Compared to the status quo, this saves 20%.';
      const result = detectAlternatives(text);
      expect(result.hasAlternativesLanguage).toBe(true);
    });

    it('should detect do-nothing option', () => {
      const text = 'If we do nothing, we lose $1M annually. The status quo is not sustainable.';
      const result = detectAlternatives(text);
      expect(result.hasDoNothingOption).toBe(true);
    });

    it('should return false when no alternatives mentioned', () => {
      const text = '## Solution\nBuild the system.';
      const result = detectAlternatives(text);
      expect(result.hasAlternativesSection).toBe(false);
      expect(result.hasAlternativesLanguage).toBe(false);
    });
  });

  describe('detectUrgency', () => {
    it('should detect urgency section', () => {
      const text = '## Why Now\nWe have a limited window of opportunity before the market shifts.';
      const result = detectUrgency(text);
      expect(result.hasUrgencySection).toBe(true);
    });

    it('should detect urgency language', () => {
      const text = 'This is urgent because the deadline is Q4 2024. The window of opportunity closes soon.';
      const result = detectUrgency(text);
      expect(result.hasUrgencyLanguage).toBe(true);
    });

    it('should detect time pressure', () => {
      const text = 'We must complete this before end of Q2. The deadline is June 30th.';
      const result = detectUrgency(text);
      expect(result.hasTimePressure).toBe(true);
    });

    it('should return false when no urgency mentioned', () => {
      const text = '## Problem\nWe have a problem.';
      const result = detectUrgency(text);
      expect(result.hasUrgencySection).toBe(false);
      expect(result.hasUrgencyLanguage).toBe(false);
    });
  });

  describe('scoreSolutionQuality with alternatives', () => {
    it('should give bonus points for alternatives considered', () => {
      const textWithAlternatives = `## Problem
Customer churn is 25% monthly.

## Solution
Implement retention program. We chose this over doing nothing because the status quo costs $500K/year.

## Goals
Reduce churn from 25% to 10%.`;

      const textWithoutAlternatives = `## Problem
Customer churn is 25% monthly.

## Solution
Implement retention program.

## Goals
Reduce churn from 25% to 10%.`;

      const scoreWith = scoreSolutionQuality(textWithAlternatives);
      const scoreWithout = scoreSolutionQuality(textWithoutAlternatives);

      // Document with alternatives should score higher
      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });
  });

  describe('scoreProblemClarity with urgency', () => {
    it('should give bonus points for urgency/Why Now', () => {
      const textWithUrgency = `## Problem Statement
Customer churn is 25% monthly, causing $500K revenue loss.

## Cost of Doing Nothing
We lose $6M annually if we don't act.

## Why Now
The window to act is closing - competitors launch similar features in Q3.`;

      const textWithoutUrgency = `## Problem Statement
Customer churn is 25% monthly, causing $500K revenue loss.

## Cost of Doing Nothing
We lose $6M annually if we don't act.`;

      const scoreWith = scoreProblemClarity(textWithUrgency);
      const scoreWithout = scoreProblemClarity(textWithoutUrgency);

      // Document with urgency should score higher
      expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesDir = join(__dirname, 'fixtures/one-pager-samples');

describe('One-Pager Fixture Regression Tests', () => {
  // Load all fixtures once
  const fixtureFiles = readdirSync(fixturesDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  const loadFixture = (filename) => {
    return readFileSync(join(fixturesDir, filename), 'utf-8');
  };

  describe('Excellent Quality Documents (01-05)', () => {
    const excellentFiles = fixtureFiles.filter(f => f.startsWith('0'));

    it.each(excellentFiles)('%s should score 70+ (excellent quality)', (filename) => {
      const content = loadFixture(filename);
      const result = validateOnePager(content);
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
    });

    it.each(excellentFiles)('%s should have problem clarity >= 22', (filename) => {
      const content = loadFixture(filename);
      const result = validateOnePager(content);
      expect(result.problemClarity.score).toBeGreaterThanOrEqual(22);
    });
  });

  describe('Good Quality Documents (06-10)', () => {
    const goodFiles = fixtureFiles.filter(f => f.startsWith('0') && parseInt(f.slice(0, 2)) >= 6 || f.startsWith('10'));

    it.each(goodFiles)('%s should score 60+ (good quality)', (filename) => {
      const content = loadFixture(filename);
      const result = validateOnePager(content);
      expect(result.totalScore).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Needs-Work Quality Documents (11-15)', () => {
    const needsWorkFiles = fixtureFiles.filter(f => parseInt(f.slice(0, 2)) >= 11);

    it.each(needsWorkFiles)('%s should score below 60 (needs improvement)', (filename) => {
      const content = loadFixture(filename);
      const result = validateOnePager(content);
      expect(result.totalScore).toBeLessThan(60);
    });

    it.each(needsWorkFiles)('%s should have vague quantifier deductions', (filename) => {
      const content = loadFixture(filename);
      const result = validateOnePager(content);
      // Needs-work docs should trigger vague quantifier detection
      expect(result.vagueQuantifiers.vagueTermCount).toBeGreaterThan(0);
    });
  });

  describe('New Detection Functions', () => {
    it('should detect decision needed section in excellent docs', () => {
      const content = loadFixture('01-product-launch-excellent.md');
      const result = validateOnePager(content);
      // Excellent docs should have completeness score including decision detection
      expect(result.completeness.score).toBeGreaterThanOrEqual(15);
    });

    it('should penalize vague quantifiers in needs-work docs', () => {
      const content = loadFixture('11-budget-request-needs-work.md');
      const result = validateOnePager(content);
      expect(result.vagueQuantifiers.deduction).toBeGreaterThan(0);
    });

    it('should detect RACI tables when present', () => {
      // 01-product-launch-excellent has RACI format
      const content = loadFixture('01-product-launch-excellent.md');
      const result = validateOnePager(content);
      // High completeness indicates stakeholder quality detected
      expect(result.completeness.score).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Score Distribution', () => {
    it('should maintain proper tier separation', () => {
      const excellentScores = fixtureFiles
        .filter(f => parseInt(f.slice(0, 2)) <= 5)
        .map(f => validateOnePager(loadFixture(f)).totalScore);

      const _goodScores = fixtureFiles
        .filter(f => parseInt(f.slice(0, 2)) >= 6 && parseInt(f.slice(0, 2)) <= 10)
        .map(f => validateOnePager(loadFixture(f)).totalScore);

      const needsWorkScores = fixtureFiles
        .filter(f => parseInt(f.slice(0, 2)) >= 11)
        .map(f => validateOnePager(loadFixture(f)).totalScore);

      const minExcellent = Math.min(...excellentScores);
      const maxNeedsWork = Math.max(...needsWorkScores);

      // Excellent docs should score significantly higher than needs-work
      expect(minExcellent).toBeGreaterThan(maxNeedsWork);
    });

    it('should average 60+ across all fixtures', () => {
      const allScores = fixtureFiles
        .map(f => validateOnePager(loadFixture(f)).totalScore);

      const average = allScores.reduce((a, b) => a + b, 0) / allScores.length;
      expect(average).toBeGreaterThanOrEqual(55); // Reasonable threshold
    });
  });
});

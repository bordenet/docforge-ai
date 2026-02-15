/**
 * One-Pager Validator Tests
 * Tests the ported One-Pager validator functionality
 */

import { describe, it, expect } from '@jest/globals';
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


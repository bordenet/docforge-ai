/**
 * ADR Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectContext,
  detectDecision,
  detectOptions,
  detectConsequences,
  detectStatus,
  detectRationale,
  detectSections,
  scoreContext,
  scoreDecision,
  scoreConsequences,
  scoreStatus,
  validateADR,
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel
} from '../plugins/adr/js/validator.js';

describe('ADR Validator', () => {
  describe('detectContext', () => {
    it('should detect context section with constraints', () => {
      const text = `## Context
Our current system has constraints on scalability. The requirement is to handle 1000 users.
This is a business challenge for our customer base.`;
      const result = detectContext(text);
      expect(result.hasContextSection).toBe(true);
      expect(result.hasContextLanguage).toBe(true);
      expect(result.hasConstraints).toBe(true);
      expect(result.hasBusinessFocus).toBe(true);
    });

    it('should detect context language without section', () => {
      const text = 'The problem is our system needs improvement. This constraint limits us.';
      const result = detectContext(text);
      expect(result.hasContextLanguage).toBe(true);
      expect(result.hasConstraints).toBe(true);
    });
  });

  describe('detectDecision', () => {
    it('should detect decision with clarity', () => {
      const text = `## Decision
We will implement PostgreSQL as our database because it meets our requirements.
We chose to adopt this solution specifically for its reliability.`;
      const result = detectDecision(text);
      expect(result.hasDecisionSection).toBe(true);
      expect(result.hasDecisionLanguage).toBe(true);
      expect(result.hasClarity).toBe(true);
      expect(result.hasActionVerbs).toBe(true);
    });

    it('should detect vague decision patterns', () => {
      const text = 'We will adopt a strategic approach to improve scalability.';
      const result = detectDecision(text);
      expect(result.hasVagueDecision).toBe(true);
    });
  });

  describe('detectOptions', () => {
    it('should detect options with comparison', () => {
      // Pattern requires "reject" not "rejected", or "ruled out", "dismissed", etc.
      const text = `## Options Considered
Option A: PostgreSQL - advantage of reliability, disadvantage of cost.
Option B: MySQL - we ruled out this option due to limitations.`;
      const result = detectOptions(text);
      expect(result.hasOptionsSection).toBe(true);
      expect(result.hasOptionsLanguage).toBe(true);
      expect(result.hasComparison).toBe(true);
      expect(result.hasRejected).toBe(true);
    });
  });

  describe('detectConsequences', () => {
    it('should detect balanced consequences', () => {
      const text = `## Consequences
Benefits: faster performance, easier maintenance, better scalability.
Drawbacks: migration cost, risk of downtime, slower initial adoption.`;
      const result = detectConsequences(text);
      expect(result.hasConsequencesSection).toBe(true);
      expect(result.hasPositive).toBe(true);
      expect(result.hasNegative).toBe(true);
      expect(result.hasBothPosNeg).toBe(true);
    });

    it('should detect vague consequence terms', () => {
      const text = 'This adds complexity and overhead to the system.';
      const result = detectConsequences(text);
      expect(result.hasVagueConsequences).toBe(true);
    });
  });

  describe('detectStatus', () => {
    it('should detect status with date', () => {
      const text = `## Status
Accepted on 2026-02-14. This decision was approved.`;
      const result = detectStatus(text);
      expect(result.hasStatusSection).toBe(true);
      expect(result.hasStatusValue).toBe(true);
      expect(result.hasDate).toBe(true);
      expect(result.hasAccepted).toBe(true);
    });
  });

  describe('detectRationale', () => {
    it('should detect rationale with evidence', () => {
      const text = `## Rationale
Because our benchmark data shows 40% improvement, we chose this approach.
The evidence demonstrates clear benefits.`;
      const result = detectRationale(text);
      expect(result.hasRationaleSection).toBe(true);
      expect(result.hasRationaleLanguage).toBe(true);
      expect(result.hasEvidence).toBe(true);
    });
  });

  describe('detectSections', () => {
    it('should identify found and missing sections', () => {
      const text = `## Context
Some context here.
## Decision
A clear decision.`;
      const result = detectSections(text);
      expect(result.found.length).toBeGreaterThanOrEqual(2);
      expect(result.found.some(s => s.name === 'Context')).toBe(true);
      expect(result.found.some(s => s.name === 'Decision')).toBe(true);
    });
  });

  describe('scoreContext', () => {
    it('should give high score for comprehensive context', () => {
      const text = `## Context
Our business faces a challenge with customer growth. We have constraints on current capacity.
The requirement is to scale to 10000 users. Revenue impact is 50 thousand dollars.`;
      const result = scoreContext(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should identify missing elements', () => {
      const text = 'Some vague text about things.';
      const result = scoreContext(text);
      expect(result.score).toBeLessThan(10);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreDecision', () => {
    it('should give high score for clear decision', () => {
      const text = `## Decision
We will implement PostgreSQL because our data shows it handles our load.
We considered MySQL, Redis, MongoDB but chose PostgreSQL for ACID compliance.`;
      const result = scoreDecision(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should penalize vague decisions', () => {
      const text = 'We will adopt a strategic approach to improve scalability.';
      const result = scoreDecision(text);
      expect(result.issues.some(i => i.includes('Vague'))).toBe(true);
    });
  });

  describe('scoreConsequences', () => {
    it('should give high score for balanced consequences', () => {
      const text = `## Consequences
Benefits: faster, easier, better, scalable, maintainable, testable.
Drawbacks: risk, cost, slower, harder, latency, bottleneck.
Training needs will require team ramp-up.
This triggers a follow-on ADR for migration strategy.
Review in 90 days to reassess.`;
      const result = scoreConsequences(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should penalize vague consequence terms', () => {
      const text = 'This adds complexity and overhead.';
      const result = scoreConsequences(text);
      expect(result.issues.some(i => i.includes('Vague'))).toBe(true);
    });
  });

  describe('scoreStatus', () => {
    it('should give high score for complete status', () => {
      const text = `## Status
Accepted on 2026-02-14.
## Context
Background info.
## Decision
We chose this.
## Consequences
Impact details.
## Options
Alternatives considered.
## Rationale
Why we chose this.`;
      const result = scoreStatus(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('validateADR', () => {
    it('should return complete validation results', () => {
      const adr = `# ADR: Use PostgreSQL for Primary Database

## Status
Accepted on 2026-02-14

## Context
Our business needs a reliable database for customer data. The constraint is ACID compliance.
We must handle 10000 transactions per hour for revenue processing.

## Decision
We will implement PostgreSQL because benchmark data shows 99.9% reliability.
We considered MySQL, MongoDB, Redis but chose PostgreSQL for ACID compliance.

## Consequences
Benefits: faster queries, easier maintenance, better reliability, scalable architecture.
Drawbacks: migration cost, risk during transition, slower initial adoption.
Training needs for team members require 2 weeks ramp-up.
This triggers ADR-002 for data migration strategy.
Review in 90 days to reassess performance.

## Options Considered
Option A: MySQL - good but lacks features vs PostgreSQL.
Option B: MongoDB - rejected due to ACID requirements.

## Rationale
Because our benchmark demonstrates clear advantages.`;

      const result = validateADR(adr);
      expect(result.totalScore).toBeGreaterThan(60);
      expect(result.context.score).toBeGreaterThan(0);
      expect(result.decision.score).toBeGreaterThan(0);
      expect(result.consequences.score).toBeGreaterThan(0);
      expect(result.status.score).toBeGreaterThan(0);
      expect(result.dimension1).toBe(result.context);
      expect(result.dimension2).toBe(result.decision);
      expect(result.dimension3).toBe(result.consequences);
      expect(result.dimension4).toBe(result.status);
    });

    it('should handle empty input', () => {
      const result = validateADR('');
      expect(result.totalScore).toBe(0);
      expect(result.issues).toContain('No content to validate');
    });

    it('should alias as validateDocument', () => {
      const adr = '## Decision\nWe chose PostgreSQL.';
      const result1 = validateADR(adr);
      const result2 = validateDocument(adr);
      expect(result1.totalScore).toBe(result2.totalScore);
    });
  });

  describe('Helper functions', () => {
    it('getGrade should return correct grades', () => {
      expect(getGrade(95)).toBe('A');
      expect(getGrade(85)).toBe('B');
      expect(getGrade(75)).toBe('C');
      expect(getGrade(65)).toBe('D');
      expect(getGrade(55)).toBe('F');
    });

    it('getScoreColor should return correct colors', () => {
      expect(getScoreColor(80)).toBe('green');
      expect(getScoreColor(60)).toBe('yellow');
      expect(getScoreColor(40)).toBe('orange');
      expect(getScoreColor(20)).toBe('red');
    });

    it('getScoreLabel should return correct labels', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
      expect(getScoreLabel(75)).toBe('Ready');
      expect(getScoreLabel(55)).toBe('Needs Work');
      expect(getScoreLabel(35)).toBe('Draft');
      expect(getScoreLabel(15)).toBe('Incomplete');
    });
  });
});


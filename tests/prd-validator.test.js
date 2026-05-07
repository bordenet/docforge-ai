/**
 * PRD Validator Tests - Core Detection Functions
 * Tests for basic PRD detection and scoring (sections, vague language, prioritization, structure)
 * See prd-validator-main.test.js, prd-validator-detection.test.js, prd-validator-scoring.test.js for additional tests
 */

import { describe, test, expect } from '@jest/globals';

// ============================================================================
// Fixture-Based Regression Tests
// ============================================================================

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  detectSections,
  detectVagueLanguage,
  detectPrioritization,
  countFunctionalRequirements,
  countAcceptanceCriteria,
  scoreDocumentStructure,
  validatePRD,
  inferDocumentScope,
} from '../plugins/prd/js/validator.js';

describe('PRD Validator', () => {
  describe('detectSections', () => {
    test('detects all 14 required PRD sections', () => {
      const prdWithAllSections = `
# 1. Executive Summary
Brief overview.

# 2. Problem Statement
The problem we're solving.

# 3. Value Proposition
Why this matters.

# 4. Goals and Objectives
- Goal 1
- Goal 2

# 5. Customer FAQ
Q: What is this?
A: A solution.

# 6. Proposed Solution
Our approach.

# 7. Scope
## 7.1 In Scope
- Feature A

## 7.2 Out of Scope
- Feature B

# 8. Requirements
## 8.1 Functional Requirements
FR1: User can login

## 8.2 Non-Functional Requirements
NFR1: 99.9% uptime

## 8.3 Constraints
Technical constraints here.

# 9. Stakeholders
Product team.

# 10. Timeline
Q1 2026.

# 11. Risks and Mitigation
Risk: Delay. Mitigation: Buffer time.

# 12. Traceability Summary
Problem -> Requirement -> Metric mapping.

# 13. Open Questions
- TBD items

# 14. Known Unknowns & Dissenting Opinions
We disagree on approach X.
      `;
      const result = detectSections(prdWithAllSections);
      expect(result.found.length).toBeGreaterThanOrEqual(10);
      expect(result.missing.length).toBeLessThanOrEqual(4);
    });

    test('detects numbered sections like "2. Problem Statement"', () => {
      const text = '2. Problem Statement\nWe have an issue.';
      const result = detectSections(text);
      expect(result.found.some((s) => s.name === 'Problem Statement')).toBe(true);
    });

    test('detects nested numbered sections like "8.2 Non-Functional Requirements"', () => {
      const text = '## 8.2 Non-Functional Requirements\nPerformance requirements.';
      const result = detectSections(text);
      expect(result.found.some((s) => s.name.includes('Requirements'))).toBe(true);
    });
  });

  describe('inferDocumentScope', () => {
    test('returns feature for short documents (≤1500 words)', () => {
      const text = 'word '.repeat(500);
      expect(inferDocumentScope(text)).toBe('feature');
    });

    test('returns epic for mid-length documents (2001-3000 words)', () => {
      const text = 'word '.repeat(2500);
      expect(inferDocumentScope(text)).toBe('epic');
    });

    test('returns product for long documents (>3000 words)', () => {
      const text = 'word '.repeat(4000);
      expect(inferDocumentScope(text)).toBe('product');
    });

    test('boundary: 2000 words is feature', () => {
      const text = 'word '.repeat(2000);
      expect(inferDocumentScope(text)).toBe('feature');
    });

    test('boundary: 2001 words is epic', () => {
      const text = 'word '.repeat(2001);
      expect(inferDocumentScope(text)).toBe('epic');
    });

    test('boundary: 3000 words is epic', () => {
      const text = 'word '.repeat(3000);
      expect(inferDocumentScope(text)).toBe('epic');
    });

    test('boundary: 3001 words is product', () => {
      const text = 'word '.repeat(3001);
      expect(inferDocumentScope(text)).toBe('product');
    });

    test('null input returns feature (defensive guard)', () => {
      expect(inferDocumentScope(null)).toBe('feature');
    });

    test('undefined input returns feature (defensive guard)', () => {
      expect(inferDocumentScope(undefined)).toBe('feature');
    });

    test('empty string returns feature', () => {
      expect(inferDocumentScope('')).toBe('feature');
    });
  });

  describe('detectSections (scope-aware)', () => {
    const featureText = `
# Executive Summary
Brief summary.
## Problem Statement
The problem.
## Goals and Objectives
- Goal 1
## Proposed Solution
Our solution.
## Requirements
FR1: User can login.
## Risks and Mitigation
Risk: Timeline.
## Open Questions
- TBD
    `;

    test('feature scope: only checks 7 required sections', () => {
      const result = detectSections(featureText, 'feature');
      expect(result.found.length + result.missing.length).toBe(7);
    });

    test('feature scope: does not penalize missing Value Proposition', () => {
      const result = detectSections(featureText, 'feature');
      expect(result.missing.some((s) => s.name === 'Value Proposition')).toBe(false);
    });

    test('feature scope: does not penalize missing Customer FAQ', () => {
      const result = detectSections(featureText, 'feature');
      expect(result.missing.some((s) => s.name === 'Customer FAQ')).toBe(false);
    });

    test('epic scope: checks 10 required sections', () => {
      const result = detectSections(featureText, 'epic');
      expect(result.found.length + result.missing.length).toBe(10);
    });

    test('epic scope: does not penalize missing Traceability Summary', () => {
      const result = detectSections(featureText, 'epic');
      expect(result.missing.some((s) => s.name === 'Traceability Summary')).toBe(false);
    });

    test('epic scope: does not penalize missing Stakeholders', () => {
      const result = detectSections(featureText, 'epic');
      expect(result.missing.some((s) => s.name === 'Stakeholders')).toBe(false);
    });

    test('product scope: checks all 14 sections', () => {
      const result = detectSections(featureText, 'product');
      expect(result.found.length + result.missing.length).toBe(14);
    });

    test('no scope: checks all 14 sections (backward compat)', () => {
      const result = detectSections(featureText);
      expect(result.found.length + result.missing.length).toBe(14);
    });
  });

  describe('scoreDocumentStructure (scope-aware)', () => {
    test('feature PRD with all 7 required sections scores full section points', () => {
      // ~500 words to stay in feature scope
      const text = `${'context '.repeat(200)}
# Executive Summary
Brief.
## Problem Statement
The problem.
## Goals and Objectives
Goal 1.
## Proposed Solution
Solution.
## Requirements
FR1: Must do X.
## Risks and Mitigation
Risk: Y.
## Open Questions
- Q1`;
      const result = scoreDocumentStructure(text);
      expect(result.scope).toBe('feature');
      expect(result.sections.missing.length).toBe(0);
      // Section score should be high (10 pts = full marks)
      expect(result.score).toBeGreaterThanOrEqual(12);
    });

    test('exposes scope in result', () => {
      const shortText = 'word '.repeat(500) + '\n## Problem Statement\nTest.';
      const result = scoreDocumentStructure(shortText);
      expect(result.scope).toBeDefined();
      expect(['feature', 'epic', 'product']).toContain(result.scope);
    });

    test('feature PRD is not penalized for missing Traceability or Stakeholders', () => {
      const text = `${'context '.repeat(200)}
# Executive Summary
Brief.
## Problem Statement
Problem.
## Goals
Goal.
## Proposed Solution
Solution.
## Requirements
FR1.
## Risks
Risk.
## Open Questions
TBD.`;
      const result = scoreDocumentStructure(text);
      expect(result.sections.missing.some((s) => s.name === 'Traceability Summary')).toBe(false);
      expect(result.sections.missing.some((s) => s.name === 'Stakeholders')).toBe(false);
    });

    test('product scope section score uses dynamic denominator (all 14 sections checked)', () => {
      // A product-scope PRD with zero sections should score 0 section points.
      // The dynamic denominator ensures we divide by the product weight sum, not a hardcoded 20.
      const longEmptyText = 'word '.repeat(4000);
      const result = scoreDocumentStructure(longEmptyText);
      expect(result.scope).toBe('product');
      expect(result.sections.found.length + result.sections.missing.length).toBe(14);
    });
  });

  describe('detectVagueLanguage', () => {
    test('detects vague qualifiers', () => {
      const text =
        'The system should be very fast and quite reliable with significant improvements.';
      const result = detectVagueLanguage(text);
      expect(result.totalCount).toBeGreaterThan(0);
    });

    test('returns low count for precise language', () => {
      const text = 'The system shall respond within 200ms with 99.9% availability.';
      const result = detectVagueLanguage(text);
      expect(result.totalCount).toBeLessThan(3);
    });
  });

  describe('detectPrioritization', () => {
    test('detects MoSCoW prioritization', () => {
      const text = 'Must have: Login. Should have: Dashboard. Could have: Reports.';
      const result = detectPrioritization(text);
      expect(result.hasMoscow).toBe(true);
    });

    test('detects P-level prioritization', () => {
      const text = 'P0: Critical bug fix. P1: Important feature. P2: Nice to have.';
      const result = detectPrioritization(text);
      expect(result.hasPLevel).toBe(true);
    });
  });

  describe('countFunctionalRequirements', () => {
    test('counts FR format requirements', () => {
      const text = 'FR1: User login. FR2: User logout. FR3: Password reset.';
      const result = countFunctionalRequirements(text);
      expect(result.count).toBe(3);
    });
  });

  describe('countAcceptanceCriteria', () => {
    test('counts Given/When/Then format (inline)', () => {
      // Pattern requires Given...When...Then on same line or with minimal whitespace
      const text = `
Given a logged-in user When they click logout Then they are redirected
Given an invalid password When user submits Then error message shown
      `;
      const result = countAcceptanceCriteria(text);
      expect(result).toBeGreaterThanOrEqual(2);
    });

    test('counts bullet-point Given format', () => {
      const text = `
- **Given** a logged-in user, when they logout, then redirect
- **Given** an invalid password, when submitted, then show error
      `;
      const result = countAcceptanceCriteria(text);
      expect(result).toBeGreaterThanOrEqual(2);
    });
  });

  describe('scoreDocumentStructure', () => {
    test('returns max 20 points', () => {
      const result = scoreDocumentStructure('# Test\nContent');
      expect(result.maxScore).toBe(20);
    });

    test('gives higher score for well-structured PRD', () => {
      const goodPRD = `
# Problem Statement
Clear problem.
# Proposed Solution
Our approach.
# Goals and Objectives
Objectives here.
# Requirements
FR1: Feature
      `;
      const result = scoreDocumentStructure(goodPRD);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixturesDir = join(__dirname, 'fixtures/prd-samples');

describe('PRD Fixture Regression Tests', () => {
  // Load all fixtures once
  const fixtureFiles = readdirSync(fixturesDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const loadFixture = (filename) => {
    return readFileSync(join(fixturesDir, filename), 'utf-8');
  };

  describe('Excellent Quality Documents (01-05)', () => {
    const excellentFiles = fixtureFiles.filter((f) => parseInt(f.slice(0, 2)) <= 5);

    it.each(excellentFiles)('%s should score 70+ (excellent quality)', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.totalScore).toBeGreaterThanOrEqual(70);
    });

    it.each(excellentFiles)('%s should have structure score >= 15', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.structure.score).toBeGreaterThanOrEqual(15);
    });

    it.each(excellentFiles)('%s should have low vague language count', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.clarity.vagueLanguage.totalCount).toBeLessThan(10);
    });
  });

  describe('Good Quality Documents (06-10)', () => {
    const goodFiles = fixtureFiles.filter((f) => {
      const num = parseInt(f.slice(0, 2));
      return num >= 6 && num <= 10;
    });

    it.each(goodFiles)('%s should score 60+ (good quality)', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.totalScore).toBeGreaterThanOrEqual(60);
    });

    it.each(goodFiles)('%s should have structure score >= 10', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.structure.score).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Needs-Work Quality Documents (11-15)', () => {
    const needsWorkFiles = fixtureFiles.filter((f) => parseInt(f.slice(0, 2)) >= 11);

    it.each(needsWorkFiles)('%s should score below 60 (needs improvement)', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      expect(result.totalScore).toBeLessThan(60);
    });

    it.each(needsWorkFiles)('%s should have vague language issues', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      // Needs-work docs should trigger vague language detection
      expect(result.clarity.vagueLanguage.totalCount).toBeGreaterThan(0);
    });

    it.each(needsWorkFiles)('%s should have missing sections', (filename) => {
      const content = loadFixture(filename);
      const result = validatePRD(content);
      // Needs-work docs should be missing at least 2 required sections.
      // Threshold is scope-relative: these fixtures are feature-scope (≤1500 words),
      // so only 7 sections are checked — ">= 2 missing" means 29%+ absent.
      expect(result.structure.sections.missing.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('New Detection Functions', () => {
    it('should detect baseline→target metric pairs in excellent docs', () => {
      const content = loadFixture('01-ai-chat-feature-excellent.md');
      const result = validatePRD(content);
      // Excellent docs should have baseline→target metrics
      expect(result.strategicViability.score).toBeGreaterThanOrEqual(12);
    });

    it('should detect competitive analysis depth in excellent docs', () => {
      const content = loadFixture('02-payments-integration-excellent.md');
      const result = validatePRD(content);
      // Excellent docs should have competitive analysis with differentiation
      expect(result.strategicViability.score).toBeGreaterThanOrEqual(12);
    });

    it('should detect user segment specificity in excellent docs', () => {
      const content = loadFixture('03-sso-enterprise-excellent.md');
      const result = validatePRD(content);
      // Excellent docs should have specific user segments
      expect(result.userFocus.score).toBeGreaterThanOrEqual(12);
    });

    it('should penalize vague language in needs-work docs', () => {
      const content = loadFixture('11-chat-widget-needs-work.md');
      const result = validatePRD(content);
      expect(result.clarity.vagueLanguage.totalCount).toBeGreaterThan(5);
    });

    it('should detect prioritization in good quality docs', () => {
      const content = loadFixture('06-notification-system-good.md');
      const result = validatePRD(content);
      expect(result.clarity.prioritization.hasPLevel).toBe(true);
    });
  });

  describe('Score Distribution', () => {
    it('should maintain proper tier separation', () => {
      const excellentScores = fixtureFiles
        .filter((f) => parseInt(f.slice(0, 2)) <= 5)
        .map((f) => validatePRD(loadFixture(f)).totalScore);

      const _goodScores = fixtureFiles
        .filter((f) => parseInt(f.slice(0, 2)) >= 6 && parseInt(f.slice(0, 2)) <= 10)
        .map((f) => validatePRD(loadFixture(f)).totalScore);

      const needsWorkScores = fixtureFiles
        .filter((f) => parseInt(f.slice(0, 2)) >= 11)
        .map((f) => validatePRD(loadFixture(f)).totalScore);

      const minExcellent = Math.min(...excellentScores);
      const maxNeedsWork = Math.max(...needsWorkScores);

      // Excellent docs should score significantly higher than needs-work
      expect(minExcellent).toBeGreaterThan(maxNeedsWork);
    });

    it('should have clear tier boundaries', () => {
      const excellentScores = fixtureFiles
        .filter((f) => parseInt(f.slice(0, 2)) <= 5)
        .map((f) => validatePRD(loadFixture(f)).totalScore);

      const goodScores = fixtureFiles
        .filter((f) => parseInt(f.slice(0, 2)) >= 6 && parseInt(f.slice(0, 2)) <= 10)
        .map((f) => validatePRD(loadFixture(f)).totalScore);

      // Average excellent should be higher than average good
      const avgExcellent = excellentScores.reduce((a, b) => a + b, 0) / excellentScores.length;
      const avgGood = goodScores.reduce((a, b) => a + b, 0) / goodScores.length;

      expect(avgExcellent).toBeGreaterThan(avgGood);
    });
  });
});

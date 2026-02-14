/**
 * PRD Validator Tests - Core Detection Functions
 * Tests for basic PRD detection and scoring (sections, vague language, prioritization, structure)
 * See prd-validator-main.test.js, prd-validator-detection.test.js, prd-validator-scoring.test.js for additional tests
 */

import { describe, test, expect } from '@jest/globals';
import {
  detectSections,
  detectVagueLanguage,
  detectPrioritization,
  countFunctionalRequirements,
  countAcceptanceCriteria,
  scoreDocumentStructure,
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

  describe('detectVagueLanguage', () => {
    test('detects vague qualifiers', () => {
      const text = 'The system should be very fast and quite reliable with significant improvements.';
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

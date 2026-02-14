/**
 * PRD Validator Tests - Detection Functions
 * Tests for secondary detection functions from validator-detection-secondary.js
 */

import { describe, test, expect } from '@jest/globals';
import {
  detectValueProposition,
  detectUserPersonas,
  detectProblemStatement,
  detectNonFunctionalRequirements,
  detectCustomerEvidence,
  detectScopeBoundaries,
  detectVagueQualifiers,
} from '../plugins/prd/js/validator.js';

describe('PRD Validator - Detection Functions', () => {
  describe('detectValueProposition', () => {
    test('detects value proposition section', () => {
      const text = '# Value Proposition\nThis product saves time.';
      const result = detectValueProposition(text);
      expect(result.hasSection).toBe(true);
    });

    test('detects customer value language', () => {
      // Pattern: value to (customer|partner|user|client)|customer benefit|partner benefit|user benefit
      const text = 'Value to customer: time savings. User benefit: simplified workflow.';
      const result = detectValueProposition(text);
      expect(result.hasCustomerValue).toBe(true);
    });

    test('detects company value language', () => {
      // Pattern: value to (company|business|organization)|business value|revenue impact|cost saving|strategic value
      const text = 'Value to company: reduced support costs. Business value: higher retention.';
      const result = detectValueProposition(text);
      expect(result.hasCompanyValue).toBe(true);
    });

    test('detects quantified benefits', () => {
      // Pattern: \d+%|\$\d+|\d+\s*(hours?|days?)\s*(saved|reduced|faster)|reduces? from \d+|increases? from \d+
      const text = 'Reduced from 100 errors to 10. 2 hours saved per day. $500 cost.';
      const result = detectValueProposition(text);
      expect(result.hasQuantification).toBe(true);
      expect(result.quantifiedCount).toBeGreaterThan(0);
    });

    test('detects vague value statements', () => {
      // Pattern: (improve|enhance|better|more efficient|streamline)\s+(the\s+)?(experience|process|workflow|operations)
      const text = 'This will improve the experience and streamline the workflow.';
      const result = detectValueProposition(text);
      expect(result.hasVagueValue).toBe(true);
    });

    test('calculates quality score', () => {
      const text = `
# Value Proposition
Customers save 30% time (customer value).
Company reduces support costs by 25% (company value).
      `;
      const result = detectValueProposition(text);
      expect(result.qualityScore).toBeGreaterThanOrEqual(2);
    });
  });

  describe('detectUserPersonas', () => {
    test('detects dedicated persona section', () => {
      const text = '# User Personas\n**Primary User**: Developer';
      const result = detectUserPersonas(text);
      expect(result.hasPersonaSection).toBe(true);
    });

    test('detects user types', () => {
      const text = 'The admin and end-user can both access the dashboard.';
      const result = detectUserPersonas(text);
      expect(result.userTypes.length).toBeGreaterThan(0);
    });

    test('detects pain points', () => {
      // Uses 'challenge' and 'struggle' which are in the pattern
      const text = 'Users face a challenge with slow loading. They struggle with search.';
      const result = detectUserPersonas(text);
      expect(result.hasPainPoints).toBe(true);
    });

    test('detects scenarios', () => {
      const text = 'Scenario: When the user needs to track tasks during a busy day.';
      const result = detectUserPersonas(text);
      expect(result.hasScenarios).toBe(true);
    });

    test('counts user types', () => {
      const text = `
**Primary User**: Developers
**Secondary User**: Designers
**Admin User**: IT Staff
      `;
      const result = detectUserPersonas(text);
      expect(result.userTypes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('detectProblemStatement', () => {
    test('detects problem section', () => {
      const text = '# Problem Statement\nUsers struggle with task management.';
      const result = detectProblemStatement(text);
      expect(result.hasProblemSection).toBe(true);
    });

    test('detects problem language', () => {
      const text = 'Users face a challenge when they struggle with complex workflows.';
      const result = detectProblemStatement(text);
      expect(result.hasProblemLanguage).toBe(true);
    });

    test('detects value proposition language', () => {
      const text = 'This will improve team productivity by 40%. The solution saves time.';
      const result = detectProblemStatement(text);
      expect(result.hasValueProp).toBe(true);
    });

    test('returns indicators for comprehensive problem statement', () => {
      const text = `
# Problem Statement
Users struggle with task management (problem language).
This enables better productivity so that teams can focus on value.
      `;
      const result = detectProblemStatement(text);
      expect(result.indicators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('detectNonFunctionalRequirements', () => {
    test('detects performance NFRs', () => {
      const text = 'Response time must be under 200ms with low latency.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.categories).toContain('performance');
    });

    test('detects security NFRs', () => {
      const text = 'Must use OAuth authentication with encrypted storage.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.categories).toContain('security');
    });

    test('detects reliability NFRs', () => {
      const text = 'System requires 99.9% uptime with failover support.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.categories).toContain('reliability');
    });


    test('detects usability NFRs', () => {
      const text = 'Must comply with WCAG 2.1 accessibility guidelines.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.categories).toContain('usability');
    });

    test('detects compliance NFRs', () => {
      const text = 'Must be GDPR compliant and SOC2 certified.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.categories).toContain('compliance');
    });

    test('detects NFR section', () => {
      const text = '# Non-Functional Requirements\nPerformance: Fast.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.hasNFRSection).toBe(true);
    });

    test('counts multiple categories', () => {
      const text = 'Performance under 100ms. Security with encryption. 99.9% uptime.';
      const result = detectNonFunctionalRequirements(text);
      expect(result.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('detectCustomerEvidence', () => {
    test('detects research mentions', () => {
      const text = 'User research shows 80% want this feature.';
      const result = detectCustomerEvidence(text);
      expect(result.hasResearch).toBe(true);
    });

    test('detects data mentions', () => {
      const text = 'Analytics data indicates 50% of users struggle.';
      const result = detectCustomerEvidence(text);
      expect(result.hasData).toBe(true);
    });

    test('detects quotes', () => {
      const text = '"This would save me hours" - Beta tester';
      const result = detectCustomerEvidence(text);
      expect(result.hasQuotes).toBe(true);
    });

    test('detects feedback', () => {
      const text = 'Customer feedback from surveys shows positive reception.';
      const result = detectCustomerEvidence(text);
      expect(result.hasFeedback).toBe(true);
    });

    test('detects validation', () => {
      const text = 'We validated this assumption through prototype testing.';
      const result = detectCustomerEvidence(text);
      expect(result.hasValidation).toBe(true);
    });

    test('counts evidence types', () => {
      // Use actual patterns from validator-config
      const text = 'User research shows concerns. "This is a quote that is at least 10 chars" - Tester. Customer feedback confirmed.';
      const result = detectCustomerEvidence(text);
      expect(result.evidenceTypes).toBeGreaterThanOrEqual(2);
    });
  });

  describe('detectScopeBoundaries', () => {
    test('detects in-scope items', () => {
      const text = '## In Scope\n- Feature A\n- Feature B';
      const result = detectScopeBoundaries(text);
      expect(result.hasInScope).toBe(true);
    });

    test('detects out-of-scope items', () => {
      const text = '## Out of Scope\n- Feature C will not be included';
      const result = detectScopeBoundaries(text);
      expect(result.hasOutOfScope).toBe(true);
    });

    test('detects both boundaries', () => {
      const text = '## In Scope\n- A\n## Out of Scope\n- B';
      const result = detectScopeBoundaries(text);
      expect(result.hasBothBoundaries).toBe(true);
    });

    test('detects scope section', () => {
      const text = '# Scope\nThis section defines boundaries.';
      const result = detectScopeBoundaries(text);
      expect(result.hasScopeSection).toBe(true);
    });
  });

  describe('detectVagueQualifiers', () => {
    test('detects vague qualifiers', () => {
      // VAGUE_LANGUAGE.qualifiers includes: 'fast', 'scalable', 'robust', etc.
      const text = 'The system should be fast and scalable with robust error handling.';
      const result = detectVagueQualifiers(text);
      expect(result.found).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    test('returns qualifiers found', () => {
      // Use actual qualifiers from config: 'efficient', 'optimal', 'flexible'
      const text = 'The solution is efficient and optimal with flexible architecture.';
      const result = detectVagueQualifiers(text);
      expect(result.qualifiers.length).toBeGreaterThan(0);
    });

    test('returns false for precise language', () => {
      const text = 'Response time shall be 200ms with 99.9% availability.';
      const result = detectVagueQualifiers(text);
      expect(result.found).toBe(false);
    });
  });
});

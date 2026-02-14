/**
 * PRD Validator Tests - Scoring Functions
 * Tests for scoring functions from validator-scoring-user.js, validator-strategic.js
 */

import { describe, test, expect } from '@jest/globals';
import {
  scoreUserFocus,
  scoreTechnicalQuality,
  scoreStrategicViability,
  scoreRequirementsClarity,
  countUserStories,
  countMeasurableRequirements,
} from '../plugins/prd/js/validator.js';

describe('PRD Validator - Scoring Functions', () => {
  describe('scoreUserFocus', () => {
    test('returns max 20 points', () => {
      const result = scoreUserFocus('Test content');
      expect(result.maxScore).toBe(20);
    });

    test('scores high for well-defined personas', () => {
      const text = `
# User Personas
**Primary User**: Solo developer who struggles with scattered tasks.
Pain points: context switching, losing track of items.
Scenario: Daily routine involves checking multiple tools.

# Problem Statement
Users face difficulty managing tasks across tools.

FR1: User can create tasks. This enables users to track work.
FR2: User can complete tasks. Solves the completion tracking problem.

# Customer Evidence
Research shows 80% of users struggle with task management.
"I spend hours switching between tools" - User interview
Feedback from beta testers confirms this need.
      `;
      const result = scoreUserFocus(text);
      expect(result.score).toBeGreaterThanOrEqual(10);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    test('identifies missing personas', () => {
      const text = 'Some generic content without user mentions.';
      const result = scoreUserFocus(text);
      expect(result.issues.some((i) => i.toLowerCase().includes('persona') || i.toLowerCase().includes('user'))).toBe(true);
    });

    test('identifies missing problem statement', () => {
      const text = 'Features: Login, Dashboard, Reports.';
      const result = scoreUserFocus(text);
      expect(result.issues.some((i) => i.includes('problem'))).toBe(true);
    });

    test('returns customer evidence detection', () => {
      const text = 'Customer research data: 70% want this. User feedback: positive.';
      const result = scoreUserFocus(text);
      expect(result.customerEvidence).toBeDefined();
    });

    test('detects Customer FAQ (Working Backwards)', () => {
      const text = '# Customer FAQ\nQ: What does this do?\nA: Solves problems.';
      const result = scoreUserFocus(text);
      expect(result.hasCustomerFAQ).toBe(true);
    });
  });

  describe('scoreTechnicalQuality', () => {
    test('returns max 15 points', () => {
      const result = scoreTechnicalQuality('Test content');
      expect(result.maxScore).toBe(15);
    });

    test('scores high for comprehensive NFRs', () => {
      const text = `
# Non-Functional Requirements
Performance: Response time under 200ms
Security: OAuth2 authentication, encrypted storage
Reliability: 99.9% uptime with failover
Scalability: Support 10000 concurrent users

# Acceptance Criteria
Given a user is logged in
When they create a task
Then it appears within 100ms

Given an invalid input
When submitted
Then an error message is shown

Given a network failure
When the user retries
Then the operation recovers

## Dependencies
Depends on: Authentication service, Database cluster
Requires: API Gateway v2
      `;
      const result = scoreTechnicalQuality(text);
      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.nfr.count).toBeGreaterThanOrEqual(3);
    });

    test('identifies missing NFRs', () => {
      const text = 'Feature: User can login.';
      const result = scoreTechnicalQuality(text);
      expect(result.issues.some((i) => i.includes('non-functional'))).toBe(true);
    });

    test('identifies missing acceptance criteria', () => {
      const text = 'Requirements without Given/When/Then format.';
      const result = scoreTechnicalQuality(text);
      expect(result.issues.some((i) => i.includes('acceptance criteria') || i.includes('Given/When/Then'))).toBe(true);
    });

    test('detects failure case acceptance criteria', () => {
      const text = `
Given an invalid password When user submits Then error message shown
Given timeout occurs When API delayed Then retry with backoff

## Risks
Risk: Timeline slip. This could fail if resources unavailable.
      `;
      const result = scoreTechnicalQuality(text);
      expect(result.acceptanceCriteriaCount).toBeGreaterThanOrEqual(1);
    });

    test('detects dependencies section', () => {
      const text = '# Dependencies\nDepends on: Auth service. Requires: DB v3.';
      const result = scoreTechnicalQuality(text);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreStrategicViability', () => {
    test('returns max 20 points', () => {
      const result = scoreStrategicViability('Test content');
      expect(result.maxScore).toBe(20);
    });

    test('detects leading indicators', () => {
      const text = 'Leading indicator: User signup rate predicts retention.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasLeadingIndicators).toBe(true);
      expect(result.metricValidityScore).toBeGreaterThan(0);
    });

    test('detects counter-metrics', () => {
      const text = 'Counter-metric: While improving speed, we must not increase errors.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasCounterMetrics).toBe(true);
    });

    test('detects source of truth', () => {
      const text = 'Source: Mixpanel dashboard. Tracked in: Datadog.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasSourceOfTruth).toBe(true);
    });

    test('detects kill switch criteria', () => {
      const text = 'Kill switch: If DAU drops below 100, pivot the approach.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasKillSwitch).toBe(true);
      expect(result.scopeRealismScore).toBeGreaterThan(0);
    });

    test('detects door type decisions', () => {
      const text = 'FR1: Database migration 🚪 (One-Way Door). FR2: UI change 🔄 (Two-Way).';
      const result = scoreStrategicViability(text);
      expect(result.details.hasDoorType).toBe(true);
    });

    test('detects alternatives considered', () => {
      const text = '# Alternatives Considered\nOption A: Build custom. Option B: Buy vendor solution.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasAlternatives).toBe(true);
    });

    test('detects dissenting opinions', () => {
      const text = '# Known Unknowns & Dissenting Opinions\nSome team members disagree with approach.';
      const result = scoreStrategicViability(text);
      expect(result.details.hasDissentingOpinions).toBe(true);
      expect(result.riskScore).toBeGreaterThan(0);
    });

    test('detects risk section with mitigations', () => {
      const text = '# Risks\nRisk: Timeline slip. Mitigation: Add buffer. Contingency: Reduce scope.';
      const result = scoreStrategicViability(text);
      expect(result.riskScore).toBeGreaterThan(0);
    });

    test('detects traceability section', () => {
      const text = '# Traceability Summary\nProblem P1 → Requirement FR1 → Metric M1';
      const result = scoreStrategicViability(text);
      expect(result.details.hasTraceability).toBe(true);
      expect(result.traceabilityScore).toBeGreaterThan(0);
    });

    test('provides issues for missing strategic elements', () => {
      const text = 'Basic PRD without strategic elements.';
      const result = scoreStrategicViability(text);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some((i) => i.includes('leading indicator') || i.includes('counter-metric'))).toBe(true);
    });
  });

  describe('countUserStories', () => {
    test('counts As a... I want format', () => {
      const text = `
As a user, I want to login so that I can access my account.
As an admin, I want to manage users so that I can control access.
      `;
      const result = countUserStories(text);
      expect(result).toBeGreaterThanOrEqual(2);
    });
  });

  describe('countMeasurableRequirements', () => {
    test('counts requirements with numbers', () => {
      const text = `
Response time under 200ms.
Support 10000 concurrent users.
99.9% uptime SLA.
      `;
      const result = countMeasurableRequirements(text);
      expect(result).toBeGreaterThanOrEqual(2);
    });
  });

  describe('scoreRequirementsClarity', () => {
    test('returns max 25 points', () => {
      const result = scoreRequirementsClarity('Test content');
      expect(result.maxScore).toBe(25);
    });

    test('scores high for clear requirements', () => {
      const text = `
FR1: User can create tasks. P1. Problem Link: P1. 🚪 One-Way Door.
FR2: User can complete tasks. P2. Problem Link: P1. 🔄 Two-Way Door.
FR3: User can delete tasks. P3. Problem Link: P2.

Response time: 200ms. Uptime: 99.9%. Concurrent users: 1000.

# Priority
Must have: FR1, FR2
Should have: FR3
      `;
      const result = scoreRequirementsClarity(text);
      expect(result.score).toBeGreaterThanOrEqual(10);
      expect(result.functionalRequirements.count).toBeGreaterThanOrEqual(3);
    });

    test('returns slop detection results', () => {
      const text = 'This groundbreaking solution leverages cutting-edge technology.';
      const result = scoreRequirementsClarity(text);
      expect(result.slopDetection).toBeDefined();
    });

    test('returns prioritization detection', () => {
      const text = 'Must have: Login. P0: Security fix.';
      const result = scoreRequirementsClarity(text);
      expect(result.prioritization).toBeDefined();
    });
  });
});

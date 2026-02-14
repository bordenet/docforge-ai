/**
 * Business Justification Validator Tests - Helper Detection Functions
 * Tests for helper detection functions from validator-detection.js
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectStrategicEvidence,
} from '../plugins/business-justification/js/validator.js';
import {
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectStakeholders,
  detectTimeline,
  detectScope,
  detectSuccessMetrics,
} from '../plugins/business-justification/js/validator-detection.js';

describe('Business Justification Helper Detection Functions', () => {
  describe('detectProblemStatement (legacy alias)', () => {
    it('returns same result as detectStrategicEvidence', () => {
      const text = '## Problem Statement\nWe have a 40% customer churn rate.';
      const legacy = detectProblemStatement(text);
      const pillar = detectStrategicEvidence(text);
      expect(legacy.hasProblemSection).toBe(pillar.hasProblemSection);
      expect(legacy.isQuantified).toBe(pillar.isQuantified);
    });
  });

  describe('detectCostOfInaction', () => {
    it('detects do-nothing cost language', () => {
      const text = 'If we do nothing, the status quo will cost us $2 million annually.';
      const result = detectCostOfInaction(text);
      expect(result.hasCostLanguage).toBe(true);
      expect(result.costCount).toBeGreaterThan(0);
    });

    it('detects quantified costs', () => {
      const text = 'Inaction costs us 40% market share and $5 million in revenue.';
      const result = detectCostOfInaction(text);
      expect(result.isQuantified).toBe(true);
    });

    it('detects cost section', () => {
      const text = '# Cost of Inaction\nWithout this, we lose $1M per year.';
      const result = detectCostOfInaction(text);
      expect(result.hasCostSection).toBe(true);
    });

    it('returns indicators array', () => {
      const text = 'Status quo costs $1 million. If we do nothing, we lose customers.';
      const result = detectCostOfInaction(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectSolution', () => {
    it('detects solution section', () => {
      // Pattern requires: solution, proposal, approach, recommendation, how at start of line
      const text = '## Solution\nImplement a new customer portal.';
      const result = detectSolution(text);
      expect(result.hasSolutionSection).toBe(true);
    });

    it('detects solution language', () => {
      // Uses: solution, approach, implement, build, create, develop, enable, provide, deliver
      const text = 'We will implement and build a new system to deliver value.';
      const result = detectSolution(text);
      expect(result.hasSolutionLanguage).toBe(true);
    });

    it('detects measurable outcomes', () => {
      // Uses: measure, metric, kpi, track, monitor, quantify, achieve, reach, target, goal
      const text = 'We will measure success via KPIs and track progress toward our goal.';
      const result = detectSolution(text);
      expect(result.hasMeasurable).toBe(true);
    });

    it('detects high-level approach', () => {
      // Uses: overview, summary, high-level, architecture, design, flow, process, workflow
      const text = 'This overview describes the high-level architecture and process.';
      const result = detectSolution(text);
      expect(result.isHighLevel).toBe(true);
    });

    it('returns indicators array', () => {
      const text = '## Solution\nWe will implement a phased rollout over 3 months.';
      const result = detectSolution(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectStakeholders', () => {
    it('detects stakeholder section', () => {
      const text = '## Stakeholders\nExecutive sponsor: VP of Engineering.';
      const result = detectStakeholders(text);
      expect(result.hasStakeholderSection).toBe(true);
    });

    it('detects stakeholder references', () => {
      // Uses: stakeholder, owner, lead, team, responsible, accountable, raci, sponsor, approver
      const text = 'The stakeholder and owner lead the team as sponsor.';
      const result = detectStakeholders(text);
      expect(result.hasStakeholders).toBe(true);
      expect(result.stakeholderCount).toBeGreaterThan(0);
    });

    it('detects role definitions', () => {
      // Uses: responsible, accountable, consulted, informed, raci
      const text = 'The lead is responsible and accountable. Informed parties include sales.';
      const result = detectStakeholders(text);
      expect(result.hasRoles).toBe(true);
      expect(result.roleCount).toBeGreaterThan(0);
    });

    it('returns indicators array', () => {
      const text = '## Stakeholders\nThe owner is responsible. Team lead is accountable.';
      const result = detectStakeholders(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectTimeline', () => {
    it('detects timeline section', () => {
      const text = '## Timeline\nQ1: Research. Q2: Build. Q3: Launch.';
      const result = detectTimeline(text);
      expect(result.hasTimelineSection).toBe(true);
    });

    it('detects timeline references', () => {
      // Uses: week, month, quarter, q1-4, phase, milestone, sprint, release, v1
      const text = 'We will complete in Q2, then phase 2 starts next month.';
      const result = detectTimeline(text);
      expect(result.hasTimeline).toBe(true);
      expect(result.dateCount).toBeGreaterThan(0);
    });

    it('detects phasing', () => {
      // Uses: phase, stage, wave, iteration, sprint, release
      const text = 'Phase 1: Research. Sprint 1 in March. Release v1 in April.';
      const result = detectTimeline(text);
      expect(result.hasPhasing).toBe(true);
      expect(result.phasingCount).toBeGreaterThan(0);
    });

    it('returns indicators array', () => {
      const text = '## Timeline\nPhase 1: Q1 milestone. Sprint 2: Q2 release.';
      const result = detectTimeline(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectScope', () => {
    it('detects scope section', () => {
      const text = '## Scope\nIn scope: Core features. Out of scope: Mobile app.';
      const result = detectScope(text);
      expect(result.hasScopeSection).toBe(true);
    });

    it('detects in-scope items', () => {
      // Uses: in scope, included, within scope, we will, we are, we provide, we deliver
      const text = 'In scope: Core features. We will deliver the API. We provide auth.';
      const result = detectScope(text);
      expect(result.hasInScope).toBe(true);
      expect(result.inScopeCount).toBeGreaterThan(0);
    });

    it('detects out-of-scope items', () => {
      // Uses: out of scope, not included, excluded, we will not, won't, outside scope, future, phase 2, post mvp, not in v1
      const text = 'Out of scope: Mobile. Excluded: Integrations. Future: Phase 2 items.';
      const result = detectScope(text);
      expect(result.hasOutOfScope).toBe(true);
      expect(result.outOfScopeCount).toBeGreaterThan(0);
    });

    it('detects both scope boundaries', () => {
      const text = 'In scope: Core API. We will build auth. Out of scope: Mobile. Not in v1.';
      const result = detectScope(text);
      expect(result.hasBothBoundaries).toBe(true);
    });

    it('returns indicators array', () => {
      const text = '## Scope\nIn scope: Features. Excluded: Nice-to-haves.';
      const result = detectScope(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectSuccessMetrics', () => {
    it('detects metrics section', () => {
      const text = '## Success Metrics\nKPI: Increase revenue by 25%.';
      const result = detectSuccessMetrics(text);
      expect(result.hasMetricsSection).toBe(true);
    });

    it('detects quantified metrics', () => {
      // Uses: numbers + %, million, thousand, hour, day, week, month, year, $, dollar, user, customer, etc.
      const text = 'Target: 50% reduction. Goal: 25 thousand users. Budget: $1 million.';
      const result = detectSuccessMetrics(text);
      expect(result.hasQuantified).toBe(true);
      expect(result.quantifiedCount).toBeGreaterThan(0);
    });

    it('detects SMART language', () => {
      // Uses: specific, measurable, achievable, relevant, time-bound, smart
      const text = 'SMART goals: specific targets, measurable outcomes, achievable milestones.';
      const result = detectSuccessMetrics(text);
      expect(result.hasSmart).toBe(true);
      expect(result.smartCount).toBeGreaterThan(0);
    });

    it('counts metrics language', () => {
      // Uses: metric, kpi, measure, target, goal, achieve, reach, improve, reduce, increase
      const text = 'Metrics: track KPIs. Target: achieve goals. Measure improvement.';
      const result = detectSuccessMetrics(text);
      expect(result.hasMetrics).toBe(true);
      expect(result.metricsCount).toBeGreaterThan(0);
    });

    it('returns indicators array', () => {
      const text = '## Success Metrics\nSMART goals: Improve by 25%, reach 10k users.';
      const result = detectSuccessMetrics(text);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });
});

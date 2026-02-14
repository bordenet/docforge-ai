/**
 * Business Justification Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectStrategicEvidence,
  detectFinancialJustification,
  detectOptionsAnalysis,
  detectExecutionCompleteness,
  detectSections,
  scoreStrategicEvidence,
  scoreFinancialJustification,
  scoreOptionsAnalysis,
  scoreExecutionCompleteness,
  validateDocument,
  getScoreColor,
  getScoreLabel
} from '../plugins/business-justification/js/validator.js';

describe('Business Justification Validator', () => {
  describe('detectStrategicEvidence', () => {
    it('detects problem section', () => {
      const result = detectStrategicEvidence('## Problem Statement\nWe have a 40% customer churn rate.');
      expect(result.hasProblemSection).toBe(true);
      expect(result.isQuantified).toBe(true);
    });

    it('detects credible sources', () => {
      const result = detectStrategicEvidence('According to Gartner research, 75% of companies fail.');
      expect(result.hasSources).toBe(true);
      expect(result.sourceCount).toBeGreaterThan(0);
    });

    it('detects before/after comparisons', () => {
      const result = detectStrategicEvidence('We improved from 50% to 85% efficiency.');
      expect(result.hasBeforeAfter).toBe(true);
    });

    it('detects business focus', () => {
      const result = detectStrategicEvidence('This impacts customer revenue and competitive positioning.');
      expect(result.hasBusinessFocus).toBe(true);
    });
  });

  describe('detectFinancialJustification', () => {
    it('detects financial section', () => {
      const result = detectFinancialJustification('## ROI Analysis\nReturn on investment is 150%.');
      expect(result.hasFinancialSection).toBe(true);
    });

    it('detects ROI mentions', () => {
      const result = detectFinancialJustification('The ROI is calculated as return on investment.');
      expect(result.hasROI).toBe(true);
    });

    it('detects payback period', () => {
      const result = detectFinancialJustification('We expect payback within 6 months.');
      expect(result.hasPayback).toBe(true);
      expect(result.hasPaybackTime).toBe(true);
    });

    it('detects TCO analysis', () => {
      const result = detectFinancialJustification('Total cost of ownership over 3-year period.');
      expect(result.hasTCO).toBe(true);
    });

    it('detects dollar amounts', () => {
      const result = detectFinancialJustification('Investment of $500,000 with $2 million return.');
      expect(result.hasDollarAmounts).toBe(true);
    });
  });

  describe('detectOptionsAnalysis', () => {
    it('detects options section', () => {
      const result = detectOptionsAnalysis('## Options Analysis\nWe considered three approaches.');
      expect(result.hasOptionsSection).toBe(true);
    });

    it('detects do-nothing scenario', () => {
      const result = detectOptionsAnalysis('If we do nothing, the status quo will cost us.');
      expect(result.hasDoNothing).toBe(true);
    });

    it('detects alternatives', () => {
      const result = detectOptionsAnalysis('Option A: Do nothing. Option B: Build. Option C: Buy.');
      expect(result.hasAlternatives).toBe(true);
      expect(result.alternativeCount).toBeGreaterThanOrEqual(3);
    });

    it('detects recommendation', () => {
      const result = detectOptionsAnalysis('We recommend Option B as the preferred approach.');
      expect(result.hasRecommendation).toBe(true);
    });

    it('detects minimal investment option', () => {
      const result = detectOptionsAnalysis('The MVP phase 1 approach with minimal investment.');
      expect(result.hasMinimalOption).toBe(true);
    });
  });

  describe('detectExecutionCompleteness', () => {
    it('detects executive summary', () => {
      const result = detectExecutionCompleteness('## Executive Summary\nThis document proposes...');
      expect(result.hasExecSummary).toBe(true);
    });

    it('detects risks section', () => {
      const result = detectExecutionCompleteness('## Risks and Mitigation\nRisk 1: Schedule delays.');
      expect(result.hasRisksSection).toBe(true);
    });

    it('detects risk language', () => {
      const result = detectExecutionCompleteness('The main risk is budget overrun. We have a contingency fallback plan.');
      expect(result.hasRiskLanguage).toBe(true);
      expect(result.riskCount).toBeGreaterThan(0);
    });

    it('detects stakeholder section', () => {
      const result = detectExecutionCompleteness('## Stakeholders\nCFO, VP Engineering, HR Director.');
      expect(result.hasStakeholderSection).toBe(true);
    });

    it('detects stakeholder concerns', () => {
      const result = detectExecutionCompleteness('Finance, FP&A, and Legal have approved this request.');
      expect(result.hasStakeholderConcerns).toBe(true);
    });
  });

  describe('detectSections', () => {
    it('finds required sections', () => {
      const text = `
## Problem Statement
The challenge we face.
## Options Analysis
Different approaches.
## Financial Justification
ROI and costs.
`;
      const result = detectSections(text);
      expect(result.found.length).toBeGreaterThan(0);
    });

    it('identifies missing sections', () => {
      const result = detectSections('Just some content without structure.');
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  describe('scoreStrategicEvidence', () => {
    it('gives high score for quantified problem with sources', () => {
      const text = `## Problem Statement
According to Gartner and Forrester research, we lose $2 million annually from 40% churn rate.
Current state shows baseline efficiency at 50%, target is 85% improvement.`;
      const result = scoreStrategicEvidence(text);
      expect(result.score).toBeGreaterThan(20);
      expect(result.maxScore).toBe(30);
    });

    it('identifies missing elements', () => {
      const text = 'We have some problems that need fixing.';
      const result = scoreStrategicEvidence(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreFinancialJustification', () => {
    it('gives high score for ROI with formula and TCO', () => {
      const text = `## Financial Analysis
ROI calculation: (500000 - 100000) / 100000 = 400%
Payback period: 6 months
3-year TCO includes $100,000 implementation and $50,000 training costs.`;
      const result = scoreFinancialJustification(text);
      expect(result.score).toBeGreaterThan(15);
    });

    it('identifies missing financial elements', () => {
      const text = 'The investment will be good for the company.';
      const result = scoreFinancialJustification(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreOptionsAnalysis', () => {
    it('gives high score for multiple options with recommendation', () => {
      const text = `## Options Analysis
Option A: Do nothing - status quo maintains current path.
Option B: Minimal MVP approach with phase 1 incremental investment.
Option C: Full comprehensive enterprise solution.
We recommend Option B as the selected approach. The comparison shows clear trade-offs.`;
      const result = scoreOptionsAnalysis(text);
      expect(result.score).toBeGreaterThan(15);
    });

    it('identifies missing options analysis', () => {
      const text = 'We should just do this project.';
      const result = scoreOptionsAnalysis(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreExecutionCompleteness', () => {
    it('gives high score for complete execution details', () => {
      const text = `## Executive Summary
This proposal requests headcount.
## Risks
Risk 1: Schedule. Risk 2: Budget. Risk 3: Dependencies. Mitigation contingency plan.
## Stakeholders
Finance FP&A, HR People Team, and Legal compliance have approved.`;
      const result = scoreExecutionCompleteness(text);
      expect(result.score).toBeGreaterThan(12);
      expect(result.maxScore).toBe(20);
    });

    it('identifies missing execution elements', () => {
      const text = 'Here is our plan.';
      const result = scoreExecutionCompleteness(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('validateDocument', () => {
    it('returns complete validation results', () => {
      const text = `## Executive Summary
Request for investment.
## Problem Statement
We lose $1 million annually.
## Options Analysis
Option A: Do nothing. Option B: Build.
## Financial Justification
ROI is 200% with 6 months payback.`;
      const result = validateDocument(text);

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.strategicEvidence).toBeDefined();
      expect(result.financialJustification).toBeDefined();
      expect(result.optionsAnalysis).toBeDefined();
      expect(result.executionCompleteness).toBeDefined();
      expect(result.dimension1).toBeDefined();
      expect(result.dimension2).toBeDefined();
      expect(result.dimension3).toBeDefined();
      expect(result.dimension4).toBeDefined();
    });

    it('handles empty input', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.strategicEvidence.issues).toContain('No content to validate');
    });

    it('handles null input', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    it('returns green for 70+', () => {
      expect(getScoreColor(80)).toBe('green');
    });

    it('returns yellow for 50-69', () => {
      expect(getScoreColor(60)).toBe('yellow');
    });

    it('returns orange for 30-49', () => {
      expect(getScoreColor(40)).toBe('orange');
    });

    it('returns red for below 30', () => {
      expect(getScoreColor(20)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    it('returns correct labels', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
      expect(getScoreLabel(75)).toBe('Ready');
      expect(getScoreLabel(55)).toBe('Needs Work');
      expect(getScoreLabel(40)).toBe('Draft');
      expect(getScoreLabel(20)).toBe('Incomplete');
    });
  });
});


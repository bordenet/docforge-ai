/**
 * Strategic Proposal Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateStrategicProposal, validateDocument, getGrade, getScoreColor, getScoreLabel
} from '../plugins/strategic-proposal/js/validator.js';
import {
  detectProblemStatement, detectUrgency, detectSolution, detectBusinessImpact,
  detectImplementation, detectRisks, detectSuccessMetrics, detectSections
} from '../plugins/strategic-proposal/js/validator-detection.js';
import {
  scoreProblemStatement, scoreProposedSolution, scoreBusinessImpact, scoreImplementationPlan
} from '../plugins/strategic-proposal/js/validator-scoring.js';

describe('Strategic Proposal Validator', () => {
  describe('detectProblemStatement', () => {
    it('should detect problem section with quantified metrics', () => {
      const text = `## Problem Statement
Our current system has a 40% failure rate, costing us $2 million annually. 
This is a critical priority for the organization.`;
      const result = detectProblemStatement(text);
      expect(result.hasProblemSection).toBe(true);
      expect(result.hasProblemLanguage).toBe(true);
      expect(result.isQuantified).toBe(true);
      expect(result.hasStrategicAlignment).toBe(true);
    });

    it('should detect problem language without section', () => {
      const text = 'The main challenge is poor customer satisfaction scores.';
      const result = detectProblemStatement(text);
      expect(result.hasProblemSection).toBe(false);
      expect(result.hasProblemLanguage).toBe(true);
    });
  });

  describe('detectUrgency', () => {
    it('should detect urgency with quantification', () => {
      // Pattern requires specific quantified format: \d+\s*(%|million|thousand|...)
      const text = 'This is an urgent priority. We lose 50 thousand dollars per week in missed opportunities.';
      const result = detectUrgency(text);
      expect(result.hasUrgencyLanguage).toBe(true);
      expect(result.isQuantified).toBe(true);
    });

    it('should detect urgency section', () => {
      const text = '## Why Now\nThe window of opportunity closes in Q2 2026.';
      const result = detectUrgency(text);
      expect(result.hasUrgencySection).toBe(true);
    });
  });

  describe('detectSolution', () => {
    it('should detect actionable solution with justification', () => {
      // Pattern requires section header to START with solution keywords
      const text = `## Solution
We will implement a new CRM system because our current data shows 60% inefficiency.
The deployment will launch in Q3 with a phased rollout.`;
      const result = detectSolution(text);
      expect(result.hasSolutionSection).toBe(true);
      expect(result.hasSolutionLanguage).toBe(true);
      expect(result.hasActionable).toBe(true);
      expect(result.hasJustification).toBe(true);
    });
  });

  describe('detectBusinessImpact', () => {
    it('should detect quantified business impact', () => {
      // Pattern requires section header to match impact patterns
      const text = `## Impact
Expected revenue increase of 25% with improved efficiency.
This positions us as a market leader.`;
      const result = detectBusinessImpact(text);
      expect(result.hasImpactSection).toBe(true);
      expect(result.isQuantified).toBe(true);
      expect(result.hasFinancialTerms).toBe(true);
      expect(result.hasCompetitiveTerms).toBe(true);
    });
  });

  describe('detectImplementation', () => {
    it('should detect implementation with phases and timeline', () => {
      const text = `## Implementation Plan
Phase 1: Discovery (January 2026)
Phase 2: Development (Q1-Q2)
The engineering team will be responsible for delivery with a budget of $500K.`;
      const result = detectImplementation(text);
      expect(result.hasImplementationSection).toBe(true);
      expect(result.hasPhases).toBe(true);
      expect(result.hasTimeline).toBe(true);
      expect(result.hasOwnership).toBe(true);
      expect(result.hasResources).toBe(true);
    });
  });

  describe('detectRisks', () => {
    it('should detect risks with mitigation', () => {
      const text = `## Risks and Assumptions
Key risk: Vendor dependency on external timeline.
Mitigation: Contingency plan with backup vendor identified.`;
      const result = detectRisks(text);
      expect(result.hasRiskSection).toBe(true);
      expect(result.hasRisks).toBe(true);
      expect(result.hasMitigation).toBe(true);
    });
  });

  describe('detectSuccessMetrics', () => {
    it('should detect timebound metrics', () => {
      const text = `## Success Metrics
KPI: 30% improvement in customer satisfaction by Q4.
Target: 95% uptime within 6 months.`;
      const result = detectSuccessMetrics(text);
      expect(result.hasMetricsSection).toBe(true);
      expect(result.hasMetrics).toBe(true);
      expect(result.hasQuantified).toBe(true);
      expect(result.hasTimebound).toBe(true);
    });
  });

  describe('detectSections', () => {
    it('should identify found and missing sections', () => {
      // Use section headers that match the patterns exactly
      const text = `## Problem
Content here about the challenge.
## Solution
More content about our approach.`;
      const result = detectSections(text);
      expect(result.found.length).toBeGreaterThanOrEqual(2);
      expect(result.found.some(s => s.name === 'Problem Statement')).toBe(true);
      expect(result.found.some(s => s.name === 'Proposed Solution')).toBe(true);
    });
  });

  describe('scoreProblemStatement', () => {
    it('should give high score for comprehensive problem', () => {
      const text = `## Problem Statement
The critical challenge is a 50% drop in customer retention this year.
This aligns with our strategic priority of customer growth.`;
      const result = scoreProblemStatement(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should identify missing elements', () => {
      const text = 'Some vague text about things.';
      const result = scoreProblemStatement(text);
      expect(result.score).toBeLessThan(10);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreProposedSolution', () => {
    it('should give high score for actionable solution', () => {
      const text = `## Proposed Solution
We will implement the new system because data shows a clear need.
The team will deploy and launch within 90 days.`;
      const result = scoreProposedSolution(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('scoreBusinessImpact', () => {
    it('should give high score for quantified impact', () => {
      const text = `## Business Impact
Revenue increase of $2 million (40% growth). Cost savings of $500K.
This gives us competitive advantage in the market.`;
      const result = scoreBusinessImpact(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('scoreImplementationPlan', () => {
    it('should give high score for detailed plan', () => {
      const text = `## Implementation Plan
Phase 1: Planning (January - February 2026)
Phase 2: Execution (Q2 2026)
The operations team is responsible with a budget of $1M.`;
      const result = scoreImplementationPlan(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('validateStrategicProposal', () => {
    it('should return complete validation results', () => {
      const proposal = `# Strategic Proposal: CRM Modernization

## Problem Statement
Our current CRM system has a critical failure rate of 40%, causing us to lose $1.5 million
annually in missed opportunities. This is a strategic priority for the organization.

## Proposed Solution
We will implement Salesforce because our research shows it reduces failures by 80%.
The deployment will launch in phases with clear deliverables.

## Business Impact
Expected revenue increase of 25% ($2 million). Cost savings of $500K from efficiency gains.
This positions us as a competitive leader in customer experience.

## Implementation Plan
Phase 1: Discovery and Planning (January 2026)
Phase 2: Development and Testing (Q1-Q2 2026)
Phase 3: Rollout (Q3 2026)
The IT team is responsible for delivery with a budget of $800K and 5 FTE resources.

## Risks
Key risk: Integration complexity with legacy systems.
Mitigation: Contingency plan with fallback to manual processes.

## Success Metrics
Target: 90% system uptime by Q4 2026.
KPI: 30% improvement in customer satisfaction scores within 12 months.`;

      const result = validateStrategicProposal(proposal);
      expect(result.totalScore).toBeGreaterThan(60);
      expect(result.problemStatement.score).toBeGreaterThan(0);
      expect(result.proposedSolution.score).toBeGreaterThan(0);
      expect(result.businessImpact.score).toBeGreaterThan(0);
      expect(result.implementationPlan.score).toBeGreaterThan(0);
      expect(result.dimension1).toBe(result.problemStatement);
      expect(result.dimension2).toBe(result.proposedSolution);
      expect(result.dimension3).toBe(result.businessImpact);
      expect(result.dimension4).toBe(result.implementationPlan);
    });

    it('should handle empty input', () => {
      const result = validateStrategicProposal('');
      expect(result.totalScore).toBe(0);
      expect(result.issues).toContain('No content to validate');
    });

    it('should alias as validateDocument', () => {
      const proposal = '## Problem\nA challenge exists.';
      const result1 = validateStrategicProposal(proposal);
      const result2 = validateDocument(proposal);
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


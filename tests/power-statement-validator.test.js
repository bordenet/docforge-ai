/**
 * Power Statement Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectActionVerbs,
  detectSpecificity,
  detectImpact,
  detectClarity,
  detectVersions,
  scoreClarity,
  scoreImpact,
  scoreAction,
  scoreSpecificity,
  validatePowerStatement,
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel
} from '../plugins/power-statement/js/validator.js';

describe('Power Statement Validator', () => {
  describe('detectActionVerbs', () => {
    it('detects strong action verbs at start', () => {
      const result = detectActionVerbs('Led a team of 10 engineers to deliver a new product.');
      expect(result.startsWithStrongVerb).toBe(true);
      expect(result.strongVerbCount).toBeGreaterThan(0);
    });

    it('detects weak verb patterns at start', () => {
      const result = detectActionVerbs('Was responsible for managing a team.');
      expect(result.startsWithWeakPattern).toBe(true);
    });

    it('finds multiple strong verbs', () => {
      const result = detectActionVerbs('Developed and launched a platform that transformed customer engagement.');
      expect(result.strongVerbCount).toBeGreaterThanOrEqual(2);
    });

    it('detects weak verbs', () => {
      const result = detectActionVerbs('I helped the team and assisted with the project.');
      expect(result.hasWeakVerbs).toBe(true);
      expect(result.weakVerbCount).toBeGreaterThan(0);
    });
  });

  describe('detectSpecificity', () => {
    it('detects percentages', () => {
      const result = detectSpecificity('Increased conversion by 45% in 3 months.');
      expect(result.hasPercentages).toBe(true);
      expect(result.percentageCount).toBe(1);
    });

    it('detects dollar amounts', () => {
      const result = detectSpecificity('Generated $2.5 million in new revenue.');
      expect(result.hasDollarAmounts).toBe(true);
    });

    it('detects time metrics', () => {
      const result = detectSpecificity('Reduced delivery time by 5 days.');
      expect(result.hasTimeMetrics).toBe(true);
    });

    it('detects comparisons', () => {
      const result = detectSpecificity('We increased by 30% and grew by 50% last year.');
      expect(result.hasComparisons).toBe(true);
    });

    it('detects team context', () => {
      const result = detectSpecificity('At Acme Corp, our team delivered results.');
      expect(result.hasTeamContext).toBe(true);
    });
  });

  describe('detectImpact', () => {
    it('detects business impact', () => {
      const result = detectImpact('Drove revenue growth and improved ROI.');
      expect(result.hasBusinessImpact).toBe(true);
    });

    it('detects customer impact', () => {
      const result = detectImpact('Improved customer satisfaction and retention rates.');
      expect(result.hasCustomerImpact).toBe(true);
    });

    it('detects scale indicators', () => {
      const result = detectImpact('Implemented company-wide solutions across the enterprise.');
      expect(result.hasScale).toBe(true);
    });
  });

  describe('detectClarity', () => {
    it('detects filler words', () => {
      const result = detectClarity('This is basically a very important solution that really works.');
      expect(result.hasFillers).toBe(true);
      expect(result.fillerCount).toBeGreaterThan(0);
    });

    it('detects jargon', () => {
      const result = detectClarity('We leverage synergy to move the needle and deep dive into solutions.');
      expect(result.hasJargon).toBe(true);
    });

    it('detects appropriate word count', () => {
      const text = 'Led the development of a customer analytics platform at Acme Corp that transformed how the sales team engages with enterprise clients. By implementing real-time data insights and predictive scoring, we increased qualified leads by 45% and shortened the sales cycle by 2 weeks. The solution now serves 500+ sales representatives across 3 regions.';
      const result = detectClarity(text);
      expect(result.isConcise).toBe(true);
    });

    it('detects passive voice', () => {
      const result = detectClarity('The project was completed by the team.');
      expect(result.hasPassiveVoice).toBe(true);
    });

    it('detects vague improvement terms', () => {
      const result = detectClarity('We improved performance and enhanced the system significantly.');
      expect(result.hasVagueImprovement).toBe(true);
    });
  });

  describe('detectVersions', () => {
    it('detects Version A header', () => {
      const result = detectVersions('## Version A:\nConcise paragraph here.');
      expect(result.hasVersionA).toBe(true);
    });

    it('detects Version B header', () => {
      const result = detectVersions('## Version B:\nStructured content here.');
      expect(result.hasVersionB).toBe(true);
    });

    it('detects structured sections', () => {
      const text = `
## Version B:
### The Challenge
Problem description.
### The Solution
Our approach.
### Results
Outcomes achieved.
### Why It Works
Explanation.
`;
      const result = detectVersions(text);
      expect(result.hasStructuredContent).toBe(true);
      expect(result.structuredSectionCount).toBe(4);
    });

    it('detects both versions', () => {
      const text = '## Version A:\nParagraph.\n## Version B:\nStructured content.';
      const result = detectVersions(text);
      expect(result.hasBothVersions).toBe(true);
    });
  });

  describe('scoreClarity', () => {
    it('gives high score for clean text', () => {
      const text = 'Led the development of an analytics platform at Acme Corp that transformed customer engagement. The team delivered real-time insights that increased qualified leads by 45% within 3 months. Sales representatives now close deals 2 weeks faster with actionable data.';
      const result = scoreClarity(text);
      expect(result.score).toBeGreaterThan(15);
      expect(result.maxScore).toBe(25);
    });

    it('penalizes filler words', () => {
      const text = 'This is basically a very important solution that really helps customers quite a lot.';
      const result = scoreClarity(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreImpact', () => {
    it('gives high score for quantified business impact', () => {
      const text = 'Drove revenue growth of 25% and reduced customer churn by 15% within the enterprise team.';
      const result = scoreImpact(text);
      expect(result.score).toBeGreaterThan(15);
    });

    it('identifies missing impact', () => {
      const text = 'Worked on a project that was pretty good.';
      const result = scoreImpact(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreAction', () => {
    it('gives high score for strong action verbs', () => {
      const text = 'Spearheaded a cross-functional initiative that transformed customer engagement and delivered measurable results.';
      const result = scoreAction(text);
      expect(result.score).toBeGreaterThan(15);
    });

    it('penalizes weak verb openings', () => {
      const text = 'Was responsible for managing a team that worked on projects.';
      const result = scoreAction(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreSpecificity', () => {
    it('gives high score for specific metrics', () => {
      const text = 'At Acme Corp, increased conversion by 35% and generated $1.5 million in 6 months for the enterprise team.';
      const result = scoreSpecificity(text);
      expect(result.score).toBeGreaterThan(15);
    });

    it('identifies missing specifics', () => {
      const text = 'Did good work that made things better.';
      const result = scoreSpecificity(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('validatePowerStatement', () => {
    it('returns complete validation results', () => {
      const text = 'Led the development of a customer analytics platform at Acme Corp that transformed how the sales team engages with enterprise clients. By implementing real-time data insights, we increased qualified leads by 45% and shortened the sales cycle by 2 weeks.';
      const result = validatePowerStatement(text);

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.clarity).toBeDefined();
      expect(result.impact).toBeDefined();
      expect(result.action).toBeDefined();
      expect(result.specificity).toBeDefined();
      expect(result.dimension1).toBeDefined();
      expect(result.dimension2).toBeDefined();
      expect(result.dimension3).toBeDefined();
      expect(result.dimension4).toBeDefined();
    });

    it('handles empty input', () => {
      const result = validatePowerStatement('');
      expect(result.totalScore).toBe(0);
      expect(result.clarity.issues).toContain('No content to validate');
    });

    it('handles null input', () => {
      const result = validatePowerStatement(null);
      expect(result.totalScore).toBe(0);
    });

    it('applies version bonus for complete format', () => {
      const text = `
## Version A:
Led the development of a customer analytics platform that increased leads by 45%.

## Version B:
### The Challenge
Sales teams lacked real-time customer insights.
### The Solution
Built an analytics platform with predictive scoring.
### Results
Increased qualified leads by 45% in 3 months.
### Why It Works
Real-time data enables faster, smarter decisions.
`;
      const result = validatePowerStatement(text);
      expect(result.versionDetection.bonus).toBe(5);
    });
  });

  describe('validateDocument', () => {
    it('is an alias for validatePowerStatement', () => {
      const text = 'Led development of analytics platform at Acme Corp.';
      const result1 = validatePowerStatement(text);
      const result2 = validateDocument(text);
      expect(result1.totalScore).toBe(result2.totalScore);
    });
  });

  describe('getGrade', () => {
    it('returns A for 90+', () => {
      expect(getGrade(95)).toBe('A');
      expect(getGrade(90)).toBe('A');
    });

    it('returns B for 80-89', () => {
      expect(getGrade(85)).toBe('B');
      expect(getGrade(80)).toBe('B');
    });

    it('returns C for 70-79', () => {
      expect(getGrade(75)).toBe('C');
    });

    it('returns D for 60-69', () => {
      expect(getGrade(65)).toBe('D');
    });

    it('returns F for below 60', () => {
      expect(getGrade(50)).toBe('F');
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
    it('returns Excellent for 80+', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
    });

    it('returns Ready for 70-79', () => {
      expect(getScoreLabel(75)).toBe('Ready');
    });

    it('returns Needs Work for 50-69', () => {
      expect(getScoreLabel(55)).toBe('Needs Work');
    });

    it('returns Draft for 30-49', () => {
      expect(getScoreLabel(40)).toBe('Draft');
    });

    it('returns Incomplete for below 30', () => {
      expect(getScoreLabel(20)).toBe('Incomplete');
    });
  });
});


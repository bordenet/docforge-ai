/**
 * PR-FAQ Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  validatePRFAQ, validateDocument, getGrade, getScoreColor, getScoreLabel
} from '../plugins/pr-faq/js/validator.js';
import { extractQuotes } from '../plugins/pr-faq/js/validator-utils.js';
import { detectMetricsInText, scoreCustomerEvidence } from '../plugins/pr-faq/js/validator-customer-evidence.js';
import { analyzeHeadlineQuality } from '../plugins/pr-faq/js/validator-structure.js';
import { analyzeFiveWs } from '../plugins/pr-faq/js/validator-content.js';
import { extractFAQs, parseFAQQuestions, isSoftballQuestion, checkHardQuestions } from '../plugins/pr-faq/js/validator-faq.js';

describe('PR-FAQ Validator', () => {
  describe('extractQuotes', () => {
    it('should extract standard double quotes', () => {
      const text = 'The CEO said "This will reduce costs by 50% for our customers" in the announcement.';
      const quotes = extractQuotes(text);
      expect(quotes.length).toBe(1);
      expect(quotes[0]).toContain('50%');
    });

    it('should filter out very short quotes', () => {
      const text = 'She said "OK" and "This is great for customers"';
      const quotes = extractQuotes(text);
      expect(quotes.length).toBe(1); // Only the longer quote
    });
  });

  describe('detectMetricsInText', () => {
    it('should detect percentage metrics', () => {
      const result = detectMetricsInText('Improved efficiency by 45%');
      expect(result.found).toBe(true);
      expect(result.types).toContain('percentage');
    });

    it('should detect multiplier metrics', () => {
      const result = detectMetricsInText('Processing speed is 3x faster');
      expect(result.found).toBe(true);
      expect(result.types).toContain('ratio');
    });

    it('should detect currency amounts', () => {
      const result = detectMetricsInText('Saving $5,000 per month');
      expect(result.found).toBe(true);
      expect(result.types).toContain('absolute');
    });
  });

  describe('analyzeHeadlineQuality', () => {
    it('should give high score for strong headline with metrics and verbs', () => {
      const title = 'Acme Launches AI-Powered Dashboard, Reducing Energy Costs by 40% Through Smart Automation';
      const result = analyzeHeadlineQuality(title);
      expect(result.score).toBeGreaterThan(6);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('should penalize weak marketing language', () => {
      const title = 'New Revolutionary Cutting-Edge Solution for Businesses';
      const result = analyzeHeadlineQuality(title);
      expect(result.issues).toContain('Avoid generic marketing language in headlines');
    });

    it('should handle missing title', () => {
      const result = analyzeHeadlineQuality('');
      expect(result.score).toBe(0);
      expect(result.issues).toContain('Missing headline/title');
    });
  });

  describe('analyzeFiveWs', () => {
    it('should detect all 5 Ws in well-structured lead', () => {
      const content = `Acme Corp today announced the launch of SmartWidget, a new AI-powered tool 
that helps small businesses reduce their operational costs by 30%. Available globally 
starting March 2026, SmartWidget enables customers to automate routine tasks.`;
      const result = analyzeFiveWs(content);
      expect(result.score).toBeGreaterThan(10);
    });

    it('should identify missing WHO', () => {
      const content = 'Today a new product was launched that helps customers save money.';
      const result = analyzeFiveWs(content);
      expect(result.issues.some(i => i.includes('WHO'))).toBe(true);
    });
  });

  describe('extractFAQs', () => {
    it('should extract External and Internal FAQ sections', () => {
      const markdown = `## Press Release
Some content here.

## FAQ

**Q: What is this?**
A: It is a product.

## Internal FAQ

**Q: What are the risks?**
A: The main risk is adoption.`;
      const faqs = extractFAQs(markdown);
      expect(faqs.externalFAQ).toContain('What is this');
      expect(faqs.internalFAQ).toContain('What are the risks');
    });
  });

  describe('parseFAQQuestions', () => {
    it('should parse Q&A format questions', () => {
      const faqContent = `**Q: How does it work?**
A: It uses AI to analyze patterns.

**Q: What is the pricing?**
A: Starting at $99/month.`;
      const questions = parseFAQQuestions(faqContent);
      expect(questions.length).toBe(2);
      expect(questions[0].question).toContain('How does it work');
    });
  });

  describe('isSoftballQuestion', () => {
    it('should detect softball questions', () => {
      const softball = 'What is the risk of being too successful? The risk is minimal since customers love it.';
      expect(isSoftballQuestion(softball)).toBe(true);
    });

    it('should not flag legitimate hard questions', () => {
      const hard = 'What happens if adoption is slower than expected? We would need to pivot our go-to-market.';
      expect(isSoftballQuestion(hard)).toBe(false);
    });
  });

  describe('checkHardQuestions', () => {
    it('should detect risk, reversibility, and opportunity cost', () => {
      const questions = [
        { question: 'What if this fails?', answer: 'We have mitigation plans.' },
        { question: 'Is this a one-way door?', answer: 'No, we can rollback.' },
        { question: 'What is the opportunity cost?', answer: 'We are deprioritizing other work.' },
      ];
      const result = checkHardQuestions(questions);
      expect(result.hasRisk).toBe(true);
      expect(result.hasReversibility).toBe(true);
      expect(result.hasOpportunityCost).toBe(true);
      expect(result.hardQuestionCount).toBe(3);
    });
  });

  describe('scoreCustomerEvidence', () => {
    it('should give high score for quotes with metrics', () => {
      const content = `"Since implementing SmartWidget, we've reduced costs by 45% and saved 200 hours monthly" said the CTO.
"Our team productivity increased 3x within the first quarter" added the VP of Operations.`;
      const result = scoreCustomerEvidence(content);
      expect(result.score).toBeGreaterThan(5);
      expect(result.quotesWithMetrics).toBeGreaterThan(0);
    });

    it('should penalize too many quotes', () => {
      const content = `"Quote one with some content here" said A.
"Quote two with some content here" said B.
"Quote three with some content here" said C.
"Quote four with some content here" said D.`;
      const result = scoreCustomerEvidence(content);
      expect(result.issues.some(i => i.includes('Too many quotes'))).toBe(true);
    });
  });

  describe('validatePRFAQ', () => {
    it('should return complete validation results', () => {
      const prfaq = `# Acme Launches SmartWidget to Reduce Energy Costs by 40%

## Press Release

SEATTLE, WA — Feb 14, 2026 — Acme Corp today announces SmartWidget, an AI-powered energy
management dashboard that reduces residential energy costs by up to 40%.

"SmartWidget represents our commitment to sustainable living," said Jane Doe, CEO of Acme.
"We've seen customers save an average of $150 monthly" added John Smith, VP of Product.

SmartWidget uses machine learning to optimize energy usage patterns. The company expects
to reach 100,000 households by year end.

About Acme Corp: Founded in 2020, Acme Corp is headquartered in Seattle.

## FAQ

**Q: How much does it cost?**
A: Starting at $29.99/month.

**Q: Does it work with all utilities?**
A: Yes, compatible with all major US utilities.

**Q: What hardware is needed?**
A: Only requires a standard smart meter.

**Q: How long to see savings?**
A: Most customers see results within 30 days.

**Q: Is my data secure?**
A: Yes, we use end-to-end encryption.

## Internal FAQ

**Q: What is the biggest risk?**
A: Customer adoption may be slower in regions with low energy costs.

**Q: Is this a one-way or two-way door?**
A: Two-way - we can pivot to commercial if residential adoption is slow.

**Q: What are we deprioritizing?**
A: We are pausing the commercial dashboard to focus on residential.

**Q: What if competitors copy this?**
A: Our ML models are 18 months ahead.

**Q: What is the estimated ROI?**
A: Break-even expected within 24 months.`;

      const result = validatePRFAQ(prfaq);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.structure.score).toBeGreaterThan(0);
      expect(result.content.score).toBeGreaterThan(0);
      expect(result.professional.score).toBeGreaterThan(0);
      expect(result.evidence.score).toBeGreaterThan(0);
      expect(result.faqQuality.score).toBeGreaterThan(0);
    });

    it('should handle empty input', () => {
      const result = validatePRFAQ('');
      expect(result.totalScore).toBe(0);
      expect(result.issues).toContain('No content to analyze');
    });

    it('should alias as validateDocument', () => {
      const prfaq = '# Test PR-FAQ\n\nSome content here.';
      const result1 = validatePRFAQ(prfaq);
      const result2 = validateDocument(prfaq);
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


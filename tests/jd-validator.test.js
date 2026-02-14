/**
 * JD Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectMasculineCoded,
  detectExtrovertBias,
  detectRedFlags,
  detectCompensation,
  detectEncouragement,
  detectWordCount,
  scoreWordCount,
  scoreMasculineCoded,
  scoreCompensation,
  scoreEncouragement,
  validateDocument,
  validateJDContent,
  getGrade,
  getScoreColor,
  getScoreLabel
} from '../plugins/jd/js/validator.js';

describe('JD Validator', () => {
  describe('detectMasculineCoded', () => {
    it('detects masculine-coded words', () => {
      const result = detectMasculineCoded('We need a rockstar ninja who is aggressive.');
      expect(result.found).toBe(true);
      expect(result.count).toBe(3);
      expect(result.words).toContain('rockstar');
      expect(result.words).toContain('ninja');
      expect(result.words).toContain('aggressive');
    });

    it('returns empty for clean text', () => {
      const result = detectMasculineCoded('We are looking for a skilled engineer.');
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });

    it('ignores mandated sections', () => {
      const result = detectMasculineCoded('[COMPANY_PREAMBLE]We are aggressive leaders.[/COMPANY_PREAMBLE] Join our team.');
      expect(result.found).toBe(false);
    });
  });

  describe('detectExtrovertBias', () => {
    it('detects extrovert-bias phrases', () => {
      const result = detectExtrovertBias('Must be outgoing and high-energy.');
      expect(result.found).toBe(true);
      expect(result.phrases).toContain('outgoing');
      expect(result.phrases).toContain('high-energy');
    });

    it('handles hyphen/space variations', () => {
      const result = detectExtrovertBias('Must be high energy and a team player.');
      expect(result.found).toBe(true);
    });
  });

  describe('detectRedFlags', () => {
    it('detects red flag phrases', () => {
      const result = detectRedFlags('We are a fast-paced company like a family.');
      expect(result.found).toBe(true);
      expect(result.phrases).toContain('fast-paced');
      expect(result.phrases).toContain('like a family');
    });

    it('handles hyphen variations', () => {
      const result = detectRedFlags('Fast paced environment where you hit the ground running.');
      expect(result.found).toBe(true);
    });
  });

  describe('detectCompensation', () => {
    it('detects salary range', () => {
      const result = detectCompensation('Salary: $100,000 - $150,000 per year.');
      expect(result.found).toBe(true);
      expect(result.hasSalaryRange).toBe(true);
    });

    it('detects hourly range', () => {
      const result = detectCompensation('$25 - $35/hour');
      expect(result.found).toBe(true);
      expect(result.hasHourlyRange).toBe(true);
    });

    it('detects bonus mention', () => {
      const result = detectCompensation('Includes equity and stock options.');
      expect(result.hasBonusMention).toBe(true);
    });
  });

  describe('detectEncouragement', () => {
    it('detects 60-70% threshold', () => {
      const result = detectEncouragement('If you meet 60-70% of the requirements, please apply!');
      expect(result.found).toBe(true);
    });

    it('detects meet most requirements', () => {
      const result = detectEncouragement('If you meet most of the requirements, we encourage you to apply.');
      expect(result.found).toBe(true);
    });

    it('detects encourage to apply', () => {
      const result = detectEncouragement('We encourage all qualified candidates to apply.');
      expect(result.found).toBe(true);
    });
  });

  describe('detectWordCount', () => {
    it('calculates word count correctly', () => {
      const text = 'This is a sample job description with exactly ten words here.';
      const result = detectWordCount(text);
      expect(result.wordCount).toBe(11);
    });

    it('identifies too short', () => {
      const result = detectWordCount('Short description.');
      expect(result.isTooShort).toBe(true);
    });
  });

  describe('scoreWordCount', () => {
    it('gives no penalty for ideal length', () => {
      const text = 'word '.repeat(500);
      const result = scoreWordCount(text);
      expect(result.penalty).toBe(0);
    });

    it('penalizes short JDs', () => {
      const text = 'word '.repeat(100);
      const result = scoreWordCount(text);
      expect(result.penalty).toBeGreaterThan(0);
    });
  });

  describe('scoreMasculineCoded', () => {
    it('penalizes masculine-coded words', () => {
      const warnings = [
        { type: 'masculine-coded', word: 'ninja' },
        { type: 'masculine-coded', word: 'rockstar' }
      ];
      const result = scoreMasculineCoded(warnings);
      expect(result.penalty).toBe(10);
      expect(result.count).toBe(2);
    });

    it('gives no penalty for clean warnings', () => {
      const result = scoreMasculineCoded([]);
      expect(result.penalty).toBe(0);
    });
  });

  describe('scoreCompensation', () => {
    it('skips for internal postings', () => {
      const result = scoreCompensation('No salary listed.', true);
      expect(result.skipped).toBe(true);
      expect(result.penalty).toBe(0);
    });

    it('penalizes missing compensation for external', () => {
      const result = scoreCompensation('No salary listed.', false);
      expect(result.penalty).toBe(10);
    });

    it('gives no penalty when compensation present', () => {
      const result = scoreCompensation('Salary: $100,000 - $150,000', false);
      expect(result.penalty).toBe(0);
    });
  });

  describe('scoreEncouragement', () => {
    it('penalizes missing encouragement', () => {
      const result = scoreEncouragement('Basic job description.');
      expect(result.penalty).toBe(5);
    });

    it('gives no penalty when present', () => {
      const result = scoreEncouragement('If you meet 60-70% of requirements, apply!');
      expect(result.penalty).toBe(0);
    });
  });

  describe('validateJDContent', () => {
    it('returns warnings for problematic content', () => {
      const result = validateJDContent('We need a rockstar who is outgoing and fast-paced.');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.valid).toBe(false);
    });

    it('returns valid for clean content', () => {
      const result = validateJDContent('We seek a skilled engineer to join our collaborative team.');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDocument', () => {
    it('returns complete validation results', () => {
      const text = 'word '.repeat(450) + 'Salary: $100,000 - $150,000. If you meet 60-70%, apply!';
      const result = validateDocument(text);

      expect(result.score).toBeGreaterThan(0);
      expect(result.grade).toBeDefined();
      expect(result.feedback).toBeDefined();
      expect(result.length).toBeDefined();
      expect(result.inclusivity).toBeDefined();
      expect(result.culture).toBeDefined();
      expect(result.transparency).toBeDefined();
    });

    it('handles empty input', () => {
      const result = validateDocument('');
      expect(result.score).toBe(0);
      expect(result.grade).toBe('F');
    });

    it('detects internal postings', () => {
      const result = validateDocument('**INTERNAL POSTING** ' + 'word '.repeat(400));
      expect(result.isInternal).toBe(true);
    });

    it('penalizes problematic language', () => {
      const cleanText = 'word '.repeat(450) + 'Salary: $100,000 - $150,000. If you meet 60-70%, apply!';
      const badText = cleanText + ' We need a rockstar ninja in a fast-paced environment.';

      const cleanResult = validateDocument(cleanText);
      const badResult = validateDocument(badText);

      expect(badResult.score).toBeLessThan(cleanResult.score);
    });
  });

  describe('getGrade', () => {
    it('returns correct grades', () => {
      expect(getGrade(95)).toBe('A');
      expect(getGrade(85)).toBe('B');
      expect(getGrade(75)).toBe('C');
      expect(getGrade(65)).toBe('D');
      expect(getGrade(50)).toBe('F');
    });
  });

  describe('getScoreColor', () => {
    it('returns correct colors', () => {
      // Now uses shared module which returns color names, not Tailwind classes
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(65)).toBe('yellow');
      expect(getScoreColor(45)).toBe('orange');
      expect(getScoreColor(25)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    it('returns correct labels', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
      expect(getScoreLabel(75)).toBe('Ready');
      expect(getScoreLabel(55)).toBe('Needs Work');
      expect(getScoreLabel(35)).toBe('Draft');
      expect(getScoreLabel(20)).toBe('Incomplete');
    });
  });
});


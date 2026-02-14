/**
 * Acceptance Criteria Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectStructure,
  detectClarity,
  detectTestability,
  detectCompleteness,
  detectSections,
  scoreStructure,
  scoreClarity,
  scoreTestability,
  scoreCompleteness,
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel
} from '../plugins/acceptance-criteria/js/validator.js';

describe('Acceptance Criteria Validator', () => {
  describe('detectStructure', () => {
    it('detects Summary section', () => {
      const result = detectStructure('# Summary\nThis is a feature.');
      expect(result.hasSummary).toBe(true);
    });

    it('detects checkbox criteria', () => {
      const result = detectStructure('- [ ] First criterion\n- [ ] Second criterion\n- [x] Third done');
      expect(result.hasCheckboxes).toBe(true);
      expect(result.checkboxCount).toBe(3);
    });

    it('detects Out of Scope section', () => {
      const result = detectStructure('# Out of Scope\nNot included.');
      expect(result.hasOutOfScope).toBe(true);
    });

    it('handles missing structure', () => {
      const result = detectStructure('Just some random text.');
      expect(result.hasSummary).toBe(false);
      expect(result.hasCheckboxes).toBe(false);
      expect(result.hasOutOfScope).toBe(false);
    });
  });

  describe('detectClarity', () => {
    it('detects action verbs', () => {
      const result = detectClarity('Implement the login flow. Display error messages. Validate user input.');
      expect(result.hasActionVerbs).toBe(true);
      expect(result.actionVerbCount).toBeGreaterThanOrEqual(3);
    });

    it('detects measurable metrics', () => {
      const result = detectClarity('Load time under 200ms. Support 1000 users. 99% uptime.');
      expect(result.hasMetrics).toBe(true);
      expect(result.metricsCount).toBeGreaterThan(0);
    });

    it('detects thresholds', () => {
      const result = detectClarity('At least 5 items. Maximum 10 retries.');
      expect(result.hasThresholds).toBe(true);
    });
  });

  describe('detectTestability', () => {
    it('detects vague terms', () => {
      const result = detectTestability('The system works correctly and handles properly.');
      expect(result.vagueTermCount).toBeGreaterThan(0);
      expect(result.hasIssues).toBe(true);
    });

    it('detects user story anti-pattern', () => {
      const result = detectTestability('As a user, I want to login.');
      expect(result.hasUserStoryAntiPattern).toBe(true);
    });

    it('detects Gherkin anti-pattern', () => {
      const result = detectTestability('Given a logged in user\nWhen they click logout');
      expect(result.hasGherkinAntiPattern).toBe(true);
    });

    it('detects compound criteria', () => {
      const result = detectTestability('The button is visible and clickable.');
      expect(result.hasCompoundCriteria).toBe(true);
    });

    it('detects implementation details', () => {
      const result = detectTestability('Store data in PostgreSQL. Use React for frontend.');
      expect(result.hasImplementationDetails).toBe(true);
    });

    it('returns clean for good criteria', () => {
      const result = detectTestability('Display confirmation message within 500ms.');
      expect(result.hasUserStoryAntiPattern).toBe(false);
      expect(result.hasGherkinAntiPattern).toBe(false);
    });
  });

  describe('detectCompleteness', () => {
    it('counts checkbox criteria', () => {
      const result = detectCompleteness('- [ ] One\n- [ ] Two\n- [ ] Three\n- [ ] Four');
      expect(result.criterionCount).toBe(4);
    });

    it('detects error cases', () => {
      const result = detectCompleteness('Handle timeout errors. Show invalid input message.');
      expect(result.hasErrorCases).toBe(true);
    });

    it('detects edge cases', () => {
      const result = detectCompleteness('Handle empty state. Test boundary condition.');
      expect(result.hasEdgeCases).toBe(true);
    });
  });

  describe('detectSections', () => {
    it('finds all required sections', () => {
      const text = '# Summary\nFeature overview.\n# Acceptance Criteria\n- [ ] Test\n# Out of Scope\nNot included.';
      const result = detectSections(text);
      expect(result.found.length).toBe(3);
      expect(result.missing.length).toBe(0);
    });

    it('identifies missing sections', () => {
      const result = detectSections('Just some text.');
      expect(result.missing.length).toBe(3);
    });
  });

  describe('scoreStructure', () => {
    it('gives full points for complete structure', () => {
      const text = '# Summary\nOverview.\n- [ ] First\n- [ ] Second\n- [ ] Third\n# Out of Scope\nNot included.';
      const result = scoreStructure(text);
      expect(result.score).toBe(25);
    });

    it('gives partial points for incomplete structure', () => {
      const text = '# Summary\nOverview.';
      const result = scoreStructure(text);
      expect(result.score).toBeLessThan(25);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreClarity', () => {
    it('gives full points for clear criteria', () => {
      const text = 'Implement login. Create user profile. Display dashboard. Validate email. Load data within 100ms. Return 5 results. Show 3 items.';
      const result = scoreClarity(text);
      expect(result.score).toBe(30);
    });

    it('deducts for missing action verbs', () => {
      const text = 'The login page.';
      const result = scoreClarity(text);
      expect(result.score).toBeLessThan(30);
    });
  });

  describe('scoreTestability', () => {
    it('starts with full score for clean criteria', () => {
      const text = 'Display confirmation message.';
      const result = scoreTestability(text);
      expect(result.score).toBeGreaterThan(0);
    });

    it('deducts for vague terms', () => {
      const text = 'The system works correctly and handles properly.';
      const result = scoreTestability(text);
      expect(result.score).toBeLessThan(25);
    });

    it('deducts for user story syntax', () => {
      const text = 'As a user, I want to login.';
      const result = scoreTestability(text);
      expect(result.issues).toContain('Remove user story syntax - use simple checkboxes instead');
    });

    it('deducts for Gherkin syntax', () => {
      const text = 'Given a logged in user\nWhen they click logout';
      const result = scoreTestability(text);
      expect(result.issues).toContain('Remove Given/When/Then syntax - use simple checkboxes');
    });
  });

  describe('scoreCompleteness', () => {
    it('scores ideal criterion count', () => {
      const text = '# Summary\nFeature.\n# Acceptance Criteria\n- [ ] One\n- [ ] Two\n- [ ] Three\n- [ ] Four\n# Out of Scope\nNot this.\nHandle error cases. Test edge case scenarios.';
      const result = scoreCompleteness(text);
      expect(result.score).toBeGreaterThan(10);
    });

    it('deducts for too few criteria', () => {
      const text = '- [ ] One';
      const result = scoreCompleteness(text);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('validateDocument', () => {
    it('returns complete validation results', () => {
      const text = `# Summary
A login feature.

# Acceptance Criteria
- [ ] Display login form within 200ms
- [ ] Validate email format
- [ ] Show error for invalid credentials
- [ ] Redirect to dashboard on success

# Out of Scope
- Password reset
`;
      const result = validateDocument(text);

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.structure).toBeDefined();
      expect(result.clarity).toBeDefined();
      expect(result.testability).toBeDefined();
      expect(result.completeness).toBeDefined();
      expect(result.dimension1).toBeDefined();
      expect(result.dimension2).toBeDefined();
      expect(result.dimension3).toBeDefined();
      expect(result.dimension4).toBeDefined();
    });

    it('handles empty input', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
    });

    it('handles null input', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    it('includes slop detection', () => {
      const text = '# Summary\nFeature.\n- [ ] Test';
      const result = validateDocument(text);
      expect(result.slopDetection).toBeDefined();
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


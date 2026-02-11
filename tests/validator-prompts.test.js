/**
 * Tests for validator-prompts.js
 * @jest-environment jsdom
 */

import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
} from '../shared/js/validator-prompts.js';

// Mock plugin for testing
const mockPlugin = {
  name: 'One-Pager',
  scoringDimensions: [
    { name: 'Problem Clarity', maxPoints: 30, description: 'Clear problem statement' },
    { name: 'Solution Quality', maxPoints: 25, description: 'Addresses root cause' },
    { name: 'Scope Discipline', maxPoints: 25, description: 'In/out scope defined' },
    { name: 'Completeness', maxPoints: 20, description: 'All sections present' },
  ],
};

const mockContent = '# Test Document\n\nThis is a test document for validation.';

const mockResult = {
  totalScore: 65,
  issues: ['Missing metrics', 'No stakeholders defined', 'Timeline unclear'],
};

describe('generateLLMScoringPrompt', () => {
  test('includes plugin name in prompt', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('One-Pager');
  });

  test('includes total points from dimensions', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('0-100 points total');
    expect(prompt).toContain('/100');
  });

  test('includes all scoring dimensions in rubric', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('Problem Clarity');
    expect(prompt).toContain('30 points');
    expect(prompt).toContain('Solution Quality');
    expect(prompt).toContain('25 points');
    expect(prompt).toContain('Scope Discipline');
    expect(prompt).toContain('Completeness');
    expect(prompt).toContain('20 points');
  });

  test('includes document content in code block', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('```\n# Test Document');
    expect(prompt).toContain('test document for validation.\n```');
  });

  test('includes calibration guidance', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('Be HARSH');
    expect(prompt).toContain('weasel words');
    expect(prompt).toContain('marketing fluff');
  });

  test('includes output format instructions', () => {
    const prompt = generateLLMScoringPrompt(mockContent, mockPlugin);
    expect(prompt).toContain('TOTAL SCORE');
    expect(prompt).toContain('Top 3 Issues');
    expect(prompt).toContain('Top 3 Strengths');
  });

  test('handles plugin with no dimensions gracefully', () => {
    const emptyPlugin = { name: 'Empty', scoringDimensions: [] };
    const prompt = generateLLMScoringPrompt(mockContent, emptyPlugin);
    expect(prompt).toContain('Empty');
    expect(prompt).toContain('0-100 points total'); // Falls back to 100
  });
});

describe('generateCritiquePrompt', () => {
  test('includes plugin name', () => {
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('One-Pager');
  });

  test('includes current score from result', () => {
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('Total Score: 65/100');
    expect(prompt).toContain('Score Summary:** 65/100');
  });

  test('includes issues from validation result', () => {
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('Missing metrics');
    expect(prompt).toContain('No stakeholders defined');
    expect(prompt).toContain('Timeline unclear');
  });

  test('includes document content', () => {
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('# Test Document');
  });

  test('handles null result gracefully', () => {
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, null);
    expect(prompt).toContain('Total Score: 0/100');
    expect(prompt).toContain('None detected');
  });

  test('handles empty issues array', () => {
    const resultNoIssues = { totalScore: 80, issues: [] };
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, resultNoIssues);
    expect(prompt).toContain('None detected');
  });

  test('limits issues to 5', () => {
    const manyIssues = {
      totalScore: 30,
      issues: ['Issue 1', 'Issue 2', 'Issue 3', 'Issue 4', 'Issue 5', 'Issue 6', 'Issue 7'],
    };
    const prompt = generateCritiquePrompt(mockContent, mockPlugin, manyIssues);
    expect(prompt).toContain('Issue 5');
    expect(prompt).not.toContain('Issue 6');
  });
});

describe('generateRewritePrompt', () => {
  test('includes plugin name', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('One-Pager');
  });

  test('includes current score', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('CURRENT SCORE: 65/100');
  });

  test('includes scoring rubric', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('Problem Clarity');
    expect(prompt).toContain('Solution Quality');
  });

  test('includes original document', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('ORIGINAL DOCUMENT');
    expect(prompt).toContain('# Test Document');
  });

  test('includes output rules for clean paste', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, mockResult);
    expect(prompt).toContain('Output ONLY the rewritten document');
    expect(prompt).toContain('Ready to paste directly');
  });

  test('handles null result gracefully', () => {
    const prompt = generateRewritePrompt(mockContent, mockPlugin, null);
    expect(prompt).toContain('CURRENT SCORE: 0/100');
  });
});


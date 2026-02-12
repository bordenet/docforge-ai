/**
 * Validator Module Tests
 * Tests for document validation and scoring logic
 */

import { describe, test, expect } from '@jest/globals';
import {
  validateDocument,
  detectSections,
  detectPrompt,
  analyzeContentQuality,
  getGrade,
  getScoreColor,
  getScoreLabel,
  calculateSlopScore,
} from '../shared/js/validator.js';

describe('Validator Module', () => {
  describe('detectSections', () => {
    test('detects problem section', () => {
      const text = '# Problem\nWe have a challenge with X.';
      const result = detectSections(text);
      expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
    });

    test('detects solution section', () => {
      const text = '## Solution\nWe will implement Y.';
      const result = detectSections(text);
      expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
    });

    test('detects multiple sections', () => {
      const text = `
# Problem
We have an issue.

# Solution
We will fix it.

# Goals
- Goal 1
- Goal 2
      `;
      const result = detectSections(text);
      expect(result.found.length).toBeGreaterThanOrEqual(3);
    });

    test('reports missing sections', () => {
      const text = '# Problem\nJust a problem.';
      const result = detectSections(text);
      expect(result.missing.length).toBeGreaterThan(0);
    });

    // Tests for section detection with plain text headings (no markdown prefix)
    // This is critical for documents imported from Word/Google Docs
    describe('Plain Text Heading Detection', () => {
      test('detects problem section without markdown prefix', () => {
        const text = 'Problem\nWe have a challenge with X.';
        const result = detectSections(text);
        expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
      });

      test('detects solution section without markdown prefix', () => {
        const text = 'Solution\nWe will implement Y.';
        const result = detectSections(text);
        expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
      });

      test('detects goals section without markdown prefix', () => {
        const text = 'Goals\n- Goal 1\n- Goal 2';
        const result = detectSections(text);
        expect(result.found.some((s) => s.name === 'Goals/Benefits')).toBe(true);
      });

      test('detects multiple plain text sections', () => {
        const text = `Problem
We have an issue.

Solution
We will fix it.

Goals
- Goal 1
- Goal 2`;
        const result = detectSections(text);
        expect(result.found.length).toBeGreaterThanOrEqual(3);
      });

      test('detects mixed markdown and plain text headings', () => {
        const text = `# Problem
We have an issue.

Solution
We will fix it.

## Goals
- Goal 1`;
        const result = detectSections(text);
        expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
        expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
        expect(result.found.some((s) => s.name === 'Goals/Benefits')).toBe(true);
      });

      test('handles Word/Google Docs style document', () => {
        // Simulates a document pasted from Word with no markdown formatting
        // Note: Section headings must start with the keyword (e.g., "Problem" not "The Problem")
        const text = `Problem Statement
Our current system is slow and unreliable.

Solution Overview
We will migrate to a new architecture.

Success Metrics
- 50% faster response time
- 99.9% uptime`;
        const result = detectSections(text);
        // "Problem Statement" matches the problem pattern (starts with "Problem")
        expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
        // "Solution Overview" matches the solution pattern (starts with "Solution")
        expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
        // "Success Metrics" matches the success/metric pattern
        expect(result.found.some((s) => s.name === 'Success Metrics')).toBe(true);
      });
    });
  });

  describe('analyzeContentQuality', () => {
    test('counts quantified content', () => {
      const text = 'We saved 50% costs and $1 million dollars with 100 users.';
      const result = analyzeContentQuality(text);
      expect(result.quantified).toBeGreaterThan(0);
    });

    test('counts headings', () => {
      const text = '# One\n## Two\n### Three\nContent here.';
      const result = analyzeContentQuality(text);
      expect(result.headingCount).toBe(3);
    });

    test('counts word count', () => {
      const text = 'One two three four five.';
      const result = analyzeContentQuality(text);
      expect(result.wordCount).toBe(5);
    });

    test('detects structure with 3+ headings', () => {
      const text = '# A\n## B\n### C\nContent.';
      const result = analyzeContentQuality(text);
      expect(result.hasStructure).toBe(true);
    });

    test('detects substance with 100+ words', () => {
      const words = Array(105).fill('word').join(' ');
      const result = analyzeContentQuality(words);
      expect(result.hasSubstance).toBe(true);
    });
  });

  describe('validateDocument', () => {
    const mockPlugin = {
      scoringDimensions: [
        { name: 'Quality', maxPoints: 50, description: 'Quality' },
        { name: 'Structure', maxPoints: 50, description: 'Structure' },
      ],
    };

    test('returns zero score for empty text', () => {
      const result = validateDocument('', mockPlugin);
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for null text', () => {
      const result = validateDocument(null, mockPlugin);
      expect(result.totalScore).toBe(0);
    });

    test('returns higher score for well-structured content', () => {
      const goodContent = `
# Problem Statement
We have 50% churn rate with $1M lost revenue.

# Proposed Solution
We will build a new system to improve retention.

# Success Metrics
- Reduce churn by 25%
- Save $500K annually

# Timeline
Phase 1: Q1 2024
Phase 2: Q2 2024
      `;
      const result = validateDocument(goodContent, mockPlugin);
      expect(result.totalScore).toBeGreaterThan(0);
    });

    test('includes dimension results', () => {
      const content = '# Problem\nSome content here with details.';
      const result = validateDocument(content, mockPlugin);
      expect(result.Quality).toBeDefined();
      expect(result.Structure).toBeDefined();
      expect(result.dimension1).toBeDefined();
      expect(result.dimension2).toBeDefined();
    });

    test('includes slop detection', () => {
      const content = 'We will delve into this incredibly robust solution.';
      const result = validateDocument(content, mockPlugin);
      expect(result.slopDetection).toBeDefined();
      expect(result.slopDetection.score).toBeDefined();
    });

    test('uses default dimensions when plugin not provided', () => {
      const result = validateDocument('# Test\nContent', null);
      expect(result.dimension1).toBeDefined();
      expect(result.totalScore).toBeDefined();
    });
  });

  describe('getGrade', () => {
    test('returns A for 90+', () => {
      expect(getGrade(90)).toBe('A');
      expect(getGrade(95)).toBe('A');
      expect(getGrade(100)).toBe('A');
    });

    test('returns B for 80-89', () => {
      expect(getGrade(80)).toBe('B');
      expect(getGrade(85)).toBe('B');
      expect(getGrade(89)).toBe('B');
    });

    test('returns C for 70-79', () => {
      expect(getGrade(70)).toBe('C');
      expect(getGrade(75)).toBe('C');
      expect(getGrade(79)).toBe('C');
    });

    test('returns D for 60-69', () => {
      expect(getGrade(60)).toBe('D');
      expect(getGrade(65)).toBe('D');
      expect(getGrade(69)).toBe('D');
    });

    test('returns F for below 60', () => {
      expect(getGrade(59)).toBe('F');
      expect(getGrade(30)).toBe('F');
      expect(getGrade(0)).toBe('F');
    });
  });

  describe('getScoreColor', () => {
    test('returns green for 70+', () => {
      expect(getScoreColor(70)).toBe('green');
      expect(getScoreColor(100)).toBe('green');
    });

    test('returns yellow for 50-69', () => {
      expect(getScoreColor(50)).toBe('yellow');
      expect(getScoreColor(69)).toBe('yellow');
    });

    test('returns orange for 30-49', () => {
      expect(getScoreColor(30)).toBe('orange');
      expect(getScoreColor(49)).toBe('orange');
    });

    test('returns red for below 30', () => {
      expect(getScoreColor(29)).toBe('red');
      expect(getScoreColor(0)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('returns Excellent for 80+', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('returns Ready for 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('returns Needs Work for 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('returns Draft for 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('returns Incomplete for below 30', () => {
      expect(getScoreLabel(29)).toBe('Incomplete');
      expect(getScoreLabel(0)).toBe('Incomplete');
    });
  });

  describe('calculateSlopScore re-export', () => {
    test('calculates slop score from re-exported function', () => {
      const text = 'This is clean text without filler.';
      const result = calculateSlopScore(text);
      // calculateSlopScore returns an object with score property
      expect(typeof result).toBe('object');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    test('returns severity level', () => {
      const text = 'Clean text without issues.';
      const result = calculateSlopScore(text);
      expect(result.severity).toBeDefined();
      expect(['clean', 'light', 'moderate', 'heavy', 'severe']).toContain(result.severity);
    });
  });

  describe('detectPrompt', () => {
    test('detects prompt with role assignment', () => {
      const text = 'You are a management consultant. Your task is to draft a proposal.';
      const result = detectPrompt(text);
      expect(result.indicatorCount).toBeGreaterThan(0);
      expect(result.indicators).toContain('Role assignment ("You are a...")');
    });

    test('detects prompt with template variables', () => {
      const text = 'Organization: {{ORGANIZATION_NAME}}\nLocation: {{LOCATION}}';
      const result = detectPrompt(text);
      expect(result.indicators).toContain('Template variables ({{VAR}})');
    });

    test('detects prompt with instruction headers', () => {
      const text = '## CRITICAL INSTRUCTIONS\n- Do not hallucinate\n- Use only provided info';
      const result = detectPrompt(text);
      expect(result.indicators).toContain('Instruction header');
    });

    test('returns isPrompt true for text with 3+ indicators', () => {
      const promptText = `You are a consultant. Your task is to write a proposal.
## CRITICAL INSTRUCTIONS
- Use ONLY the information provided
Organization: {{ORGANIZATION_NAME}}`;
      const result = detectPrompt(promptText);
      expect(result.isPrompt).toBe(true);
      expect(result.indicatorCount).toBeGreaterThanOrEqual(3);
    });

    test('returns isPrompt false for normal document', () => {
      const docText = `# Strategic Proposal for Acme Corp

## Executive Summary
This proposal outlines a partnership opportunity.

## Financial Impact
Expected ROI of 25% within 12 months.`;
      const result = detectPrompt(docText);
      expect(result.isPrompt).toBe(false);
    });
  });

  describe('validateDocument with prompt detection', () => {
    test('returns zero score and warning for detected prompts', () => {
      const promptText = `You are a management consultant. Your task is to draft a proposal.
## CRITICAL INSTRUCTIONS
- Use ONLY the information provided
Organization: {{ORGANIZATION_NAME}}
<output_rules>Start immediately with the title</output_rules>`;
      const result = validateDocument(promptText);
      expect(result.totalScore).toBe(0);
      expect(result.isPromptDetected).toBe(true);
      expect(result.issues[0]).toContain('PROMPT');
    });

    test('validates normal documents without prompt warning', () => {
      const docText = `# Strategic Proposal

## Problem Statement
The company faces challenges with customer retention.

## Proposed Solution
Implement a loyalty program with measurable KPIs.`;
      const result = validateDocument(docText);
      expect(result.isPromptDetected).toBeFalsy();
    });
  });
});

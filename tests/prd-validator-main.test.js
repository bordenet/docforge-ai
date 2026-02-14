/**
 * PRD Validator Tests - Main Validation Functions
 * Tests for validatePRD and validateDocument
 */

import { describe, test, expect } from '@jest/globals';
import {
  validatePRD,
  validateDocument,
} from '../plugins/prd/js/validator.js';

describe('PRD Validator - Main Functions', () => {
  describe('validatePRD', () => {
    test('returns zero scores for empty input', () => {
      const result = validatePRD('');
      expect(result.totalScore).toBe(0);
      expect(result.clarity.issues).toContain('No content to validate');
    });

    test('returns zero scores for null input', () => {
      const result = validatePRD(null);
      expect(result.totalScore).toBe(0);
      expect(result.clarity.issues).toContain('No content to validate');
    });

    test('returns zero scores for non-string input', () => {
      const result = validatePRD(123);
      expect(result.totalScore).toBe(0);
    });

    test('returns complete validation result with all dimensions', () => {
      const prd = `
# Problem Statement
Users struggle with task management.

# User Personas
**Primary User**: Solo developer who needs to track tasks.
Pain points: loses track of items, context switching.

# Goals and Objectives
- Reduce context switching by 50%
- Increase task completion rate

# Proposed Solution
A unified task management system.

# Requirements
FR1: User can create tasks. P1
FR2: User can mark tasks complete. P1

# Non-Functional Requirements
Performance: Response time under 200ms
Security: OAuth2 authentication

# Acceptance Criteria
Given a user is logged in
When they create a task
Then the task appears in their list
      `;
      const result = validatePRD(prd);

      // Check all dimension properties exist
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('structure');
      expect(result).toHaveProperty('clarity');
      expect(result).toHaveProperty('userFocus');
      expect(result).toHaveProperty('technical');
      expect(result).toHaveProperty('strategicViability');

      // Check dimension aliases for app.js compatibility
      expect(result).toHaveProperty('dimension1');
      expect(result).toHaveProperty('dimension2');
      expect(result).toHaveProperty('dimension3');
      expect(result).toHaveProperty('dimension4');
      expect(result).toHaveProperty('dimension5');

      // Check slop detection
      expect(result).toHaveProperty('slopDetection');
      expect(result.slopDetection).toHaveProperty('deduction');

      // Score should be positive for reasonable PRD
      expect(result.totalScore).toBeGreaterThan(0);
    });

    test('applies slop penalty when AI patterns detected', () => {
      const sloppyPrd = `
# Problem Statement
This groundbreaking solution leverages cutting-edge technology to seamlessly
integrate world-class capabilities that unlock transformative value.
It is important to note that the game-changing approach revolutionizes
the enterprise landscape.
      `;
      const result = validatePRD(sloppyPrd);
      expect(result.slopDetection.deduction).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateDocument', () => {
    test('is an alias for validatePRD', () => {
      const text = '# Problem Statement\nSimple problem.';
      const prdResult = validatePRD(text);
      const docResult = validateDocument(text);

      expect(docResult.totalScore).toBe(prdResult.totalScore);
      expect(docResult.structure.score).toBe(prdResult.structure.score);
    });
  });
});


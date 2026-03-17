/**
 * PRD Validator Score Consistency Tests
 *
 * These tests ensure the PRD validator produces consistent, deterministic scores
 * and that scoring dimensions align across config.js, validator.js, and phase2.md.
 *
 * @module tests/prd-score-consistency
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import validator and config
import { validatePRD } from '../plugins/prd/js/validator.js';
import { prdPlugin as prdConfig } from '../plugins/prd/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('PRD Validator Score Consistency', () => {
  let fixtureContent;
  let validationResult;

  beforeAll(() => {
    // Load the Project Verity PRD fixture
    const fixturePath = join(__dirname, 'fixtures', 'prd-project-verity.md');
    fixtureContent = readFileSync(fixturePath, 'utf8');
    validationResult = validatePRD(fixtureContent);
  });

  describe('Deterministic Scoring', () => {
    test('should produce identical scores on repeated runs', () => {
      // Run validator multiple times on the same content
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(validatePRD(fixtureContent));
      }

      // All runs should produce identical total scores
      const totalScores = results.map((r) => r.totalScore);
      expect(new Set(totalScores).size).toBe(1);

      // All dimension scores should also be identical
      const dimensions = ['structure', 'clarity', 'userFocus', 'technical', 'strategicViability'];
      for (const dim of dimensions) {
        const dimScores = results.map((r) => r[dim].score);
        expect(new Set(dimScores).size).toBe(1);
      }
    });

    test('should produce expected scores for Project Verity PRD fixture', () => {
      // These are the exact scores from running the validator on the fixture
      // If these change, either the validator logic changed or the fixture changed
      expect(validationResult.totalScore).toBe(77);

      expect(validationResult.structure.score).toBe(18);
      expect(validationResult.structure.maxScore).toBe(20);

      expect(validationResult.clarity.score).toBe(16);
      expect(validationResult.clarity.maxScore).toBe(25);

      expect(validationResult.userFocus.score).toBe(20);
      expect(validationResult.userFocus.maxScore).toBe(20);

      expect(validationResult.technical.score).toBe(7);
      expect(validationResult.technical.maxScore).toBe(15);

      expect(validationResult.strategicViability.score).toBe(20);
      expect(validationResult.strategicViability.maxScore).toBe(20);
    });
  });

  describe('Unicode Normalization - Copy-Paste Resilience', () => {
    test('zero-width spaces should not affect scores', () => {
      // ZWS (U+200B) is commonly inserted by browsers during copy-paste from AI chat interfaces
      const withZWS = fixtureContent.replace(/## /g, '##\u200B ');
      const result = validatePRD(withZWS);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('BOM should not affect scores', () => {
      // BOM (U+FEFF) is added by some text editors and clipboard operations
      const withBOM = '\uFEFF' + fixtureContent;
      const result = validatePRD(withBOM);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('non-breaking spaces should not affect scores', () => {
      // NBSP (U+00A0) is common in copy-paste from web pages
      const withNBSP = fixtureContent.replace(/ /g, '\u00A0');
      const result = validatePRD(withNBSP);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('zero-width joiners should not affect scores', () => {
      const withZWJ = fixtureContent.replace(/# /g, '#\u200D ');
      const result = validatePRD(withZWJ);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('directional marks should not affect scores', () => {
      const withLRM = fixtureContent.replace(/## /g, '##\u200E ');
      const result = validatePRD(withLRM);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('Windows line endings should not affect scores', () => {
      const withCRLF = fixtureContent.replace(/\n/g, '\r\n');
      const result = validatePRD(withCRLF);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });

    test('multiple invisible characters combined should not affect scores', () => {
      // Simulate worst-case copy-paste: BOM + ZWS + NBSP + directional marks
      const corrupted = '\uFEFF' + fixtureContent
        .replace(/## /g, '##\u200B ')
        .replace(/\| /g, '|\u00A0')
        .replace(/# /g, '#\u200E ');
      const result = validatePRD(corrupted);
      expect(result.totalScore).toBe(validationResult.totalScore);
    });
  });

  describe('Issues Rollup', () => {
    test('validatePRD should include top-level issues array', () => {
      expect(Array.isArray(validationResult.issues)).toBe(true);
    });

    test('top-level issues should aggregate all dimension issues', () => {
      const expectedIssueCount =
        validationResult.structure.issues.length +
        validationResult.clarity.issues.length +
        validationResult.userFocus.issues.length +
        validationResult.technical.issues.length +
        validationResult.strategicViability.issues.length +
        (validationResult.slopDetection?.issues?.length || 0);
      expect(validationResult.issues.length).toBe(expectedIssueCount);
    });
  });

  describe('Dimension Alignment - Config', () => {
    test('should have exactly 5 scoring dimensions in config.js', () => {
      expect(prdConfig.scoringDimensions).toHaveLength(5);
    });

    test('should have correct dimension names and max points in config.js', () => {
      const expectedDimensions = [
        { name: 'Document Structure', maxPoints: 20 },
        { name: 'Requirements Clarity', maxPoints: 25 },
        { name: 'User Focus', maxPoints: 20 },
        { name: 'Technical Quality', maxPoints: 15 },
        { name: 'Strategic Viability', maxPoints: 20 },
      ];

      for (let i = 0; i < expectedDimensions.length; i++) {
        expect(prdConfig.scoringDimensions[i].name).toBe(expectedDimensions[i].name);
        expect(prdConfig.scoringDimensions[i].maxPoints).toBe(expectedDimensions[i].maxPoints);
      }
    });

    test('should have total max points of 100 in config.js', () => {
      const totalMax = prdConfig.scoringDimensions.reduce((sum, dim) => sum + dim.maxPoints, 0);
      expect(totalMax).toBe(100);
    });
  });

  describe('Validator-Config Consistency', () => {
    test('should return results with all required dimension keys', () => {
      const expectedKeys = [
        'totalScore',
        'structure',
        'clarity',
        'userFocus',
        'technical',
        'strategicViability',
      ];

      for (const key of expectedKeys) {
        expect(validationResult).toHaveProperty(key);
      }
    });

    test('should have maxScore matching config maxPoints for each dimension', () => {
      // Map validator keys to config dimension names
      const keyToConfigName = {
        structure: 'Document Structure',
        clarity: 'Requirements Clarity',
        userFocus: 'User Focus',
        technical: 'Technical Quality',
        strategicViability: 'Strategic Viability',
      };

      for (const [validatorKey, configName] of Object.entries(keyToConfigName)) {
        const configDim = prdConfig.scoringDimensions.find((d) => d.name === configName);
        expect(configDim).toBeDefined();
        expect(validationResult[validatorKey].maxScore).toBe(configDim.maxPoints);
      }
    });
  });

  describe('Prompt Rubric Alignment', () => {
    let phase2Content;

    beforeAll(() => {
      const promptPath = join(__dirname, '..', 'plugins', 'prd', 'prompts', 'phase2.md');
      phase2Content = readFileSync(promptPath, 'utf8');
    });

    test('should have phase2.md rubric dimensions matching config.js', () => {
      // Extract dimension headers from phase2.md using regex
      // Pattern: "### N. Dimension Name (XX pts max)"
      const rubricPattern = /### \d+\.\s+([A-Za-z ]+)\s+\((\d+)\s+pts\s+max\)/g;
      const matches = [...phase2Content.matchAll(rubricPattern)];
      const rubricDimensions = matches.map((match) => ({
        name: match[1].trim(),
        maxPoints: parseInt(match[2], 10),
      }));

      // Should find exactly 5 dimensions in the rubric
      expect(rubricDimensions).toHaveLength(5);

      // Each rubric dimension should match a config dimension
      for (const rubricDim of rubricDimensions) {
        const configDim = prdConfig.scoringDimensions.find((d) => d.name === rubricDim.name);
        expect(configDim).toBeDefined();
        expect(configDim.maxPoints).toBe(rubricDim.maxPoints);
      }
    });

    test('should have phase2.md total points summing to 100', () => {
      const rubricPattern = /### \d+\.\s+[A-Za-z ]+\s+\((\d+)\s+pts\s+max\)/g;
      const matches = [...phase2Content.matchAll(rubricPattern)];
      const totalPoints = matches.reduce((sum, match) => sum + parseInt(match[1], 10), 0);

      expect(totalPoints).toBe(100);
    });
  });
});


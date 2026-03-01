/**
 * Prompt-Rubric Alignment Tests
 * Validates that scoring rubrics in prompt markdown files match JavaScript validator logic
 * Addresses: Bug 2 (Score Mismatch between Assistant and Validator)
 */

import { describe, test, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import plugin registry to get scoring dimensions
import { getPlugin } from '../shared/js/plugin-registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Parse scoring rubric from prompt markdown
 * Extracts dimension names and max points from Phase 2 review prompts
 */
function parseRubricFromPrompt(promptContent) {
  const dimensions = [];
  
  // Match patterns like "### 1. Document Structure (20 pts max)"
  const dimensionPattern = /###\s*\d+\.\s*(.+?)\s*\((\d+)\s*pts?\s*max\)/gi;
  let match;
  
  while ((match = dimensionPattern.exec(promptContent)) !== null) {
    dimensions.push({
      name: match[1].trim(),
      maxPoints: parseInt(match[2], 10),
    });
  }
  
  return dimensions;
}

/**
 * Extract total points claimed in prompt
 */
function parseTotalPointsFromPrompt(promptContent) {
  // Match patterns like "100 pts total" or "5 Dimensions - 100 pts total"
  const totalPattern = /(\d+)\s*pts?\s*total/i;
  const match = promptContent.match(totalPattern);
  return match ? parseInt(match[1], 10) : null;
}

describe('Prompt-Rubric Alignment', () => {
  describe('PRD Plugin', () => {
    const prdPlugin = getPlugin('prd');
    let phase2Content;
    
    beforeAll(() => {
      const phase2Path = join(projectRoot, 'plugins/prd/prompts/phase2.md');
      phase2Content = readFileSync(phase2Path, 'utf-8');
    });

    test('total points in prompt matches JS validator (100 pts)', () => {
      const promptTotal = parseTotalPointsFromPrompt(phase2Content);
      const validatorTotal = prdPlugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
      
      expect(promptTotal).toBe(100);
      expect(validatorTotal).toBe(100);
      expect(promptTotal).toBe(validatorTotal);
    });

    test('dimension count in prompt matches JS validator', () => {
      const promptDimensions = parseRubricFromPrompt(phase2Content);
      
      expect(promptDimensions.length).toBe(prdPlugin.scoringDimensions.length);
    });

    test('dimension names in prompt match JS validator', () => {
      const promptDimensions = parseRubricFromPrompt(phase2Content);
      const validatorDimNames = prdPlugin.scoringDimensions.map(d => d.name.toLowerCase());
      
      promptDimensions.forEach(promptDim => {
        const normalizedName = promptDim.name.toLowerCase();
        const hasMatch = validatorDimNames.some(vName => 
          vName.includes(normalizedName) || normalizedName.includes(vName)
        );
        expect(hasMatch).toBe(true);
      });
    });

    test('dimension maxPoints in prompt match JS validator', () => {
      const promptDimensions = parseRubricFromPrompt(phase2Content);
      
      // Map prompt dimensions to validator dimensions by name
      promptDimensions.forEach(promptDim => {
        const matchingValidator = prdPlugin.scoringDimensions.find(vd => 
          vd.name.toLowerCase().includes(promptDim.name.toLowerCase()) ||
          promptDim.name.toLowerCase().includes(vd.name.toLowerCase().replace(' ', ''))
        );
        
        if (matchingValidator) {
          expect(promptDim.maxPoints).toBe(matchingValidator.maxPoints);
        }
      });
    });

    test('prompt mentions all 5 scoring dimensions', () => {
      expect(phase2Content).toContain('Document Structure');
      expect(phase2Content).toContain('Requirements Clarity');
      expect(phase2Content).toContain('User Focus');
      expect(phase2Content).toContain('Technical Quality');
      expect(phase2Content).toContain('Strategic Viability');
    });

    test('prompt dimension point values are correct', () => {
      // These are the authoritative values from the JS validator
      expect(phase2Content).toMatch(/Document Structure\s*\(20 pts max\)/i);
      expect(phase2Content).toMatch(/Requirements Clarity\s*\(25 pts max\)/i);
      expect(phase2Content).toMatch(/User Focus\s*\(20 pts max\)/i);
      expect(phase2Content).toMatch(/Technical Quality\s*\(15 pts max\)/i);
      expect(phase2Content).toMatch(/Strategic Viability\s*\(20 pts max\)/i);
    });
  });

  describe('One-Pager Plugin', () => {
    const onePagerPlugin = getPlugin('one-pager');

    test('total points sum to 100', () => {
      const total = onePagerPlugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
      expect(total).toBe(100);
    });

    test('has at least 4 dimensions', () => {
      expect(onePagerPlugin.scoringDimensions.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('All Plugins', () => {
    const pluginIds = ['prd', 'one-pager', 'adr', 'acceptance-criteria', 'power-statement', 'business-justification', 'jd', 'strategic-proposal'];

    test.each(pluginIds)('%s plugin dimensions sum to 100 points', (pluginId) => {
      const plugin = getPlugin(pluginId);
      if (!plugin) return; // Skip if plugin doesn't exist
      
      const total = plugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
      expect(total).toBe(100);
    });
  });
});


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
  let match = dimensionPattern.exec(promptContent);

  while (match !== null) {
    dimensions.push({
      name: match[1].trim(),
      maxPoints: parseInt(match[2], 10),
    });
    match = dimensionPattern.exec(promptContent);
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

  describe('PR-FAQ Plugin (Bug 2 pattern - cross-plugin audit)', () => {
    const prFaqPlugin = getPlugin('pr-faq');
    let phase2Content;

    beforeAll(() => {
      const phase2Path = join(projectRoot, 'plugins/pr-faq/prompts/phase2.md');
      phase2Content = readFileSync(phase2Path, 'utf-8');
    });

    test('config dimensions sum to 100 points', () => {
      const total = prFaqPlugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
      expect(total).toBe(100);
    });

    test('config has 5 dimensions matching validator', () => {
      // PR-FAQ validator has: structure (20), content (20), professional (15), evidence (10), faqQuality (35)
      expect(prFaqPlugin.scoringDimensions.length).toBe(5);
    });

    test('config dimension maxPoints match validator exactly', () => {
      // Must match validator.js: Structure (20), Content (20), Professional (15), Evidence (10), FAQ (35)
      const expectedPoints = [20, 20, 15, 10, 35];
      prFaqPlugin.scoringDimensions.forEach((dim, i) => {
        expect(dim.maxPoints).toBe(expectedPoints[i]);
      });
    });

    test('Phase 2 prompt dimension points match config', () => {
      // Structure & Hook: 20 pts
      expect(phase2Content).toMatch(/Structure & Hook \(20 points\)/i);
      // Content Quality: 20 pts
      expect(phase2Content).toMatch(/Content Quality \(20 points\)/i);
      // Professional Tone: 15 pts
      expect(phase2Content).toMatch(/Professional Tone \(15 points\)/i);
      // Customer Evidence: 10 pts
      expect(phase2Content).toMatch(/Customer Evidence \(10 points\)/i);
      // FAQ Quality: 35 pts
      expect(phase2Content).toMatch(/FAQ Quality \(35 points\)/i);
    });

    test('Phase 2 prompt total matches 100 pts', () => {
      expect(phase2Content).toMatch(/100 pts total/i);
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

  describe('Strategic Viability Rubric Alignment (Bug 2 Prevention)', () => {
    let phase2Content;

    beforeAll(() => {
      const phase2Path = join(projectRoot, 'plugins/prd/prompts/phase2.md');
      phase2Content = readFileSync(phase2Path, 'utf-8');
    });

    test('Strategic Viability max is 20 pts', () => {
      expect(phase2Content).toMatch(/Strategic Viability\s*\(20 pts max\)/i);
    });

    test('prompt includes Metric Validity scoring (matches JS validator)', () => {
      // JS validator: metricValidityScore up to 8 pts (leading 2, counter 2, source 2, baseline-target 2)
      expect(phase2Content).toContain('Metric Validity');
      expect(phase2Content).toContain('Leading indicators');
      expect(phase2Content).toContain('Counter-metrics');
      expect(phase2Content).toContain('Source of truth');
    });

    test('prompt includes Scope Realism scoring (matches JS validator)', () => {
      // JS validator: scopeRealismScore up to 5 pts (kill switch 2, door type 2, alternatives 1)
      expect(phase2Content).toContain('Scope Realism');
      expect(phase2Content).toContain('Kill switch');
      expect(phase2Content).toContain('Door type');
    });

    test('prompt includes Risk Quality scoring (matches JS validator)', () => {
      // JS validator: riskScore up to 5 pts (risks+mitigations 3, dissenting 2)
      expect(phase2Content).toContain('Risk');
      expect(phase2Content).toContain('Dissenting opinions');
    });

    test('prompt includes Traceability scoring (matches JS validator)', () => {
      // JS validator: traceabilityScore up to 4 pts
      expect(phase2Content).toContain('Traceability');
    });

    test('prompt includes Competitive Depth scoring (matches JS validator)', () => {
      // JS validator: competitiveDepthScore up to 4 pts
      expect(phase2Content).toContain('Competitive');
    });

    test('prompt does NOT include removed items from old rubric', () => {
      // These items caused Bug 2 - they were in prompt but not in JS validator
      // Removed: Rollout Strategy (3 pts), Out-of-Scope Rationale (2 pts)
      expect(phase2Content).not.toMatch(/\|\s*3 pts\s*\|\s*\*\*Rollout Strategy\*\*/i);
      expect(phase2Content).not.toMatch(/\|\s*2 pts\s*\|\s*\*\*Out-of-Scope Rationale\*\*/i);
    });

    test('prompt notes theoretical max exceeds 20 pts (capped)', () => {
      // The JS validator can theoretically score 26 pts but caps at 20
      expect(phase2Content).toContain('capped at 20');
    });
  });
});


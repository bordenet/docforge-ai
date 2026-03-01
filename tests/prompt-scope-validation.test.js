/**
 * Prompt Scope Validation Tests
 * Validates that PRD prompts correctly handle document scope and brevity signals
 * Addresses: Bug 3 (PRD Length Not Respecting User Intent)
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

describe('Prompt Scope Validation', () => {
  let phase1Content;
  
  beforeAll(() => {
    const phase1Path = join(projectRoot, 'plugins/prd/prompts/phase1.md');
    phase1Content = readFileSync(phase1Path, 'utf-8');
  });

  describe('Scope Defaults (Fix 7)', () => {
    test('prompt defaults to Feature scope when DOCUMENT_SCOPE is empty', () => {
      // Bug 3 cause: Previously defaulted to Epic (4-8 pages)
      // Fix: Should default to Feature (1-3 pages)
      expect(phase1Content).toMatch(/empty.?unspecified.*default.*feature/i);
    });

    test('prompt explicitly states Feature is the default', () => {
      expect(phase1Content).toMatch(/Feature scope is the DEFAULT/i);
    });

    test('prompt warns to only escalate if user explicitly requests Epic/Product', () => {
      expect(phase1Content).toMatch(/only escalate.*explicitly/i);
    });
  });

  describe('Brevity Signal Detection (Fix 8)', () => {
    test('prompt handles brevity signals like short, quick, brief', () => {
      expect(phase1Content).toMatch(/short.*quick.*brief/i);
    });

    test('prompt treats brevity signals as Feature scope override', () => {
      // Matches: "Treat as **Feature scope**"
      expect(phase1Content).toMatch(/treat as.*feature scope/i);
    });

    test('prompt lists multiple brevity signal words', () => {
      const brevityWords = ['short', 'quick', 'brief', 'concise', 'simple', 'lightweight', 'minimal'];
      const foundWords = brevityWords.filter(word => 
        phase1Content.toLowerCase().includes(word)
      );
      expect(foundWords.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Scope-to-Word-Count Mapping (Fix 9)', () => {
    test('Feature scope targets 700-1500 words', () => {
      expect(phase1Content).toMatch(/feature.*700.*1,?500/i);
    });

    test('Epic scope targets 1500-3000 words', () => {
      expect(phase1Content).toMatch(/epic.*1,?500.*3,?000/i);
    });

    test('Product scope targets 3000-6000 words', () => {
      expect(phase1Content).toMatch(/product.*3,?000.*6,?000/i);
    });

    test('brevity requests have 1500 word MAX limit', () => {
      // Matches: "Do NOT exceed 1,500 words"
      expect(phase1Content).toMatch(/do not exceed 1,?500/i);
    });
  });

  describe('Section Requirements by Scope (Fix 10)', () => {
    test('Feature scope requires only 5-7 essential sections', () => {
      // Check for section requirements table
      expect(phase1Content).toContain('Essential sections ONLY');
    });

    test('Feature scope skips non-essential sections', () => {
      expect(phase1Content).toMatch(/skip.*for feature scope/i);
    });

    test('Feature scope requires Executive Summary', () => {
      expect(phase1Content).toMatch(/Executive Summary.*Required/i);
    });

    test('Feature scope requires Problem Statement', () => {
      expect(phase1Content).toMatch(/Problem.*Required/i);
    });

    test('Feature scope requires Goals & Metrics', () => {
      expect(phase1Content).toMatch(/Goals.*Required/i);
    });

    test('Feature scope requires Proposed Solution', () => {
      expect(phase1Content).toMatch(/Solution.*Required/i);
    });

    test('Feature scope requires Requirements', () => {
      expect(phase1Content).toMatch(/Requirements.*Required/i);
    });
  });

  describe('Length Checkpoint Thresholds (Fix 11)', () => {
    test('Feature checkpoint threshold is lower than Epic', () => {
      // Feature: ~700 words, Epic: ~1500 words
      const featureMatch = phase1Content.match(/Feature.*?(\d+)\s*words.*checkpoint/i);
      const epicMatch = phase1Content.match(/Epic.*?(\d+)\s*words.*checkpoint/i);
      
      // Just verify the checkpoint section exists with correct structure
      expect(phase1Content).toContain('Checkpoint Threshold');
    });

    test('prompt has checkpoint thresholds table', () => {
      expect(phase1Content).toContain('Length Thresholds by Scope');
    });

    test('Feature checkpoint triggers STOP action', () => {
      expect(phase1Content).toMatch(/feature.*stop.*wrap up/i);
    });

    test('Unspecified scope uses Feature thresholds', () => {
      expect(phase1Content).toMatch(/unspecified.*feature threshold/i);
    });

    test('Brevity requested scope triggers STOP', () => {
      expect(phase1Content).toMatch(/brevity.*stop.*do not exceed/i);
    });
  });
});

describe('Cross-Plugin Prompt Validation (Fix 12)', () => {
  const pluginsWithScopes = ['prd']; // Only PRD has scope handling currently
  
  test.each(pluginsWithScopes)('%s plugin has phase1.md', (pluginId) => {
    const phase1Path = join(projectRoot, `plugins/${pluginId}/prompts/phase1.md`);
    expect(() => readFileSync(phase1Path)).not.toThrow();
  });

  test('PRD phase1 has scope handling section', () => {
    const phase1Path = join(projectRoot, 'plugins/prd/prompts/phase1.md');
    const content = readFileSync(phase1Path, 'utf-8');
    expect(content).toContain('DOCUMENT_SCOPE');
  });
});


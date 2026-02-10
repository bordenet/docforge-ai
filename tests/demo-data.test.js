import { describe, test, expect } from '@jest/globals';
import {
  onePagerFormData,
  onePagerPhase1Output,
  onePagerPhase2Output,
  onePagerPhase3Output,
  getDemoData,
  hasDemoData
} from '../shared/js/demo-data.js';

describe('Demo Data', () => {

  describe('onePagerFormData', () => {
    test('should have all required fields', () => {
      expect(onePagerFormData.projectName).toBeDefined();
      expect(onePagerFormData.problemStatement).toBeDefined();
      expect(onePagerFormData.proposedSolution).toBeDefined();
    });

    test('should have non-empty values', () => {
      expect(onePagerFormData.projectName.length).toBeGreaterThan(0);
      expect(onePagerFormData.problemStatement.length).toBeGreaterThan(10);
    });
  });

  describe('Phase outputs', () => {
    test('Phase 1 output should be markdown', () => {
      expect(onePagerPhase1Output).toContain('#');
      expect(onePagerPhase1Output).toContain('## ');
    });

    test('Phase 2 output should contain adversarial review', () => {
      expect(onePagerPhase2Output.toLowerCase()).toContain('review');
      expect(onePagerPhase2Output).toContain('Gaps');
    });

    test('Phase 3 output should be final synthesis', () => {
      expect(onePagerPhase3Output).toContain('Final');
      expect(onePagerPhase3Output.length).toBeGreaterThan(onePagerPhase1Output.length * 0.5);
    });

    test('all phases should have substantial content', () => {
      expect(onePagerPhase1Output.length).toBeGreaterThan(500);
      expect(onePagerPhase2Output.length).toBeGreaterThan(500);
      expect(onePagerPhase3Output.length).toBeGreaterThan(500);
    });
  });

  describe('getDemoData', () => {
    test('should return demo data for one-pager', () => {
      const data = getDemoData('one-pager');
      expect(data).not.toBeNull();
      expect(data.formData).toBeDefined();
      expect(data.phases).toBeDefined();
      expect(data.phases[1]).toBeDefined();
      expect(data.phases[2]).toBeDefined();
      expect(data.phases[3]).toBeDefined();
    });

    test('should return null for unsupported doc types', () => {
      expect(getDemoData('prd')).toBeNull();
      expect(getDemoData('adr')).toBeNull();
      expect(getDemoData('unknown')).toBeNull();
    });
  });

  describe('hasDemoData', () => {
    test('should return true for one-pager', () => {
      expect(hasDemoData('one-pager')).toBe(true);
    });

    test('should return false for other doc types', () => {
      expect(hasDemoData('prd')).toBe(false);
      expect(hasDemoData('adr')).toBe(false);
      expect(hasDemoData('jd')).toBe(false);
    });
  });

});


/**
 * Templates Tests - Verify all 9 document types have valid templates
 * Tests template structure, required fields, and cross-plugin consistency
 */

import { describe, test, expect } from '@jest/globals';

// Import all template files
import { TEMPLATES as ONE_PAGER_TEMPLATES } from '../plugins/one-pager/templates.js';
import { TEMPLATES as PRD_TEMPLATES } from '../plugins/prd/templates.js';
import { TEMPLATES as ADR_TEMPLATES } from '../plugins/adr/templates.js';
import { TEMPLATES as PR_FAQ_TEMPLATES } from '../plugins/pr-faq/templates.js';
import { TEMPLATES as POWER_STATEMENT_TEMPLATES } from '../plugins/power-statement/templates.js';
import { TEMPLATES as ACCEPTANCE_TEMPLATES } from '../plugins/acceptance-criteria/templates.js';
import { TEMPLATES as JD_TEMPLATES } from '../plugins/jd/templates.js';
import { TEMPLATES as BUSINESS_TEMPLATES } from '../plugins/business-justification/templates.js';
import { TEMPLATES as STRATEGIC_TEMPLATES } from '../plugins/strategic-proposal/templates.js';

// Map of all plugins and their templates
const ALL_TEMPLATES = {
  'one-pager': ONE_PAGER_TEMPLATES,
  'prd': PRD_TEMPLATES,
  'adr': ADR_TEMPLATES,
  'pr-faq': PR_FAQ_TEMPLATES,
  'power-statement': POWER_STATEMENT_TEMPLATES,
  'acceptance-criteria': ACCEPTANCE_TEMPLATES,
  'jd': JD_TEMPLATES,
  'business-justification': BUSINESS_TEMPLATES,
  'strategic-proposal': STRATEGIC_TEMPLATES
};

describe('Templates - All Document Types', () => {
  describe('Template Structure', () => {
    Object.entries(ALL_TEMPLATES).forEach(([pluginId, templates]) => {
      describe(`${pluginId} templates`, () => {
        test('exports an array of templates', () => {
          expect(Array.isArray(templates)).toBe(true);
          expect(templates.length).toBeGreaterThan(0);
        });

        test('has a blank template as first option', () => {
          const blank = templates[0];
          expect(blank.id).toBe('blank');
          // Name should start with "Blank" (may include doc type like "Blank PRD")
          expect(blank.name).toMatch(/^Blank/);
          expect(blank.icon).toBe('📄');
          expect(blank.fields).toEqual({});
        });

        test('all templates have required properties', () => {
          templates.forEach((template) => {
            expect(template).toHaveProperty('id');
            expect(template).toHaveProperty('name');
            expect(template).toHaveProperty('icon');
            expect(template).toHaveProperty('description');
            expect(template).toHaveProperty('fields');

            expect(typeof template.id).toBe('string');
            expect(typeof template.name).toBe('string');
            expect(typeof template.icon).toBe('string');
            expect(typeof template.description).toBe('string');
            expect(typeof template.fields).toBe('object');
          });
        });

        test('all template ids are unique within plugin', () => {
          const ids = templates.map(t => t.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        });

        test('all templates have non-empty names', () => {
          templates.forEach((template) => {
            expect(template.name.trim().length).toBeGreaterThan(0);
          });
        });

        test('all templates have non-empty descriptions', () => {
          templates.forEach((template) => {
            expect(template.description.trim().length).toBeGreaterThan(0);
          });
        });

        test('all templates have emoji icons', () => {
          templates.forEach((template) => {
            // Emoji should be at least 1 character and typically 1-4 chars
            expect(template.icon.length).toBeGreaterThanOrEqual(1);
            expect(template.icon.length).toBeLessThanOrEqual(4);
          });
        });
      });
    });
  });

  describe('Template Counts', () => {
    test('one-pager has 8 templates', () => {
      expect(ONE_PAGER_TEMPLATES.length).toBe(8);
    });

    test('prd has at least 4 templates', () => {
      expect(PRD_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    });

    test('adr has at least 4 templates', () => {
      expect(ADR_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    });

    test('all 9 document types have templates', () => {
      expect(Object.keys(ALL_TEMPLATES).length).toBe(9);
      Object.values(ALL_TEMPLATES).forEach((templates) => {
        expect(templates.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Non-Blank Templates Have Content', () => {
    Object.entries(ALL_TEMPLATES).forEach(([pluginId, templates]) => {
      test(`${pluginId} non-blank templates have field values`, () => {
        const nonBlank = templates.filter(t => t.id !== 'blank');
        nonBlank.forEach((template) => {
          const fieldCount = Object.keys(template.fields).length;
          // Non-blank templates should have at least 3 pre-filled fields
          expect(fieldCount).toBeGreaterThanOrEqual(3);
        });
      });
    });
  });

  describe('Field Values Are Strings', () => {
    Object.entries(ALL_TEMPLATES).forEach(([pluginId, templates]) => {
      test(`${pluginId} template field values are all strings`, () => {
        templates.forEach((template) => {
          Object.entries(template.fields).forEach(([key, value]) => {
            expect(typeof value).toBe('string');
            expect(key.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});


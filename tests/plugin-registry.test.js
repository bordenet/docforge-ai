/**
 * Plugin Registry Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  getPlugin,
  getAllPlugins,
  getDefaultPlugin,
  hasPlugin,
  getPluginIds,
} from '../shared/js/plugin-registry.js';

describe('Plugin Registry', () => {
  describe('getPluginIds', () => {
    it('should return all 9 document type IDs', () => {
      const ids = getPluginIds();
      expect(ids).toHaveLength(9);
      expect(ids).toContain('one-pager');
      expect(ids).toContain('prd');
      expect(ids).toContain('adr');
      expect(ids).toContain('pr-faq');
      expect(ids).toContain('power-statement');
      expect(ids).toContain('acceptance-criteria');
      expect(ids).toContain('jd');
      expect(ids).toContain('business-justification');
      expect(ids).toContain('strategic-proposal');
    });
  });

  describe('hasPlugin', () => {
    it('should return true for valid plugin IDs', () => {
      expect(hasPlugin('one-pager')).toBe(true);
      expect(hasPlugin('prd')).toBe(true);
      expect(hasPlugin('adr')).toBe(true);
    });

    it('should return false for invalid plugin IDs', () => {
      expect(hasPlugin('invalid')).toBe(false);
      expect(hasPlugin('')).toBe(false);
      expect(hasPlugin(null)).toBe(false);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin config for valid ID', () => {
      const plugin = getPlugin('one-pager');
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('one-pager');
      expect(plugin.name).toBe('One-Pager');
      expect(plugin.icon).toBe('📄');
    });

    it('should return undefined for invalid ID', () => {
      expect(getPlugin('invalid')).toBeUndefined();
    });

    it('should have required properties on all plugins', () => {
      const requiredProps = [
        'id',
        'name',
        'icon',
        'description',
        'dbName',
        'formFields',
        'scoringDimensions',
      ];

      getAllPlugins().forEach((plugin) => {
        requiredProps.forEach((prop) => {
          expect(plugin).toHaveProperty(prop);
        });
      });
    });
  });

  describe('getAllPlugins', () => {
    it('should return array of all plugins', () => {
      const plugins = getAllPlugins();
      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins).toHaveLength(9);
    });

    it('should return plugins with unique IDs', () => {
      const plugins = getAllPlugins();
      const ids = plugins.map((p) => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids).toEqual(uniqueIds);
    });

    it('should return plugins with unique dbNames', () => {
      const plugins = getAllPlugins();
      const dbNames = plugins.map((p) => p.dbName);
      const uniqueDbNames = [...new Set(dbNames)];
      expect(dbNames).toEqual(uniqueDbNames);
    });
  });

  describe('getDefaultPlugin', () => {
    it('should return one-pager as default', () => {
      const plugin = getDefaultPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('one-pager');
    });
  });

  describe('Plugin formFields', () => {
    it('should have at least one required field per plugin', () => {
      getAllPlugins().forEach((plugin) => {
        const requiredFields = plugin.formFields.filter((f) => f.required);
        expect(requiredFields.length).toBeGreaterThan(0);
      });
    });

    it('should have valid field types', () => {
      const validTypes = ['text', 'textarea', 'select'];
      getAllPlugins().forEach((plugin) => {
        plugin.formFields.forEach((field) => {
          expect(validTypes).toContain(field.type);
        });
      });
    });
  });

  describe('Plugin scoringDimensions', () => {
    it('should have dimensions that sum to 100 points', () => {
      getAllPlugins().forEach((plugin) => {
        const total = plugin.scoringDimensions.reduce((sum, d) => sum + d.maxPoints, 0);
        expect(total).toBe(100);
      });
    });

    it('should have at least 3 dimensions per plugin', () => {
      getAllPlugins().forEach((plugin) => {
        expect(plugin.scoringDimensions.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have unique dimension names within each plugin', () => {
      getAllPlugins().forEach((plugin) => {
        const names = plugin.scoringDimensions.map((d) => d.name);
        const unique = [...new Set(names)];
        expect(names).toEqual(unique);
      });
    });

    it('each plugin should have dimension names distinct from other plugins', () => {
      // Build a map of dimension-name-set → plugin IDs
      // At least the first dimension should differ between plugins to prevent
      // the wrong-plugin-loaded bug from going undetected
      const plugins = getAllPlugins();
      const firstDimByPlugin = plugins.map((p) => ({
        id: p.id,
        firstDim: p.scoringDimensions[0]?.name,
      }));

      // No two plugins with different IDs should share ALL dimension names
      for (let i = 0; i < plugins.length; i++) {
        for (let j = i + 1; j < plugins.length; j++) {
          const namesA = plugins[i].scoringDimensions.map((d) => d.name).sort();
          const namesB = plugins[j].scoringDimensions.map((d) => d.name).sort();
          const identical = namesA.length === namesB.length && namesA.every((n, k) => n === namesB[k]);
          expect(identical).toBe(false);
        }
      }
      // Suppress unused variable warning
      expect(firstDimByPlugin.length).toBe(plugins.length);
    });
  });

  describe('Validator URL routing contract (regression)', () => {
    // Regression: views-phase.js used plugin.type (undefined) instead of plugin.id,
    // causing ALL document types to load the one-pager validator.
    it('every plugin must have a non-empty id for URL routing', () => {
      getAllPlugins().forEach((plugin) => {
        expect(plugin.id).toBeDefined();
        expect(typeof plugin.id).toBe('string');
        expect(plugin.id.length).toBeGreaterThan(0);
        // id must be URL-safe
        expect(plugin.id).toMatch(/^[a-z][a-z0-9-]*$/);
      });
    });

    it('no plugin should define a "type" property (prevents confusion with id)', () => {
      // If a plugin ever adds a "type" property, someone might use it for routing
      // instead of "id", recreating the original bug.
      getAllPlugins().forEach((plugin) => {
        expect(plugin.type).toBeUndefined();
      });
    });
  });

  describe('Plugin validateDocument contract', () => {
    // Each plugin's validateDocument must return a totalScore and an issues array.
    // Plugins using the additive dimension model (all except JD) must also return
    // results keyed by dimension name or dimension${index+1}.
    // The JD plugin uses a deduction-based model with different result keys.

    const sampleTexts = {
      'one-pager': '## Problem Statement\nUsers struggle with X.\n## Proposed Solution\nBuild Y.\n## Success Metrics\n50% reduction.\n## Scope\nIn scope: A. Out of scope: B.\n## Stakeholders\nTeam lead.\n## Timeline\nQ1 2026.',
      'prd': '## Executive Summary\nThis PRD covers X.\n## Problem Statement\nUsers need Y.\n## Value Proposition\nValue to customer: faster.\n## Goals and Objectives\nReduce time by 50%.\n## Requirements\nFR1: Must do X.\n## Scope\nIn scope: A. Out of scope: B.',
      'adr': '## Context\nWe need to decide X.\n## Decision\nWe will use Y.\n## Consequences\nThis means Z.\n## Status\nAccepted.',
      'pr-faq': '# Press Release: New Feature\n## Summary\nAmazon announces X.\n## Problem\nCustomers struggle with Y.\n## Solution\nNew feature Z.\n## Customer Quote\n"This is amazing" — Customer\n## Internal FAQ\nQ: Why now?\nA: Market timing.\n## External FAQ\nQ: How much?\nA: Free.',
      'power-statement': 'Led migration of 50 microservices to Kubernetes at Acme Corp, reducing deployment time by 75% and saving $2M annually.',
      'acceptance-criteria': '## Feature: Login\n**Given** a registered user\n**When** they enter valid credentials\n**Then** they are redirected to dashboard\n## Edge Cases\nInvalid password shows error.',
      'jd': '## Software Engineer\nWe are looking for a software engineer to join our team.\n## Responsibilities\nDesign and build systems.\n## Qualifications\n3+ years experience.\n## Benefits\nHealth insurance, 401k.',
      'business-justification': '## Strategic Context\nMarket opportunity of $10M.\n## Financial Analysis\nROI: 300% over 3 years. NPV: $5M.\n## Options Analysis\nOption A: Build. Option B: Buy.\n## Execution Plan\nPhase 1: Discovery. Phase 2: Build.',
      'strategic-proposal': '## Problem Statement\nCurrent system cannot scale.\n## Proposed Solution\nMigrate to cloud.\n## Business Impact\nReduce costs by 40%.\n## Implementation Plan\nQ1: Design. Q2: Build.',
    };

    it('every plugin validateDocument should return totalScore and issues', () => {
      getAllPlugins().forEach((plugin) => {
        const text = sampleTexts[plugin.id] || 'Sample document content for testing.';
        const result = plugin.validateDocument(text);

        expect(result).toBeDefined();
        expect(typeof result.totalScore).toBe('number');
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(100);
        expect(Array.isArray(result.issues)).toBe(true);
      });
    });

    it('additive-dimension plugins should return results keyed by dimension name', () => {
      // JD uses a deduction model with different result keys — skip it here
      const additiveDimPlugins = getAllPlugins().filter((p) => p.id !== 'jd');

      additiveDimPlugins.forEach((plugin) => {
        const text = sampleTexts[plugin.id] || 'Sample document content for testing.';
        const result = plugin.validateDocument(text);

        plugin.scoringDimensions.forEach((dim, index) => {
          const dimResult = result[dim.name] || result[`dimension${index + 1}`];
          expect(dimResult).toBeDefined();
          expect(typeof dimResult.score).toBe('number');
        });
      });
    });

    it('validateDocument should be deterministic (same input = same scores)', () => {
      getAllPlugins().forEach((plugin) => {
        const text = sampleTexts[plugin.id] || 'Sample document content for testing.';
        const result1 = plugin.validateDocument(text);
        const result2 = plugin.validateDocument(text);

        expect(result1.totalScore).toBe(result2.totalScore);
      });
    });

    it('validateDocument should be deterministic across 10 consecutive calls', () => {
      getAllPlugins().forEach((plugin) => {
        const text = sampleTexts[plugin.id] || 'Sample document content for testing.';
        const scores = [];
        for (let i = 0; i < 10; i++) {
          scores.push(plugin.validateDocument(text).totalScore);
        }
        // All 10 scores must be identical
        const allSame = scores.every((s) => s === scores[0]);
        expect(allSame).toBe(true);
      });
    });
  });
});

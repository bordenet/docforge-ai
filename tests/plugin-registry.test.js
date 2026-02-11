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
  });
});

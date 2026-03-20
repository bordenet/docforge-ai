/**
 * Router Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock window.location for testing
const mockLocation = {
  search: '',
  hash: '',
  href: 'http://localhost/',
  pathname: '/assistant/',
};

// Mock will be set up in beforeEach

beforeEach(() => {
  // Reset mocks
  mockLocation.search = '';
  mockLocation.hash = '';
  mockLocation.href = 'http://localhost/';

  // Create a more complete mock
  delete global.window;
  global.window = {
    location: mockLocation,
    addEventListener: () => {},
    URLSearchParams,
  };
});

// Import after mocking - must be dynamic due to mock setup
// eslint-disable-next-line import-x/first
import {
  getCurrentDocumentType,
  getCurrentPlugin,
  getCurrentView,
  getProjectIdFromHash,
  getPhaseFromHash,
  getProjectIdFromQuery,
  getPhaseFromQuery,
  getDocTypeUrl,
  navigateTo,
  initRouter,
} from '../shared/js/router.js';
// eslint-disable-next-line import-x/first
import { getAllPlugins } from '../shared/js/plugin-registry.js';

describe('Router', () => {
  describe('getCurrentDocumentType', () => {
    it('should return one-pager as default', () => {
      mockLocation.search = '';
      const type = getCurrentDocumentType();
      expect(type).toBe('one-pager');
    });

    it('should return type from URL query', () => {
      mockLocation.search = '?type=prd';
      const type = getCurrentDocumentType();
      expect(type).toBe('prd');
    });

    it('should return default for invalid type', () => {
      mockLocation.search = '?type=invalid-type';
      const type = getCurrentDocumentType();
      expect(type).toBe('one-pager');
    });
  });

  describe('getCurrentView', () => {
    it('should return list for empty hash', () => {
      mockLocation.hash = '';
      const view = getCurrentView();
      expect(view).toBe('list');
    });

    it('should return new for #new hash', () => {
      mockLocation.hash = '#new';
      const view = getCurrentView();
      expect(view).toBe('new');
    });

    it('should return project for #project/id hash', () => {
      mockLocation.hash = '#project/123';
      const view = getCurrentView();
      expect(view).toBe('project');
    });

    it('should return phase for #phase/id/num hash', () => {
      mockLocation.hash = '#phase/123/2';
      const view = getCurrentView();
      expect(view).toBe('phase');
    });

    it('should return edit for #edit/id hash', () => {
      mockLocation.hash = '#edit/123';
      const view = getCurrentView();
      expect(view).toBe('edit');
    });
  });

  describe('getProjectIdFromHash', () => {
    it('should return null for empty hash', () => {
      mockLocation.hash = '';
      expect(getProjectIdFromHash()).toBeNull();
    });

    it('should extract project ID from project hash', () => {
      mockLocation.hash = '#project/abc-123';
      expect(getProjectIdFromHash()).toBe('abc-123');
    });

    it('should extract project ID from phase hash', () => {
      mockLocation.hash = '#phase/abc-123/2';
      expect(getProjectIdFromHash()).toBe('abc-123');
    });

    it('should extract project ID from edit hash', () => {
      mockLocation.hash = '#edit/abc-123';
      expect(getProjectIdFromHash()).toBe('abc-123');
    });
  });

  describe('getPhaseFromHash', () => {
    it('should return null for non-phase hash', () => {
      mockLocation.hash = '#project/123';
      expect(getPhaseFromHash()).toBeNull();
    });

    it('should extract phase number from phase hash', () => {
      mockLocation.hash = '#phase/abc-123/2';
      expect(getPhaseFromHash()).toBe(2);
    });

    it('should return null for invalid phase number', () => {
      mockLocation.hash = '#phase/abc-123/invalid';
      expect(getPhaseFromHash()).toBeNull();
    });
  });

  describe('getDocTypeUrl', () => {
    it('should build URL with new doc type', () => {
      mockLocation.href = 'http://localhost/assistant/?type=one-pager#project/123';
      const url = getDocTypeUrl('prd');
      expect(url).toContain('type=prd');
    });
  });

  describe('getCurrentPlugin', () => {
    it('should return plugin for current document type', () => {
      mockLocation.search = '?type=prd';
      const plugin = getCurrentPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('prd');
    });

    it('should return default plugin for invalid type', () => {
      mockLocation.search = '?type=invalid';
      const plugin = getCurrentPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe('one-pager');
    });
  });

  describe('navigateTo', () => {
    it('should navigate to list view', () => {
      navigateTo('list');
      expect(mockLocation.hash).toBe('');
    });

    it('should navigate to new view', () => {
      navigateTo('new');
      expect(mockLocation.hash).toBe('new');
    });

    it('should navigate to project view with ID', () => {
      navigateTo('project', { projectId: 'abc-123' });
      expect(mockLocation.hash).toBe('project/abc-123');
    });

    it('should navigate to phase view with project ID and phase number', () => {
      navigateTo('phase', { projectId: 'abc-123', phase: 2 });
      expect(mockLocation.hash).toBe('phase/abc-123/2');
    });

    it('should navigate to edit view with project ID', () => {
      navigateTo('edit', { projectId: 'abc-123' });
      expect(mockLocation.hash).toBe('edit/abc-123');
    });

    it('should handle unknown view by defaulting to empty hash', () => {
      navigateTo('unknown-view');
      expect(mockLocation.hash).toBe('');
    });
  });

  describe('initRouter', () => {
    it('should add hashchange listener and trigger initial route', () => {
      let callCount = 0;
      let lastView = null;
      let lastParams = null;

      const mockCallback = (view, params) => {
        callCount++;
        lastView = view;
        lastParams = params;
      };

      // Mock addEventListener to capture the handler
      let hashChangeHandler = null;
      global.window.addEventListener = (event, handler) => {
        if (event === 'hashchange') {
          hashChangeHandler = handler;
        }
      };

      mockLocation.hash = '#project/test-123';
      initRouter(mockCallback);

      // Should have been called once for initial route
      expect(callCount).toBe(1);
      expect(lastView).toBe('project');
      expect(lastParams.projectId).toBe('test-123');

      // Simulate hash change
      mockLocation.hash = '#phase/test-123/2';
      if (hashChangeHandler) {
        hashChangeHandler();
      }

      expect(callCount).toBe(2);
      expect(lastView).toBe('phase');
      expect(lastParams.phase).toBe(2);
    });
  });

  describe('Validator URL routing contract', () => {
    it('should resolve PRD type from URL parameter', () => {
      mockLocation.search = '?type=prd';
      expect(getCurrentDocumentType()).toBe('prd');
    });

    it('should resolve all registered plugin types from URL', () => {
      const pluginIds = ['one-pager', 'prd', 'adr', 'pr-faq', 'power-statement',
        'acceptance-criteria', 'jd', 'business-justification', 'strategic-proposal'];

      for (const id of pluginIds) {
        mockLocation.search = `?type=${id}`;
        expect(getCurrentDocumentType()).toBe(id);
      }
    });

    it('should default to one-pager when type parameter is empty', () => {
      mockLocation.search = '?type=';
      expect(getCurrentDocumentType()).toBe('one-pager');
    });

    it('should default to one-pager when type parameter is missing', () => {
      mockLocation.search = '';
      expect(getCurrentDocumentType()).toBe('one-pager');
    });

    it('plugin configs should use id (not type) for validator URL routing', () => {
      // Regression test: views-phase.js previously used plugin.type which doesn't exist,
      // causing all validator URLs to fall through to one-pager default.
      // The fix uses plugin.id which is a required field on all plugins.
      const plugins = getAllPlugins();

      for (const plugin of plugins) {
        // Every plugin must have an id (used for URL routing)
        expect(plugin.id).toBeDefined();
        expect(typeof plugin.id).toBe('string');
        expect(plugin.id.length).toBeGreaterThan(0);

        // The id must be recognized by the router
        mockLocation.search = `?type=${plugin.id}`;
        expect(getCurrentDocumentType()).toBe(plugin.id);
      }
    });

	    it('should resolve project id from query string when present', () => {
	      mockLocation.search = '?type=one-pager&project=proj-123';
	      expect(getProjectIdFromQuery()).toBe('proj-123');
	    });

	    it('should return null when project query param is missing', () => {
	      mockLocation.search = '?type=one-pager';
	      expect(getProjectIdFromQuery()).toBeNull();
	    });

	    it('should return null when project query param is empty', () => {
	      mockLocation.search = '?type=one-pager&project=';
	      expect(getProjectIdFromQuery()).toBeNull();
	    });

	    it('should resolve phase number from query string when valid', () => {
	      mockLocation.search = '?type=one-pager&phase=3';
	      expect(getPhaseFromQuery()).toBe(3);
	    });

	    it('should return null when phase query param is missing', () => {
	      mockLocation.search = '?type=one-pager';
	      expect(getPhaseFromQuery()).toBeNull();
	    });

	    it('should return null when phase query param is invalid', () => {
	      mockLocation.search = '?type=one-pager&phase=99';
	      expect(getPhaseFromQuery()).toBeNull();
	    });
  });
});


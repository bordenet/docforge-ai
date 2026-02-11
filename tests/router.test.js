/**
 * Router Tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock window.location for testing
const mockLocation = {
  search: '',
  hash: '',
  href: 'http://localhost/',
  pathname: '/assistant/'
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
  getDocTypeUrl,
  navigateTo,
  initRouter,
} from '../shared/js/router.js';

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
});


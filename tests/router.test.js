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
    URLSearchParams: URLSearchParams
  };
});

// Import after mocking
import {
  getCurrentDocumentType,
  getCurrentView,
  getProjectIdFromHash,
  getPhaseFromHash,
  getDocTypeUrl
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
});


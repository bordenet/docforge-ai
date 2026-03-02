/**
 * Validator Storage module tests - Version history management
 * Ported from genesis validator tests
 */

import { createStorage } from '../../shared/js/validator-storage.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('Validator Storage - Version History', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    storage = createStorage('test-validator-history');
  });

  describe('saveVersion', () => {
    it('saves first version successfully', () => {
      const result = storage.saveVersion('# Document v1');
      expect(result.success).toBe(true);
      expect(result.versionNumber).toBe(1);
      expect(result.totalVersions).toBe(1);
    });

    it('saves multiple versions in sequence', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');
      const result = storage.saveVersion('# Version 3');

      expect(result.success).toBe(true);
      expect(result.versionNumber).toBe(3);
      expect(result.totalVersions).toBe(3);
    });

    it('does not save if content is identical', () => {
      storage.saveVersion('# Same content');
      const result = storage.saveVersion('# Same content');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('no-change');
    });

    it('replaces current and future versions when saving from past position', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');
      storage.saveVersion('# Version 3');
      storage.saveVersion('# Version 4');
      storage.saveVersion('# Version 5');

      storage.goBack();
      storage.goBack();

      const result = storage.saveVersion('# New Version replacing v3');

      expect(result.success).toBe(true);
      expect(result.versionNumber).toBe(3);
      expect(result.totalVersions).toBe(3);

      const current = storage.getCurrentVersion();
      expect(current.canGoForward).toBe(false);
      expect(current.markdown).toBe('# New Version replacing v3');
    });

    it('respects maxVersions limit', () => {
      const limitedStorage = createStorage('limited-test', 3);
      
      limitedStorage.saveVersion('# V1');
      limitedStorage.saveVersion('# V2');
      limitedStorage.saveVersion('# V3');
      limitedStorage.saveVersion('# V4');
      
      const current = limitedStorage.getCurrentVersion();
      expect(current.totalVersions).toBe(3);
      expect(current.versionNumber).toBe(3);
    });
  });

  describe('goBack', () => {
    it('returns null when no history', () => {
      expect(storage.goBack()).toBeNull();
    });

    it('returns null when at first version', () => {
      storage.saveVersion('# Only version');
      expect(storage.goBack()).toBeNull();
    });

    it('navigates to previous version', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');

      const prev = storage.goBack();
      expect(prev.markdown).toBe('# Version 1');
      expect(prev.versionNumber).toBe(1);
    });
  });

  describe('goForward', () => {
    it('returns null when no history', () => {
      expect(storage.goForward()).toBeNull();
    });

    it('returns null when at latest version', () => {
      storage.saveVersion('# Version 1');
      expect(storage.goForward()).toBeNull();
    });

    it('navigates to next version after going back', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');
      storage.goBack();

      const next = storage.goForward();
      expect(next.markdown).toBe('# Version 2');
      expect(next.versionNumber).toBe(2);
    });
  });

  describe('getCurrentVersion', () => {
    it('returns null when no history', () => {
      expect(storage.getCurrentVersion()).toBeNull();
    });

    it('returns current version info with navigation flags', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');

      const current = storage.getCurrentVersion();
      expect(current.versionNumber).toBe(2);
      expect(current.totalVersions).toBe(2);
      expect(current.canGoBack).toBe(true);
      expect(current.canGoForward).toBe(false);
    });

    it('updates navigation flags after going back', () => {
      storage.saveVersion('# Version 1');
      storage.saveVersion('# Version 2');
      storage.goBack();

      const current = storage.getCurrentVersion();
      expect(current.versionNumber).toBe(1);
      expect(current.canGoBack).toBe(false);
      expect(current.canGoForward).toBe(true);
    });
  });

  describe('loadDraft', () => {
    it('returns null when no history', () => {
      expect(storage.loadDraft()).toBeNull();
    });

    it('returns current version content', () => {
      storage.saveVersion('# My document draft');
      const draft = storage.loadDraft();
      expect(draft.markdown).toBe('# My document draft');
    });
  });

  describe('getTimeSince', () => {
    it('returns "--" for null input', () => {
      expect(storage.getTimeSince(null)).toBe('--');
    });

    it('returns "just now" for recent time', () => {
      const now = new Date().toISOString();
      expect(storage.getTimeSince(now)).toBe('just now');
    });

    it('returns human-readable time for older dates', () => {
      const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      expect(storage.getTimeSince(twoMinsAgo)).toBe('2 mins ago');
    });
  });

  describe('document type isolation', () => {
    it('maintains separate history per storage key', () => {
      const prdStorage = createStorage('prd-validator-history');
      const adrStorage = createStorage('adr-validator-history');

      prdStorage.saveVersion('# PRD Content');
      adrStorage.saveVersion('# ADR Content');

      expect(prdStorage.loadDraft().markdown).toBe('# PRD Content');
      expect(adrStorage.loadDraft().markdown).toBe('# ADR Content');
    });
  });
});


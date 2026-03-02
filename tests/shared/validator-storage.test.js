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

    it('returns "--" for undefined input', () => {
      expect(storage.getTimeSince(undefined)).toBe('--');
    });

    it('returns "just now" for recent time', () => {
      const now = new Date().toISOString();
      expect(storage.getTimeSince(now)).toBe('just now');
    });

    it('returns "1 min ago" for one minute', () => {
      const oneMinAgo = new Date(Date.now() - 1 * 60 * 1000).toISOString();
      expect(storage.getTimeSince(oneMinAgo)).toBe('1 min ago');
    });

    it('returns "X mins ago" for multiple minutes', () => {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(storage.getTimeSince(fiveMinsAgo)).toBe('5 mins ago');
    });

    it('returns "1 hour ago" for one hour', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(storage.getTimeSince(oneHourAgo)).toBe('1 hour ago');
    });

    it('returns "X hours ago" for multiple hours', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(storage.getTimeSince(threeHoursAgo)).toBe('3 hours ago');
    });

    it('returns formatted date for old dates', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = storage.getTimeSince(twoDaysAgo.toISOString());
      // Should return a locale date string
      expect(result).toBe(twoDaysAgo.toLocaleDateString());
    });
  });

  describe('maxVersions limit', () => {
    it('trims oldest versions when limit exceeded', () => {
      const limitedStorage = createStorage('limited-test-trim', 3);

      limitedStorage.saveVersion('# V1 - oldest');
      limitedStorage.saveVersion('# V2');
      limitedStorage.saveVersion('# V3');
      limitedStorage.saveVersion('# V4 - newest');

      // V1 should be trimmed, only V2, V3, V4 remain
      const current = limitedStorage.getCurrentVersion();
      expect(current.totalVersions).toBe(3);

      // Go back to oldest remaining version
      limitedStorage.goBack();
      limitedStorage.goBack();
      const oldest = limitedStorage.loadDraft();
      expect(oldest.markdown).toBe('# V2');
    });

    it('uses default maxVersions of 10', () => {
      const defaultStorage = createStorage('default-limit-test');

      // Save 12 versions
      for (let i = 1; i <= 12; i++) {
        defaultStorage.saveVersion(`# Version ${i}`);
      }

      const current = defaultStorage.getCurrentVersion();
      expect(current.totalVersions).toBe(10);
      expect(current.versionNumber).toBe(10);
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

    it('allows different version counts per document type', () => {
      const prdStorage = createStorage('prd-test');
      const adrStorage = createStorage('adr-test');

      prdStorage.saveVersion('# PRD v1');
      prdStorage.saveVersion('# PRD v2');
      prdStorage.saveVersion('# PRD v3');

      adrStorage.saveVersion('# ADR v1');

      expect(prdStorage.getCurrentVersion().totalVersions).toBe(3);
      expect(adrStorage.getCurrentVersion().totalVersions).toBe(1);
    });

    it('does not affect other storage keys when navigating', () => {
      const storage1 = createStorage('storage-1');
      const storage2 = createStorage('storage-2');

      storage1.saveVersion('# S1 V1');
      storage1.saveVersion('# S1 V2');
      storage2.saveVersion('# S2 V1');

      storage1.goBack();

      // storage2 should be unaffected
      expect(storage2.getCurrentVersion().versionNumber).toBe(1);
      expect(storage1.getCurrentVersion().versionNumber).toBe(1);
    });
  });

  describe('localStorage error handling', () => {
    it('handles corrupted JSON in localStorage gracefully', () => {
      // Manually corrupt the localStorage entry
      localStorage.setItem('corrupted-test', 'not valid json');

      const corruptedStorage = createStorage('corrupted-test');

      // Should return empty history, not throw
      expect(corruptedStorage.getCurrentVersion()).toBeNull();
      expect(corruptedStorage.loadDraft()).toBeNull();

      // Should still be able to save
      const result = corruptedStorage.saveVersion('# New content');
      expect(result.success).toBe(true);
    });

    it('handles empty string in localStorage', () => {
      localStorage.setItem('empty-test', '');

      const emptyStorage = createStorage('empty-test');
      expect(emptyStorage.getCurrentVersion()).toBeNull();
    });
  });

  describe('savedAt timestamp', () => {
    it('includes savedAt ISO timestamp in saved version', () => {
      const beforeSave = new Date().toISOString();
      storage.saveVersion('# Test content');
      const afterSave = new Date().toISOString();

      const version = storage.getCurrentVersion();
      expect(version.savedAt).toBeDefined();
      expect(version.savedAt >= beforeSave).toBe(true);
      expect(version.savedAt <= afterSave).toBe(true);
    });

    it('preserves savedAt when navigating versions', () => {
      storage.saveVersion('# V1');
      const v1Version = storage.getCurrentVersion();
      const v1SavedAt = v1Version.savedAt;

      // Wait a tiny bit to ensure different timestamp
      storage.saveVersion('# V2');
      storage.goBack();

      const restored = storage.getCurrentVersion();
      expect(restored.savedAt).toBe(v1SavedAt);
    });
  });

  describe('edge cases', () => {
    it('handles empty string content', () => {
      const result = storage.saveVersion('');
      expect(result.success).toBe(true);
      expect(storage.loadDraft().markdown).toBe('');
    });

    it('handles very long content', () => {
      const longContent = '# Long Document\n' + 'x'.repeat(100000);
      const result = storage.saveVersion(longContent);
      expect(result.success).toBe(true);
      expect(storage.loadDraft().markdown).toBe(longContent);
    });

    it('handles special characters in content', () => {
      const specialContent = '# 日本語 🎉 <script>alert("xss")</script> "quotes" & ampersand';
      const result = storage.saveVersion(specialContent);
      expect(result.success).toBe(true);
      expect(storage.loadDraft().markdown).toBe(specialContent);
    });

    it('multiple goBack calls stop at first version', () => {
      storage.saveVersion('# V1');
      storage.saveVersion('# V2');
      storage.saveVersion('# V3');

      storage.goBack();
      storage.goBack();
      storage.goBack(); // Should do nothing, already at V1
      storage.goBack(); // Should still do nothing

      expect(storage.getCurrentVersion().versionNumber).toBe(1);
      expect(storage.getCurrentVersion().canGoBack).toBe(false);
    });

    it('multiple goForward calls stop at latest version', () => {
      storage.saveVersion('# V1');
      storage.saveVersion('# V2');
      storage.goBack();

      storage.goForward();
      storage.goForward(); // Should do nothing
      storage.goForward(); // Should still do nothing

      expect(storage.getCurrentVersion().versionNumber).toBe(2);
      expect(storage.getCurrentVersion().canGoForward).toBe(false);
    });
  });
});


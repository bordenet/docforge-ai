/**
 * Jest Setup File
 *
 * This file runs before each test suite to set up the testing environment.
 */

import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';
import { jest } from '@jest/globals';

// Expose jest globally for test files
global.jest = jest;

// Suppress jsdom navigation errors (jsdom doesn't support full navigation)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0]?.toString?.() || '';
  // Suppress known jsdom limitations
  if (
    message.includes('Not implemented: navigation') ||
    message.includes('Error: Not implemented')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Polyfill crypto.randomUUID for Node.js
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true,
});

// Polyfill structuredClone for Node.js < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Global test utilities
global.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock clipboard API
global.ClipboardItem = jest.fn().mockImplementation((data) => ({ data }));
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    write: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock window.isSecureContext for Clipboard API availability check
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
});

// Mock document.execCommand for fallback clipboard operations
document.execCommand = jest.fn(() => true);

// Reset mocks before each test
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});

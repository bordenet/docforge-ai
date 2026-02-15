/**
 * @jest-environment jsdom
 */

import {
  LLMClient,
  setLLMMode,
  getLLMMode,
  setAPIKey,
  getAPIKey,
  hasAPIKey,
  clearAllAPIKeys,
  getProviderConfig,
  createClientForPhase,
  checkWorkflowReady,
} from '../shared/js/llm-client.js';

describe('LLM Client Module', () => {
  beforeEach(() => {
    // Reset to mock mode and clear API keys before each test
    setLLMMode('mock');
    clearAllAPIKeys();
  });

  describe('Mode Management', () => {
    test('default mode is mock', () => {
      expect(getLLMMode()).toBe('mock');
    });

    test('setLLMMode changes mode', () => {
      setLLMMode('api');
      expect(getLLMMode()).toBe('api');
    });

    test('setLLMMode throws for invalid mode', () => {
      expect(() => setLLMMode('invalid')).toThrow('Invalid LLM mode');
    });
  });

  describe('API Key Management', () => {
    test('getAPIKey returns null when not set', () => {
      expect(getAPIKey('claude')).toBeNull();
    });

    test('setAPIKey stores key', () => {
      setAPIKey('claude', 'test-key');
      expect(getAPIKey('claude')).toBe('test-key');
    });

    test('hasAPIKey returns correct boolean', () => {
      expect(hasAPIKey('gemini')).toBe(false);
      setAPIKey('gemini', 'gemini-key');
      expect(hasAPIKey('gemini')).toBe(true);
    });
  });

  describe('Provider Configuration', () => {
    test('getProviderConfig returns Claude config', () => {
      const config = getProviderConfig('claude');
      expect(config.name).toBe('Claude');
      expect(config.apiUrl).toContain('anthropic');
    });

    test('getProviderConfig returns Gemini config', () => {
      const config = getProviderConfig('gemini');
      expect(config.name).toBe('Gemini');
      expect(config.apiUrl).toContain('generativelanguage');
    });

    test('getProviderConfig throws for unknown provider', () => {
      expect(() => getProviderConfig('unknown')).toThrow('Unknown provider');
    });
  });

  describe('LLMClient Class', () => {
    test('constructor sets provider', () => {
      const client = new LLMClient('claude');
      expect(client.provider).toBe('claude');
    });

    test('getDisplayName returns provider name', () => {
      const client = new LLMClient('gemini');
      expect(client.getDisplayName()).toBe('Gemini');
    });

    test('isReady returns true in mock mode', () => {
      setLLMMode('mock');
      const client = new LLMClient('claude');
      expect(client.isReady()).toBe(true);
    });

    test('isReady returns false in api mode without key', () => {
      setLLMMode('api');
      const client = new LLMClient('claude');
      expect(client.isReady()).toBe(false);
    });

    test('isReady returns true in api mode with key', () => {
      setLLMMode('api');
      setAPIKey('claude', 'test-key');
      const client = new LLMClient('claude');
      expect(client.isReady()).toBe(true);
    });
  });

  describe('Mock Response Generation', () => {
    test('generate returns mock response in mock mode', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 1 });

      expect(response).toContain('mock response');
      expect(response).toContain('Initial Draft');
    });

    test('phase 1 mock response contains executive summary', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 1 });

      expect(response).toContain('Executive Summary');
    });

    test('phase 2 mock response contains review', async () => {
      const client = new LLMClient('gemini');
      const response = await client.generate('Test prompt', { phase: 2 });

      expect(response).toContain('Phase 2 Review');
      expect(response).toContain('Assessment');
    });

    test('phase 3 mock response contains synthesis', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 3 });

      expect(response).toContain('Final Synthesized');
      expect(response).toContain('Improvements Made');
    });

    test('mock response includes provider name', async () => {
      const client = new LLMClient('gemini');
      const response = await client.generate('Test prompt', { phase: 2 });

      expect(response).toContain('Gemini');
    });
  });

  describe('Factory Functions', () => {
    test('createClientForPhase returns Claude for phase 1', () => {
      const client = createClientForPhase(1);
      expect(client.provider).toBe('claude');
    });

    test('createClientForPhase returns Gemini for phase 2', () => {
      const client = createClientForPhase(2);
      expect(client.provider).toBe('gemini');
    });

    test('createClientForPhase returns Claude for phase 3', () => {
      const client = createClientForPhase(3);
      expect(client.provider).toBe('claude');
    });
  });
});


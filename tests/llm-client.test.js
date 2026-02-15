/**
 * @jest-environment jsdom
 */

import { LLMClient, createClientForPhase } from '../shared/js/llm-client.js';

describe('LLM Client Module (Mock Only)', () => {
  describe('LLMClient Class', () => {
    test('constructor sets provider', () => {
      const client = new LLMClient('claude');
      expect(client.provider).toBe('claude');
    });

    test('constructor throws for unknown provider', () => {
      expect(() => new LLMClient('unknown')).toThrow('Unknown provider');
    });

    test('getDisplayName returns Claude', () => {
      const client = new LLMClient('claude');
      expect(client.getDisplayName()).toBe('Claude');
    });

    test('getDisplayName returns Gemini', () => {
      const client = new LLMClient('gemini');
      expect(client.getDisplayName()).toBe('Gemini');
    });
  });

  describe('Mock Response Generation', () => {
    test('generate returns mock response', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 1 });
      expect(response).toContain('Mock');
      expect(response).toContain('Initial Draft');
    });

    test('phase 1 mock response contains summary', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 1 });
      expect(response).toContain('Executive Summary');
    });

    test('phase 2 mock response contains review', async () => {
      const client = new LLMClient('gemini');
      const response = await client.generate('Test prompt', { phase: 2 });
      expect(response).toContain('Phase 2 Review');
    });

    test('phase 3 mock response contains synthesis', async () => {
      const client = new LLMClient('claude');
      const response = await client.generate('Test prompt', { phase: 3 });
      expect(response).toContain('Final Synthesized');
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


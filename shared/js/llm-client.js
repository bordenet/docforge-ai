/**
 * LLM Client - Mock interface for testing workflow
 * @module llm-client
 *
 * Provides mock LLM responses to test the 3-phase workflow.
 * DocForge AI uses a copy-paste workflow - users manually interact with LLMs.
 * This module enables UI testing without external dependencies.
 *
 * Usage:
 *   import { LLMClient, createClientForPhase } from './llm-client.js';
 *   const client = createClientForPhase(1);
 *   const response = await client.generate(prompt);
 */

import { logger } from './logger.js';

// Provider display names
const PROVIDER_NAMES = { claude: 'Claude', gemini: 'Gemini' };

/**
 * Generate mock content based on phase
 */
function generateMockContent(phase, provider, docType, timestamp) {
  const base = `**Mock Response** | ${provider} | ${timestamp}\n\n`;
  switch (phase) {
    case 1:
      return `# ${docType} - Initial Draft\n\n${base}## Executive Summary\nMock Phase 1 draft for testing the copy-paste workflow.\n\n## Problem Statement\nSimulates LLM response for UI testing.\n\n## Proposed Solution\nUsers copy prompts to Claude.ai/Gemini and paste responses back.\n\n---\n*Mock response for testing*`;
    case 2:
      return `## Phase 2 Review\n\n${base}**Score:** 75/100\n\n### Issues Identified\n1. Mock Issue 1\n2. Mock Issue 2\n\n### Improvements\n- Add metrics\n- Clarify scope\n\n---\n*Mock Phase 2 review*`;
    case 3:
      return `# Final Synthesized ${docType}\n\n${base}## Summary\nMock synthesis combining Phase 1 and Phase 2.\n\n## Improvements Made\n- Addressed issues (mock)\n- Incorporated feedback (mock)\n\n---\n*Mock Phase 3 synthesis*`;
    default:
      return `Mock response for phase ${phase}`;
  }
}

/**
 * LLM Client - Mock interface for workflow testing
 */
export class LLMClient {
  /**
   * @param {'claude' | 'gemini'} provider - Provider name
   */
  constructor(provider) {
    if (!PROVIDER_NAMES[provider]) {
      throw new Error(`Unknown provider: ${provider}. Must be 'claude' or 'gemini'.`);
    }
    this.provider = provider;
  }

  /**
   * Generate mock response
   * @param {string} prompt - Input prompt
   * @param {Object} [options] - Options
   * @param {number} [options.phase] - Phase number (1-3)
   * @returns {Promise<string>} Mock response
   */
  async generate(prompt, options = {}) {
    const phase = options.phase || 1;

    // Simulate network latency (500-1500ms)
    const delay = 500 + Math.random() * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    logger.info(`Mock ${this.provider} response for phase ${phase}`, 'llm-client');

    const providerName = PROVIDER_NAMES[this.provider];
    const timestamp = new Date().toISOString();
    const docTypeMatch = prompt.match(/(?:PRD|One-Pager|ADR|Strategic Proposal|Job Description)/i);
    const docType = docTypeMatch ? docTypeMatch[0] : 'Document';

    return generateMockContent(phase, providerName, docType, timestamp);
  }

  /**
   * Get provider display name
   * @returns {string} Display name
   */
  getDisplayName() {
    return PROVIDER_NAMES[this.provider];
  }
}

/**
 * Create LLM client for a phase
 * @param {number} phase - Phase number (1-3)
 * @returns {LLMClient} Client configured for the phase
 */
export function createClientForPhase(phase) {
  // Phase 1 & 3: Claude, Phase 2: Gemini
  const provider = phase === 2 ? 'gemini' : 'claude';
  return new LLMClient(provider);
}


/**
 * Prompt Generator - Generates prompts from templates with form data
 * @module prompt-generator
 */

import { logger } from './logger.js';

/**
 * Replace template variables in a prompt
 * Variables are in format {{FIELD_ID}}
 *
 * @param {string} template - Prompt template with {{variables}}
 * @param {Object} formData - Form data keyed by field ID
 * @returns {string} Prompt with variables replaced
 */
export function fillPromptTemplate(template, formData) {
  if (!template) return '';

  let result = template.replace(/\{\{(\w+)\}\}/g, (match, fieldId) => {
    // Convert from UPPER_CASE to camelCase for lookup
    const camelCase = fieldId
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    // Return value or empty string - never return the raw placeholder
    return formData[camelCase] || formData[fieldId] || '';
  });

  // Safety check: detect and remove any remaining placeholders
  // This prevents unsubstituted {{PLACEHOLDER}} from reaching the LLM
  const remaining = result.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    logger.warn(`Unsubstituted placeholders detected: ${remaining.join(', ')}`, 'prompt-generator');
    result = result.replace(/\{\{[A-Z_]+\}\}/g, '');
  }

  return result;
}

/**
 * Load a prompt template from a plugin's prompts directory
 * @param {string} pluginId - Plugin ID
 * @param {number} phase - Phase number (1, 2, or 3)
 * @returns {Promise<string>} Prompt template
 */
export async function loadPromptTemplate(pluginId, phase) {
  const basePath = getBasePath();
  const url = `${basePath}plugins/${pluginId}/prompts/phase${phase}.md`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      logger.warn(`Prompt template not found: ${url}, using fallback`, 'prompt-generator');
      return getFallbackPrompt(phase);
    }
    return await response.text();
  } catch (error) {
    logger.error('Error loading prompt template', error, 'prompt-generator');
    return getFallbackPrompt(phase);
  }
}

/**
 * Detect base path for assets
 * @returns {string} Base path
 */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/assistant/')) {
    return '../';
  }
  if (path.includes('/validator/')) {
    return '../';
  }
  return './';
}

/**
 * Get fallback prompt for a phase
 * @param {number} phase - Phase number
 * @returns {string} Fallback prompt
 */
function getFallbackPrompt(phase) {
  switch (phase) {
    case 1:
      return `# Phase 1: Initial Draft

You are an expert assistant helping to create a high-quality document.

## Context
**Title:** {{TITLE}}

## Your Task
Generate a well-structured first draft based on the provided context.
`;

    case 2:
      return `# Phase 2: Alternative Perspective

Review the draft and provide an alternative perspective.

## Original Draft
{{PHASE1_OUTPUT}}

## Your Task
Identify weaknesses and suggest improvements.
`;

    case 3:
      return `# Phase 3: Final Synthesis

Combine the original draft and alternative perspective into a polished final version.

## Original Draft
{{PHASE1_OUTPUT}}

## Alternative Perspective
{{PHASE2_OUTPUT}}

## Your Task
Create the final, polished document.
`;

    default:
      return 'Unknown phase';
  }
}

/**
 * Generate a complete prompt for a phase
 * @param {import('./plugin-registry.js').DocumentTypePlugin} plugin - Plugin
 * @param {number} phase - Phase number
 * @param {Object} formData - Form data
 * @param {Object} [previousResponses] - Previous phase responses
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.isImported] - Whether the document was imported
 * @returns {Promise<string>} Complete prompt
 */
export async function generatePrompt(plugin, phase, formData, previousResponses = {}, options = {}) {
  const template = await loadPromptTemplate(plugin.id, phase);

  // Build combined data for template filling
  // Templates use PHASE1_OUTPUT and PHASE2_OUTPUT (not RESPONSE)
  const data = {
    ...formData,
    // Support both naming conventions for backwards compatibility
    PHASE1_OUTPUT: previousResponses[1] || '',
    PHASE2_OUTPUT: previousResponses[2] || '',
    PHASE1_RESPONSE: previousResponses[1] || '',
    PHASE2_RESPONSE: previousResponses[2] || '',
    // Pass import status for conditional prompts
    IS_IMPORTED: options.isImported ? 'true' : '',
    IMPORTED_CONTENT: options.isImported ? (formData.importedContent || previousResponses[1] || '') : '',
  };

  return fillPromptTemplate(template, data);
}

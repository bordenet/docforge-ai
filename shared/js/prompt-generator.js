/**
 * Prompt Generator - Generates prompts from templates with form data
 * @module prompt-generator
 */

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

  return template.replace(/\{\{(\w+)\}\}/g, (match, fieldId) => {
    // Convert from UPPER_CASE to camelCase for lookup
    const camelCase = fieldId.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    return formData[camelCase] || formData[fieldId] || match;
  });
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
      console.warn(`Prompt template not found: ${url}, using fallback`);
      return getFallbackPrompt(phase);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading prompt template: ${error}`);
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
{{PHASE1_RESPONSE}}

## Your Task
Identify weaknesses and suggest improvements.
`;

  case 3:
    return `# Phase 3: Final Synthesis

Combine the original draft and alternative perspective into a polished final version.

## Original Draft
{{PHASE1_RESPONSE}}

## Alternative Perspective
{{PHASE2_RESPONSE}}

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
 * @returns {Promise<string>} Complete prompt
 */
export async function generatePrompt(plugin, phase, formData, previousResponses = {}) {
  const template = await loadPromptTemplate(plugin.id, phase);

  // Build combined data for template filling
  const data = {
    ...formData,
    PHASE1_RESPONSE: previousResponses[1] || '',
    PHASE2_RESPONSE: previousResponses[2] || ''
  };

  return fillPromptTemplate(template, data);
}


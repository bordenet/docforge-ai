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
/**
 * Strip creation-mode sections from a TEMPLATE (before imported content is injected).
 * This ensures we only strip template sections, not user content.
 *
 * @param {string} template - The raw template with {{IMPORTED_CONTENT}} placeholder
 * @returns {string} Template with creation-mode sections stripped
 */
function stripCreationSectionsFromTemplate(template) {
  let result = template;

  // Strategy: Strip sections that appear AFTER {{IMPORTED_CONTENT}} placeholder
  // This ensures we never touch user content since it hasn't been injected yet

  // Find where IMPORTED_CONTENT is injected - we only strip after this point
  const importedContentMarker = '{{IMPORTED_CONTENT}}';
  const markerIndex = result.indexOf(importedContentMarker);

  if (markerIndex === -1) {
    // No imported content placeholder - return as-is
    return result;
  }

  // Split template into before and after the marker
  const beforeMarker = result.substring(0, markerIndex + importedContentMarker.length);
  let afterMarker = result.substring(markerIndex + importedContentMarker.length);

  // Strip sections ONLY from the part after {{IMPORTED_CONTENT}}
  // This is where template sections live; user content goes IN the placeholder

  // Remove ## INPUT DATA section
  afterMarker = afterMarker.replace(/## INPUT DATA[\s\S]*?(?=\n## |\n\*\*BEGIN WITH|\n---\s*$|$)/g, '');

  // Remove ## Context section (with empty form fields like {{TITLE}})
  // Only match if followed by template field patterns (**, {{)
  afterMarker = afterMarker.replace(/## Context\n[\s\S]*?(?=\n## |\n---\n|$)/g, '');

  // Remove ## Context Grounding section (ADR-specific)
  afterMarker = afterMarker.replace(/## Context Grounding[\s\S]*?(?=\n## |\n---\n|$)/g, '');

  // Remove ## OUTPUT FORMAT section
  afterMarker = afterMarker.replace(/## OUTPUT FORMAT[\s\S]*?(?=\n## |\n\*\*BEGIN WITH|$)/g, '');

  // Remove "### Required Sections" table
  afterMarker = afterMarker.replace(/### Required Sections[\s\S]*?(?=\n## |\n\*\*BEGIN WITH|$)/g, '');

  // Replace creation-mode closing instruction
  afterMarker = afterMarker.replace(
    /\*\*BEGIN WITH THE HEADLINE NOW:\*\*/gi,
    '**REVIEW THE IMPORTED DOCUMENT ABOVE. Identify weaknesses, gaps, and areas for improvement. Then provide an enhanced version that addresses these issues.**'
  );

  // Recombine
  result = beforeMarker + afterMarker;

  // Clean up excessive newlines
  result = result.replace(/\n{4,}/g, '\n\n\n');

  return result;
}

/**
 * Fix broken prose from empty inline placeholders (post-substitution)
 * Only fixes patterns that are clearly broken prose, not user content.
 *
 * @param {string} prompt - The filled prompt after substitution
 * @returns {string} Prompt with fixed prose
 */
function fixBrokenPlaceholderProse(prompt) {
  let result = prompt;

  // Pattern: "a  word" or "A  word" (article + double space + word)
  result = result.replace(/\b([Aa]n?)\s{2,}(\w)/g, '$1 $2');

  // Pattern: "the  word" (article + double space + word)
  result = result.replace(/\b([Tt]he)\s{2,}(\w)/g, '$1 $2');

  // Pattern: "create a  document" -> "create a document" (specific case)
  result = result.replace(/create\s+a\s{2,}/gi, 'create a ');

  return result;
}

export async function generatePrompt(plugin, phase, formData, previousResponses = {}, options = {}) {
  let template = await loadPromptTemplate(plugin.id, phase);

  // Defensive check: warn if formData is empty or missing key fields
  if (!formData || Object.keys(formData).length === 0) {
    logger.warn('generatePrompt called with empty formData - prompt will have no user inputs', 'prompt-generator');
  } else if (phase === 1 && !formData.title && !formData.problem) {
    logger.warn('Phase 1 prompt missing title and problem - user may not have filled out the form', 'prompt-generator');
  }

  // CRITICAL: For imports, strip template sections BEFORE injecting user content
  // This ensures we only strip template sections (like ## Context with {{TITLE}}),
  // not identically-named sections in the user's imported document.
  if (options.isImported && phase === 1) {
    template = stripCreationSectionsFromTemplate(template);
  }

  // Build combined data for template filling
  // Templates use PHASE1_OUTPUT and PHASE2_OUTPUT (not RESPONSE)

  // Compute imported content value once - used for both camelCase and UPPER_CASE keys
  // When isImported: true, inject the imported document
  // When isImported: false, set to empty string to prevent content leaking via formData spread
  const importedContentValue = options.isImported
    ? (formData?.importedContent || previousResponses[1] || '')
    : '';

  const data = {
    ...formData,
    // Support both naming conventions for backwards compatibility
    PHASE1_OUTPUT: previousResponses[1] || '',
    PHASE2_OUTPUT: previousResponses[2] || '',
    PHASE1_RESPONSE: previousResponses[1] || '',
    PHASE2_RESPONSE: previousResponses[2] || '',
    // Pass import status for conditional prompts
    IS_IMPORTED: options.isImported ? 'true' : '',
    // Set BOTH camelCase and UPPER_CASE keys to ensure fillPromptTemplate uses our value
    // fillPromptTemplate looks up camelCase first, so we must override formData.importedContent
    importedContent: importedContentValue,
    IMPORTED_CONTENT: importedContentValue,
  };

  let prompt = fillPromptTemplate(template, data);

  // For imports, fix broken prose from empty inline placeholders
  // This runs AFTER substitution to catch "A  executive" patterns
  if (options.isImported && phase === 1) {
    prompt = fixBrokenPlaceholderProse(prompt);
  }

  return prompt;
}

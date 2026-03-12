/**
 * Prompt Generator - Generates prompts from templates with form data
 * @module prompt-generator
 */

import { logger } from './logger.js';

/**
 * Default review instruction for imported documents.
 * Used when plugin doesn't specify a custom importConfig.reviewInstruction
 */
export const DEFAULT_REVIEW_INSTRUCTION = '**REVIEW THE IMPORTED DOCUMENT ABOVE. Identify weaknesses, gaps, and areas for improvement. Then provide an enhanced version that addresses these issues.**';

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

{{IMPORTED_CONTENT}}

## ⚠️ MODE SELECTION (READ FIRST)

**If an imported document appears above this section:**
- You are in **REVIEW MODE**. Review, critique, and improve the imported document.

**If no imported document appears above:**
- You are in **CREATION MODE**. Generate a new document from the inputs below.

---

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Context
**Title:** {{TITLE}}
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

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
 * Section headers that are stripped from templates during import.
 * These sections contain form field placeholders that will be empty.
 *
 * MAINTENANCE NOTE: If you add/rename sections in templates, update these regexes.
 * Tests in import-prompt-rendering.test.js verify these are stripped correctly.
 *
 * Current sections stripped:
 * - ## INPUT DATA
 * - ## Context
 * - ## Context Grounding
 * - ## OUTPUT FORMAT
 * - ### Required Sections
 */

/**
 * Validate DOCFORGE marker pairing in a template.
 * Logs warnings for unclosed START markers or orphan END markers.
 *
 * @param {string} template - Template to validate
 * @returns {void}
 */
function validateMarkerPairing(template) {
  const startMarker = '<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->';
  const endMarker = '<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->';

  const startCount = (template.match(new RegExp(startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const endCount = (template.match(new RegExp(endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  if (startCount > endCount) {
    logger.warn(
      `Unclosed DOCFORGE marker: ${startCount} START markers but only ${endCount} END markers`,
      'prompt-generator'
    );
  } else if (endCount > startCount) {
    logger.warn(
      `Orphan DOCFORGE marker: ${endCount} END markers but only ${startCount} START markers`,
      'prompt-generator'
    );
  }

  // Also check for proper ordering (START before END)
  // This catches cases like END...START...END...START
  let depth = 0;
  const startRegex = new RegExp(startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const endRegex = new RegExp(endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

  // Find all marker positions
  const markers = [];
  let startMatch = startRegex.exec(template);
  while (startMatch !== null) {
    markers.push({ type: 'start', index: startMatch.index });
    startMatch = startRegex.exec(template);
  }
  let endMatch = endRegex.exec(template);
  while (endMatch !== null) {
    markers.push({ type: 'end', index: endMatch.index });
    endMatch = endRegex.exec(template);
  }
  markers.sort((a, b) => a.index - b.index);

  // Verify proper nesting
  for (const marker of markers) {
    if (marker.type === 'start') {
      depth++;
    } else {
      depth--;
      if (depth < 0) {
        logger.warn(
          'Mismatched DOCFORGE markers: END marker appears before START marker',
          'prompt-generator'
        );
        break;
      }
    }
  }
}

/**
 * Strip content between DOCFORGE:STRIP_FOR_IMPORT markers.
 * This is the preferred method - more explicit and maintainable.
 *
 * @param {string} template - Template with marker pairs
 * @returns {string} Template with marked sections removed
 */
function stripMarkedSections(template) {
  const startMarker = '<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->';
  const endMarker = '<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->';

  // Validate marker pairing before stripping
  validateMarkerPairing(template);

  let result = template;

  // Strip all content between marker pairs (including the markers)
  // Use non-greedy match to handle multiple pairs
  const markerRegex = new RegExp(
    startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +  // Escape special chars
    '[\\s\\S]*?' +  // Non-greedy match any content
    endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    'g'
  );

  result = result.replace(markerRegex, '');

  return result;
}

/**
 * Remove DOCFORGE markers from template (for creation mode).
 * Keeps content but removes the marker comments.
 *
 * @param {string} template - Template with markers
 * @returns {string} Template with markers removed but content preserved
 */
function removeMarkerComments(template) {
  return template
    .replace(/<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->\n?/g, '')
    .replace(/<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->\n?/g, '');
}

/**
 * Strip creation-mode sections from a TEMPLATE (before imported content is injected).
 * This ensures we only strip template sections, not user content.
 *
 * Uses marker-based stripping if markers present, falls back to regex.
 * Stripped sections are defined in IMPORT_STRIPPABLE_SECTIONS.
 *
 * @param {string} template - The raw template with {{IMPORTED_CONTENT}} placeholder
 * @param {Object} [plugin={}] - Plugin configuration (optional)
 * @param {Object} [plugin.importConfig] - Import-specific configuration
 * @param {string} [plugin.importConfig.reviewInstruction] - Custom review instruction
 * @returns {string} Template with creation-mode sections stripped
 */
function stripCreationSectionsFromTemplate(template, plugin = {}) {
  let result = template;

  // Get review instruction: use plugin-specific or default
  const reviewInstruction = plugin?.importConfig?.reviewInstruction || DEFAULT_REVIEW_INSTRUCTION;

  // Check if template uses marker-based stripping (preferred)
  // Check for either START or END markers to catch orphan markers too
  const hasStartMarkers = result.includes('DOCFORGE:STRIP_FOR_IMPORT_START');
  const hasEndMarkers = result.includes('DOCFORGE:STRIP_FOR_IMPORT_END');
  const hasMarkers = hasStartMarkers || hasEndMarkers;

  if (hasMarkers) {
    // Use explicit markers - more reliable than regex
    result = stripMarkedSections(result);

    // Inject review instruction:
    // 1. Try to replace "BEGIN WITH THE HEADLINE NOW:" anchor
    // 2. If no anchor, append at end of template
    const hasAnchor = /\*\*BEGIN WITH THE HEADLINE NOW:\*\*/gi.test(result);
    if (hasAnchor) {
      result = result.replace(
        /\*\*BEGIN WITH THE HEADLINE NOW:\*\*/gi,
        reviewInstruction
      );
    } else {
      // No anchor - append review instruction at end
      result = result.trimEnd() + '\n\n---\n\n' + reviewInstruction + '\n';
    }

    // Clean up excessive newlines
    result = result.replace(/\n{4,}/g, '\n\n\n');

    return result;
  }

  // Fallback: Regex-based stripping for templates without markers
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
  const originalAfterMarker = afterMarker; // Keep original for validation

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

  // Inject review instruction:
  // 1. Try to replace "BEGIN WITH THE HEADLINE NOW:" anchor
  // 2. If no anchor, append at end
  const hasAnchor = /\*\*BEGIN WITH THE HEADLINE NOW:\*\*/gi.test(afterMarker);
  if (hasAnchor) {
    afterMarker = afterMarker.replace(
      /\*\*BEGIN WITH THE HEADLINE NOW:\*\*/gi,
      reviewInstruction
    );
  } else {
    // No anchor - append review instruction at end
    afterMarker = afterMarker.trimEnd() + '\n\n---\n\n' + reviewInstruction + '\n';
  }

  // Validation: Warn if sections that should have been stripped still exist
  // This catches template structure changes that break our regexes
  // NOTE: This validation only runs for templates WITHOUT DOCFORGE markers.
  // All 9 built-in plugins use markers, so this is mainly for:
  // - Third-party plugins without markers
  // - Future templates that haven't adopted markers yet
  const sectionsToValidate = [
    { name: '## INPUT DATA', pattern: /## INPUT DATA/i },
    { name: '## Context', pattern: /## Context(?! Grounding)/i }, // Negative lookahead to not double-match
    { name: '## Context Grounding', pattern: /## Context Grounding/i },
    { name: '## OUTPUT FORMAT', pattern: /## OUTPUT FORMAT/i },
  ];

  for (const section of sectionsToValidate) {
    // Only warn if section existed in original AND still exists after stripping
    if (section.pattern.test(originalAfterMarker) && section.pattern.test(afterMarker)) {
      logger.warn(
        `Failed to strip "${section.name}" section - template structure may have changed`,
        'prompt-generator'
      );
    }
  }

  // Recombine
  result = beforeMarker + afterMarker;

  // Clean up excessive newlines
  result = result.replace(/\n{4,}/g, '\n\n\n');

  return result;
}

/**
 * Fix broken prose from empty inline placeholders (post-substitution)
 * Only fixes patterns in TEMPLATE portions, NOT user-imported content.
 *
 * @param {string} prompt - The filled prompt after substitution
 * @param {number} userContentStart - Start index of user content in prompt
 * @param {number} userContentEnd - End index of user content in prompt
 * @returns {string} Prompt with fixed prose (user content untouched)
 */
function fixBrokenPlaceholderProse(prompt, userContentStart = -1, userContentEnd = -1) {
  // If no user content bounds provided, apply to entire prompt (backwards compatibility)
  if (userContentStart < 0 || userContentEnd < 0) {
    let result = prompt;
    result = result.replace(/\b([Aa]n?)\s{2,}(\w)/g, '$1 $2');
    result = result.replace(/\b([Tt]he)\s{2,}(\w)/g, '$1 $2');
    result = result.replace(/create\s+a\s{2,}/gi, 'create a ');
    return result;
  }

  // Split prompt into: before user content, user content, after user content
  const beforeUser = prompt.substring(0, userContentStart);
  const userContent = prompt.substring(userContentStart, userContentEnd);
  const afterUser = prompt.substring(userContentEnd);

  // Apply prose fixes ONLY to template portions (before and after user content)
  const fixProse = (text) => {
    let result = text;
    // Pattern: "a  word" or "A  word" (article + double space + word)
    result = result.replace(/\b([Aa]n?)\s{2,}(\w)/g, '$1 $2');
    // Pattern: "the  word" (article + double space + word)
    result = result.replace(/\b([Tt]he)\s{2,}(\w)/g, '$1 $2');
    // Pattern: "create a  document" -> "create a document"
    result = result.replace(/create\s+a\s{2,}/gi, 'create a ');
    return result;
  };

  // Recombine: fixed template before + untouched user content + fixed template after
  return fixProse(beforeUser) + userContent + fixProse(afterUser);
}

/**
 * Generate a complete prompt for a phase
 *
 * For imports (options.isImported=true, phase=1):
 * 1. Strips creation-mode sections from template BEFORE substitution
 * 2. Injects imported content via {{IMPORTED_CONTENT}} placeholder
 * 3. Fixes broken prose from empty inline placeholders
 *
 * @param {import('./plugin-registry.js').DocumentTypePlugin} plugin - Plugin
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {Object} formData - Form data including importedContent for imports
 * @param {Object} [previousResponses] - Previous phase responses keyed by phase number
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.isImported] - Whether the document was imported (triggers section stripping)
 * @returns {Promise<string>} Complete prompt ready for LLM
 */
export async function generatePrompt(plugin, phase, formData, previousResponses = {}, options = {}) {
  let template = await loadPromptTemplate(plugin.id, phase);

  // Defensive check: warn if formData is empty or missing key fields
  if (!formData || Object.keys(formData).length === 0) {
    logger.warn('generatePrompt called with empty formData - prompt will have no user inputs', 'prompt-generator');
  } else if (phase === 1 && !formData.title && !formData.problem) {
    logger.warn('Phase 1 prompt missing title and problem - user may not have filled out the form', 'prompt-generator');
  }

  // Handle DOCFORGE markers in templates
  // For imports: strip content between markers (and the markers themselves)
  // For creation: remove markers but keep content
  if (options.isImported && phase === 1) {
    // CRITICAL: Strip template sections BEFORE injecting user content
    // This ensures we only strip template sections (like ## Context with {{TITLE}}),
    // not identically-named sections in the user's imported document.
    // Pass plugin to allow plugin-specific review instructions
    template = stripCreationSectionsFromTemplate(template, plugin);
  } else if (template.includes('DOCFORGE:STRIP_FOR_IMPORT')) {
    // Creation mode: remove marker comments but preserve content
    template = removeMarkerComments(template);
  }

  // Build combined data for template filling
  // Templates use PHASE1_OUTPUT and PHASE2_OUTPUT (not RESPONSE)

  // Compute imported content value once - used for both camelCase and UPPER_CASE keys
  // When isImported: true, inject the imported document
  // When isImported: false, set to empty string to prevent content leaking via formData spread
  const importedContentValue = options.isImported
    ? (formData?.importedContent || previousResponses[1] || '')
    : '';

  // Track where user content will be inserted (for scoped prose normalization)
  // We need to find the marker position BEFORE substitution
  const importedContentMarker = '{{IMPORTED_CONTENT}}';
  const markerIndex = template.indexOf(importedContentMarker);
  const userContentLength = importedContentValue.length;

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
  // IMPORTANT: Only fix prose in template portions, NOT in user content
  if (options.isImported && phase === 1) {
    if (markerIndex >= 0 && userContentLength > 0) {
      // Calculate where user content ended up in the final prompt
      // Note: Other placeholders before the marker may have changed positions,
      // but we can find user content by searching for it directly
      const userContentStart = prompt.indexOf(importedContentValue);
      const userContentEnd = userContentStart + userContentLength;
      prompt = fixBrokenPlaceholderProse(prompt, userContentStart, userContentEnd);
    } else {
      // No user content or marker - apply to entire prompt
      prompt = fixBrokenPlaceholderProse(prompt);
    }
  }

  return prompt;
}

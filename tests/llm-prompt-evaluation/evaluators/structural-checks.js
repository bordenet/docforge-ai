/**
 * Structural Checks for LLM Prompt Evaluation
 *
 * Validates prompt structure regardless of workflow or phase:
 * - No leaked DOCFORGE markers
 * - No unsubstituted placeholders
 * - Minimum length requirements
 * - No double spaces from empty substitutions
 */

/**
 * Check for leaked DOCFORGE:STRIP markers
 * @param {string} prompt - Generated prompt
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noLeakedMarkers(prompt) {
  const markerPattern = /DOCFORGE:STRIP/;
  const match = prompt.match(markerPattern);

  if (match) {
    return {
      check: 'no-leaked-markers',
      severity: 'FAIL',
      message: `Found "${match[0]}" at position ${match.index}`,
    };
  }
  return null;
}

/**
 * Check for unsubstituted {{PLACEHOLDER}} patterns
 * @param {string} prompt - Generated prompt
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noUnsubstitutedPlaceholders(prompt) {
  const placeholderPattern = /\{\{[A-Z_]+\}\}/g;
  const matches = prompt.match(placeholderPattern);

  if (matches && matches.length > 0) {
    return {
      check: 'no-unsubstituted-placeholders',
      severity: 'FAIL',
      message: `Found unsubstituted placeholders: ${matches.join(', ')}`,
    };
  }
  return null;
}

/**
 * Check minimum prompt length (not empty/truncated)
 * @param {string} prompt - Generated prompt
 * @param {number} minLength - Minimum expected length (default 500)
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function minimumLength(prompt, minLength = 500) {
  if (prompt.length < minLength) {
    return {
      check: 'minimum-length',
      severity: 'FAIL',
      message: `Prompt length ${prompt.length} is below minimum ${minLength}`,
    };
  }
  return null;
}

/**
 * Check for double spaces from empty placeholder substitution
 * Excludes:
 * - Code blocks (intentional formatting)
 * - Line-ending double spaces (markdown line break syntax)
 * - Table alignment spaces
 * @param {string} prompt - Generated prompt
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noDoubleSpaces(prompt) {
  // Remove code blocks before checking
  let cleaned = prompt.replace(/```[\s\S]*?```/g, '');
  // Remove line-ending double spaces (markdown line break syntax)
  cleaned = cleaned.replace(/ {2}$/gm, '');
  // Remove table rows (often have alignment spaces)
  cleaned = cleaned.replace(/^\|.*\|$/gm, '');

  // Check for double spaces in the middle of lines
  const doubleSpacePattern = / {2,}/g;
  const matches = cleaned.match(doubleSpacePattern);

  if (matches && matches.length > 10) {
    // Allow up to 10 instances, flag if excessive
    return {
      check: 'no-double-spaces',
      severity: 'WARN',
      message: `Found ${matches.length} instances of consecutive spaces (may indicate empty placeholder substitutions)`,
    };
  }
  return null;
}

/**
 * Run all structural checks
 * @param {string} prompt - Generated prompt
 * @returns {Array<{ check: string, severity: string, message: string }>}
 */
export function runStructuralChecks(prompt) {
  const results = [];
  const checks = [
    noLeakedMarkers(prompt),
    noUnsubstitutedPlaceholders(prompt),
    minimumLength(prompt),
    noDoubleSpaces(prompt),
  ];

  for (const result of checks) {
    if (result !== null) {
      results.push(result);
    }
  }

  return results;
}


/**
 * Workflow Checks for LLM Prompt Evaluation
 *
 * Validates workflow-specific requirements:
 * - IMPORT: Has review instruction, has imported content
 * - CREATE: No review instruction, has form values
 */

/**
 * Check that IMPORT workflow prompts contain review instruction
 * Only applies to Phase 1 - Phase 2/3 don't re-inject the review instruction
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures (unused)
 * @param {number} phase - Current phase
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasReviewInstruction(prompt, workflow, fixtures, phase) {
  // Only check Phase 1 - review instruction is injected once
  if (workflow !== 'import' || phase !== 1) return null;

  const reviewPattern = /REVIEW THE IMPORTED DOCUMENT/i;
  if (!reviewPattern.test(prompt)) {
    return {
      check: 'has-review-instruction',
      severity: 'FAIL',
      message: 'IMPORT workflow missing review instruction',
    };
  }
  return null;
}

/**
 * Check that CREATE workflow prompts do NOT contain review instruction
 * Only applies to Phase 1 - Phase 2/3 don't have form context
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures (unused)
 * @param {number} phase - Current phase
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noReviewInstruction(prompt, workflow, fixtures, phase) {
  // Only check Phase 1
  if (workflow !== 'create' || phase !== 1) return null;

  const reviewPattern = /REVIEW THE IMPORTED DOCUMENT/i;
  if (reviewPattern.test(prompt)) {
    return {
      check: 'no-review-instruction',
      severity: 'FAIL',
      message: 'CREATE workflow should not have review instruction',
    };
  }
  return null;
}

/**
 * Check that IMPORT workflow prompts contain the imported content
 * Only applies to Phase 1 - Phase 2/3 contain AI outputs instead
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @param {number} phase - Current phase
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasImportedContent(prompt, workflow, fixtures, phase) {
  // Only check Phase 1 - imported content is only in Phase 1
  if (workflow !== 'import' || phase !== 1) return null;
  if (!fixtures.importedContent) return null;

  // Check for a significant portion of the imported content
  // Use first 100 chars as a signature
  const signature = fixtures.importedContent.slice(0, 100).trim();
  if (!prompt.includes(signature)) {
    return {
      check: 'has-imported-content',
      severity: 'FAIL',
      message: 'Imported document content not found in prompt',
    };
  }
  return null;
}

/**
 * Check that CREATE workflow prompts contain form field values
 * Only applies to Phase 1 - Phase 2/3 contain AI outputs instead
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @param {number} phase - Current phase
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasFormValues(prompt, workflow, fixtures, phase) {
  // Only check Phase 1 - form values only appear in Phase 1
  if (workflow !== 'create' || phase !== 1) return null;
  if (!fixtures.formData) return null;

  // Check that at least one form field value appears in the prompt
  // Look for any non-empty string field that's longer than 10 chars
  const fieldValues = Object.entries(fixtures.formData)
    .filter(([, value]) => typeof value === 'string' && value.length > 10)
    .map(([key, value]) => ({ key, value }));

  if (fieldValues.length === 0) return null;

  // Check if ANY form value appears in the prompt
  const foundValue = fieldValues.find(({ value }) => prompt.includes(value));

  if (!foundValue) {
    const checkedFields = fieldValues.map((f) => f.key).join(', ');
    return {
      check: 'has-form-values',
      severity: 'FAIL',
      message: `No form field values found in prompt (checked: ${checkedFields})`,
    };
  }
  return null;
}

/**
 * Run all workflow checks
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @param {number} phase - Current phase (1, 2, or 3)
 * @returns {Array<{ check: string, severity: string, message: string }>}
 */
export function runWorkflowChecks(prompt, workflow, fixtures, phase) {
  const results = [];
  const checks = [
    hasReviewInstruction(prompt, workflow, fixtures, phase),
    noReviewInstruction(prompt, workflow, fixtures, phase),
    hasImportedContent(prompt, workflow, fixtures, phase),
    hasFormValues(prompt, workflow, fixtures, phase),
  ];

  for (const result of checks) {
    if (result !== null) {
      results.push(result);
    }
  }

  return results;
}


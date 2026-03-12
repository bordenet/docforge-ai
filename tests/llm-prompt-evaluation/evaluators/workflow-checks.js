/**
 * Workflow Checks for LLM Prompt Evaluation
 *
 * Validates workflow-specific requirements:
 * - IMPORT: Has review instruction, has imported content
 * - CREATE: No review instruction, has form values
 */

/**
 * Check that IMPORT workflow prompts contain review instruction
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasReviewInstruction(prompt, workflow) {
  if (workflow !== 'import') return null;

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
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noReviewInstruction(prompt, workflow) {
  if (workflow !== 'create') return null;

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
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @param {string} fixtures.importedContent - The imported document content
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasImportedContent(prompt, workflow, fixtures) {
  if (workflow !== 'import') return null;
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
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @param {Object} fixtures.formData - The form data
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasFormValues(prompt, workflow, fixtures) {
  if (workflow !== 'create') return null;
  if (!fixtures.formData || !fixtures.formData.title) return null;

  // Check that the title appears in the prompt
  if (!prompt.includes(fixtures.formData.title)) {
    return {
      check: 'has-form-values',
      severity: 'FAIL',
      message: `Form field "title" value not found in prompt`,
    };
  }
  return null;
}

/**
 * Run all workflow checks
 * @param {string} prompt - Generated prompt
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {Object} fixtures - Test fixtures
 * @returns {Array<{ check: string, severity: string, message: string }>}
 */
export function runWorkflowChecks(prompt, workflow, fixtures) {
  const results = [];
  const checks = [
    hasReviewInstruction(prompt, workflow),
    noReviewInstruction(prompt, workflow),
    hasImportedContent(prompt, workflow, fixtures),
    hasFormValues(prompt, workflow, fixtures),
  ];

  for (const result of checks) {
    if (result !== null) {
      results.push(result);
    }
  }

  return results;
}


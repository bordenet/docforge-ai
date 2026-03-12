/**
 * Evaluators Index
 *
 * Exports all evaluator modules and provides a unified check runner.
 */

import { runStructuralChecks } from './structural-checks.js';
import { runWorkflowChecks } from './workflow-checks.js';
import { runPhaseChecks } from './phase-checks.js';

export { runStructuralChecks } from './structural-checks.js';
export { runWorkflowChecks } from './workflow-checks.js';
export { runPhaseChecks } from './phase-checks.js';

/**
 * Run all checks on a generated prompt
 *
 * @param {string} prompt - Generated prompt to evaluate
 * @param {'create' | 'import'} workflow - Current workflow
 * @param {number} phase - Current phase (1, 2, or 3)
 * @param {Object} fixtures - Test fixtures containing formData, importedContent, previousResponses
 * @returns {{
 *   failures: Array<{ check: string, severity: string, message: string }>,
 *   warnings: Array<{ check: string, severity: string, message: string }>,
 *   passed: boolean
 * }}
 */
export function runAllChecks(prompt, workflow, phase, fixtures) {
  const allResults = [
    ...runStructuralChecks(prompt),
    ...runWorkflowChecks(prompt, workflow, fixtures),
    ...runPhaseChecks(prompt, phase, fixtures),
  ];

  const failures = allResults.filter((r) => r.severity === 'FAIL');
  const warnings = allResults.filter((r) => r.severity === 'WARN');

  return {
    failures,
    warnings,
    passed: failures.length === 0,
  };
}


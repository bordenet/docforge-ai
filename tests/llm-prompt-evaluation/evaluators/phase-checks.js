/**
 * Phase Checks for LLM Prompt Evaluation
 *
 * Validates phase-specific requirements:
 * - Phase 1: Contains MODE SELECTION section
 * - Phase 2: Contains Phase 1 output
 * - Phase 3: Contains Phase 2 output
 */

/**
 * Check that Phase 1 prompts contain MODE SELECTION section
 * @param {string} prompt - Generated prompt
 * @param {number} phase - Current phase (1, 2, or 3)
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function hasModeSelection(prompt, phase) {
  if (phase !== 1) return null;

  const modePattern = /MODE SELECTION/i;
  if (!modePattern.test(prompt)) {
    return {
      check: 'has-mode-selection',
      severity: 'WARN', // WARN not FAIL - some templates may not have this
      message: 'Phase 1 prompt missing MODE SELECTION section',
    };
  }
  return null;
}

/**
 * Check that Phase 2 prompts contain Phase 1 output
 * @param {string} prompt - Generated prompt
 * @param {number} phase - Current phase (1, 2, or 3)
 * @param {Object} fixtures - Test fixtures
 * @param {Object} fixtures.previousResponses - Previous phase outputs
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function phase1OutputPresent(prompt, phase, fixtures) {
  if (phase !== 2) return null;
  if (!fixtures.previousResponses || !fixtures.previousResponses[1]) return null;

  // Check for a portion of the phase 1 output
  const signature = fixtures.previousResponses[1].slice(0, 50).trim();
  if (!prompt.includes(signature)) {
    return {
      check: 'phase1-output-present',
      severity: 'FAIL',
      message: 'Phase 2 prompt missing Phase 1 output',
    };
  }
  return null;
}

/**
 * Check that Phase 3 prompts contain Phase 2 output
 * @param {string} prompt - Generated prompt
 * @param {number} phase - Current phase (1, 2, or 3)
 * @param {Object} fixtures - Test fixtures
 * @param {Object} fixtures.previousResponses - Previous phase outputs
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function phase2OutputPresent(prompt, phase, fixtures) {
  if (phase !== 3) return null;
  if (!fixtures.previousResponses || !fixtures.previousResponses[2]) return null;

  // Check for a portion of the phase 2 output
  const signature = fixtures.previousResponses[2].slice(0, 50).trim();
  if (!prompt.includes(signature)) {
    return {
      check: 'phase2-output-present',
      severity: 'FAIL',
      message: 'Phase 3 prompt missing Phase 2 output',
    };
  }
  return null;
}

/**
 * Check that previous phase outputs are non-trivial
 * @param {string} prompt - Generated prompt
 * @param {number} phase - Current phase (1, 2, or 3)
 * @param {Object} fixtures - Test fixtures
 * @returns {{ check: string, severity: string, message: string } | null}
 */
export function noEmptyPhaseOutput(prompt, phase, fixtures) {
  if (phase === 1) return null;
  if (!fixtures.previousResponses) return null;

  const prevPhase = phase - 1;
  const prevOutput = fixtures.previousResponses[prevPhase];

  if (!prevOutput || prevOutput.length < 50) {
    return {
      check: 'no-empty-phase-output',
      severity: 'FAIL',
      message: `Phase ${prevPhase} output is empty or too short`,
    };
  }
  return null;
}

/**
 * Run all phase checks
 * @param {string} prompt - Generated prompt
 * @param {number} phase - Current phase (1, 2, or 3)
 * @param {Object} fixtures - Test fixtures
 * @returns {Array<{ check: string, severity: string, message: string }>}
 */
export function runPhaseChecks(prompt, phase, fixtures) {
  const results = [];
  const checks = [
    hasModeSelection(prompt, phase),
    phase1OutputPresent(prompt, phase, fixtures),
    phase2OutputPresent(prompt, phase, fixtures),
    noEmptyPhaseOutput(prompt, phase, fixtures),
  ];

  for (const result of checks) {
    if (result !== null) {
      results.push(result);
    }
  }

  return results;
}


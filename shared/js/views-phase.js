/**
 * Views Phase Module - Phase content rendering
 * @module views-phase
 */

import { escapeHtml } from './ui.js';

// Phase accent colors for visual differentiation
const PHASE_ACCENT_COLORS = {
  1: 'blue',
  2: 'green',
  3: 'purple',
};
const DEFAULT_PHASE_COLOR = 'blue';

/**
 * Get phase metadata from plugin config
 * @param {Object} plugin - Plugin config
 * @param {number} phaseNumber - Phase number
 * @returns {Object} Phase metadata
 */
function getPhaseMetadata(plugin, phaseNumber) {
  const phases = plugin.workflowConfig?.phases || [];
  return (
    phases.find((p) => p.number === phaseNumber) || {
      number: phaseNumber,
      name: `Phase ${phaseNumber}`,
      icon: '📝',
      aiModel: 'Claude',
      description: `Complete phase ${phaseNumber}`,
    }
  );
}

/**
 * Render content for a specific phase
 * @param {Object} plugin - Plugin config
 * @param {Object} project - Project data
 * @param {number} phase - Phase number
 * @returns {string} HTML
 */
export function renderPhaseContent(plugin, project, phase) {
  const meta = getPhaseMetadata(plugin, phase);
  const phaseData = project.phases?.[phase] || { prompt: '', response: '', completed: false };
  const color = PHASE_ACCENT_COLORS[phase] || DEFAULT_PHASE_COLOR;

  // Completion banner for Phase 3
  let completionBanner = '';
  if (phase === 3 && phaseData.completed) {
    completionBanner = `
      <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
              <span class="mr-2">🎉</span> Your ${plugin.name} is Complete!
            </h4>
            <p class="text-green-700 dark:text-green-400 mt-1">
              You can copy the final document or validate it.
            </p>
          </div>
          <div class="flex gap-3">
            <button id="export-final-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              📋 Copy Final Document
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    ${completionBanner}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ${meta.icon} ${meta.name}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          ${meta.description}
        </p>
        <div class="inline-flex items-center px-3 py-1 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-300 rounded-full text-sm">
          <span class="mr-2">🤖</span>
          Use with ${meta.aiModel}
        </div>
      </div>

      <!-- Step A: Generate Prompt -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step A: Copy Prompt to AI
        </h4>
        <div class="flex gap-3 flex-wrap">
          <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📋 ${phaseData.prompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
          </button>
          <a
            id="open-ai-btn"
            href="${phase === 2 ? 'https://gemini.google.com' : 'https://claude.ai'}"
            target="ai-assistant-tab"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${phaseData.prompt ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed pointer-events-none'}"
            ${phaseData.prompt ? '' : 'aria-disabled="true"'}
          >
            🔗 Open ${phase === 2 ? 'Gemini' : 'Claude'}
          </a>
        </div>
      </div>

      <!-- Step B: Paste Response -->
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step B: Paste ${meta.aiModel}'s Response
        </h4>
        <textarea
          id="response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          placeholder="Paste ${meta.aiModel}'s response here..."
          ${!phaseData.prompt ? 'disabled' : ''}
        >${escapeHtml(phaseData.response || '')}</textarea>

        <div class="mt-3 flex justify-between items-center">
          ${
            phaseData.completed && phase < 3
              ? `
            <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Next Phase →
            </button>
          `
              : phase < 3
                ? `
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${phaseData.prompt ? 'Paste response to complete this phase' : 'Copy prompt first, then paste response'}
            </span>
          `
                : '<span></span>'
          }
          <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!phaseData.prompt ? 'disabled' : ''}>
            Save Response
          </button>
        </div>
      </div>
    </div>
  `;
}


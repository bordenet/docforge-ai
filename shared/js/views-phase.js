/**
 * Views Phase Module - Phase content rendering
 * @module views-phase
 */

import { escapeHtml } from './ui.js';
import { validateDocument, getScoreColor, getScoreLabel } from './validator.js';

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
    // Calculate quality score
    const documentContent = phaseData.response || '';
    const validationResult = validateDocument(documentContent, plugin);
    const scoreColor = getScoreColor(validationResult.totalScore);
    const scoreLabel = getScoreLabel(validationResult.totalScore);

    // Get dimension scores for display
    const dimensions = plugin.scoringDimensions || [];
    const dimensionScoresHtml = dimensions
      .map((dim, index) => {
        const dimResult = validationResult[dim.name] || validationResult[`dimension${index + 1}`] || { score: 0, maxScore: dim.maxPoints };
        return `
          <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
            <div class="text-gray-500 dark:text-gray-400 text-xs">${escapeHtml(dim.name)}</div>
            <div class="font-semibold text-gray-900 dark:text-white">${dimResult.score}/${dimResult.maxScore}</div>
          </div>
        `;
      })
      .join('');

    // Collect all issues
    const allIssues = validationResult.issues || [];

				completionBanner = `
		      <div class="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
		        <div class="flex items-center justify-between flex-wrap gap-3">
		          <div class="min-w-0">
	            <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
	              <span class="mr-2">🎉</span> Your ${escapeHtml(plugin.name)} is Complete!
	            </h4>
		            <p class="text-green-700 dark:text-green-400 mt-0.5">
			          <strong>Next steps:</strong> Copy, download, or tune & refine for detailed feedback.
	            </p>
	          </div>
		          <div class="flex gap-3 flex-wrap flex-shrink-0">
	            <button id="export-final-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
		              📋 Copy Final
	            </button>
		        <button id="download-menu-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
			          ⬇️ Download ▾
			        </button>
	          </div>
	        </div>

		    <!-- Automated Validation Score (collapsed by default) -->
		    <details class="group mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
		      <summary class="cursor-pointer list-none [&::-webkit-details-marker]:hidden [&::marker]:content-[''] grid grid-cols-[auto,1fr] items-center gap-2">
		        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" class="self-center flex-shrink-0 w-5 h-5 text-gray-500 dark:text-gray-300 transition-transform group-open:rotate-90">
		          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24c.3.3.3.77 0 1.06l-4.24 4.24a.75.75 0 0 1-1.08-.01Z" clip-rule="evenodd" />
		        </svg>
		        <div class="flex flex-wrap items-center gap-3 min-w-0">
		          <div class="min-w-0 flex-1">
		            <div class="font-semibold text-gray-900 dark:text-white flex items-center">
		              📊 Automated Validation Score
		              ${allIssues.length > 0 && validationResult.totalScore < 70 ? `
		                <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">• ${allIssues.length} suggestion${allIssues.length > 1 ? 's' : ''}</span>
		              ` : ''}
		            </div>
		            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
		              Pattern-based checks • May differ from AI critique scores
		            </p>
		          </div>
		          <div class="flex items-center gap-3 ml-auto flex-shrink-0">
		            <div class="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
		              <span class="text-2xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400">${validationResult.totalScore}</span>
		              <span class="text-gray-500 dark:text-gray-400">/100</span>
		              <span class="px-2 py-1 text-xs font-medium rounded-full bg-${scoreColor}-100 dark:bg-${scoreColor}-900/30 text-${scoreColor}-700 dark:text-${scoreColor}-300">${scoreLabel}</span>
		            </div>
		            <button type="button" id="validate-btn" data-validator-url="../validator/?type=${encodeURIComponent(plugin.id || '')}${project?.id ? `&project=${encodeURIComponent(project.id)}&phase=${encodeURIComponent(String(phase))}` : ''}" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-w-0">
		              🎛️ Tune & Refine&nbsp;↗
		            </button>
		          </div>
		        </div>
		      </summary>

		      <div class="mt-4">
		        <!-- Score Breakdown -->
		        ${dimensionScoresHtml ? `
		        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
		          ${dimensionScoresHtml}
		        </div>
		        ` : ''}

		        ${allIssues.length > 0 && validationResult.totalScore < 70 ? `
		        <!-- Improvement Suggestions -->
		        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
		          <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
		            💡 Top suggestions to improve your score
		          </div>
		          <ul class="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
				            ${allIssues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join('')}
		          </ul>
		        </div>
		        ` : ''}
		      </div>
		    </details>
      </div>
    `;
  }

  return `
    ${completionBanner}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6 flex justify-between items-start">
        <div>
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
        <!-- More Actions Menu Trigger -->
        <button id="more-actions-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="More actions">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>
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


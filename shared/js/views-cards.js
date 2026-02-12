/**
 * Views Cards Module - Project card rendering
 * @module views-cards
 */

import { escapeHtml, formatDate } from './ui.js';

// Phase progress bar color classes
const PHASE_COLORS = {
  complete: 'bg-green-500',
  current: 'bg-blue-500',
  pending: 'bg-gray-300 dark:bg-gray-600',
};

/**
 * Get the appropriate color class for a phase progress segment
 * @param {boolean} isComplete - Whether the phase is complete
 * @param {boolean} isCurrent - Whether this is the current active phase
 * @returns {string} Tailwind color class
 */
function getPhaseColorClass(isComplete, isCurrent) {
  if (isComplete) return PHASE_COLORS.complete;
  if (isCurrent) return PHASE_COLORS.current;
  return PHASE_COLORS.pending;
}

/**
 * Render a project card
 * @param {Object} project - Project data
 * @returns {string} HTML
 */
export function renderProjectCard(project) {
  const title = project.title || project.formData?.title || 'Untitled';

  // Calculate phase completion
  const isComplete =
    project.phases &&
    project.phases[1]?.completed &&
    project.phases[2]?.completed &&
    project.phases[3]?.completed;

  const completedPhases = [1, 2, 3].filter((p) => project.phases?.[p]?.completed).length;

  // Get a description from form data if available
  const description =
    project.formData?.problemStatement ||
    project.formData?.description ||
    project.formData?.context ||
    '';

  // Progress bar segments
  const progressBar = [1, 2, 3]
    .map((phase) => {
      const isPhaseComplete = project.phases?.[phase]?.completed;
      const currentPhase = project.currentPhase || 1;
      const isCurrent = phase === currentPhase && !isPhaseComplete;
      const colorClass = getPhaseColorClass(isPhaseComplete, isCurrent);
      return `<div class="flex-1 h-1.5 rounded ${colorClass}"></div>`;
    })
    .join('');

  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">
            ${escapeHtml(title)}
          </h3>
          <div class="flex items-center space-x-1">
            ${
              isComplete
                ? `
            <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors p-1" data-project-id="${project.id}" title="Preview & Copy">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            `
                : ''
            }
            <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors p-1" data-project-id="${project.id}" title="Delete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-3">
          <div class="flex items-center space-x-1 mb-1">
            ${progressBar}
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${completedPhases}/3 phases complete</span>
        </div>

        ${
          description
            ? `
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          ${escapeHtml(description)}
        </p>
        `
            : ''
        }

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Updated ${formatDate(project.updatedAt)}
        </div>
      </div>
    </div>
  `;
}


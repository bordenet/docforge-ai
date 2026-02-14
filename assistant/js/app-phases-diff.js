/**
 * App Phase Diff & Response Handling
 *
 * Handles response saving, phase completion, and diff comparison between phases.
 *
 * @module app-phases-diff
 */

import { getProject, saveProject } from '../../shared/js/storage.js';
import { showToast } from '../../shared/js/ui.js';
import { renderPhaseContent } from '../../shared/js/views.js';
import { logger } from '../../shared/js/logger.js';
import { computeWordDiff, renderDiffHtml, getDiffStats } from '../../shared/js/diff-view.js';
import { detectPrompt } from '../../shared/js/validator.js';

// Module state - injected via init
let updatePhaseTabStyles = null;
let attachPhaseEventListeners = null;

/**
 * Initialize module with parent callbacks
 * @param {Function} tabStylesFn - updatePhaseTabStyles function
 * @param {Function} attachListenersFn - attachPhaseEventListeners function
 */
export function initDiffModule(tabStylesFn, attachListenersFn) {
  updatePhaseTabStyles = tabStylesFn;
  attachPhaseEventListeners = attachListenersFn;
}

/**
 * Handle saving response for a phase
 */
export async function handleSaveResponse(plugin, project, phase, responseTextarea) {
  const response = responseTextarea?.value?.trim();
  if (!response || response.length < 3) {
    showToast('Please enter a response', 'warning');
    return;
  }

  // Check if user accidentally pasted the prompt instead of the AI response
  const promptCheck = detectPrompt(response);
  if (promptCheck.isPrompt) {
    showToast(
      `⚠️ This looks like a PROMPT, not AI output. Detected: ${promptCheck.indicators.slice(0, 2).join(', ')}. Paste the AI's response instead.`,
      'error'
    );
    return;
  }

  try {
    const freshProject = await getProject(plugin.dbName, project.id);
    if (!freshProject.phases) freshProject.phases = {};
    if (!freshProject.phases[phase]) freshProject.phases[phase] = { prompt: '', response: '', completed: false };

    freshProject.phases[phase].response = response;
    freshProject.phases[phase].completed = true;

    if (phase < 3) {
      freshProject.currentPhase = phase + 1;
      await saveProject(plugin.dbName, freshProject);
      showToast('Response saved! Moving to next phase...', 'success');

      updatePhaseTabStyles(phase + 1);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, phase + 1);
      attachPhaseEventListeners(plugin, freshProject, phase + 1);
      markPhaseComplete(phase);
    } else {
      await saveProject(plugin.dbName, freshProject);
      showToast('Your document is complete!', 'success');
      document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, phase);
      attachPhaseEventListeners(plugin, freshProject, phase);
      markPhaseComplete(phase);
    }
  } catch (error) {
    logger.error('Failed to save response', error, 'app-phases');
    showToast('Failed to save response', 'error');
  }
}

/**
 * Mark a phase tab as complete with checkmark
 */
export function markPhaseComplete(phase) {
  const completedTab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
  if (completedTab && !completedTab.innerHTML.includes('✓')) {
    completedTab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
  }
}

/**
 * Show diff modal to compare phases
 * @param {Object} plugin - Plugin config
 * @param {Object} phases - Phase responses { 1: string, 2: string, 3: string }
 * @param {Array} completedPhases - Array of completed phase numbers
 */
export function showDiffModal(plugin, phases, completedPhases) {
  const phaseNames = {};
  const workflowPhases = plugin.workflowConfig?.phases || [];
  completedPhases.forEach((p) => {
    const meta = workflowPhases.find((wp) => wp.number === p) || { name: `Phase ${p}`, aiModel: 'Claude' };
    phaseNames[p] = `Phase ${p}: ${meta.name} (${meta.aiModel})`;
  });

  // Default to comparing first two completed phases
  let leftPhase = completedPhases[0];
  let rightPhase = completedPhases[1];

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

  function renderDiff() {
    const leftOutput = phases[leftPhase] || '';
    const rightOutput = phases[rightPhase] || '';
    const diff = computeWordDiff(leftOutput, rightOutput);
    const stats = getDiffStats(diff);
    const diffHtml = renderDiffHtml(diff);

    const optionsHtml = completedPhases.map((p) => `<option value="${p}">${phaseNames[p]}</option>`).join('');

    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">
              🔄 Phase Comparison
            </h3>
            <div class="flex items-center gap-2 flex-wrap">
              <select id="diff-left-phase" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                ${optionsHtml}
              </select>
              <span class="text-gray-500 dark:text-gray-400 font-medium">→</span>
              <select id="diff-right-phase" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
                ${optionsHtml}
              </select>
              <div class="flex gap-2 ml-4 text-sm">
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                  +${stats.additions} added
                </span>
                <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                  -${stats.deletions} removed
                </span>
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  ${stats.unchanged} unchanged
                </span>
              </div>
            </div>
          </div>
          <button id="close-diff-modal-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ml-4">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <div id="diff-content" class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            ${diffHtml}
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="bg-green-200 dark:bg-green-900/50 px-1">Green text</span> = added in right phase &nbsp;|&nbsp;
            <span class="bg-red-200 dark:bg-red-900/50 px-1 line-through">Red strikethrough</span> = removed from left phase
          </p>
        </div>
      </div>
    `;

    // Set selected values
    modal.querySelector('#diff-left-phase').value = leftPhase;
    modal.querySelector('#diff-right-phase').value = rightPhase;

    // Add change handlers
    modal.querySelector('#diff-left-phase').addEventListener('change', (e) => {
      leftPhase = parseInt(e.target.value);
      renderDiff();
    });
    modal.querySelector('#diff-right-phase').addEventListener('change', (e) => {
      rightPhase = parseInt(e.target.value);
      renderDiff();
    });

    // Close button
    modal.querySelector('#close-diff-modal-btn').addEventListener('click', () => modal.remove());
  }

  renderDiff();
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Close on escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}


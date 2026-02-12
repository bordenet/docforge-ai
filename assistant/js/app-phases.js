/**
 * App Phase Event Handlers
 *
 * Handles phase navigation, prompt copying, response saving for the 3-phase workflow.
 *
 * @module app-phases
 */

import { getProject, saveProject, deleteProject } from '../../shared/js/storage.js';
import { showToast, copyToClipboard, confirm, createActionMenu, showPromptModal } from '../../shared/js/ui.js';
import { generatePrompt } from '../../shared/js/prompt-generator.js';
import { renderPhaseContent } from '../../shared/js/views.js';
import { logger } from '../../shared/js/logger.js';
import { computeWordDiff, renderDiffHtml, getDiffStats } from '../../shared/js/diff-view.js';

/**
 * Update phase tab styles
 */
export function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach((tab) => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}

/**
 * Attach event listeners for phase interactions
 */
export function attachPhaseEventListeners(plugin, project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const exportFinalBtn = document.getElementById('export-final-btn');

  // Copy prompt button
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      try {
        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        const prompt = await generatePrompt(plugin, phase, project.formData, previousResponses);
        await copyToClipboard(prompt);
        showToast('Prompt copied to clipboard!', 'success');

        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = { prompt: '', response: '', completed: false };
        project.phases[phase].prompt = prompt;
        await saveProject(plugin.dbName, project);

        // Enable the "Open AI" button
        const openAiBtn = document.getElementById('open-ai-btn');
        if (openAiBtn) {
          openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          openAiBtn.classList.add('hover:bg-green-700');
          openAiBtn.removeAttribute('aria-disabled');
        }

        // Enable the response textarea
        if (responseTextarea) {
          responseTextarea.disabled = false;
          responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
          responseTextarea.focus();
        }

        if (saveResponseBtn) saveResponseBtn.disabled = false;
      } catch (error) {
        logger.error('Failed to copy prompt', error, 'app-phases');
        showToast('Failed to copy prompt', 'error');
      }
    });
  }

  // Enable save button as user types
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasContent = responseTextarea.value.trim().length >= 3;
      if (saveResponseBtn) saveResponseBtn.disabled = !hasContent;
    });
  }

  // Save response button
  if (saveResponseBtn) {
    saveResponseBtn.addEventListener('click', () => handleSaveResponse(plugin, project, phase, responseTextarea));
  }

  // Next phase button
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;
      const freshProject = await getProject(plugin.dbName, project.id);
      freshProject.currentPhase = nextPhase;

      updatePhaseTabStyles(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, nextPhase);
      attachPhaseEventListeners(plugin, freshProject, nextPhase);
    });
  }

  // Export final document button (Phase 3 complete)
  if (exportFinalBtn) {
    exportFinalBtn.addEventListener('click', async () => {
      const freshProject = await getProject(plugin.dbName, project.id);
      const finalResponse = freshProject.phases?.[3]?.response || '';
      if (finalResponse) {
        await copyToClipboard(finalResponse);
        showToast('Final document copied to clipboard!', 'success');
      } else {
        showToast('No final document to copy', 'warning');
      }
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  logger.debug('More actions button found:', { found: !!moreActionsBtn, phase }, 'app-phases');
  if (moreActionsBtn) {
    const phaseData = project.phases?.[phase] || {};
    const hasPrompt = !!phaseData.prompt;

    // Build menu items based on current state
    const menuItems = [];

    // View Prompt (only if prompt exists)
    if (hasPrompt) {
      menuItems.push({
        label: 'View Prompt',
        icon: '👁️',
        onClick: async () => {
          const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
          const prompt = await generatePrompt(plugin, phase, project.formData, previousResponses);
          showPromptModal(prompt, `Phase ${phase} Prompt`);
        },
      });
    }

    // Edit Details (always available - go back to form)
    menuItems.push({
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => {
        // Navigate to edit form with project ID
        window.location.hash = `edit/${project.id}`;
      },
    });

    // Compare Phases (only if 2+ phases completed)
    const completedCount = [1, 2, 3].filter((p) => project.phases?.[p]?.response).length;
    if (completedCount >= 2) {
      menuItems.push({
        label: 'Compare Phases',
        icon: '🔄',
        onClick: () => {
          const phases = {
            1: project.phases?.[1]?.response || '',
            2: project.phases?.[2]?.response || '',
            3: project.phases?.[3]?.response || '',
          };
          const completedPhases = [1, 2, 3].filter((p) => phases[p]);
          showDiffModal(plugin, phases, completedPhases);
        },
      });
    }

    // Separator before destructive action
    menuItems.push({ separator: true });

    // Delete (destructive)
    menuItems.push({
      label: 'Delete...',
      icon: '🗑️',
      destructive: true,
      onClick: async () => {
        const title = project.title || project.formData?.title || 'this project';
        if (await confirm(`Are you sure you want to delete "${title}"?`, 'Delete Project')) {
          await deleteProject(plugin.dbName, project.id);
          showToast('Project deleted', 'success');
          window.location.hash = '';
        }
      },
    });

    logger.debug('Creating action menu with items:', { itemCount: menuItems.length }, 'app-phases');
    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end',
    });
    logger.debug('Action menu created successfully', {}, 'app-phases');
  }
}

async function handleSaveResponse(plugin, project, phase, responseTextarea) {
  const response = responseTextarea?.value?.trim();
  if (!response || response.length < 3) {
    showToast('Please enter a response', 'warning');
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

function markPhaseComplete(phase) {
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
function showDiffModal(plugin, phases, completedPhases) {
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

/**
 * App Phase Event Handlers
 *
 * Handles phase navigation, prompt copying, response saving for the 3-phase workflow.
 *
 * @module app-phases
 */

import { getProject, saveProject, deleteProject } from '../../shared/js/storage.js';
import { showToast, copyToClipboard, confirm } from '../../shared/js/ui.js';
import { generatePrompt } from '../../shared/js/prompt-generator.js';
import { renderPhaseContent } from '../../shared/js/views.js';
import { logger } from '../../shared/js/logger.js';

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

  // More actions menu toggle
  const moreActionsBtn = document.getElementById('more-actions-btn');
  const actionsMenu = document.getElementById('actions-menu');
  if (moreActionsBtn && actionsMenu) {
    moreActionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      actionsMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      actionsMenu.classList.add('hidden');
    });
  }

  // Delete project button
  const deleteProjectBtn = document.getElementById('delete-project-btn');
  if (deleteProjectBtn) {
    deleteProjectBtn.addEventListener('click', async () => {
      const title = project.title || project.formData?.title || 'this project';
      if (await confirm(`Are you sure you want to delete "${title}"?`, 'Delete Project')) {
        await deleteProject(plugin.dbName, project.id);
        showToast('Project deleted', 'success');
        window.location.hash = '';
      }
    });
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


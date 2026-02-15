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
import { initDiffModule, handleSaveResponse, showDiffModal } from './app-phases-diff.js';
import { createClientForPhase } from '../../shared/js/llm-client.js';
import { Workflow } from '../../shared/js/workflow.js';

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
  const autoGenerateBtn = document.getElementById('auto-generate-btn');

  // Auto-generate button (mock mode for testing)
  if (autoGenerateBtn) {
    autoGenerateBtn.addEventListener('click', async () => {
      const progressEl = document.getElementById('generate-progress');
      const statusEl = document.getElementById('generate-status');

      try {
        // Show progress
        if (progressEl) progressEl.classList.remove('hidden');
        if (statusEl) statusEl.textContent = `Generating with ${phase === 2 ? 'Gemini' : 'Claude'}...`;
        autoGenerateBtn.disabled = true;
        autoGenerateBtn.classList.add('opacity-50', 'cursor-not-allowed');

        // Create workflow and execute phase
        const workflow = new Workflow(project, plugin);
        workflow.currentPhase = phase;

        const client = createClientForPhase(phase);
        const result = await workflow.executePhase(client);

        // Update project phases
        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = { prompt: '', response: '', completed: false };
        project.phases[phase].prompt = result.prompt;
        project.phases[phase].response = result.response;
        project.phases[phase].completed = true;
        project.currentPhase = phase + 1;

        // Save to storage
        await saveProject(plugin.dbName, project);

        // Update UI
        if (responseTextarea) {
          responseTextarea.value = result.response;
          responseTextarea.disabled = false;
        }

        showToast(`Phase ${phase} generated successfully!`, 'success');

        // Re-render phase content to show completion state
        const freshProject = await getProject(plugin.dbName, project.id);
        document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, phase);
        attachPhaseEventListeners(plugin, freshProject, phase);

      } catch (error) {
        logger.error('Auto-generate failed', error, 'app-phases');
        showToast(`Generation failed: ${error.message}`, 'error');
      } finally {
        if (progressEl) progressEl.classList.add('hidden');
        autoGenerateBtn.disabled = false;
        autoGenerateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    });
  }

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
    // Initialize diff module with callbacks on first use
    initDiffModule(updatePhaseTabStyles, attachPhaseEventListeners);
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

  // Copy output button (phases 1-2 only)
  const copyOutputBtn = document.getElementById('copy-output-btn');
  if (copyOutputBtn) {
    copyOutputBtn.addEventListener('click', async () => {
      const freshProject = await getProject(plugin.dbName, project.id);
      const phaseResponse = freshProject.phases?.[phase]?.response || '';
      if (phaseResponse) {
        await copyToClipboard(phaseResponse);
        showToast('Output copied to clipboard!', 'success');
      } else {
        showToast('No output to copy', 'warning');
      }
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

  // Copy & Validate button - copies document to clipboard AND opens validator
  const validateBtn = document.getElementById('validate-btn');
  if (validateBtn) {
    validateBtn.addEventListener('click', async () => {
      const freshProject = await getProject(plugin.dbName, project.id);
      const finalResponse = freshProject.phases?.[3]?.response || '';
      const validatorUrl = validateBtn.dataset.validatorUrl;

      if (finalResponse) {
        await copyToClipboard(finalResponse);
        showToast('Document copied! Opening validator...', 'success');
        // Small delay to ensure toast is visible before new tab opens
        setTimeout(() => {
          window.open(validatorUrl, '_blank', 'noopener,noreferrer');
        }, 300);
      } else {
        showToast('No document to validate', 'warning');
      }
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (moreActionsBtn) {
    // Build menu items based on current state
    const menuItems = [];

    // Preview Prompt (always available - generates prompt on demand)
    menuItems.push({
      label: 'Preview Prompt',
      icon: '👁️',
      onClick: async () => {
        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        const prompt = await generatePrompt(plugin, phase, project.formData, previousResponses);
        showPromptModal(prompt, `Phase ${phase} Prompt`);
      },
    });

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

    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end',
    });
  }
}



/**
 * Main Application Module for DocForgeAI Assistant
 * @module app
 */

import { getCurrentPlugin, initRouter } from '../../shared/js/router.js';
import { saveProject, getProject, getAllProjects, deleteProject } from '../../shared/js/storage.js';
import { extractFormData, validateFormData } from '../../shared/js/form-generator.js';
import { renderListView, renderNewView, renderProjectView, renderPhaseContent } from '../../shared/js/views.js';
import { showToast, showLoading, hideLoading, copyToClipboard } from '../../shared/js/ui.js';
import { generatePrompt } from '../../shared/js/prompt-generator.js';

let currentPlugin = null;

/**
 * Initialize the application
 */
async function initApp() {
  try {
    showLoading('Initializing...');

    // Get current plugin from URL
    currentPlugin = getCurrentPlugin();

    // Update header to reflect current document type
    updateHeader(currentPlugin);

    // Setup document type selector
    setupDocTypeSelector();

    // Setup global event listeners
    setupGlobalEventListeners();

    // Initialize router
    initRouter(handleRouteChange);

    // Update storage info
    updateStorageInfo();

    console.log(`App initialized with plugin: ${currentPlugin.id}`);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showToast('Failed to initialize app', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Update header based on current plugin
 */
function updateHeader(plugin) {
  document.getElementById('header-icon').textContent = plugin.icon;
  document.getElementById('header-title').textContent = `${plugin.name} Assistant`;
  document.title = `${plugin.name} Assistant - DocForgeAI`;

  // Update favicon
  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${plugin.icon}</text></svg>`;
  }
}

/**
 * Setup document type selector
 */
function setupDocTypeSelector() {
  const selector = document.getElementById('doc-type-selector');
  if (!selector) return;

  // Set current value
  selector.value = currentPlugin.id;

  // Handle change
  selector.addEventListener('change', (e) => {
    const newType = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set('type', newType);
    url.hash = '';
    window.location.href = url.toString();
  });
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Privacy notice close
  document.getElementById('close-privacy-notice')?.addEventListener('click', () => {
    document.getElementById('privacy-notice')?.remove();
    localStorage.setItem('privacy-notice-dismissed', 'true');
  });

  // Show privacy notice if not dismissed
  if (!localStorage.getItem('privacy-notice-dismissed')) {
    document.getElementById('privacy-notice')?.classList.remove('hidden');
  }
}

/**
 * Handle route changes
 */
async function handleRouteChange(view, params) {
  const container = document.getElementById('app-container');
  if (!container) return;

  showLoading();

  try {
    switch (view) {
    case 'list':
      await renderList(container);
      break;
    case 'new':
      renderNew(container);
      break;
    case 'project':
      await renderProject(container, params.projectId);
      break;
    default:
      await renderList(container);
    }
  } catch (error) {
    console.error('Route change error:', error);
    showToast('Error loading view', 'error');
  } finally {
    hideLoading();
  }
}

async function renderList(container) {
  const projects = await getAllProjects(currentPlugin.dbName);
  container.innerHTML = renderListView(currentPlugin, projects);
  setupListEventHandlers();
}

function renderNew(container) {
  container.innerHTML = renderNewView(currentPlugin);
  setupNewFormEventHandlers();
}

async function renderProject(container, projectId) {
  const project = await getProject(currentPlugin.dbName, projectId);
  if (!project) {
    showToast('Project not found', 'error');
    window.location.hash = '';
    return;
  }

  // Initialize phases object if not present
  if (!project.phases) {
    project.phases = {};
  }

  container.innerHTML = renderProjectView(currentPlugin, project);

  // Populate phase content
  const currentPhase = project.currentPhase || 1;
  const phaseContent = document.getElementById('phase-content');
  if (phaseContent) {
    phaseContent.innerHTML = renderPhaseContent(currentPlugin, project, currentPhase);
  }

  // Attach event listeners
  attachProjectEventListeners(project, currentPhase);
}

function setupListEventHandlers() {
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.delete;
      if (confirm('Delete this project?')) {
        await deleteProject(currentPlugin.dbName, id);
        showToast('Project deleted', 'success');
        window.location.hash = '';
      }
    });
  });
}

function setupNewFormEventHandlers() {
  const form = document.getElementById('new-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = extractFormData(currentPlugin.formFields);
    const validation = validateFormData(currentPlugin.formFields, formData);
    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }
    const project = await saveProject(currentPlugin.dbName, { formData, title: formData.title, currentPhase: 1 });
    showToast('Project created!', 'success');
    window.location.hash = `project/${project.id}`;
  });
}

/**
 * Attach event listeners for project view
 */
function attachProjectEventListeners(project, phase) {
  // Phase tab navigation
  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);
      const freshProject = await getProject(currentPlugin.dbName, project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.currentPhase = targetPhase;
      updatePhaseTabStyles(targetPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(currentPlugin, freshProject, targetPhase);
      attachPhaseEventListeners(freshProject, targetPhase);
    });
  });

  attachPhaseEventListeners(project, phase);
}

/**
 * Update phase tab styles
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
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
function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const exportFinalBtn = document.getElementById('export-final-btn');

  // Copy prompt button
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      try {
        // Build previous responses for prompt generation
        const previousResponses = {
          1: project.phases?.[1]?.response || '',
          2: project.phases?.[2]?.response || ''
        };

        const prompt = await generatePrompt(currentPlugin, phase, project.formData, previousResponses);
        await copyToClipboard(prompt);
        showToast('Prompt copied to clipboard!', 'success');

        // Save prompt to phase data
        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = { prompt: '', response: '', completed: false };
        project.phases[phase].prompt = prompt;
        await saveProject(currentPlugin.dbName, project);

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

        // Enable save button
        if (saveResponseBtn) {
          saveResponseBtn.disabled = false;
        }
      } catch (error) {
        console.error('Failed to copy prompt:', error);
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
    saveResponseBtn.addEventListener('click', async () => {
      const response = responseTextarea?.value?.trim();
      if (!response || response.length < 3) {
        showToast('Please enter a response', 'warning');
        return;
      }

      try {
        // Re-fetch project to get fresh data
        const freshProject = await getProject(currentPlugin.dbName, project.id);
        if (!freshProject.phases) freshProject.phases = {};
        if (!freshProject.phases[phase]) freshProject.phases[phase] = { prompt: '', response: '', completed: false };

        freshProject.phases[phase].response = response;
        freshProject.phases[phase].completed = true;

        // Auto-advance to next phase if not final
        if (phase < 3) {
          freshProject.currentPhase = phase + 1;
          await saveProject(currentPlugin.dbName, freshProject);
          showToast('Response saved! Moving to next phase...', 'success');

          updatePhaseTabStyles(phase + 1);
          document.getElementById('phase-content').innerHTML = renderPhaseContent(currentPlugin, freshProject, phase + 1);
          attachPhaseEventListeners(freshProject, phase + 1);

          // Update tab checkmark for completed phase
          const completedTab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
          if (completedTab && !completedTab.innerHTML.includes('✓')) {
            completedTab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
          }
        } else {
          // Final phase complete
          await saveProject(currentPlugin.dbName, freshProject);
          showToast('Your document is complete!', 'success');

          // Re-render to show completion banner
          document.getElementById('phase-content').innerHTML = renderPhaseContent(currentPlugin, freshProject, phase);
          attachPhaseEventListeners(freshProject, phase);

          // Update tab checkmark
          const completedTab = document.querySelector(`.phase-tab[data-phase="${phase}"]`);
          if (completedTab && !completedTab.innerHTML.includes('✓')) {
            completedTab.innerHTML += '<span class="ml-2 text-green-500">✓</span>';
          }
        }
      } catch (error) {
        console.error('Failed to save response:', error);
        showToast('Failed to save response', 'error');
      }
    });
  }

  // Next phase button
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;
      const freshProject = await getProject(currentPlugin.dbName, project.id);
      freshProject.currentPhase = nextPhase;

      updatePhaseTabStyles(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(currentPlugin, freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Export final document button (Phase 3 complete)
  if (exportFinalBtn) {
    exportFinalBtn.addEventListener('click', async () => {
      const freshProject = await getProject(currentPlugin.dbName, project.id);
      const finalResponse = freshProject.phases?.[3]?.response || '';
      if (finalResponse) {
        await copyToClipboard(finalResponse);
        showToast('Final document copied to clipboard!', 'success');
      } else {
        showToast('No final document to copy', 'warning');
      }
    });
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

async function updateStorageInfo() {
  const projects = await getAllProjects(currentPlugin.dbName);
  const el = document.getElementById('storage-info');
  if (el) el.textContent = `${projects.length} ${currentPlugin.name} project(s) stored locally`;
}

// Load theme
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


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
import { showImportModal } from '../../shared/js/import-document.js';
import { exportAllProjects, importProjects } from '../../shared/js/projects.js';

let currentPlugin = null;
let currentTemplates = [];

/**
 * Load templates for a plugin (if available)
 * @param {string} pluginId
 * @returns {Promise<Object[]>}
 */
async function loadPluginTemplates(pluginId) {
  try {
    const module = await import(`../../plugins/${pluginId}/templates.js`);
    return module.getAllTemplates?.() || module.TEMPLATES || [];
  } catch {
    // No templates for this plugin
    return [];
  }
}

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

  // Export all projects button
  document.getElementById('export-all-btn')?.addEventListener('click', async () => {
    try {
      await exportAllProjects(currentPlugin.dbName, currentPlugin.id);
      showToast('All projects exported', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed', 'error');
    }
  });

  // Import projects button
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const imported = await importProjects(currentPlugin.dbName, file);
          showToast(`Imported ${imported} project(s)`, 'success');
          // Refresh current view if on home page
          if (window.location.hash === '#home' || !window.location.hash) {
            window.location.reload();
          }
        } catch (error) {
          console.error('Import failed:', error);
          showToast('Import failed: ' + error.message, 'error');
        }
      }
    };
    input.click();
  });

  // About link
  document.getElementById('about-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAboutModal();
  });
}

/**
 * Show about modal with plugin-specific content
 */
function showAboutModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.id = 'about-modal';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">About ${currentPlugin?.name || 'DocForgeAI'} Assistant</h3>
      <div class="text-gray-600 dark:text-gray-400 space-y-3">
        <p>A privacy-first tool for creating high-quality documents using AI assistance.</p>
        <p><strong>Features:</strong></p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>100% client-side processing</li>
          <li>No data sent to servers</li>
          <li>3-phase adversarial AI workflow</li>
          <li>Multiple project management</li>
          <li>Import/export capabilities</li>
          <li>9 document types supported</li>
        </ul>
        <p class="text-sm">All your data stays in your browser's local storage.</p>
      </div>
      <div class="flex justify-end mt-6">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors close-about-btn">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-about-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
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
      await renderNew(container);
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

async function renderNew(container) {
  currentTemplates = await loadPluginTemplates(currentPlugin.id);
  container.innerHTML = renderNewView(currentPlugin, {}, currentTemplates);
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
  // Project card clicks - navigate to project
  document.querySelectorAll('[data-project-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't navigate if clicking delete or preview buttons
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        const projectId = card.dataset.projectId;
        window.location.hash = `project/${projectId}`;
      }
    });
  });

  // Delete button clicks
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.delete;
      if (confirm('Delete this project?')) {
        await deleteProject(currentPlugin.dbName, id);
        showToast('Project deleted', 'success');
        // Re-render the list directly (hash may already be empty, so hashchange won't fire)
        const container = document.getElementById('app-container');
        if (container) {
          await renderList(container);
        }
      }
    });
  });

  // Preview button clicks (for completed projects)
  document.querySelectorAll('.preview-project-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = await getProject(currentPlugin.dbName, projectId);
      if (project?.phases?.[3]?.response) {
        await copyToClipboard(project.phases[3].response);
        showToast('Final document copied to clipboard!', 'success');
      } else {
        showToast('No final document to copy', 'warning');
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

  // Template selection handlers
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const template = currentTemplates.find(t => t.id === templateId);

      // Update button styling
      document.querySelectorAll('.template-btn').forEach(b => {
        b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        b.classList.add('border-gray-200', 'dark:border-gray-600');
      });
      btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
      btn.classList.remove('border-gray-200', 'dark:border-gray-600');

      // Pre-fill form fields from template
      if (template && template.fields) {
        Object.keys(template.fields).forEach(fieldId => {
          const input = document.getElementById(fieldId);
          if (input) {
            input.value = template.fields[fieldId];
          }
        });
      }
    });
  });

  // Import button handler
  const importBtn = document.getElementById('import-doc-btn');
  importBtn?.addEventListener('click', () => {
    showImportModal(currentPlugin, saveProject, (project) => {
      window.location.hash = `project/${project.id}`;
    });
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


/**
 * Main Application Module for DocForgeAI Assistant
 * @module app
 */

import { getCurrentPlugin, initRouter } from '../../shared/js/router.js';
// Plugin registry available for future use
// import { getPlugin } from '../../shared/js/plugin-registry.js';
import { saveProject, getProject, getAllProjects, deleteProject } from '../../shared/js/storage.js';
import { extractFormData, validateFormData } from '../../shared/js/form-generator.js';
import { renderListView, renderNewView, renderProjectView } from '../../shared/js/views.js';
import { showToast, showLoading, hideLoading } from '../../shared/js/ui.js';

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
  container.innerHTML = renderProjectView(currentPlugin, project);
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


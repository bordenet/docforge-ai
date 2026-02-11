/**
 * Main Application Module for DocForgeAI Assistant
 * @module app
 *
 * This is the application entry point that orchestrates the UI.
 *
 * ## Structure
 *
 * - `app.js` - Initialization, routing, global event setup
 * - `app-handlers.js` - List, form, and project event handlers
 * - `app-phases.js` - Phase navigation and response saving
 *
 * ## Data Flow
 *
 * URL hash → Router → handleRouteChange → render[View] → attachEventListeners
 *
 * ## State
 *
 * - `currentPlugin` - Active document type plugin (from URL ?type=)
 * - `currentTemplates` - Templates for the current plugin
 * - Projects stored in IndexedDB via storage.js
 */

import { getCurrentPlugin, initRouter } from '../../shared/js/router.js';
import { getProject, getAllProjects } from '../../shared/js/storage.js';
import { renderListView, renderNewView, renderProjectView, renderPhaseContent } from '../../shared/js/views.js';
import { showToast, showLoading, hideLoading } from '../../shared/js/ui.js';
import { logger } from '../../shared/js/logger.js';
import { setupListEventHandlers, setupNewFormEventHandlers, attachProjectEventListeners } from './app-handlers.js';
import { setupGlobalEventListeners } from './app-global.js';

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
    setupGlobalEventListeners(currentPlugin, toggleTheme);

    // Initialize router
    initRouter(handleRouteChange);

    // Update storage info
    updateStorageInfo();

    logger.info(`App initialized with plugin: ${currentPlugin.id}`, 'app');
  } catch (error) {
    logger.error('Failed to initialize app', error, 'app');
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
    logger.error('Route change error', error, 'app');
    showToast('Error loading view', 'error');
  } finally {
    hideLoading();
  }
}

async function renderList(container) {
  const projects = await getAllProjects(currentPlugin.dbName);
  container.innerHTML = renderListView(currentPlugin, projects);
  setupListEventHandlers(currentPlugin, renderList);
}

async function renderNew(container) {
  currentTemplates = await loadPluginTemplates(currentPlugin.id);
  container.innerHTML = renderNewView(currentPlugin, {}, currentTemplates);
  setupNewFormEventHandlers(currentPlugin, currentTemplates);
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
  attachProjectEventListeners(currentPlugin, project, currentPhase);
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem(
    'theme',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
}

async function updateStorageInfo() {
  const projects = await getAllProjects(currentPlugin.dbName);
  const el = document.getElementById('storage-info');
  if (el) el.textContent = `${projects.length} ${currentPlugin.name} project(s) stored locally`;
}

// Load theme
if (
  localStorage.getItem('theme') === 'dark' ||
  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark');
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

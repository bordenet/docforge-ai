/**
 * Views Module - Generates HTML for different views based on plugin config
 * @module views
 */

import { generateFormFields } from './form-generator.js';
import { escapeHtml, formatDate } from './ui.js';

/**
 * Render the project list view
 * @param {Object} plugin - Current plugin config
 * @param {Object[]} projects - Array of projects
 * @returns {string} HTML
 */
export function renderListView(plugin, projects) {
  const projectCards = projects.length === 0
    ? `<div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <p class="text-lg mb-4">No ${plugin.name} projects yet</p>
        <a href="#new" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span class="mr-2">+</span> Create Your First ${plugin.name}
        </a>
      </div>`
    : `<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${projects.map(p => renderProjectCard(p, plugin)).join('')}
      </div>`;

  return `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        ${plugin.icon} Your ${plugin.name} Projects
      </h2>
      <a href="#new" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <span class="mr-2">+</span> New ${plugin.name}
      </a>
    </div>
    ${projectCards}
  `;
}

/**
 * Render a project card
 * @param {Object} project - Project data
 * @param {Object} plugin - Plugin config
 * @returns {string} HTML
 */
function renderProjectCard(project, _plugin) {
  const title = project.title || project.formData?.title || 'Untitled';
  const phase = project.currentPhase || 1;
  const phaseLabel = phase > 3 ? 'Complete' : `Phase ${phase}`;

  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <a href="#project/${project.id}" class="block">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 dark:text-white truncate">${escapeHtml(title)}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${formatDate(project.updatedAt)}</p>
          </div>
          <span class="ml-2 px-2 py-1 text-xs rounded ${phase > 3 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
            ${phaseLabel}
          </span>
        </div>
      </a>
      <div class="mt-3 flex justify-end space-x-2">
        <button type="button" class="text-sm text-red-600 hover:text-red-800 dark:text-red-400" data-delete="${project.id}">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Render the new project form view
 * @param {Object} plugin - Current plugin config
 * @param {Object} [existingData] - Existing form data (for editing)
 * @returns {string} HTML
 */
export function renderNewView(plugin, existingData = {}) {
  const formFields = generateFormFields(plugin.formFields, existingData);

  return `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          ${plugin.icon} New ${plugin.name}
        </h2>
        <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-800">← Back to list</a>
      </div>

      <form id="new-project-form" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        ${formFields}

        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a href="#" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 rounded-lg">Cancel</a>
          <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start ${plugin.name} Workflow
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * Render the project detail view (workflow phases)
 * @param {Object} plugin - Current plugin config
 * @param {Object} project - Project data
 * @returns {string} HTML
 */
export function renderProjectView(plugin, project) {
  const title = project.title || project.formData?.title || 'Untitled';
  const currentPhase = project.currentPhase || 1;
  const phases = plugin.workflowConfig?.phases || [];

  const phaseIndicators = phases.map((phase, _idx) => {
    const num = phase.number;
    const isComplete = currentPhase > num;
    const isActive = currentPhase === num;
    const cls = isComplete ? 'text-green-600' : isActive ? 'text-blue-600 font-semibold' : 'text-gray-400';
    const icon = isComplete ? '✓' : isActive ? '→' : '○';
    return `<span class="${cls}">${icon} Phase ${num}: ${phase.name}</span>`;
  }).join('<span class="mx-2 text-gray-300">|</span>');

  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-800">← Back to list</a>
        <div class="text-sm">${phaseIndicators}</div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">${escapeHtml(title)}</h2>

        <div id="phase-content">
          <!-- Phase content rendered by app.js -->
        </div>
      </div>
    </div>
  `;
}


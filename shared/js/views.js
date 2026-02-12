/**
 * Views Module - Generates HTML for different views based on plugin config
 * @module views
 */

import { generateFormFields } from './form-generator.js';
import { escapeHtml } from './ui.js';
import { renderProjectCard } from './views-cards.js';
import { renderPhaseContent } from './views-phase.js';

// Re-export for backward compatibility
export { renderProjectCard, renderPhaseContent };

/**
 * Render the plugin name with an optional hyperlink to documentation
 * @param {Object} plugin - Plugin config
 * @param {string} [displayText] - Optional custom display text (defaults to plugin.name)
 * @returns {string} HTML - either a hyperlink or plain text
 */
function renderPluginNameLink(plugin, displayText = null) {
  const text = displayText || plugin.name;
  if (plugin.docsUrl) {
    return `<a href="${plugin.docsUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">${escapeHtml(text)}</a>`;
  }
  return escapeHtml(text);
}

/**
 * Get phase metadata from plugin config
 * @param {Object} plugin - Plugin config
 * @param {number} phaseNumber - Phase number
 * @returns {Object} Phase metadata
 */
export function getPhaseMetadata(plugin, phaseNumber) {
  const phases = plugin.workflowConfig?.phases || [];
  return (
    phases.find((p) => p.number === phaseNumber) || {
      number: phaseNumber,
      name: `Phase ${phaseNumber}`,
      icon: '📝',
      aiModel: 'Claude',
      description: `Complete phase ${phaseNumber}`,
    }
  );
}

/**
 * Render the project list view
 * @param {Object} plugin - Current plugin config
 * @param {Object[]} projects - Array of projects
 * @returns {string} HTML
 */
export function renderListView(plugin, projects) {
  const pluginNameLink = renderPluginNameLink(plugin);
  const projectCards =
    projects.length === 0
      ? `<div class="text-center py-12 text-gray-500 dark:text-gray-400">
        <p class="text-lg mb-4">No projects yet</p>
        <a href="#new" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span class="mr-2">+</span> Create Your First Project
        </a>
      </div>`
      : `<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        ${projects.map((p) => renderProjectCard(p)).join('')}
      </div>`;

  return `
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        ${plugin.icon} Your Projects
      </h2>
      <a href="#new" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        <span class="mr-2">+</span> New ${pluginNameLink}
      </a>
    </div>
    ${projectCards}
  `;
}

/**
 * Render the new project form view
 * @param {Object} plugin - Current plugin config
 * @param {Object} [existingData] - Existing form data (for editing)
 * @param {Object[]} [templates] - Optional array of templates for this plugin
 * @returns {string} HTML
 */
export function renderNewView(plugin, existingData = {}, templates = []) {
  const formFields = generateFormFields(plugin.formFields, existingData);

  // Template selector (only if templates provided)
  // Import tile is always shown when templates are available
  const importTile = `
    <button type="button"
      id="import-doc-btn"
      class="p-3 border-2 border-dashed rounded-lg text-center transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 border-gray-300 dark:border-gray-600">
      <span class="text-2xl block mb-1">📥</span>
      <span class="text-sm font-medium text-gray-900 dark:text-white block">Import Existing</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">Paste from Word/Docs</span>
    </button>
  `;

  const templateSelector =
    templates.length > 0
      ? `
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Choose a Template
      </label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3" id="template-selector">
        ${templates
          .map(
            (t) => `
          <button type="button"
            class="template-btn p-3 border-2 rounded-lg text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${t.id === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}"
            data-template-id="${t.id}">
            <span class="text-2xl block mb-1">${t.icon}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white block">${escapeHtml(t.name)}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(t.description)}</span>
          </button>
        `
          )
          .join('')}
        ${importTile}
      </div>
    </div>
  `
      : '';

  const pluginNameLink = renderPluginNameLink(plugin);

  return `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          ${plugin.icon} New ${pluginNameLink}
        </h2>
        <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-gray-800">← Back to list</a>
      </div>

      <form id="new-project-form" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        ${templateSelector}

        <div id="form-fields-container">
          ${formFields}
        </div>

        <div class="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a href="#" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 rounded-lg">Cancel</a>
          <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Start ${pluginNameLink} Workflow
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
  const pluginNameLink = renderPluginNameLink(plugin);

  // Generate phase tabs
  const phaseTabs = phases
    .map((phase) => {
      const num = phase.number;
      const isComplete = project.phases?.[num]?.completed || false;
      const isActive = currentPhase === num;
      const activeClass = isActive
        ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200';
      return `
      <button class="phase-tab px-6 py-3 font-medium transition-colors ${activeClass}" data-phase="${num}">
        <span class="mr-2">${phase.icon}</span>
        Phase ${num}
        ${isComplete ? '<span class="ml-2 text-green-500">✓</span>' : ''}
      </button>
    `;
    })
    .join('');

  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to ${pluginNameLink} Projects
        </a>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">${escapeHtml(title)}</h2>
      </div>

      <!-- Phase Tabs -->
      <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex space-x-1">
          ${phaseTabs}
        </div>
      </div>

      <!-- Phase Content -->
      <div id="phase-content">
        <!-- Populated by renderPhaseContent -->
      </div>
    </div>
  `;
}

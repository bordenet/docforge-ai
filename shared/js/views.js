/**
 * Views Module - Generates HTML for different views based on plugin config
 * @module views
 */

import { generateFormFields } from './form-generator.js';
import { escapeHtml, formatDate } from './ui.js';

/**
 * Get phase metadata from plugin config
 * @param {Object} plugin - Plugin config
 * @param {number} phaseNumber - Phase number
 * @returns {Object} Phase metadata
 */
export function getPhaseMetadata(plugin, phaseNumber) {
  const phases = plugin.workflowConfig?.phases || [];
  return phases.find(p => p.number === phaseNumber) || {
    number: phaseNumber,
    name: `Phase ${phaseNumber}`,
    icon: '📝',
    aiModel: 'Claude',
    description: `Complete phase ${phaseNumber}`
  };
}

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
        ${projects.map(p => renderProjectCard(p)).join('')}
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
 * @returns {string} HTML
 */
function renderProjectCard(project) {
  const title = project.title || project.formData?.title || 'Untitled';

  // Calculate phase completion
  const isComplete = project.phases &&
    project.phases[1]?.completed &&
    project.phases[2]?.completed &&
    project.phases[3]?.completed;

  const completedPhases = [1, 2, 3].filter(p => project.phases?.[p]?.completed).length;

  // Get a description from form data if available
  const description = project.formData?.problemStatement ||
    project.formData?.description ||
    project.formData?.context ||
    '';

  // Progress bar segments
  const progressBar = [1, 2, 3].map(phase => {
    const isPhaseComplete = project.phases?.[phase]?.completed;
    const currentPhase = project.currentPhase || 1;
    const isCurrent = phase === currentPhase && !isPhaseComplete;
    const colorClass = isPhaseComplete ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600';
    return `<div class="flex-1 h-1.5 rounded ${colorClass}"></div>`;
  }).join('');

  return `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
            ${escapeHtml(title)}
          </h3>
          <div class="flex items-center space-x-2">
            ${isComplete ? `
            <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            ` : ''}
            <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-delete="${project.id}" title="Delete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-3">
          <div class="flex items-center space-x-1 mb-1">
            ${progressBar}
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">${completedPhases}/3 phases complete</span>
        </div>

        ${description ? `
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          ${escapeHtml(description)}
        </p>
        ` : ''}

        <div class="text-xs text-gray-500 dark:text-gray-400">
          Updated ${formatDate(project.updatedAt)}
        </div>
      </div>
    </div>
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

  const templateSelector = templates.length > 0 ? `
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Choose a Template
      </label>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3" id="template-selector">
        ${templates.map(t => `
          <button type="button"
            class="template-btn p-3 border-2 rounded-lg text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${t.id === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}"
            data-template-id="${t.id}">
            <span class="text-2xl block mb-1">${t.icon}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-white block">${escapeHtml(t.name)}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(t.description)}</span>
          </button>
        `).join('')}
        ${importTile}
      </div>
    </div>
  ` : '';

  return `
    <div class="max-w-3xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          ${plugin.icon} New ${plugin.name}
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

  // Generate phase tabs
  const phaseTabs = phases.map((phase) => {
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
  }).join('');

  return `
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to ${plugin.name} Projects
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

/**
 * Render content for a specific phase
 * @param {Object} plugin - Plugin config
 * @param {Object} project - Project data
 * @param {number} phase - Phase number
 * @returns {string} HTML
 */
export function renderPhaseContent(plugin, project, phase) {
  const meta = getPhaseMetadata(plugin, phase);
  const phaseData = project.phases?.[phase] || { prompt: '', response: '', completed: false };
  const colorMap = { 1: 'blue', 2: 'green', 3: 'purple' };
  const color = colorMap[phase] || 'blue';

  // Completion banner for Phase 3
  let completionBanner = '';
  if (phase === 3 && phaseData.completed) {
    completionBanner = `
      <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
              <span class="mr-2">🎉</span> Your ${plugin.name} is Complete!
            </h4>
            <p class="text-green-700 dark:text-green-400 mt-1">
              You can copy the final document or validate it.
            </p>
          </div>
          <div class="flex gap-3">
            <button id="export-final-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              📋 Copy Final Document
            </button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    ${completionBanner}
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ${meta.icon} ${meta.name}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          ${meta.description}
        </p>
        <div class="inline-flex items-center px-3 py-1 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-300 rounded-full text-sm">
          <span class="mr-2">🤖</span>
          Use with ${meta.aiModel}
        </div>
      </div>

      <!-- Step A: Generate Prompt -->
      <div class="mb-6">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step A: Copy Prompt to AI
        </h4>
        <div class="flex gap-3 flex-wrap">
          <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            📋 ${phaseData.prompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
          </button>
          <a
            id="open-ai-btn"
            href="${phase === 2 ? 'https://gemini.google.com' : 'https://claude.ai'}"
            target="ai-assistant-tab"
            rel="noopener noreferrer"
            class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${phaseData.prompt ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed pointer-events-none'}"
            ${phaseData.prompt ? '' : 'aria-disabled="true"'}
          >
            🔗 Open ${phase === 2 ? 'Gemini' : 'Claude'}
          </a>
        </div>
      </div>

      <!-- Step B: Paste Response -->
      <div>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Step B: Paste ${meta.aiModel}'s Response
        </h4>
        <textarea
          id="response-textarea"
          rows="12"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          placeholder="Paste ${meta.aiModel}'s response here..."
          ${!phaseData.prompt ? 'disabled' : ''}
        >${escapeHtml(phaseData.response || '')}</textarea>

        <div class="mt-3 flex justify-between items-center">
          ${phaseData.completed && phase < 3 ? `
            <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Next Phase →
            </button>
          ` : phase < 3 ? `
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${phaseData.prompt ? 'Paste response to complete this phase' : 'Copy prompt first, then paste response'}
            </span>
          ` : '<span></span>'}
          <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" ${!phaseData.prompt ? 'disabled' : ''}>
            Save Response
          </button>
        </div>
      </div>
    </div>
  `;
}


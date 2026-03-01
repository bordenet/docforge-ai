/**
 * Validator Application Module
 * Main entry point for the validator application
 * @module validator-app
 */

import { getCurrentDocumentType } from '../../shared/js/router.js';
import { getPlugin } from '../../shared/js/plugin-registry.js';
import { showToast, escapeHtml, setupGlobalErrorHandler } from '../../shared/js/ui.js';
import { validateDocument } from '../../shared/js/validator.js';
import { logger } from '../../shared/js/logger.js';
import { toggleDarkMode, initTheme } from '../../shared/js/theme.js';
// Display functions
import { updateScoreDisplay, renderSlopDetection, renderIssues, renderExpansionStubs } from './app-display.js';
// AI Power-ups functions
import {
  initPowerups,
  handleCritique,
  handleRewrite,
  handleViewPrompt,
} from './app-powerups.js';
// LLM Scoring Mode functions
import {
  initLLMMode,
  toggleScoringMode,
  handleCopyLLMPrompt,
  handleViewLLMPrompt,
} from './app-llm-mode.js';

// Setup global error handler for uncaught errors
setupGlobalErrorHandler();

let currentPlugin = null;
let currentResult = null;
let currentPrompt = null;

// State accessor functions for modules
function getState() {
  return { plugin: currentPlugin, result: currentResult };
}

function setPrompt(prompt) {
  currentPrompt = prompt;
}

/**
 * Initialize the validator
 */
function initValidator() {
  // Initialize theme before rendering
  initTheme();

  // Get current plugin from URL
  const docType = getCurrentDocumentType();
  currentPlugin = getPlugin(docType) || getPlugin('one-pager');

  // Initialize sub-modules with state accessors
  initPowerups(getState, setPrompt);
  initLLMMode(getState, setPrompt);

  // Update UI for current plugin
  updateHeader(currentPlugin);
  renderDimensionScores(currentPlugin);
  setupEventListeners();
  setupDocTypeSelector();

  logger.info(`Validator initialized for: ${currentPlugin.id}`, 'validator');
}

/**
 * Update header for current document type
 */
function updateHeader(plugin) {
  document.getElementById('header-icon').textContent = plugin.icon;
  document.getElementById('header-title').textContent = `${plugin.name} Validator`;
  document.getElementById('doc-type-label').textContent = plugin.name;
  document.title = `${plugin.name} Validator - DocForgeAI`;

  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${plugin.icon}</text></svg>`;
  }

  const helpText = document.getElementById('editor-help');
  if (helpText) {
    helpText.textContent = `Generate a ${plugin.name} with the Assistant, then paste the markdown here.`;
  }
}

/**
 * Render scoring dimension placeholders
 */
function renderDimensionScores(plugin) {
  const container = document.getElementById('dimension-scores');
  if (!container) return;

  const html = plugin.scoringDimensions
    .map(
      (dim) => `
    <div class="dimension-row">
      <div class="flex justify-between items-center mb-1">
        <span class="text-sm font-medium text-slate-300">${escapeHtml(dim.name)}</span>
        <span class="text-sm text-slate-400">
          <span class="dim-score" data-dim="${escapeHtml(dim.name)}">--</span>/${dim.maxPoints}
        </span>
      </div>
      <div class="w-full bg-slate-700 rounded-full h-2">
        <div class="dim-bar bg-blue-500 h-2 rounded-full transition-all duration-300" data-dim="${escapeHtml(dim.name)}" style="width: 0%"></div>
      </div>
      <p class="text-xs text-slate-500 mt-1">${escapeHtml(dim.description)}</p>
    </div>
  `
    )
    .join('');

  container.innerHTML = html;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const editor = document.getElementById('editor');
  const validateBtn = document.getElementById('btn-validate');
  const clearBtn = document.getElementById('btn-clear');
  const darkModeBtn = document.getElementById('btn-dark-mode');

  validateBtn?.addEventListener('click', () => runValidation());
  clearBtn?.addEventListener('click', () => clearEditor());
  darkModeBtn?.addEventListener('click', () => toggleDarkMode());

  // Auto-validate on paste
  editor?.addEventListener('paste', () => {
    setTimeout(() => runValidation(), 100);
  });

  // AI Power-ups
  document.getElementById('btn-critique')?.addEventListener('click', handleCritique);
  document.getElementById('btn-rewrite')?.addEventListener('click', handleRewrite);
  document.getElementById('btn-view-prompt')?.addEventListener('click', () => handleViewPrompt(currentPrompt));

  // LLM Scoring Mode
  document.getElementById('btn-toggle-mode')?.addEventListener('click', toggleScoringMode);
  document.getElementById('btn-copy-llm-prompt')?.addEventListener('click', handleCopyLLMPrompt);
  document.getElementById('btn-view-llm-prompt')?.addEventListener('click', () => handleViewLLMPrompt(currentPrompt));
}

/**
 * Setup document type selector
 */
function setupDocTypeSelector() {
  const selector = document.getElementById('doc-type-selector');
  if (!selector) return;

  selector.value = currentPlugin.id;

  selector.addEventListener('change', (e) => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', e.target.value);
    window.location.href = url.toString();
  });
}

/**
 * Validate the document using shared validator module
 */
function runValidation() {
  const editor = document.getElementById('editor');
  const content = editor?.value?.trim() || '';

  if (!content) {
    showToast('Please paste a document to validate', 'info');
    return;
  }

  // Use the shared validator module
  currentResult = validateDocument(content, currentPlugin);
  updateScoreDisplay(currentResult, currentPlugin);
  renderSlopDetection(currentResult.slopDetection);
  renderExpansionStubs(currentResult.expansionStubs);
  renderIssues(currentResult.issues);

  // Show AI power-ups if content is substantial
  const aiPowerups = document.getElementById('ai-powerups');
  if (aiPowerups && content.length > 200) {
    aiPowerups.classList.remove('hidden');
  }

  showToast('Document validated!', 'success');
}

function clearEditor() {
  const editor = document.getElementById('editor');
  if (editor) editor.value = '';
  document.getElementById('score-total').textContent = '--';
  document.querySelectorAll('.dim-score').forEach((el) => (el.textContent = '--'));
  document.querySelectorAll('.dim-bar').forEach((el) => (el.style.width = '0%'));
  document.getElementById('score-badge').textContent = 'Paste a document to score';
  currentResult = null;
  currentPrompt = null;
  document.getElementById('ai-powerups')?.classList.add('hidden');
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}

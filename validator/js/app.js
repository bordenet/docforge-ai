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

function toggleDarkMode() {
  const html = document.documentElement;
  const body = document.body;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    // Switch to light mode
    html.classList.remove('dark');
    body.classList.remove('bg-slate-950', 'text-slate-100');
    body.classList.add('bg-white', 'text-slate-900');
    // Update header
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-600', 'border-slate-500');
      header.classList.add('bg-slate-200', 'border-slate-300');
    }
    // Update panels
    document.querySelectorAll('.bg-slate-900').forEach(el => {
      el.classList.remove('bg-slate-900');
      el.classList.add('bg-slate-100');
    });
    document.querySelectorAll('.bg-slate-800').forEach(el => {
      el.classList.remove('bg-slate-800');
      el.classList.add('bg-slate-200');
    });
    document.querySelectorAll('.border-slate-800').forEach(el => {
      el.classList.remove('border-slate-800');
      el.classList.add('border-slate-300');
    });
    // Update button icon to sun
    const darkModeBtn = document.getElementById('btn-dark-mode');
    if (darkModeBtn) {
      darkModeBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
      </svg>`;
    }
    localStorage.setItem('docforge-theme', 'light');
  } else {
    // Switch to dark mode
    html.classList.add('dark');
    body.classList.remove('bg-white', 'text-slate-900');
    body.classList.add('bg-slate-950', 'text-slate-100');
    // Update header
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-200', 'border-slate-300');
      header.classList.add('bg-slate-600', 'border-slate-500');
    }
    // Update panels
    document.querySelectorAll('.bg-slate-100').forEach(el => {
      el.classList.remove('bg-slate-100');
      el.classList.add('bg-slate-900');
    });
    document.querySelectorAll('.bg-slate-200').forEach(el => {
      el.classList.remove('bg-slate-200');
      el.classList.add('bg-slate-800');
    });
    document.querySelectorAll('.border-slate-300').forEach(el => {
      el.classList.remove('border-slate-300');
      el.classList.add('border-slate-800');
    });
    // Update button icon to moon
    const darkModeBtn = document.getElementById('btn-dark-mode');
    if (darkModeBtn) {
      darkModeBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>`;
    }
    localStorage.setItem('docforge-theme', 'dark');
  }
}

/**
 * Initialize theme based on saved preference or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem('docforge-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Default is dark mode (as designed), so only switch to light if explicitly set
  if (savedTheme === 'light') {
    // Start in dark (default), then toggle to light
    document.documentElement.classList.add('dark');
    toggleDarkMode();
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}

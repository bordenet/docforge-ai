/**
 * Validator Application Module
 * Main entry point for the validator application
 * @module validator-app
 */

import {
  getCurrentDocumentType,
  getProjectIdFromQuery,
  getPhaseFromQuery,
} from '../../shared/js/router.js';
import { getPlugin } from '../../shared/js/plugin-registry.js';
import { showToast, escapeHtml, setupGlobalErrorHandler } from '../../shared/js/ui.js';
import { validateDocument } from '../../shared/js/validator.js';
import { logger } from '../../shared/js/logger.js';
import { toggleDarkMode, initTheme } from '../../shared/js/theme.js';
import { createStorage } from '../../shared/js/validator-storage.js';
import { getProject } from '../../shared/js/storage.js';
import { getPhaseOutputInternal } from '../../shared/js/workflow-config.js';
import { initAnalytics, trackValidation } from '../../shared/js/analytics.js';
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
let storage = null; // Initialized per document type

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
async function initValidator() {
  // Initialize theme before rendering
  initTheme();

  // Get current plugin from URL
  const docType = getCurrentDocumentType();
  currentPlugin = getPlugin(docType) || getPlugin('one-pager');

  // Initialize storage with document-type-specific key
  storage = createStorage(`${currentPlugin.id}-validator-history`);

  // Initialize sub-modules with state accessors
  initPowerups(getState, setPrompt);
  initLLMMode(getState, setPrompt);

  const attachedProjectId = getProjectIdFromQuery();
  const phaseFromQuery = getPhaseFromQuery();
  const attachedPhase = attachedProjectId ? phaseFromQuery || 3 : null;

  // Update UI for current plugin
  updateHeader(currentPlugin, { attachedProjectId });
  renderDimensionScores(currentPlugin);
  setupEventListeners();
  setupDocTypeSelector();

  // Initialize analytics (tracks tool open)
  initAnalytics();

  const editor = document.getElementById('editor');

  if (attachedProjectId && editor) {
    const { markdown, error } = await loadAttachedMarkdown({
      plugin: currentPlugin,
      projectId: attachedProjectId,
      phase: attachedPhase || 3,
    });

    if (markdown) {
      editor.value = markdown;
      runValidation();
    } else {
      // Milestone 4 adds a dedicated UX state; for now we warn and fall back to standalone draft.
      showToast(error || 'Unable to load project document', 'warning');
      const draft = storage.loadDraft();
      if (draft && draft.markdown) {
        editor.value = draft.markdown;
        runValidation();
      }
    }
  } else {
    // Standalone mode: Load saved draft if available
    const draft = storage.loadDraft();
    if (draft && draft.markdown && editor) {
      editor.value = draft.markdown;
      // Run validation on restored content
      runValidation();
    }
  }
  updateVersionDisplay();

  logger.info(`Validator initialized for: ${currentPlugin.id}`, 'validator');
}

/**
 * Update header for current document type
 */
function updateHeader(plugin, { attachedProjectId } = {}) {
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
    helpText.textContent = attachedProjectId
      ? `Loaded from Assistant project storage (ID: ${attachedProjectId}).`
      : `Generate a ${plugin.name} with the Assistant, then paste the markdown here.`;
  }

  const attachedBadge = document.getElementById('attached-badge');
  if (attachedBadge) {
    if (attachedProjectId) {
      attachedBadge.classList.remove('hidden');
    } else {
      attachedBadge.classList.add('hidden');
    }
  }
}

async function loadAttachedMarkdown({ plugin, projectId, phase }) {
  try {
    const project = await getProject(plugin.dbName, projectId);
    if (!project) return { markdown: '', error: 'Project not found' };

    const markdown = getPhaseOutputInternal(project, phase);
    if (!markdown || !markdown.trim()) {
      return { markdown: '', error: `Phase ${phase} output is empty` };
    }

    return { markdown, error: null };
  } catch (error) {
    logger.error('Failed to load attached project markdown', error, 'validator');
    return { markdown: '', error: 'Unable to access project storage' };
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

// ============================================================
// Version Control
// ============================================================

function updateVersionDisplay() {
  const versionInfo = document.getElementById('version-info');
  const lastSaved = document.getElementById('last-saved');
  const btnBack = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');

  if (!storage) return;

  const version = storage.getCurrentVersion();
  if (version) {
    if (versionInfo) versionInfo.textContent = `Version ${version.versionNumber} of ${version.totalVersions}`;
    if (lastSaved) lastSaved.textContent = storage.getTimeSince(version.savedAt);
    if (btnBack) btnBack.disabled = !version.canGoBack;
    if (btnForward) btnForward.disabled = !version.canGoForward;
  } else {
    if (versionInfo) versionInfo.textContent = 'No saved versions';
    if (lastSaved) lastSaved.textContent = '';
    if (btnBack) btnBack.disabled = true;
    if (btnForward) btnForward.disabled = true;
  }
}

function handleSave() {
  const editor = document.getElementById('editor');
  const content = editor?.value || '';

  if (!content.trim()) {
    showToast('Nothing to save', 'warning');
    return;
  }

  const result = storage.saveVersion(content);
  if (result.success) {
    showToast(`Saved as version ${result.versionNumber}`, 'success');
    updateVersionDisplay();
  } else if (result.reason === 'no-change') {
    showToast('No changes to save', 'info');
  } else {
    showToast('Failed to save', 'error');
  }
}

function handleGoBack() {
  const editor = document.getElementById('editor');
  const version = storage.goBack();
  if (version && editor) {
    editor.value = version.markdown;
    runValidation();
    updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info');
  }
}

function handleGoForward() {
  const editor = document.getElementById('editor');
  const version = storage.goForward();
  if (version && editor) {
    editor.value = version.markdown;
    runValidation();
    updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info');
  }
}

// ============================================================
// Event Listeners
// ============================================================

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

  // About button
  document.getElementById('btn-about')?.addEventListener('click', () => showAboutModal(currentPlugin));

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

  // Version control
  document.getElementById('btn-save')?.addEventListener('click', handleSave);
  document.getElementById('btn-back')?.addEventListener('click', handleGoBack);
  document.getElementById('btn-forward')?.addEventListener('click', handleGoForward);

  // Keyboard shortcut: Ctrl/Cmd+S to save
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  });

  // Update version display periodically (every 60 seconds)
  setInterval(updateVersionDisplay, 60000);
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

  // Track validation event
  trackValidation('validate', currentPlugin.id, currentResult.totalScore);

  // Show AI power-ups if content is substantial (>200 chars)
  const aiPowerups = document.getElementById('ai-powerups');
  if (aiPowerups) {
    if (content.length > 200) {
      aiPowerups.classList.remove('hidden');
    } else {
      aiPowerups.classList.add('hidden');
    }
  }

  const message = content.length > 200
    ? 'Document validated!'
    : 'Document validated! (AI Power-ups require 200+ characters)';
  showToast(message, 'success');
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

// ============================================================
// About Modal
// ============================================================

/**
 * Show about modal with plugin-specific content for the validator
 * @param {Object} plugin - Current plugin configuration
 */
function showAboutModal(plugin) {
  // Remove existing modal if any
  const existing = document.getElementById('about-modal');
  if (existing) existing.remove();

  // Plugin-specific metadata for About modal
  const pluginMeta = {
    'one-pager': {
      pluralName: 'One-Pagers',
      learnMoreText: 'one-pagers',
      description: 'A concise decision document that fits on one page. Used to get executive buy-in before investing in detailed planning.'
    },
    'prd': {
      pluralName: 'Product Requirements Documents',
      learnMoreText: 'PRDs',
      description: 'A Product Requirements Document defines WHAT to build and WHY. It bridges business goals and engineering implementation.'
    },
    'adr': {
      pluralName: 'Architecture Decision Records',
      learnMoreText: 'ADRs',
      description: 'Architecture Decision Records capture significant technical decisions, their context, and consequences. Essential for team knowledge sharing.'
    },
    'pr-faq': {
      pluralName: 'PR-FAQs',
      learnMoreText: 'PR-FAQs',
      description: 'An Amazon-style internal planning document. NOT an actual press release. It is a thinking tool that forces customer-centric product definition.'
    },
    'power-statement': {
      pluralName: 'Power Statements',
      learnMoreText: 'power statements',
      description: 'A sales technique for articulating value. Combines a customer pain point with quantified business impact to create compelling pitches.'
    },
    'acceptance-criteria': {
      pluralName: 'Acceptance Criteria',
      learnMoreText: 'acceptance criteria',
      description: 'Testable conditions that define when a user story is complete. Bridges the gap between requirements and QA.'
    },
    'jd': {
      pluralName: 'Job Descriptions',
      learnMoreText: 'job descriptions',
      description: 'Complete job descriptions with clear scope, leveling criteria, and realistic qualifications. Avoids common pitfalls that repel good candidates.'
    },
    'business-justification': {
      pluralName: 'Business Justifications',
      learnMoreText: 'business justifications',
      description: 'A business case document for headcount, budget, or investment requests. Quantifies ROI and risk.'
    },
    'strategic-proposal': {
      pluralName: 'Strategic Proposals',
      learnMoreText: 'sales proposals',
      description: 'A sales-focused proposal for strategic initiatives. Structures the pitch around customer pain points and measurable outcomes.'
    }
  };

  const meta = pluginMeta[plugin?.id] || {};
  const description = meta.description || plugin?.description || 'Validate your documents.';
  const pluralName = meta.pluralName || plugin?.name || 'Documents';
  const learnMoreText = meta.learnMoreText || plugin?.name?.toLowerCase() || 'this document type';
  const docsLink = plugin?.docsUrl
    ? `<p class="text-sm"><a href="${plugin.docsUrl}" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">📚 Learn more about ${escapeHtml(learnMoreText)} →</a></p>`
    : '';

  const modal = document.createElement('div');
  modal.id = 'about-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${plugin?.icon || '✓'} About ${escapeHtml(pluralName)} Validator</h3>
      <div class="text-gray-600 dark:text-gray-400 space-y-3">
        <p class="font-medium">${escapeHtml(description)}</p>
        ${docsLink}
        <hr class="border-gray-200 dark:border-gray-700">
        <p class="text-sm"><strong>How this validator works:</strong></p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li><strong>Quick mode:</strong> Pattern-based scoring for instant feedback</li>
          <li><strong>LLM mode:</strong> Copy scoring prompts for AI-powered analysis</li>
          <li><strong>AI Power-ups:</strong> Get critiques and rewrites via external AI</li>
        </ul>
        <p class="text-xs text-gray-500 dark:text-gray-500"><strong>Tip:</strong> Use the Assistant to generate documents, then paste here to validate.</p>
      </div>
      <div class="flex justify-end mt-6">
        <button class="px-4 py-2 bg-blue-600 !text-white rounded-lg hover:bg-blue-700 transition-colors close-about-btn">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-about-btn').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initValidator().catch((error) => {
      logger.error('Validator initialization failed', error, 'validator');
      showToast('Validator failed to initialize', 'error');
    });
  });
} else {
  initValidator().catch((error) => {
    logger.error('Validator initialization failed', error, 'validator');
    showToast('Validator failed to initialize', 'error');
  });
}

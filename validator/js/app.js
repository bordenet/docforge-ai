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
import { createProjectValidatorStorage } from '../../shared/js/validator-project-storage.js';
import { getProject, updateProjectPhaseOutput } from '../../shared/js/storage.js';
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
let attachedContext = null; // { projectId, phaseNumber, canonicalMarkdown, lastAppliedAt } when in attached mode

function createBlockedValidatorStorage() {
  return {
    async loadDraft() {
      return null;
    },
    async saveDraft() {
      // no-op
    },
    async getCurrentVersion() {
      return null;
    },
    getTimeSince() {
      return '';
    },
    async saveVersion() {
      return { success: false, reason: 'blocked' };
    },
    async goBack() {
      return null;
    },
    async goForward() {
      return null;
    },
  };
}

async function resolveModeContext(plugin) {
  const attachedProjectId = getProjectIdFromQuery();
  const phaseFromQuery = getPhaseFromQuery();
  const phaseNumber = attachedProjectId ? phaseFromQuery || 3 : null;

  if (!attachedProjectId) {
    return { mode: 'standalone', attachedProjectId: null, phaseNumber: null, project: null };
  }

  const project = await getProject(plugin.dbName, attachedProjectId);
  if (!project) {
    return {
      mode: 'blocked',
      attachedProjectId,
      phaseNumber: phaseNumber || 3,
      project: null,
      canonicalMarkdown: '',
      errorMessage: 'Project not found',
    };
  }

  const canonicalMarkdown = getPhaseOutputInternal(project, phaseNumber || 3) || '';
	const warningMessage = !canonicalMarkdown.trim() ? `Phase ${phaseNumber || 3} output is empty` : null;

  return {
    mode: 'attached',
    attachedProjectId,
    phaseNumber: phaseNumber || 3,
    project,
    canonicalMarkdown,
	  warningMessage,
  };
}

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

	const modeContext = await resolveModeContext(currentPlugin);

	attachedContext = modeContext.attachedProjectId
	  ? {
	      projectId: modeContext.attachedProjectId,
	      phaseNumber: modeContext.phaseNumber || 3,
	      canonicalMarkdown: '',
	      lastAppliedAt: null,
	    }
	  : null;

  // Initialize storage
	storage =
	  modeContext.mode === 'standalone'
	    ? createStorage(`${currentPlugin.id}-validator-history`)
	    : modeContext.mode === 'attached'
	      ? createProjectValidatorStorage({
	        dbName: currentPlugin.dbName,
	        projectId: modeContext.attachedProjectId,
	        phaseNumber: modeContext.phaseNumber,
	      })
	      : createBlockedValidatorStorage();

  // Initialize sub-modules with state accessors
  initPowerups(getState, setPrompt);
  initLLMMode(getState, setPrompt);

  // Update UI for current plugin
	updateHeader(currentPlugin, { attachedProjectId: modeContext.attachedProjectId });
  renderDimensionScores(currentPlugin);
  setupEventListeners();
  setupDocTypeSelector();

  // Initialize analytics (tracks tool open)
  initAnalytics();

  const editor = document.getElementById('editor');

	if (modeContext.mode === 'blocked' && editor) {
	  // Hard error: do not allow editing/saving when the project doesn't exist.
	  setAttachedBlocked(true);
	  showAttachedError(modeContext.errorMessage || 'Project not found');
	  showAttachedStatus('Attached: Project not found');
	  showAttachedEmpty(null);
	  if (attachedContext) attachedContext.lastAppliedAt = null;
	  setMainControlsEnabled(false);
	} else if (modeContext.mode === 'attached' && editor) {
	  setAttachedBlocked(false);
	  setMainControlsEnabled(true);

	  attachedContext.canonicalMarkdown = modeContext.canonicalMarkdown || '';
	  showAttachedError(null);
	  const assistantUrl = `/assistant/?type=${currentPlugin.id}#project/${attachedContext.projectId}`;
	  if (modeContext.warningMessage) {
	    showAttachedEmpty({ message: modeContext.warningMessage, assistantUrl });
	  } else {
	    showAttachedEmpty(null);
	  }

	  const draft = await storage.loadDraft();
	  editor.value = draft?.markdown || '';

	  if (editor.value.trim()) {
	    runValidation();
	  }

	  syncAttachedViewState();
	} else {
	  showAttachedError(null);
	  showAttachedStatus(null);
	  showAttachedEmpty(null);
	  setAttachedBlocked(false);
	  setMainControlsEnabled(true);
	  // Standalone mode: Load saved draft if available
	  const draft = storage.loadDraft();
	  if (draft && draft.markdown && editor) {
	    editor.value = draft.markdown;
	    // Run validation on restored content
	    runValidation();
	  }
	}
  await updateVersionDisplay();

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
	  const applyBtn = document.getElementById('btn-apply');
	  const docTypeBtn = document.getElementById('doc-type-btn');
	  const docTypeSelector = document.getElementById('doc-type-selector');
  if (attachedBadge) {
    if (attachedProjectId) {
      attachedBadge.classList.remove('hidden');
    } else {
      attachedBadge.classList.add('hidden');
    }
  }

	  if (applyBtn) {
	    if (attachedProjectId) {
	      applyBtn.classList.remove('hidden');
	    } else {
	      applyBtn.classList.add('hidden');
	    }
	  }

	  // Attached-mode contract: do not allow switching document type.
	  if (docTypeBtn) {
	    if (attachedProjectId) {
	      docTypeBtn.classList.add('hidden');
	    } else {
	      docTypeBtn.classList.remove('hidden');
	    }
	  }
	  if (docTypeSelector) {
	    docTypeSelector.disabled = Boolean(attachedProjectId);
	  }
}

function showAttachedError(message) {
  const el = document.getElementById('attached-error');
  if (!el) return;

  if (message) {
    el.textContent = message;
    el.classList.remove('hidden');
  } else {
    el.textContent = '';
    el.classList.add('hidden');
  }
}

function showAttachedStatus(message) {
  const el = document.getElementById('attached-status');
  if (!el) return;

  if (message) {
    el.textContent = message;
    el.classList.remove('hidden');
  } else {
    el.textContent = '';
    el.classList.add('hidden');
  }
}

function showAttachedEmpty(args) {
  const el = document.getElementById('attached-empty');
  const textEl = document.getElementById('attached-empty-text');
  const linkEl = document.getElementById('attached-open-assistant');
  if (!el || !textEl || !linkEl) return;

  const message = args?.message;
  const assistantUrl = args?.assistantUrl;

  if (message) {
    textEl.textContent = message;
    linkEl.href = assistantUrl || '#';
    el.classList.remove('hidden');
  } else {
    textEl.textContent = '';
    linkEl.href = '#';
    el.classList.add('hidden');
  }
}

function setMainControlsEnabled(enabled) {
  const editor = document.getElementById('editor');
  if (editor) editor.disabled = !enabled;

  const ids = ['btn-apply', 'btn-save', 'btn-back', 'btn-forward', 'btn-validate', 'btn-clear'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });
}

function setAttachedBlocked(isBlocked) {
  const el = document.getElementById('attached-blocked');
  if (!el) return;

  if (isBlocked) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function syncAttachedViewState() {
  if (!attachedContext) return;

  const editor = document.getElementById('editor');
  const value = editor?.value || '';
  const canonical = attachedContext.canonicalMarkdown || '';
  const canonicalEmpty = !canonical.trim();
  const valueEmpty = !value.trim();
  const isCanonical = value === canonical;

  // If the user changes text after an apply, we're back to a draft state.
  if (!isCanonical && attachedContext.lastAppliedAt) {
    attachedContext.lastAppliedAt = null;
  }

  if (isCanonical && attachedContext.lastAppliedAt) {
    showAttachedStatus(`Applied to project at ${attachedContext.lastAppliedAt}`);
    return;
  }

  if (canonicalEmpty && valueEmpty) {
    showAttachedStatus('Attached: Phase output is empty (start drafting)');
  } else if (isCanonical) {
    showAttachedStatus('Attached: Editing project output');
  } else {
    showAttachedStatus('Attached: Editing draft (not applied to project)');
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

async function updateVersionDisplay() {
  const versionInfo = document.getElementById('version-info');
  const lastSaved = document.getElementById('last-saved');
  const btnBack = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');

  if (!storage) return;

  const version = await storage.getCurrentVersion();
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

async function handleSave() {
  if (!storage) {
    showToast('No document loaded to save', 'warning');
    return;
  }

  const editor = document.getElementById('editor');
  const content = editor?.value || '';

  if (!content.trim()) {
    showToast('Nothing to save', 'warning');
    return;
  }

  const result = await storage.saveVersion(content);
  if (result.success) {
    showToast(`Saved as version ${result.versionNumber}`, 'success');
    await updateVersionDisplay();
  } else if (result.reason === 'no-change') {
    showToast('No changes to save', 'info');
  } else {
    showToast('Failed to save', 'error');
  }
}

async function handleGoBack() {
  if (!storage) return;

  const editor = document.getElementById('editor');
  const version = await storage.goBack();
  if (version && editor) {
    editor.value = version.markdown;
    runValidation();
	      syncAttachedViewState();
    await updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info');
  }
}

async function handleGoForward() {
  if (!storage) return;

  const editor = document.getElementById('editor');
  const version = await storage.goForward();
  if (version && editor) {
    editor.value = version.markdown;
    runValidation();
	      syncAttachedViewState();
    await updateVersionDisplay();
    showToast(`Restored version ${version.versionNumber}`, 'info');
  }
}

async function handleApplyToProject() {
  if (!attachedContext) {
    showToast('Not in project-attached mode', 'warning');
    return;
  }

  const applyBtn = document.getElementById('btn-apply');
  const priorLabel = applyBtn?.textContent || null;
  if (applyBtn) {
    applyBtn.disabled = true;
    applyBtn.textContent = 'Applying…';
  }

  const editor = document.getElementById('editor');
  const content = editor?.value || '';
  if (content.trim().length < 3) {
    if (applyBtn) {
      applyBtn.disabled = false;
      if (priorLabel) applyBtn.textContent = priorLabel;
    }
    showToast('Nothing to apply', 'warning');
    return;
  }

  try {
    const updated = await updateProjectPhaseOutput(
      currentPlugin.dbName,
      attachedContext.projectId,
      attachedContext.phaseNumber,
      content
    );

    if (!updated) {
      showAttachedError('Project not found');
      showToast('Project not found', 'error');
      return;
    }

    // Update local attached-mode context.
    attachedContext.canonicalMarkdown = content;
	    attachedContext.lastAppliedAt = new Date().toLocaleTimeString();
	    // Keep the draft aligned with canonical so reloads don't re-open in "not applied" state.
	    await storage?.saveDraft?.(content);
	    showAttachedEmpty(null);
    showAttachedError(null);
	    syncAttachedViewState();
    showToast('Applied to project!', 'success');
  } finally {
    if (applyBtn) {
      // Keep the disabled state observable (and UX-consistent) even if IndexedDB writes are very fast.
      await new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      applyBtn.disabled = false;
      applyBtn.textContent = priorLabel || '⬆️ Apply to Project';
    }
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

  // Project-attached draft persistence (debounced)
  if (editor && typeof storage?.saveDraft === 'function') {
    let debounceTimer = null;
    const DEBOUNCE_MS = 400;

    editor.addEventListener('input', () => {
	      if (attachedContext) {
	        // User started writing; clear the "empty phase output" warning.
	        if (!attachedContext.canonicalMarkdown?.trim()) {
	          const assistantUrl = `/assistant/?type=${currentPlugin.id}#project/${attachedContext.projectId}`;
	          if (editor.value.trim()) {
	            showAttachedEmpty(null);
	          } else {
	            showAttachedEmpty({
	              message: `Phase ${attachedContext.phaseNumber} output is empty`,
	              assistantUrl,
	            });
	          }
	        }
	        syncAttachedViewState();
	      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        storage.saveDraft(editor.value).catch((error) => {
          logger.error('Failed to save validator draft', error, 'validator');
        });
      }, DEBOUNCE_MS);
    });

    editor.addEventListener('blur', () => {
	      if (attachedContext) {
	        syncAttachedViewState();
	      }

      storage.saveDraft(editor.value).catch((error) => {
        logger.error('Failed to save validator draft', error, 'validator');
      });
    });
  }

  // AI Power-ups
  document.getElementById('btn-critique')?.addEventListener('click', handleCritique);
  document.getElementById('btn-rewrite')?.addEventListener('click', handleRewrite);
  document.getElementById('btn-view-prompt')?.addEventListener('click', () => handleViewPrompt(currentPrompt));

  // LLM Scoring Mode
  document.getElementById('btn-toggle-mode')?.addEventListener('click', toggleScoringMode);
  document.getElementById('btn-copy-llm-prompt')?.addEventListener('click', handleCopyLLMPrompt);
  document.getElementById('btn-view-llm-prompt')?.addEventListener('click', () => handleViewLLMPrompt(currentPrompt));

  // Version control
  document.getElementById('btn-save')?.addEventListener('click', () => {
    handleSave().catch((error) => {
      logger.error('Save version failed', error, 'validator');
      showToast('Failed to save', 'error');
    });
  });
	  document.getElementById('btn-apply')?.addEventListener('click', () => {
	    handleApplyToProject().catch((error) => {
	      logger.error('Apply to project failed', error, 'validator');
	      showToast('Failed to apply to project', 'error');
	    });
	  });
  document.getElementById('btn-back')?.addEventListener('click', () => {
    handleGoBack().catch((error) => {
      logger.error('Go back failed', error, 'validator');
      showToast('Failed to restore version', 'error');
    });
  });
  document.getElementById('btn-forward')?.addEventListener('click', () => {
    handleGoForward().catch((error) => {
      logger.error('Go forward failed', error, 'validator');
      showToast('Failed to restore version', 'error');
    });
  });

  // Keyboard shortcut: Ctrl/Cmd+S to save
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave().catch((error) => {
        logger.error('Save version failed', error, 'validator');
        showToast('Failed to save', 'error');
      });
    }
  });

  // Update version display periodically (every 60 seconds)
  setInterval(() => {
    updateVersionDisplay().catch((error) => {
      logger.error('Failed to update version display', error, 'validator');
    });
  }, 60000);
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

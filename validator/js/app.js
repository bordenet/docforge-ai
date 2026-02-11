/**
 * Validator Application Module
 * @module validator-app
 */

import { getCurrentDocumentType } from '../../shared/js/router.js';
import { getPlugin } from '../../shared/js/plugin-registry.js';
import { showToast, escapeHtml, copyToClipboard, showPromptModal } from '../../shared/js/ui.js';
import {
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel,
} from '../../shared/js/validator.js';
import { logger } from '../../shared/js/logger.js';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
} from '../../shared/js/validator-prompts.js';

let currentPlugin = null;
let currentResult = null;
let currentPrompt = null;
let isLLMMode = false;

/**
 * Initialize the validator
 */
function initValidator() {
  // Get current plugin from URL
  const docType = getCurrentDocumentType();
  currentPlugin = getPlugin(docType) || getPlugin('one-pager');

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
  document.getElementById('btn-view-prompt')?.addEventListener('click', handleViewPrompt);

  // LLM Scoring Mode
  document.getElementById('btn-toggle-mode')?.addEventListener('click', toggleScoringMode);
  document.getElementById('btn-copy-llm-prompt')?.addEventListener('click', handleCopyLLMPrompt);
  document.getElementById('btn-view-llm-prompt')?.addEventListener('click', handleViewLLMPrompt);

  // Initialize scoring mode from localStorage
  initScoringMode();
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
  updateScoreDisplay(currentResult);
  renderSlopDetection(currentResult.slopDetection);
  renderIssues(currentResult.issues);

  // Show AI power-ups if content is substantial
  const aiPowerups = document.getElementById('ai-powerups');
  if (aiPowerups && content.length > 200) {
    aiPowerups.classList.remove('hidden');
  }

  showToast('Document validated!', 'success');
}

/**
 * Update score display from validation result
 */
function updateScoreDisplay(result) {
  // Update dimension scores
  currentPlugin.scoringDimensions.forEach((dim, index) => {
    const dimResult = result[`dimension${index + 1}`] || result[dim.name];
    if (!dimResult) return;

    const scoreEl = document.querySelector(`.dim-score[data-dim="${dim.name}"]`);
    const barEl = document.querySelector(`.dim-bar[data-dim="${dim.name}"]`);

    if (scoreEl) scoreEl.textContent = dimResult.score;
    if (barEl) {
      const pct = (dimResult.score / dim.maxPoints) * 100;
      barEl.style.width = `${pct}%`;
      barEl.className = `dim-bar h-2 rounded-full transition-all duration-300 ${getBarColor(pct)}`;
    }
  });

  // Update total score
  const totalEl = document.getElementById('score-total');
  if (totalEl) totalEl.textContent = result.totalScore;

  updateBadge(result.totalScore);
}

/**
 * Get bar color class based on percentage
 */
function getBarColor(pct) {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  if (pct >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Update badge using shared helper functions
 */
function updateBadge(score) {
  const badge = document.getElementById('score-badge');
  if (!badge) return;

  const label = getScoreLabel(score);
  const color = getScoreColor(score);
  const grade = getGrade(score);

  const colorClasses = {
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    orange: 'bg-orange-600',
    red: 'bg-red-600',
  };

  badge.textContent = `${grade} - ${label}`;
  badge.className = `inline-block px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color] || 'bg-slate-600'} text-white`;
}

/**
 * Render slop detection results
 */
function renderSlopDetection(slopData) {
  const container = document.getElementById('slop-detection');
  if (!container || !slopData) return;

  const severityColors = {
    clean: 'text-green-400',
    light: 'text-yellow-400',
    moderate: 'text-orange-400',
    heavy: 'text-red-400',
    severe: 'text-red-600',
  };

  container.innerHTML = `
    <div class="mt-4 p-3 bg-slate-800 rounded-lg">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium text-slate-300">AI Slop Detection</span>
        <span class="text-sm ${severityColors[slopData.severity] || 'text-slate-400'}">
          ${slopData.severity?.toUpperCase() || 'N/A'} (${slopData.penalty || 0} pt penalty)
        </span>
      </div>
      ${
        slopData.issues?.length > 0
          ? `
        <ul class="text-xs text-slate-400 space-y-1">
          ${slopData.issues.map((issue) => `<li>• ${escapeHtml(issue)}</li>`).join('')}
        </ul>
      `
          : '<p class="text-xs text-green-400">No AI slop detected</p>'
      }
    </div>
  `;
}

/**
 * Render validation issues
 */
function renderIssues(issues) {
  const container = document.getElementById('validation-issues');
  if (!container) return;

  if (!issues || issues.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="mt-4 p-3 bg-slate-800 rounded-lg">
      <span class="text-sm font-medium text-slate-300">Suggestions</span>
      <ul class="mt-2 text-xs text-slate-400 space-y-1">
        ${issues
          .slice(0, 5)
          .map((issue) => `<li>• ${escapeHtml(issue)}</li>`)
          .join('')}
      </ul>
    </div>
  `;
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
  document.documentElement.classList.toggle('dark');
}

// ============================================================================
// AI Power-ups
// ============================================================================

function enableButton(btn, colorClass = 'bg-teal-600 hover:bg-teal-700') {
  if (!btn) return;
  btn.classList.remove('bg-slate-600', 'text-slate-400', 'cursor-not-allowed', 'pointer-events-none');
  btn.classList.add(...colorClass.split(' '), 'text-white');
  btn.disabled = false;
  btn.removeAttribute('aria-disabled');
}

function handleCritique() {
  const editor = document.getElementById('editor');
  const content = editor?.value || '';
  if (!content || !currentResult) {
    showToast('Add some content first', 'warning');
    return;
  }

  const prompt = generateCritiquePrompt(content, currentPlugin, currentResult);
  currentPrompt = { text: prompt, type: 'Critique' };

  enableButton(document.getElementById('btn-view-prompt'));
  enableButton(document.getElementById('btn-open-claude'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('Critique prompt copied! Open Claude.ai and paste.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

function handleRewrite() {
  const editor = document.getElementById('editor');
  const content = editor?.value || '';
  if (!content || !currentResult) {
    showToast('Add some content first', 'warning');
    return;
  }

  const prompt = generateRewritePrompt(content, currentPlugin, currentResult);
  currentPrompt = { text: prompt, type: 'Rewrite' };

  enableButton(document.getElementById('btn-view-prompt'));
  enableButton(document.getElementById('btn-open-claude'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('Rewrite prompt copied! Open Claude.ai and paste.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

function handleViewPrompt() {
  if (!currentPrompt?.text) {
    showToast('Copy a prompt first', 'warning');
    return;
  }
  showPromptModal(currentPrompt.text, `${currentPrompt.type} Prompt`);
}

// ============================================================================
// LLM Scoring Mode
// ============================================================================

function toggleScoringMode() {
  isLLMMode = !isLLMMode;

  const btnToggle = document.getElementById('btn-toggle-mode');
  const toggleKnob = btnToggle?.querySelector('span');
  const modeLabelQuick = document.getElementById('mode-label-quick');
  const modeLabelLLM = document.getElementById('mode-label-llm');
  const quickPanel = document.getElementById('quick-score-panel');
  const llmPanel = document.getElementById('llm-score-panel');

  if (isLLMMode) {
    btnToggle?.classList.remove('bg-slate-500');
    btnToggle?.classList.add('bg-indigo-600');
    if (toggleKnob) toggleKnob.style.transform = 'translateX(24px)';
    btnToggle?.setAttribute('aria-checked', 'true');
    modeLabelQuick?.classList.remove('text-white');
    modeLabelQuick?.classList.add('text-slate-400');
    modeLabelLLM?.classList.remove('text-slate-400');
    modeLabelLLM?.classList.add('text-white');
    quickPanel?.classList.add('hidden');
    llmPanel?.classList.remove('hidden');
  } else {
    btnToggle?.classList.remove('bg-indigo-600');
    btnToggle?.classList.add('bg-slate-500');
    if (toggleKnob) toggleKnob.style.transform = 'translateX(0)';
    btnToggle?.setAttribute('aria-checked', 'false');
    modeLabelQuick?.classList.remove('text-slate-400');
    modeLabelQuick?.classList.add('text-white');
    modeLabelLLM?.classList.remove('text-white');
    modeLabelLLM?.classList.add('text-slate-400');
    quickPanel?.classList.remove('hidden');
    llmPanel?.classList.add('hidden');
  }

  localStorage.setItem('docforge-scoring-mode', isLLMMode ? 'llm' : 'quick');
}

function initScoringMode() {
  const saved = localStorage.getItem('docforge-scoring-mode');
  if (saved === 'llm') {
    isLLMMode = false;
    toggleScoringMode();
  }
}

function handleCopyLLMPrompt() {
  const editor = document.getElementById('editor');
  const content = editor?.value?.trim() || '';
  if (!content) {
    showToast('Add some content first', 'warning');
    return;
  }

  const prompt = generateLLMScoringPrompt(content, currentPlugin);
  currentPrompt = { text: prompt, type: 'LLM Scoring' };

  enableButton(document.getElementById('btn-view-llm-prompt'));
  enableButton(document.getElementById('btn-open-claude-llm'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('LLM scoring prompt copied! Paste into Claude.ai.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

function handleViewLLMPrompt() {
  if (!currentPrompt || currentPrompt.type !== 'LLM Scoring') {
    showToast('Copy the scoring prompt first', 'warning');
    return;
  }
  showPromptModal(currentPrompt.text, 'LLM Scoring Prompt');
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}

/**
 * Validator Application Module
 * @module validator-app
 */

import { getCurrentDocumentType } from '../../shared/js/router.js';
import { getPlugin } from '../../shared/js/plugin-registry.js';
import { showToast, escapeHtml } from '../../shared/js/ui.js';
import {
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel,
} from '../../shared/js/validator.js';
import { logger } from '../../shared/js/logger.js';

let currentPlugin = null;

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
  const result = validateDocument(content, currentPlugin);
  updateScoreDisplay(result);
  renderSlopDetection(result.slopDetection);
  renderIssues(result.issues);
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
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// escapeHtml imported from ui.js

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}

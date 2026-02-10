/**
 * Validator Application Module
 * @module validator-app
 */

import { getCurrentDocumentType } from '../../shared/js/router.js';
import { getPlugin } from '../../shared/js/plugin-registry.js';
import { showToast } from '../../shared/js/ui.js';

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

  console.log(`Validator initialized for: ${currentPlugin.id}`);
}

/**
 * Update header for current document type
 */
function updateHeader(plugin) {
  document.getElementById('header-icon').textContent = plugin.icon;
  document.getElementById('header-title').textContent = `${plugin.name} Validator`;
  document.getElementById('doc-type-label').textContent = plugin.name;
  document.title = `${plugin.name} Validator - Genesis Fusion`;

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

  const html = plugin.scoringDimensions.map(dim => `
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
  `).join('');

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

  validateBtn?.addEventListener('click', () => validateDocument());
  clearBtn?.addEventListener('click', () => clearEditor());
  darkModeBtn?.addEventListener('click', () => toggleDarkMode());

  // Auto-validate on paste
  editor?.addEventListener('paste', () => {
    setTimeout(() => validateDocument(), 100);
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
 * Validate the document
 */
function validateDocument() {
  const editor = document.getElementById('editor');
  const content = editor?.value?.trim() || '';

  if (!content) {
    showToast('Please paste a document to validate', 'info');
    return;
  }

  // Simple scoring based on section detection
  const scores = scoreDocument(content, currentPlugin);
  updateScoreDisplay(scores);
  showToast('Document validated!', 'success');
}

/**
 * Score a document based on plugin dimensions
 */
function scoreDocument(content, plugin) {
  const scores = {};
  // Reserved for future keyword matching
  // const lowerContent = content.toLowerCase();

  plugin.scoringDimensions.forEach(dim => {
    // Simple heuristic: check for keywords related to each dimension
    let score = Math.floor(dim.maxPoints * 0.5); // Base score

    // Bonus for longer content
    if (content.length > 500) score += Math.floor(dim.maxPoints * 0.2);
    if (content.length > 1000) score += Math.floor(dim.maxPoints * 0.1);

    // Check for sections (headings)
    const headingCount = (content.match(/^#+\s/gm) || []).length;
    if (headingCount >= 3) score += Math.floor(dim.maxPoints * 0.1);

    scores[dim.name] = Math.min(score, dim.maxPoints);
  });

  return scores;
}

/**
 * Update score display
 */
function updateScoreDisplay(scores) {
  let total = 0;
  Object.entries(scores).forEach(([name, score]) => {
    total += score;
    const scoreEl = document.querySelector(`.dim-score[data-dim="${name}"]`);
    const barEl = document.querySelector(`.dim-bar[data-dim="${name}"]`);
    const dim = currentPlugin.scoringDimensions.find(d => d.name === name);
    if (scoreEl) scoreEl.textContent = score;
    if (barEl && dim) barEl.style.width = `${(score / dim.maxPoints) * 100}%`;
  });

  document.getElementById('score-total').textContent = total;
  updateBadge(total);
}

function updateBadge(score) {
  const badge = document.getElementById('score-badge');
  if (!badge) return;
  if (score >= 90) { badge.textContent = 'Excellent'; badge.className = 'inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-600 text-white'; }
  else if (score >= 70) { badge.textContent = 'Good'; badge.className = 'inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white'; }
  else if (score >= 50) { badge.textContent = 'Needs Work'; badge.className = 'inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-600 text-white'; }
  else { badge.textContent = 'Poor'; badge.className = 'inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white'; }
}

function clearEditor() {
  const editor = document.getElementById('editor');
  if (editor) editor.value = '';
  document.getElementById('score-total').textContent = '--';
  document.querySelectorAll('.dim-score').forEach(el => el.textContent = '--');
  document.querySelectorAll('.dim-bar').forEach(el => el.style.width = '0%');
  document.getElementById('score-badge').textContent = 'Paste a document to score';
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#039;' })[c]);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}


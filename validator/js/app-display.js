/**
 * Validator Application - Display Module
 * Handles score display, badges, slop detection, and issues rendering
 * @module validator-app-display
 */

import { escapeHtml } from '../../shared/js/ui.js';
import { getGrade, getScoreColor, getScoreLabel } from '../../shared/js/validator.js';

/**
 * Update score display from validation result
 * @param {Object} result - Validation result
 * @param {Object} plugin - Current plugin configuration
 */
export function updateScoreDisplay(result, plugin) {
  // Update dimension scores
  plugin.scoringDimensions.forEach((dim, index) => {
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
 * @param {number} pct - Percentage value
 * @returns {string} Tailwind color class
 */
export function getBarColor(pct) {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  if (pct >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Update badge using shared helper functions
 * @param {number} score - Total score
 */
export function updateBadge(score) {
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
 * @param {Object} slopData - Slop detection data
 */
export function renderSlopDetection(slopData) {
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
 * @param {Array} issues - Array of issue strings
 */
export function renderIssues(issues) {
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


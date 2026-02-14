/**
 * UI Utilities - Toast notifications, loading overlays, and common UI patterns
 * Main entry point that re-exports from sub-modules for backward compatibility
 * @module ui
 */

// Import base utilities for internal use
import { escapeHtml as _escapeHtml } from './ui-base.js';

// Re-export from sub-modules for backward compatibility
export { createActionMenu } from './ui-menu.js';
export { confirm, showPromptModal } from './ui-modals.js';
export { escapeHtml, copyToClipboard } from './ui-base.js';

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - Toast type
 * @param {number} [duration=3000] - Duration in ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `notification ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2`;
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span>${_escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Show loading overlay
 * @param {string} [message='Loading...'] - Loading message
 */
export function showLoading(message = 'Loading...') {
  const overlay = document.getElementById('loading-overlay');
  const text = document.getElementById('loading-text');
  if (overlay) {
    overlay.classList.remove('hidden');
    if (text) text.textContent = message;
  }
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Render markdown to HTML
 * @param {string} markdown - Markdown text
 * @returns {string} HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';
  // marked is loaded globally via script tag
  if (typeof marked !== 'undefined') {
    return marked.parse(markdown);
  }
  // Fallback: just escape and preserve newlines
  return _escapeHtml(markdown).replace(/\n/g, '<br>');
}

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} [mimeType='text/plain'] - MIME type
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

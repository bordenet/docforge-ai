/**
 * UI Utilities - Toast notifications, loading overlays, and common UI patterns
 * Main entry point that re-exports from sub-modules for backward compatibility
 * @module ui
 */

/* global DOMPurify */

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
 * Allowed HTML tags for sanitized markdown output
 * @type {string[]}
 */
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i', 'u', 's', 'del',
  'code', 'pre', 'blockquote',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
];

/**
 * Allowed HTML attributes for sanitized markdown output
 * @type {string[]}
 */
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'];

/**
 * Render markdown to HTML with XSS sanitization
 * @param {string} markdown - Markdown text
 * @returns {string} Sanitized HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';

  // marked and DOMPurify are loaded globally via script tags
  if (typeof marked !== 'undefined') {
    const rawHtml = marked.parse(markdown);

    // Sanitize HTML to prevent XSS attacks
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ALLOW_DATA_ATTR: false,
      });
    }

    // If DOMPurify not available, return raw (dev environment warning)
    console.warn('[ui] DOMPurify not loaded - markdown not sanitized');
    return rawHtml;
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

/**
 * Wrap an async function with error boundary that catches errors and shows toast
 * @param {Function} fn - Async function to wrap
 * @param {string} [errorMessage] - Custom error message (defaults to error.message)
 * @param {Object} [options] - Options
 * @param {boolean} [options.rethrow=false] - Re-throw error after handling
 * @param {Function} [options.onError] - Custom error handler callback
 * @returns {Function} Wrapped function that catches errors
 * @example
 * const safeSubmit = withErrorBoundary(handleSubmit, 'Failed to save');
 * button.addEventListener('click', safeSubmit);
 */
export function withErrorBoundary(fn, errorMessage, options = {}) {
  const { rethrow = false, onError } = options;

  return async function (...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      const message = errorMessage || error.message || 'An unexpected error occurred';
      console.error('[ErrorBoundary]', message, error);
      showToast(message, 'error', 5000);

      if (onError) {
        onError(error);
      }

      if (rethrow) {
        throw error;
      }
      return undefined;
    }
  };
}

/**
 * Setup global error handlers for uncaught errors and unhandled promise rejections
 * Should be called once during app initialization
 */
export function setupGlobalErrorHandler() {
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('[GlobalError]', event.error || event.message);
    showToast('An unexpected error occurred', 'error', 5000);
    // Don't prevent default - let it also log to console
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[UnhandledRejection]', event.reason);
    showToast('An unexpected error occurred', 'error', 5000);
    // Prevent the default browser behavior (console error)
    event.preventDefault();
  });
}

/**
 * UI Utilities - Toast notifications, loading overlays, and common UI patterns
 * @module ui
 */

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
    <span>${escapeHtml(message)}</span>
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
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  return str.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char]
  );
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
  return escapeHtml(markdown).replace(/\n/g, '<br>');
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } finally {
      document.body.removeChild(textarea);
    }
  }
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
 * Show a confirmation dialog
 * @param {string} message - Confirmation message
 * @param {string} [title='Confirm'] - Dialog title
 * @returns {Promise<boolean>} True if confirmed
 */
export function confirm(message, title = 'Confirm') {
  return new Promise((resolve) => {
    const existing = document.getElementById('confirm-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'confirm-modal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${escapeHtml(title)}</h3>
          <p class="text-gray-600 dark:text-gray-400">${escapeHtml(message)}</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button id="confirm-cancel" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 rounded-lg">
            Cancel
          </button>
          <button id="confirm-ok" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
            Delete
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = (result) => {
      modal.remove();
      resolve(result);
    };

    document.getElementById('confirm-cancel').addEventListener('click', () => close(false));
    document.getElementById('confirm-ok').addEventListener('click', () => close(true));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close(false);
    });
  });
}

/**
 * Show a modal with prompt content
 * @param {string} text - Prompt text to display
 * @param {string} title - Modal title
 */
export function showPromptModal(text, title = 'Prompt') {
  // Remove existing modal if any
  const existing = document.getElementById('prompt-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'prompt-modal';
  modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
      <div class="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 class="text-lg font-semibold text-white">${escapeHtml(title)}</h3>
        <button id="modal-close" class="text-slate-400 hover:text-white text-xl">&times;</button>
      </div>
      <div class="p-4 overflow-auto flex-1">
        <pre class="text-sm text-slate-300 whitespace-pre-wrap font-mono">${escapeHtml(text)}</pre>
      </div>
      <div class="p-4 border-t border-slate-700 flex justify-end gap-2">
        <button id="modal-copy" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
          Copy
        </button>
        <button id="modal-close-btn" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  document.getElementById('modal-close').addEventListener('click', close);
  document.getElementById('modal-close-btn').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  document.getElementById('modal-copy').addEventListener('click', async () => {
    const success = await copyToClipboard(text);
    if (success) {
      showToast('Copied to clipboard!', 'success');
    }
  });
}

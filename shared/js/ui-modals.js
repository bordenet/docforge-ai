/**
 * UI Utilities - Modal Dialogs
 * Confirmation dialogs and prompt modals
 * @module ui-modals
 */

import { escapeHtml, copyToClipboard } from './ui.js';
import { showToast } from './ui.js';

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


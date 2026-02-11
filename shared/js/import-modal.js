/**
 * Import Modal UI Module
 * Handles modal display and user interaction for document import
 * @module import-modal
 */

import { showToast } from './ui.js';
import { convertHtmlToMarkdown, normalizeMarkdown, extractTitleFromMarkdown } from './import-document.js';

/**
 * Generate the import modal HTML
 * @param {string} docType - Document type name
 * @returns {string} Modal HTML
 */
export function getImportModalHtml(docType) {
  return `
    <div id="import-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Import Existing ${docType}
          </h2>
          <button id="import-modal-close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Paste your ${docType} from Word, Google Docs, or any source below. We'll convert it to Markdown.
          </p>
          <div id="import-paste-step">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste your content here
            </label>
            <div id="import-paste-area" contenteditable="true"
              class="w-full h-48 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            </div>
            <button id="import-convert-btn" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Convert to Markdown
            </button>
          </div>
          <div id="import-preview-step" class="hidden">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Converted Markdown</label>
            <textarea id="import-preview-area"
              class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            </textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button id="import-cancel-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            Cancel
          </button>
          <button id="import-save-btn" class="hidden px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Save & Continue to Phase 2
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the import modal and wire up event handlers
 * @param {Object} plugin - Current plugin config
 * @param {Function} saveProject - Function to save project
 * @param {Function} onComplete - Callback when import is complete (receives project)
 */
export function showImportModal(plugin, saveProject, onComplete) {
  const docType = plugin.name;
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = getImportModalHtml(docType);
  document.body.appendChild(modalContainer.firstElementChild);

  const modal = document.getElementById('import-modal');
  const pasteArea = document.getElementById('import-paste-area');
  const convertBtn = document.getElementById('import-convert-btn');
  const previewStep = document.getElementById('import-preview-step');
  const pasteStep = document.getElementById('import-paste-step');
  const previewArea = document.getElementById('import-preview-area');
  const saveBtn = document.getElementById('import-save-btn');

  const closeModal = () => modal.remove();
  document.getElementById('import-modal-close').addEventListener('click', closeModal);
  document.getElementById('import-cancel-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  convertBtn.addEventListener('click', () => {
    const html = pasteArea.innerHTML;
    if (!html || html === '<br>' || html.trim() === '') {
      showToast('Please paste some content first', 'error');
      return;
    }
    const markdown = convertHtmlToMarkdown(html);
    pasteStep.classList.add('hidden');
    previewStep.classList.remove('hidden');
    previewArea.value = markdown;
    saveBtn.classList.remove('hidden');
  });

  let isSaving = false;
  saveBtn.addEventListener('click', async () => {
    if (isSaving) return;
    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const rawMarkdown = previewArea.value;
      if (!rawMarkdown.trim()) {
        showToast('No content to save', 'error');
        return;
      }

      const markdown = normalizeMarkdown(rawMarkdown, docType);
      const title = extractTitleFromMarkdown(markdown, docType) || `Imported ${docType}`;
      const now = new Date().toISOString();

      const project = await saveProject(plugin.dbName, {
        title,
        formData: { title, importedContent: markdown },
        currentPhase: 2,
        phases: {
          1: {
            response: markdown,
            completed: true,
            startedAt: now,
            completedAt: now,
          },
        },
        isImported: true,
      });

      closeModal();
      showToast(`${docType} imported! Continue to Phase 2 for review.`, 'success');
      onComplete(project);
    } finally {
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue to Phase 2';
    }
  });

  pasteArea.focus();
}


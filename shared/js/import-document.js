/**
 * Import Document Module
 * Handles importing existing documents from Word/Google Docs via paste
 * @module import-document
 */

import { showToast } from './ui.js';

/**
 * Extract title from markdown using multiple strategies
 * @param {string} markdown - Markdown content
 * @param {string} docType - Document type name
 * @returns {string|null} Extracted title or null
 */
function extractTitleFromMarkdown(markdown, docType) {
  if (!markdown) return null;

  // Strategy 1: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
  if (h1Match) {
    const title = h1Match[1].replace(new RegExp(`^${docType}:\\s*`, 'i'), '').trim();
    if (title && title.length > 0) return title;
  }

  // Strategy 2: H2 header (## Title)
  const h2Match = markdown.match(/^##\s+(.+?)(?:\n|$)/m);
  if (h2Match) {
    const title = h2Match[1].trim();
    if (title && title.length > 0 && title.length <= 100) return title;
  }

  // Strategy 3: First bold text (**Title** or __Title__)
  const boldMatch = markdown.match(/^\*\*(.+?)\*\*|^__(.+?)__/m);
  if (boldMatch) {
    const title = (boldMatch[1] || boldMatch[2]).trim();
    if (title && title.length > 0 && title.length <= 100) return title;
  }

  // Strategy 4: First non-empty line (truncated)
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^[-=*]{3,}$/.test(trimmed) || trimmed.length < 5) continue;
    const cleaned = trimmed
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, ' ')
      .trim();
    if (cleaned.length > 0) {
      return cleaned.length > 80 ? cleaned.substring(0, 77) + '...' : cleaned;
    }
  }

  return null;
}

/**
 * Check if text content contains markdown syntax
 * @param {string} text - Plain text content
 * @returns {boolean} True if text contains markdown patterns
 */
function containsMarkdownSyntax(text) {
  if (!text) return false;

  // Check for markdown patterns in the text
  const markdownPatterns = [
    /^#{1,6}\s+/m,           // Headers: # ## ### etc
    /^\s*[-*+]\s+\S/m,       // Unordered lists (dash/asterisk/plus followed by space and content)
    /^\s*\d+\.\s+/m,         // Ordered lists
    /\*\*[^*\n]+\*\*/,       // Bold **text**
    /\*[^*\n]+\*/,           // Italic *text*
    /`[^`\n]+`/,             // Inline code
    /```/,                   // Code block markers
    /^\s*>/m,                // Blockquotes
    /\[[^\]]+\]\([^)]+\)/,   // Links [text](url)
    /^\|.+\|$/m              // Table rows |col|col|
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

/**
 * Convert HTML to Markdown using Turndown (if available)
 * If content already contains markdown syntax, return plain text to preserve it
 * @param {string} html - HTML content from paste
 * @returns {string} Markdown content
 */
export function convertHtmlToMarkdown(html) {
  // First, extract plain text
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const plainText = temp.textContent || temp.innerText || '';

  // If the plain text contains markdown syntax, return it directly
  // This handles cases where:
  // 1. User pastes plain markdown (browser wraps in divs)
  // 2. User pastes from rich editor that preserved markdown in text
  if (containsMarkdownSyntax(plainText)) {
    return plainText.trim();
  }

  // If Turndown isn't available, return plain text
  if (typeof TurndownService === 'undefined') {
    console.warn('Turndown not loaded, returning plain text');
    return plainText;
  }

  // Use Turndown for rich HTML content that has no markdown syntax
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });

  return turndownService.turndown(html);
}

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
            Save & Continue to Phase 1
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
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

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
      const markdown = previewArea.value;
      if (!markdown.trim()) {
        showToast('No content to save', 'error');
        return;
      }

      const title = extractTitleFromMarkdown(markdown, docType) || `Imported ${docType}`;
      const project = await saveProject(plugin.dbName, {
        title,
        formData: { title, importedContent: markdown },
        currentPhase: 1,
        phases: {
          1: { response: markdown, completed: false, startedAt: new Date().toISOString() }
        },
        isImported: true
      });

      closeModal();
      showToast(`${docType} imported! Review and refine in Phase 1.`, 'success');
      onComplete(project);
    } finally {
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue to Phase 1';
    }
  });

  pasteArea.focus();
}


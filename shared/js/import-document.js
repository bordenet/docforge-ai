/**
 * Import Document Module
 * Handles importing existing documents from Word/Google Docs via paste
 * @module import-document
 */

import { showToast } from './ui.js';

/**
 * Extract title from the BEGINNING of markdown (first 20 lines only)
 * This prevents grabbing titles from appendices or other sections
 * @param {string} markdown - Markdown content
 * @param {string} docType - Document type name
 * @returns {string|null} Extracted title or null
 */
function extractTitleFromMarkdown(markdown, docType) {
  if (!markdown) return null;

  // Only look at the first 20 lines to avoid grabbing appendix titles
  const lines = markdown.split('\n').slice(0, 20);
  const topContent = lines.join('\n');

  // Strategy 1: H1 header at the top (# Title)
  const h1Match = topContent.match(/^#\s+(.+?)(?:\n|$)/m);
  if (h1Match) {
    const title = h1Match[1].replace(new RegExp(`^${docType}:\\s*`, 'i'), '').trim();
    // Skip generic section headers
    if (title && title.length > 0 && !isGenericSectionHeader(title)) {
      return title;
    }
  }

  // Strategy 2: H2 header at the top (## Title) - but not section headers
  const h2Match = topContent.match(/^##\s+(.+?)(?:\n|$)/m);
  if (h2Match) {
    const title = h2Match[1].trim();
    if (title && title.length > 0 && title.length <= 100 && !isGenericSectionHeader(title)) {
      return title;
    }
  }

  // Strategy 3: First bold text at the top (**Title** or __Title__)
  // But skip if it looks like a label (ends with :) or is a generic header
  const boldMatch = topContent.match(/^\*\*(.+?)\*\*|^__(.+?)__/m);
  if (boldMatch) {
    const title = (boldMatch[1] || boldMatch[2]).trim();
    // Skip labels (end with :) and generic headers
    if (title && title.length > 0 && title.length <= 100 &&
        !title.endsWith(':') && !isGenericSectionHeader(title)) {
      return title;
    }
  }

  // Strategy 4: First non-empty line that looks like a title
  // Skip: section headers, labels, sentences (too long or contains periods)
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
    // Skip if:
    // - Empty or too long (> 80 chars = probably a sentence)
    // - Ends with : (label) or . (sentence ending)
    // - Contains . followed by space (sentence with multiple clauses)
    // - Is a generic section header
    if (cleaned.length > 0 && cleaned.length <= 80 &&
        !cleaned.endsWith(':') &&
        !cleaned.endsWith('.') &&
        !/\.\s/.test(cleaned) &&
        !isGenericSectionHeader(cleaned)) {
      return cleaned;
    }
  }

  // No valid title found - return null to trigger fallback
  return null;
}

/**
 * Check if text is a generic section header (not a real title)
 * @param {string} text - Text to check
 * @returns {boolean} True if it's a generic section header
 */
function isGenericSectionHeader(text) {
  const genericHeaders = [
    /^problem\s*statement$/i,
    /^cost\s*of\s*doing\s*nothing$/i,
    /^proposed\s*solution$/i,
    /^key\s*goals?\/?\s*benefits?$/i,
    /^success\s*metrics?$/i,
    /^key\s*stakeholders?$/i,
    /^timeline$/i,
    /^budget\s*impact$/i,
    /^scope$/i,
    /^appendix/i,
    /^executive\s*summary$/i,
    /^overview$/i,
    /^background$/i,
    /^introduction$/i,
    /^conclusion$/i
  ];
  return genericHeaders.some(pattern => pattern.test(text.trim()));
}

/**
 * Compute markdown confidence score (0-100)
 * Higher score = more likely to be markdown
 * @param {string} text - Text content
 * @returns {number} Confidence score 0-100
 */
function computeMarkdownConfidence(text) {
  if (!text) return 0;

  let score = 0;
  const lines = text.split('\n');

  // Headers (# ## ### etc) - strong indicator
  const headerMatches = text.match(/^#{1,6}\s+/gm) || [];
  score += Math.min(headerMatches.length * 15, 40);

  // Bold **text** - strong indicator
  const boldMatches = text.match(/\*\*[^*\n]+\*\*/g) || [];
  score += Math.min(boldMatches.length * 5, 20);

  // Italic *text* (but not list items)
  const italicMatches = text.match(/(?<!\*)\*[^*\n]+\*(?!\*)/g) || [];
  score += Math.min(italicMatches.length * 3, 10);

  // Unordered lists (- or * at start of line)
  const listMatches = text.match(/^\s*[-*+]\s+\S/gm) || [];
  score += Math.min(listMatches.length * 2, 15);

  // Ordered lists (1. 2. etc)
  const orderedMatches = text.match(/^\s*\d+\.\s+/gm) || [];
  score += Math.min(orderedMatches.length * 2, 10);

  // Code blocks or inline code
  if (/```/.test(text)) score += 10;
  const inlineCodeMatches = text.match(/`[^`\n]+`/g) || [];
  score += Math.min(inlineCodeMatches.length * 2, 10);

  // Links [text](url)
  const linkMatches = text.match(/\[[^\]]+\]\([^)]+\)/g) || [];
  score += Math.min(linkMatches.length * 3, 10);

  // Tables |col|col|
  const tableMatches = text.match(/^\|.+\|$/gm) || [];
  score += Math.min(tableMatches.length * 2, 10);

  // Blockquotes
  const quoteMatches = text.match(/^\s*>/gm) || [];
  score += Math.min(quoteMatches.length * 2, 5);

  return Math.min(score, 100);
}

/**
 * Check if text content contains markdown syntax
 * @param {string} text - Plain text content
 * @returns {boolean} True if text contains markdown patterns
 */
function containsMarkdownSyntax(text) {
  // Use confidence score - anything above 10 is likely markdown
  return computeMarkdownConfidence(text) >= 10;
}

/**
 * Normalize markdown by adding H1 title if missing
 * If the markdown has no H1 but appears to be valid markdown,
 * prepend a title using the document type
 * @param {string} markdown - Markdown content
 * @param {string} docType - Document type name (e.g., "One-Pager")
 * @returns {string} Normalized markdown with H1 title
 */
export function normalizeMarkdown(markdown, docType) {
  if (!markdown || !markdown.trim()) return markdown;

  // Check if markdown already has an H1
  const hasH1 = /^#\s+[^#]/m.test(markdown);
  if (hasH1) {
    return markdown; // Already has H1, no normalization needed
  }

  // Compute confidence that this is markdown
  const confidence = computeMarkdownConfidence(markdown);

  // If confidence is high enough (has markdown syntax), add H1
  // Threshold of 15 means at least one header OR a few other markdown elements
  if (confidence >= 15) {
    // Prepend H1 with document type
    return `# ${docType}\n\n${markdown}`;
  }

  // Low confidence - might be plain text, don't modify
  return markdown;
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
      const rawMarkdown = previewArea.value;
      if (!rawMarkdown.trim()) {
        showToast('No content to save', 'error');
        return;
      }

      // Normalize markdown: add H1 title if missing but content looks like markdown
      const markdown = normalizeMarkdown(rawMarkdown, docType);

      // Extract title from normalized markdown (will find the H1 we just added if needed)
      const title = extractTitleFromMarkdown(markdown, docType) || `Imported ${docType}`;
      const now = new Date().toISOString();

      // When importing, the document IS Phase 1 output - skip to Phase 2 for review
      const project = await saveProject(plugin.dbName, {
        title,
        formData: { title, importedContent: markdown },
        currentPhase: 2,  // Start at Phase 2 (review) since we already have the document
        phases: {
          1: {
            response: markdown,  // Save normalized markdown with H1
            completed: true,  // Phase 1 is complete - we have the document
            startedAt: now,
            completedAt: now
          }
        },
        isImported: true
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


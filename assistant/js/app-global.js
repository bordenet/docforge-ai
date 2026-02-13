/**
 * App Global Event Handlers and UI
 *
 * Handles theme toggle, privacy notice, import/export, and about modal.
 *
 * @module app-global
 */

import { showToast } from '../../shared/js/ui.js';
import { exportAllProjects, importProjects } from '../../shared/js/projects.js';
import { logger } from '../../shared/js/logger.js';

/**
 * Setup global event listeners
 */
export function setupGlobalEventListeners(plugin, toggleThemeFn) {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleThemeFn);

  // Privacy notice close
  document.getElementById('close-privacy-notice')?.addEventListener('click', () => {
    document.getElementById('privacy-notice')?.remove();
    localStorage.setItem('privacy-notice-dismissed', 'true');
  });

  // Show privacy notice if not dismissed
  if (!localStorage.getItem('privacy-notice-dismissed')) {
    document.getElementById('privacy-notice')?.classList.remove('hidden');
  }

  // Export all projects button
  document.getElementById('export-all-btn')?.addEventListener('click', async () => {
    try {
      await exportAllProjects(plugin.dbName, plugin.id);
      showToast('All projects exported', 'success');
    } catch (error) {
      logger.error('Export failed', error, 'app-global');
      showToast('Export failed', 'error');
    }
  });

  // Import projects button
  document.getElementById('import-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const imported = await importProjects(plugin.dbName, file);
          showToast(`Imported ${imported} project(s)`, 'success');
          if (window.location.hash === '#home' || !window.location.hash) {
            window.location.reload();
          }
        } catch (error) {
          logger.error('Import failed', error, 'app-global');
          showToast('Import failed: ' + error.message, 'error');
        }
      }
    };
    input.click();
  });

  // About link
  document.getElementById('about-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    showAboutModal(plugin);
  });
}

/**
 * Show about modal with plugin-specific content
 */
export function showAboutModal(plugin) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.id = 'about-modal';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">About ${plugin?.name || 'DocForgeAI'} Assistant</h3>
      <div class="text-gray-600 dark:text-gray-400 space-y-3">
        <p>A privacy-first tool for creating high-quality documents using AI assistance.</p>
        <p><strong>Features:</strong></p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Drafts stored locally in your browser</li>
          <li>You control when prompts are sent to AI</li>
          <li>3-phase adversarial AI workflow</li>
          <li>Multiple project management</li>
          <li>Import/export capabilities</li>
          <li>9 document types supported</li>
        </ul>
        <p class="text-sm">Drafts stored locally. You control when prompts are sent to AI.</p>
      </div>
      <div class="flex justify-end mt-6">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors close-about-btn">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.close-about-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}


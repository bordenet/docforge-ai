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

  // Plugin-specific metadata for About modal
  const pluginMeta = {
    'one-pager': {
      pluralName: 'One-Pagers',
      learnMoreText: 'one-pagers',
      description: 'A concise decision document that fits on one page. Used to get executive buy-in before investing in detailed planning.'
    },
    'prd': {
      pluralName: 'Product Requirements Documents',
      learnMoreText: 'PRDs',
      description: 'A Product Requirements Document defines WHAT to build and WHY. It bridges business goals and engineering implementation.'
    },
    'adr': {
      pluralName: 'Architecture Decision Records',
      learnMoreText: 'ADRs',
      description: 'Architecture Decision Records capture significant technical decisions, their context, and consequences. Essential for team knowledge sharing.'
    },
    'pr-faq': {
      pluralName: 'PR-FAQs',
      learnMoreText: 'PR-FAQs',
      description: 'An Amazon-style internal planning document. NOT an actual press release. It is a thinking tool that forces customer-centric product definition.'
    },
    'power-statement': {
      pluralName: 'Power Statements',
      learnMoreText: 'power statements',
      description: 'A sales technique for articulating value. Combines a customer pain point with quantified business impact to create compelling pitches.'
    },
    'acceptance-criteria': {
      pluralName: 'Acceptance Criteria',
      learnMoreText: 'acceptance criteria',
      description: 'Testable conditions that define when a user story is complete. Bridges the gap between requirements and QA.'
    },
    'jd': {
      pluralName: 'Job Descriptions',
      learnMoreText: 'job descriptions',
      description: 'Complete job descriptions with clear scope, leveling criteria, and realistic qualifications. Avoids common pitfalls that repel good candidates.'
    },
    'business-justification': {
      pluralName: 'Business Justifications',
      learnMoreText: 'business justifications',
      description: 'A business case document for headcount, budget, or investment requests. Quantifies ROI and risk.'
    },
    'strategic-proposal': {
      pluralName: 'Strategic Proposals',
      learnMoreText: 'sales proposals',
      description: 'A sales-focused proposal for strategic initiatives. Structures the pitch around customer pain points and measurable outcomes.'
    }
  };

  const meta = pluginMeta[plugin?.id] || {};
  const description = meta.description || plugin?.description || 'Create high-quality documents.';
  const pluralName = meta.pluralName || plugin?.name || 'Documents';
  const learnMoreText = meta.learnMoreText || plugin?.name?.toLowerCase() || 'this document type';
  const docsLink = plugin?.docsUrl
    ? `<p class="text-sm"><a href="${plugin.docsUrl}" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">📚 Learn more about ${learnMoreText} →</a></p>`
    : '';

  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">${plugin?.icon || '📄'} About ${pluralName}</h3>
      <div class="text-gray-600 dark:text-gray-400 space-y-3">
        <p class="font-medium">${description}</p>
        ${docsLink}
        <hr class="border-gray-200 dark:border-gray-700">
        <p class="text-sm"><strong>How this tool works:</strong></p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Fill out the form with your document details</li>
          <li>Copy generated prompts to external AI (Claude, Gemini, etc)</li>
          <li>Paste AI responses back here</li>
          <li>3-phase workflow: generate → critique → synthesize</li>
        </ul>
        <p class="text-xs text-gray-500 dark:text-gray-500"><strong>Note:</strong> Drafts stored locally. Human-controlled workflow: you review prompts before sending to AI.</p>
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


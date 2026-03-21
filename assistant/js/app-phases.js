/**
 * App Phase Event Handlers
 *
 * Handles phase navigation, prompt copying, response saving for the 3-phase workflow.
 *
 * @module app-phases
 */

import { getProject, saveProject, deleteProject } from '../../shared/js/storage.js';
import {
  showToast,
  copyToClipboard,
  confirm,
  createActionMenu,
  showPromptModal,
  downloadFile,
  renderMarkdown,
} from '../../shared/js/ui.js';
import { generatePrompt } from '../../shared/js/prompt-generator.js';
import { renderPhaseContent } from '../../shared/js/views.js';
import { logger } from '../../shared/js/logger.js';
import { initDiffModule, handleSaveResponse, showDiffModal } from './app-phases-diff.js';
import { trackPhase } from '../../shared/js/analytics.js';
import { getExportFilename } from '../../shared/js/workflow.js';

// Cache script-load promises so we only pull third-party exporters once per page
const SCRIPT_LOADS = new Map();

// Phase output saves are async (IndexedDB). Track in-flight saves per project so actions like
// Copy Final / Tune & Refine always use the most recently saved Phase 3 content.
/** @type {Map<string, Promise<any>>} */
const RESPONSE_SAVE_IN_FLIGHT = new Map();

async function awaitResponseSave(projectId) {
	const p = RESPONSE_SAVE_IN_FLIGHT.get(projectId);
	if (!p) return;
	try {
		await p;
	} finally {
		// Only clear if the same promise is still registered.
		if (RESPONSE_SAVE_IN_FLIGHT.get(projectId) === p) {
			RESPONSE_SAVE_IN_FLIGHT.delete(projectId);
		}
	}
}

function loadScriptOnce(url, globalVar) {
  if (globalVar && window[globalVar]) return Promise.resolve();
  if (SCRIPT_LOADS.has(url)) return SCRIPT_LOADS.get(url);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      if (!globalVar || window[globalVar]) {
        resolve();
      } else {
        reject(new Error(`Script loaded but global '${globalVar}' was not found`));
      }
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });

  SCRIPT_LOADS.set(url, promise);
  return promise;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getExportBaseFilename(project) {
  const md = getExportFilename(project);
  return md.endsWith('.md') ? md.slice(0, -3) : md;
}

const EXPORT_CSS = `
  body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #111827; }
  h1, h2, h3 { margin: 1.1em 0 0.6em; }
  p { margin: 0.6em 0; }
  ul, ol { margin: 0.6em 0 0.6em 1.25em; }
  pre { background: #f3f4f6; padding: 12px; border-radius: 8px; overflow: auto; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e5e7eb; padding: 8px; vertical-align: top; }
  th { background: #f9fafb; }
  a { color: #2563eb; text-decoration: none; }
`;

function buildExportHtmlDocument({ title, bodyHtml }) {
  // TODO(superpower-fast-follow): Export from Markdown AST -> a document model (DOCX/PDF)
  // for higher fidelity tables, page breaks, and predictable typography.
  const safeTitle = String(title || 'Document').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${safeTitle}</title>
    <style>
      ${EXPORT_CSS}
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`;
}

async function exportFinalAsMarkdown(plugin, project) {
	await awaitResponseSave(project.id);
  const freshProject = await getProject(plugin.dbName, project.id);
  const finalResponse = freshProject.phases?.[3]?.response || '';
  if (!finalResponse) {
    showToast('No final document to download', 'warning');
    return;
  }
  const filename = getExportFilename(freshProject);
  downloadFile(finalResponse, filename, 'text/markdown');
  trackPhase(3, 'download-md', plugin.id);
  showToast('Downloaded Markdown', 'success');
}

async function exportFinalAsDocx(plugin, project) {
	await awaitResponseSave(project.id);
  const freshProject = await getProject(plugin.dbName, project.id);
  const finalResponse = freshProject.phases?.[3]?.response || '';
  if (!finalResponse) {
    showToast('No final document to download', 'warning');
    return;
  }

  showToast('Preparing Word export...', 'info');
  // html-docx-js exposes window.htmlDocx
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.min.js', 'htmlDocx');

  const bodyHtml = renderMarkdown(finalResponse);
  const html = buildExportHtmlDocument({ title: freshProject.title || freshProject.name, bodyHtml });
  const blob = window.htmlDocx.asBlob(html);
  const filename = `${getExportBaseFilename(freshProject)}.docx`;
  downloadBlob(blob, filename);
  trackPhase(3, 'download-docx', plugin.id);
  showToast('Downloaded Word document', 'success');
}

async function exportFinalAsPdf(plugin, project) {
	await awaitResponseSave(project.id);
  const freshProject = await getProject(plugin.dbName, project.id);
  const finalResponse = freshProject.phases?.[3]?.response || '';
  if (!finalResponse) {
    showToast('No final document to download', 'warning');
    return;
  }

  showToast('Preparing PDF export...', 'info');
  // html2pdf bundle exposes window.html2pdf
  await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', 'html2pdf');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = 'white';
  container.style.padding = '24px';
  container.innerHTML = `<style>${EXPORT_CSS}</style><div>${renderMarkdown(finalResponse)}</div>`;
  document.body.appendChild(container);

  const filename = `${getExportBaseFilename(freshProject)}.pdf`;
  try {
    await window
      .html2pdf()
      .set({
        margin: 10,
        filename,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save();

    trackPhase(3, 'download-pdf', plugin.id);
    showToast('Downloaded PDF', 'success');
  } finally {
    container.remove();
  }
}

/**
 * Update phase tab styles
 */
export function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach((tab) => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}

/**
 * Attach event listeners for phase interactions
 */
export function attachPhaseEventListeners(plugin, project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const exportFinalBtn = document.getElementById('export-final-btn');
  const downloadMenuBtn = document.getElementById('download-menu-btn');

  // Copy prompt button
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      try {
        // Debug: Log formData to help diagnose empty prompt issues
        if (!project.formData || Object.keys(project.formData).length === 0) {
          logger.warn('Project formData is empty - prompt will have no user inputs', 'app-phases');
          console.warn('[DocForge Debug] project.formData is empty:', project.formData);
          console.warn('[DocForge Debug] Full project object:', project);
        }

        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        const options = { isImported: project.isImported || false };
        const prompt = await generatePrompt(plugin, phase, project.formData, previousResponses, options);
        await copyToClipboard(prompt);
        showToast('Prompt copied to clipboard!', 'success');

        // Track phase prompt copy
        trackPhase(phase, 'copy', plugin.id);

        if (!project.phases) project.phases = {};
        if (!project.phases[phase]) project.phases[phase] = { prompt: '', response: '', completed: false };
        project.phases[phase].prompt = prompt;
        await saveProject(plugin.dbName, project);

        // Enable the "Open AI" button
        const openAiBtn = document.getElementById('open-ai-btn');
        if (openAiBtn) {
          openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          openAiBtn.classList.add('hover:bg-green-700');
          openAiBtn.removeAttribute('aria-disabled');
        }

        // Enable the response textarea
        if (responseTextarea) {
          responseTextarea.disabled = false;
          responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
          responseTextarea.focus();
        }

        if (saveResponseBtn) saveResponseBtn.disabled = false;
      } catch (error) {
        logger.error('Failed to copy prompt', error, 'app-phases');
        showToast('Failed to copy prompt', 'error');
      }
    });
  }

  // Enable save button as user types
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasContent = responseTextarea.value.trim().length >= 3;
      if (saveResponseBtn) saveResponseBtn.disabled = !hasContent;
    });
  }

  // Save response button
  if (saveResponseBtn) {
    // Initialize diff module with callbacks on first use
    initDiffModule(updatePhaseTabStyles, attachPhaseEventListeners);
	  saveResponseBtn.addEventListener('click', async () => {
			if (!project?.id) return;
			if (RESPONSE_SAVE_IN_FLIGHT.has(project.id)) return;

			// Prevent duplicate save clicks; other actions will await this save via awaitResponseSave().
			saveResponseBtn.disabled = true;

			const p = handleSaveResponse(plugin, project, phase, responseTextarea);
			RESPONSE_SAVE_IN_FLIGHT.set(project.id, p);
			try {
				await p;
			} finally {
				// Best-effort re-enable; content may have re-rendered.
				if (RESPONSE_SAVE_IN_FLIGHT.get(project.id) === p) {
					RESPONSE_SAVE_IN_FLIGHT.delete(project.id);
				}
				// Phase content may have re-rendered.
				// Let the input listener decide disabled state based on content.
				if (responseTextarea) {
					const hasContent = responseTextarea.value.trim().length >= 3;
					saveResponseBtn.disabled = !hasContent;
				} else {
					saveResponseBtn.disabled = false;
				}
			}
		});
  }

  // Next phase button
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;
      const freshProject = await getProject(plugin.dbName, project.id);
      freshProject.currentPhase = nextPhase;

      updatePhaseTabStyles(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, nextPhase);
      attachPhaseEventListeners(plugin, freshProject, nextPhase);
    });
  }

  // Export final document button (Phase 3 complete)
  if (exportFinalBtn) {
    exportFinalBtn.addEventListener('click', async () => {
			await awaitResponseSave(project.id);
      const freshProject = await getProject(plugin.dbName, project.id);
      const finalResponse = freshProject.phases?.[3]?.response || '';
      if (finalResponse) {
        await copyToClipboard(finalResponse);
        showToast('Final document copied to clipboard!', 'success');
      } else {
        showToast('No final document to copy', 'warning');
      }
    });
  }

  // Tune & Refine button - copies document to clipboard AND opens validator
  const validateBtn = document.getElementById('validate-btn');
  if (validateBtn) {
	  validateBtn.addEventListener('click', async (e) => {
	    // When the button is placed inside a <summary> expando row, prevent toggling the <details>.
	    e?.preventDefault?.();
	    e?.stopPropagation?.();

			await awaitResponseSave(project.id);
      const freshProject = await getProject(plugin.dbName, project.id);
      const finalResponse = freshProject.phases?.[3]?.response || '';
      const validatorUrl = validateBtn.dataset.validatorUrl;

      if (finalResponse) {
        await copyToClipboard(finalResponse);
        showToast('Document copied! Opening Tune & Refine...', 'success');
        // Small delay to ensure toast is visible before new tab opens
        setTimeout(() => {
          window.open(validatorUrl, '_blank', 'noopener,noreferrer');
        }, 300);
      } else {
        showToast('No document to validate', 'warning');
      }
    });
  }

  // Download menu (Phase 3 complete) - Markdown / Word / PDF
  if (downloadMenuBtn) {
    const hasFinal = Boolean(project.phases?.[3]?.response);
    createActionMenu({
      triggerElement: downloadMenuBtn,
      items: [
        {
          label: 'Markdown (.md)',
          icon: '📝',
          disabled: !hasFinal,
          onClick: async () => {
            try {
              await exportFinalAsMarkdown(plugin, project);
            } catch (error) {
              logger.error('Markdown export failed', error, 'app-phases');
              showToast('Markdown export failed', 'error');
            }
          },
        },
        {
          label: 'Word (.docx)',
          icon: '📄',
          disabled: !hasFinal,
          onClick: async () => {
            try {
              await exportFinalAsDocx(plugin, project);
            } catch (error) {
              logger.error('DOCX export failed', error, 'app-phases');
              showToast('Word export failed', 'error');
            }
          },
        },
        {
          label: 'PDF (.pdf)',
          icon: '🧾',
          disabled: !hasFinal,
          onClick: async () => {
            try {
              await exportFinalAsPdf(plugin, project);
            } catch (error) {
              logger.error('PDF export failed', error, 'app-phases');
              showToast('PDF export failed', 'error');
            }
          },
        },
      ],
      position: 'bottom-end',
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (moreActionsBtn) {
    // Build menu items based on current state
    const menuItems = [];

    // Preview Prompt (always available - generates prompt on demand)
    menuItems.push({
      label: 'Preview Prompt',
      icon: '👁️',
      onClick: async () => {
        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        const options = { isImported: project.isImported || false };
        const prompt = await generatePrompt(plugin, phase, project.formData, previousResponses, options);
        showPromptModal(prompt, `Phase ${phase} Prompt`);
      },
    });

    // Edit Details (always available - go back to form)
    menuItems.push({
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => {
        // Navigate to edit form with project ID
        window.location.hash = `edit/${project.id}`;
      },
    });

    // Compare Phases (only if 2+ phases completed)
    const completedCount = [1, 2, 3].filter((p) => project.phases?.[p]?.response).length;
    if (completedCount >= 2) {
      menuItems.push({
        label: 'Compare Phases',
        icon: '🔄',
        onClick: () => {
          const phases = {
            1: project.phases?.[1]?.response || '',
            2: project.phases?.[2]?.response || '',
            3: project.phases?.[3]?.response || '',
          };
          const completedPhases = [1, 2, 3].filter((p) => phases[p]);
          showDiffModal(plugin, phases, completedPhases);
        },
      });
    }

    // Separator before destructive action
    menuItems.push({ separator: true });

    // Delete (destructive)
    menuItems.push({
      label: 'Delete...',
      icon: '🗑️',
      destructive: true,
      onClick: async () => {
        const title = project.title || project.formData?.title || 'this project';
        if (await confirm(`Are you sure you want to delete "${title}"?`, 'Delete Project')) {
          await deleteProject(plugin.dbName, project.id);
          showToast('Project deleted', 'success');
          window.location.hash = '';
        }
      },
    });

    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end',
    });
  }
}



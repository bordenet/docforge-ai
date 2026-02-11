/**
 * App Event Handlers
 *
 * Handles list view, new project form, and project view event handlers.
 *
 * @module app-handlers
 */

import { getProject, deleteProject, saveProject } from '../../shared/js/storage.js';
import { extractFormData, validateFormData } from '../../shared/js/form-generator.js';
import { showToast, copyToClipboard } from '../../shared/js/ui.js';
import { showImportModal } from '../../shared/js/import-modal.js';
import { renderPhaseContent } from '../../shared/js/views.js';
import { attachPhaseEventListeners, updatePhaseTabStyles } from './app-phases.js';

/**
 * Setup event handlers for list view
 */
export function setupListEventHandlers(plugin, renderListFn) {
  // Project card clicks - navigate to project
  document.querySelectorAll('[data-project-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        const projectId = card.dataset.projectId;
        window.location.hash = `project/${projectId}`;
      }
    });
  });

  // Delete button clicks
  document.querySelectorAll('.delete-project-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = btn.dataset.delete;
      if (confirm('Delete this project?')) {
        await deleteProject(plugin.dbName, id);
        showToast('Project deleted', 'success');
        const container = document.getElementById('app-container');
        if (container) {
          await renderListFn(container);
        }
      }
    });
  });

  // Preview button clicks (for completed projects)
  document.querySelectorAll('.preview-project-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = await getProject(plugin.dbName, projectId);
      if (project?.phases?.[3]?.response) {
        await copyToClipboard(project.phases[3].response);
        showToast('Final document copied to clipboard!', 'success');
      } else {
        showToast('No final document to copy', 'warning');
      }
    });
  });
}

/**
 * Setup event handlers for new project form
 */
export function setupNewFormEventHandlers(plugin, templates) {
  const form = document.getElementById('new-project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = extractFormData(plugin.formFields);
    const validation = validateFormData(plugin.formFields, formData);
    if (!validation.valid) {
      showToast(validation.errors[0], 'error');
      return;
    }
    const project = await saveProject(plugin.dbName, {
      formData,
      title: formData.title,
      currentPhase: 1,
    });
    showToast('Project created!', 'success');
    window.location.hash = `project/${project.id}`;
  });

  // Template selection handlers
  document.querySelectorAll('.template-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const template = templates.find((t) => t.id === templateId);

      document.querySelectorAll('.template-btn').forEach((b) => {
        b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
        b.classList.add('border-gray-200', 'dark:border-gray-600');
      });
      btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
      btn.classList.remove('border-gray-200', 'dark:border-gray-600');

      if (template?.fields) {
        Object.keys(template.fields).forEach((fieldId) => {
          const input = document.getElementById(fieldId);
          if (input) input.value = template.fields[fieldId];
        });
      }
    });
  });

  // Import button handler
  document.getElementById('import-doc-btn')?.addEventListener('click', () => {
    showImportModal(plugin, saveProject, (project) => {
      window.location.hash = `project/${project.id}`;
    });
  });
}

/**
 * Attach event listeners for project view
 */
export function attachProjectEventListeners(plugin, project, phase) {
  // Phase tab navigation
  document.querySelectorAll('.phase-tab').forEach((tab) => {
    tab.addEventListener('click', async () => {
      const targetPhase = parseInt(tab.dataset.phase);
      const freshProject = await getProject(plugin.dbName, project.id);

      // Guard: Can only navigate to a phase if all prior phases are complete
      if (targetPhase > 1) {
        const priorPhase = targetPhase - 1;
        const priorPhaseComplete = freshProject.phases?.[priorPhase]?.completed;
        if (!priorPhaseComplete) {
          showToast(`Complete Phase ${priorPhase} before proceeding to Phase ${targetPhase}`, 'warning');
          return;
        }
      }

      freshProject.currentPhase = targetPhase;
      updatePhaseTabStyles(targetPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(plugin, freshProject, targetPhase);
      attachPhaseEventListeners(plugin, freshProject, targetPhase);
    });
  });

  attachPhaseEventListeners(plugin, project, phase);
}


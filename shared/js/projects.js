/**
 * Project Management Module
 * Business logic layer on top of storage
 * @module projects
 */

import { saveProject, getProject, getAllProjects } from './storage.js';

// ============================================================================
// Configuration Constants
// ============================================================================

/** Minimum title length to be considered valid (shorter is likely truncated or generic) */
const MIN_TITLE_LENGTH = 10;

/** Maximum title length before it's considered a sentence rather than a title */
const MAX_TITLE_LENGTH = 150;

/** Maximum length for sanitized filenames */
const MAX_FILENAME_LENGTH = 50;

/**
 * Extract title from final document markdown content
 * @param {string} markdown - Document markdown content
 * @returns {string} Extracted title or empty string
 */
export function extractTitleFromMarkdown(markdown) {
  if (!markdown) return '';

  // First try: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const title = h1Match[1].trim();
    // Skip generic headers like "PRESS RELEASE" or "Press Release"
    if (!/^press\s+release$/i.test(title)) {
      return title;
    }
  }

  // Second try: Bold headline after "# PRESS RELEASE" or "## Press Release"
  const prMatch = markdown.match(/^#\s*PRESS\s*RELEASE\s*$/im);
  if (prMatch) {
    const startIdx = markdown.indexOf(prMatch[0]) + prMatch[0].length;
    const afterPR = markdown.slice(startIdx).trim();
    const boldMatch = afterPR.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      return boldMatch[1].trim();
    }
  }

  // Third try: First bold line in the document
  const firstBoldMatch = markdown.match(/\*\*(.+?)\*\*/);
  if (firstBoldMatch) {
    const title = firstBoldMatch[1].trim();
    // Only use if it looks like a headline (not too long, not a sentence)
    if (
      title.length > MIN_TITLE_LENGTH &&
      title.length < MAX_TITLE_LENGTH &&
      !title.endsWith('.')
    ) {
      return title;
    }
  }

  return '';
}

/**
 * Update project phase data with auto-advance and title extraction
 * @param {string} dbName - Database name (plugin-specific)
 * @param {string} projectId - Project ID
 * @param {number} phase - Phase number (1-3)
 * @param {string} prompt - Phase prompt
 * @param {string} response - Phase response
 * @param {Object} options - Options
 * @param {boolean} [options.skipAutoAdvance=false] - Skip auto-advance
 * @returns {Promise<Object>} Updated project
 */
export async function updatePhase(dbName, projectId, phase, prompt, response, options = {}) {
  const project = await getProject(dbName, projectId);
  if (!project) throw new Error('Project not found');

  const { skipAutoAdvance = false } = options;

  // Initialize phases if needed
  if (!project.phases) {
    project.phases = {};
  }

  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response,
  };

  // Keep legacy flat field for backward compatibility
  if (response) {
    const phaseKey = `phase${phase}_output`;
    project[phaseKey] = response;
  }

  // Auto-advance to next phase if current phase is completed (unless skipped)
  if (response && phase < 3 && !skipAutoAdvance) {
    project.phase = phase + 1;
    project.currentPhase = phase + 1;
  }

  // Phase 3: Extract title from final document only if no title exists
  // Don't overwrite user-provided title from form
  if (phase === 3 && response && !project.title && !project.formData?.title) {
    const extractedTitle = extractTitleFromMarkdown(response);
    if (extractedTitle) {
      project.title = extractedTitle;
      project.name = extractedTitle; // Legacy compatibility
    }
  }

  return saveProject(dbName, project);
}

/**
 * Update project metadata
 * @param {string} dbName - Database name
 * @param {string} projectId - Project ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated project
 */
export async function updateProject(dbName, projectId, updates) {
  const project = await getProject(dbName, projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, updates);
  return saveProject(dbName, project);
}

/**
 * Sanitize filename for export
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return (filename || 'untitled')
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, MAX_FILENAME_LENGTH);
}

/**
 * Export a single project as JSON download
 * @param {string} dbName - Database name
 * @param {string} projectId - Project ID
 */
export async function exportProject(dbName, projectId) {
  const project = await getProject(dbName, projectId);
  if (!project) throw new Error('Project not found');

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title || project.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all projects as a backup JSON
 * @param {string} dbName - Database name
 * @param {string} pluginId - Plugin ID for filename
 */
export async function exportAllProjects(dbName, pluginId = 'docforge') {
  const projects = await getAllProjects(dbName);

  const backup = {
    version: '1.0',
    pluginId,
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pluginId}-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import projects from JSON file
 * @param {string} dbName - Database name
 * @param {File} file - File object to import
 * @returns {Promise<number>} Number of imported projects
 */
export async function importProjects(dbName, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        let imported = 0;

        if (content.version && content.projects) {
          // Backup file format
          for (const project of content.projects) {
            await saveProject(dbName, project);
            imported++;
          }
        } else if (content.id && (content.title || content.name)) {
          // Single project format
          await saveProject(dbName, content);
          imported = 1;
        } else {
          throw new Error('Invalid file format');
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Re-export storage functions for convenience
export { getProject, getAllProjects, deleteProject } from './storage.js';

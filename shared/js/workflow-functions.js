/**
 * Workflow Standalone Functions
 * Functional API for project data manipulation without Workflow class
 * @module workflow-functions
 */

import { generateId } from './storage.js';
import { PHASES, getPhaseData } from './workflow-config.js';

/**
 * Create a new project
 * @param {string} name - Project name
 * @param {string} description - Project description
 * @returns {Object} New project object
 */
export function createProject(name, description) {
  return {
    id: generateId(),
    name,
    description,
    created: Date.now(),
    modified: Date.now(),
    currentPhase: 1,
    formData: {},
    phases: PHASES.map((phase) => ({
      number: phase.number,
      name: phase.name,
      type: phase.type,
      prompt: '',
      response: '',
      completed: false,
    })),
  };
}

/**
 * Update project form data
 * @param {Object} project - Project object
 * @param {Object} formData - Form data to merge
 * @returns {Object} Updated project
 */
export function updateFormData(project, formData) {
  project.formData = { ...project.formData, ...formData };
  return project;
}

/**
 * Validate current phase
 * @param {Object} project - Project object
 * @param {Object} [requiredFields] - Required form fields for phase 1
 * @returns {{valid: boolean, error?: string}}
 */
export function validatePhase(project, requiredFields = ['title']) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  const phaseData = getPhaseData(project, phaseNumber);

  // Phase 1: Validate form data
  if (phaseNumber === 1 && requiredFields.length > 0) {
    for (const field of requiredFields) {
      if (!project.formData?.[field] || project.formData[field].trim() === '') {
        return { valid: false, error: `Please fill in the ${field}` };
      }
    }
  }

  // All phases: Validate response
  if (!phaseData.response || phaseData.response.trim() === '') {
    return { valid: false, error: 'Please paste the AI response' };
  }

  return { valid: true };
}

/**
 * Advance to next phase
 * @param {Object} project - Project object
 * @returns {Object} Updated project
 */
export function advancePhase(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  const phaseData = getPhaseData(project, phaseNumber);

  if (phaseData) {
    phaseData.completed = true;
  }

  if (phaseNumber <= PHASES.length) {
    project.currentPhase = phaseNumber + 1;
    project.phase = phaseNumber + 1;
  }

  return project;
}

/**
 * Check if project is complete
 * @param {Object} project - Project object
 * @returns {boolean} True if all phases completed
 */
export function isProjectComplete(project) {
  if (Array.isArray(project.phases)) {
    return project.phases.every((phase) => phase.completed);
  }
  return [1, 2, 3].every((num) => getPhaseData(project, num).completed);
}

/**
 * Get current phase data
 * @param {Object} project - Project object
 * @returns {Object} Current phase data
 */
export function getCurrentPhase(project) {
  const phaseNumber = project.currentPhase || project.phase || 1;
  return getPhaseData(project, phaseNumber);
}

/**
 * Update current phase response
 * @param {Object} project - Project object
 * @param {string} response - Response text
 * @returns {Object} Updated project
 */
export function updatePhaseResponse(project, response) {
  const phase = getCurrentPhase(project);
  phase.response = response;
  return project;
}

/**
 * Get project progress percentage
 * @param {Object} project - Project object
 * @returns {number} Progress 0-100
 */
export function getProgress(project) {
  if (!project.phases) return 0;
  const completedPhases = project.phases.filter((p) => p.completed).length;
  return Math.round((completedPhases / PHASES.length) * 100);
}

/**
 * Generate export filename for project
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  const title = project.title || project.name || 'document';
  return `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
}


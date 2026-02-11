/**
 * Workflow Module - 3-phase document workflow engine
 * @module workflow
 */

import { generateId } from './storage.js';
import { generatePrompt as generatePromptFromTemplate } from './prompt-generator.js';

/**
 * Workflow configuration
 */
export const WORKFLOW_CONFIG = {
  phaseCount: 3,
  phases: [
    {
      number: 1,
      name: 'Generate',
      description: 'Create initial draft with AI assistance',
      aiModel: 'Claude',
      icon: '✨',
      type: 'generate'
    },
    {
      number: 2,
      name: 'Critique',
      description: 'Get alternative perspective and identify weaknesses',
      aiModel: 'Gemini',
      icon: '🔍',
      type: 'critique'
    },
    {
      number: 3,
      name: 'Synthesize',
      description: 'Combine perspectives into final polished document',
      aiModel: 'Claude',
      icon: '🎯',
      type: 'synthesize'
    }
  ]
};

// Legacy alias for backward compatibility
export const PHASES = WORKFLOW_CONFIG.phases;

/**
 * Get phase metadata by number
 * @param {number} phaseNumber - Phase number (1-3)
 * @returns {Object|undefined} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Helper to get phase output from project
 * @param {Object} project - Project object
 * @param {number} phaseNum - Phase number (1-3)
 * @returns {string} Phase output or empty string
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical)
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Legacy nested format
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

/**
 * Workflow Class - Canonical implementation for 3-phase document workflow
 */
export class Workflow {
  /**
   * @param {Object} project - Project object
   * @param {import('./plugin-registry.js').DocumentTypePlugin} [plugin] - Plugin for prompt generation
   */
  constructor(project, plugin = null) {
    this.project = project;
    this.plugin = plugin;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || project.currentPhase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
   * Get current phase configuration
   * @returns {Object} Phase config
   */
  getCurrentPhase() {
    if (this.currentPhase > WORKFLOW_CONFIG.phaseCount) {
      return WORKFLOW_CONFIG.phases[WORKFLOW_CONFIG.phaseCount - 1];
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   * @returns {Object|null} Next phase config or null if on last phase
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
   * Check if workflow is complete
   * @returns {boolean} True if past phase 3
   */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
   * Advance to next phase
   * @returns {boolean} True if advanced, false if already complete
   */
  advancePhase() {
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Go back to previous phase
   * @returns {boolean} True if went back, false if at phase 1
   */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      this.project.currentPhase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Save phase output
   * @param {string} output - Phase output content
   */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
    this.project.modified = Date.now();
  }

  /**
   * Get phase output
   * @param {number} phaseNumber - Phase number (1-3)
   * @returns {string} Phase output or empty string
   */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
   * Generate prompt for current phase
   * @returns {Promise<string>} Prompt text
   */
  async generatePrompt() {
    if (this.currentPhase < 1 || this.currentPhase > WORKFLOW_CONFIG.phaseCount) {
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }

    if (!this.plugin) {
      throw new Error('Plugin required for prompt generation');
    }

    const formData = this.project.formData || {};
    const previousResponses = {
      1: this.getPhaseOutput(1),
      2: this.getPhaseOutput(2)
    };

    return generatePromptFromTemplate(this.plugin, this.currentPhase, formData, previousResponses);
  }

  /**
   * Export final document as markdown
   * @returns {string} Markdown content
   */
  exportAsMarkdown() {
    const phase3 = this.getPhaseOutput(3);
    const phase1 = this.getPhaseOutput(1);
    const phase2 = this.getPhaseOutput(2);

    let content;
    if (phase3) {
      content = phase3;
    } else if (phase1) {
      content = phase1;
    } else if (phase2) {
      content = phase2;
    } else {
      content = `# ${this.project.title || this.project.name || 'Untitled'}\n\nNo content generated yet.`;
    }

    return content + '\n\n---\n\n*Generated with DocForgeAI*';
  }

  /**
   * Get workflow progress percentage
   * @returns {number} Progress 0-100
   */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}

// ============================================================================
// Standalone Helper Functions
// ============================================================================

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
    phases: PHASES.map(phase => ({
      number: phase.number,
      name: phase.name,
      type: phase.type,
      prompt: '',
      response: '',
      completed: false
    }))
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
 * Get phase data from project
 * @param {Object} project - Project object
 * @param {number} phaseNum - Phase number (1-3)
 * @returns {Object} Phase data
 */
function getPhaseData(project, phaseNum) {
  const defaultPhase = { prompt: '', response: '', completed: false };
  if (!project.phases) return defaultPhase;

  if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
    return project.phases[phaseNum - 1];
  }
  if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
    return project.phases[phaseNum];
  }
  return defaultPhase;
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
    return project.phases.every(phase => phase.completed);
  }
  return [1, 2, 3].every(num => getPhaseData(project, num).completed);
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
  const completedPhases = project.phases.filter(p => p.completed).length;
  return Math.round((completedPhases / PHASES.length) * 100);
}

/**
 * Get final markdown from project
 * @param {Object} project - Project object
 * @returns {string|null} Markdown content or null
 */
export function getFinalMarkdown(project) {
  const workflow = new Workflow(project);
  const phase3 = workflow.getPhaseOutput(3);
  const phase1 = workflow.getPhaseOutput(1);
  const phase2 = workflow.getPhaseOutput(2);

  if (phase3) return phase3;
  if (phase1) return phase1;
  if (phase2) return phase2;
  return null;
}

/**
 * Export final document as markdown
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
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


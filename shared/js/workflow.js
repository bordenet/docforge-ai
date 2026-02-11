/**
 * Workflow Module - 3-phase document workflow engine
 * @module workflow
 *
 * This module provides two complementary APIs:
 *
 * 1. **Workflow Class** (OOP API) - For runtime workflow orchestration:
 *    - Phase navigation (getCurrentPhase, advancePhase, previousPhase)
 *    - Output management (getPhaseOutput, savePhaseOutput)
 *    - Prompt generation (requires plugin)
 *    - Export (exportAsMarkdown)
 *
 * 2. **Standalone Functions** (Functional API) - For project data manipulation:
 *    - createProject, updateFormData - Project lifecycle
 *    - advancePhase, getCurrentPhase - Phase state management
 *    - validatePhase, isProjectComplete - Validation
 *    - getProgress, getExportFilename - Utilities
 *    - getFinalMarkdown, exportFinalDocument - Delegates to Workflow class
 *
 * The Workflow class wraps a project object for stateful operations.
 * The standalone functions operate directly on project data.
 */

import { generatePrompt as generatePromptFromTemplate } from './prompt-generator.js';
import {
  WORKFLOW_CONFIG,
  PHASES,
  getPhaseMetadata,
  getPhaseOutputInternal,
} from './workflow-config.js';
import {
  createProject,
  updateFormData,
  validatePhase,
  advancePhase as advancePhaseFunction,
  isProjectComplete,
  getCurrentPhase as getCurrentPhaseFunction,
  updatePhaseResponse,
  getProgress as getProgressFunction,
  getExportFilename,
} from './workflow-functions.js';

// Re-export config for backward compatibility
export { WORKFLOW_CONFIG, PHASES, getPhaseMetadata };

// Re-export standalone functions for backward compatibility
export {
  createProject,
  updateFormData,
  validatePhase,
  advancePhaseFunction as advancePhase,
  isProjectComplete,
  getCurrentPhaseFunction as getCurrentPhase,
  updatePhaseResponse,
  getProgressFunction as getProgress,
  getExportFilename,
};

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
    return WORKFLOW_CONFIG.phases.find((p) => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   * @returns {Object|null} Next phase config or null if on last phase
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find((p) => p.number === this.currentPhase + 1);
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
      2: this.getPhaseOutput(2),
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
// Workflow-dependent Functions
// These functions require the Workflow class instance for their implementation
// ============================================================================

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

/**
 * Workflow Configuration Module
 * Contains phase definitions and workflow configuration constants
 * @module workflow-config
 */

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
      type: 'generate',
    },
    {
      number: 2,
      name: 'Critique',
      description: 'Get alternative perspective and identify weaknesses',
      aiModel: 'Gemini',
      icon: '🔍',
      type: 'critique',
    },
    {
      number: 3,
      name: 'Synthesize',
      description: 'Combine perspectives into final polished document',
      aiModel: 'Claude',
      icon: '🎯',
      type: 'synthesize',
    },
  ],
};

// Legacy alias for backward compatibility
export const PHASES = WORKFLOW_CONFIG.phases;

/**
 * Get phase metadata by number
 * @param {number} phaseNumber - Phase number (1-3)
 * @returns {Object|undefined} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find((p) => p.number === phaseNumber);
}

/**
 * Helper to get phase output from project
 * @param {Object} project - Project object
 * @param {number} phaseNum - Phase number (1-3)
 * @returns {string} Phase output or empty string
 */
export function getPhaseOutputInternal(project, phaseNum) {
	if (!project) return '';

	// Nested format is the primary source of truth in the Assistant UI.
	// If both nested + flat exist, prefer nested to avoid stale reads when legacy fields drift.
	const phases = project.phases;
	let nested = '';
	if (phases) {
		if (Array.isArray(phases) && phases[phaseNum - 1]) {
			nested = phases[phaseNum - 1].response || '';
		} else if (phases[phaseNum] && typeof phases[phaseNum] === 'object') {
			nested = phases[phaseNum].response || '';
		} else if (phases[String(phaseNum)] && typeof phases[String(phaseNum)] === 'object') {
			nested = phases[String(phaseNum)].response || '';
		}
	}
	if (nested) return nested;

	// Flat legacy format (kept in sync for backward compatibility)
	const flatKey = `phase${phaseNum}_output`;
	return project[flatKey] || '';
}

/**
 * Get phase data from project
 * @param {Object} project - Project object
 * @param {number} phaseNum - Phase number (1-3)
 * @returns {Object} Phase data
 */
export function getPhaseData(project, phaseNum) {
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


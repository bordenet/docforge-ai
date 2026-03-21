/**
 * Project-scoped validator storage (IndexedDB)
 * Keeps validator drafts + version history out of the canonical project record.
 */

import { getProject, getValidatorState, saveValidatorState } from './storage.js';
import { getPhaseOutputInternal } from './workflow-config.js';
import { sanitizeString } from './storage-sanitization.js';

function createEmptyHistory() {
  return { versions: [], currentIndex: -1 };
}

function getTimeSince(isoDate) {
  if (!isoDate) return '--';
  const saved = new Date(isoDate);
  const now = new Date();
  const diffMs = now - saved;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  return saved.toLocaleDateString();
}

/**
 * @param {Object} params
 * @param {string} params.dbName
 * @param {string} params.projectId
 * @param {number} params.phaseNumber
 * @param {number} [params.maxVersions=10]
 */
export function createProjectValidatorStorage({ dbName, projectId, phaseNumber, maxVersions = 10 }) {
  const phaseKey = String(phaseNumber);

  async function ensureState() {
    let state = await getValidatorState(dbName, projectId);

    if (!state) {
	      const project = await getProject(dbName, projectId);
	      if (!project) {
	        // Hard contract: do not create validatorState for non-existent projects.
	        throw new Error('Project not found');
	      }
	      const seed = getPhaseOutputInternal(project, phaseNumber) || '';
      const now = new Date().toISOString();

      const history = createEmptyHistory();
      if (seed) {
        history.versions.push({ markdown: seed, savedAt: now });
        history.currentIndex = 0;
      }

      state = {
        projectId,
        schemaVersion: 1,
        phases: {
          [phaseKey]: {
            draftMarkdown: seed,
            draftUpdatedAt: seed ? now : null,
            history,
          },
        },
      };

      await saveValidatorState(dbName, state);
      return state;
    }

    if (!state.phases) state.phases = {};
    if (!state.phases[phaseKey]) {
	      const project = await getProject(dbName, projectId);
	      if (!project) {
	        throw new Error('Project not found');
	      }
	      const seed = getPhaseOutputInternal(project, phaseNumber) || '';
      const now = new Date().toISOString();

      const history = createEmptyHistory();
      if (seed) {
        history.versions.push({ markdown: seed, savedAt: now });
        history.currentIndex = 0;
      }

      state.phases[phaseKey] = {
        draftMarkdown: seed,
        draftUpdatedAt: seed ? now : null,
        history,
      };
      await saveValidatorState(dbName, state);
    }

    return state;
  }

  function buildVersionView(history) {
    if (!history || history.versions.length === 0) return null;

    const v = history.versions[history.currentIndex];
    if (!v) return null;

    return {
      ...v,
      versionNumber: history.currentIndex + 1,
      totalVersions: history.versions.length,
      canGoBack: history.currentIndex > 0,
      canGoForward: history.currentIndex < history.versions.length - 1,
    };
  }

  async function loadDraft() {
    const state = await ensureState();
    const phase = state.phases[phaseKey];
    const current = buildVersionView(phase.history);

    const markdown = phase.draftMarkdown || current?.markdown || '';
    return { markdown };
  }

  async function saveDraft(markdown) {
    const state = await ensureState();
    const phase = state.phases[phaseKey];

    phase.draftMarkdown = sanitizeString(markdown);
    phase.draftUpdatedAt = new Date().toISOString();

    await saveValidatorState(dbName, state);
    return { success: true };
  }

  async function getCurrentVersion() {
    const state = await ensureState();
    return buildVersionView(state.phases[phaseKey].history);
  }

  async function saveVersion(markdown) {
    const state = await ensureState();
    const phase = state.phases[phaseKey];
    const history = phase.history || createEmptyHistory();

    const clean = sanitizeString(markdown);

    if (history.versions.length > 0 && history.versions[history.currentIndex]?.markdown === clean) {
      return { success: false, reason: 'no-change' };
    }

    if (history.currentIndex < history.versions.length - 1) {
      history.versions = history.versions.slice(0, history.currentIndex);
    }

    history.versions.push({ markdown: clean, savedAt: new Date().toISOString() });

    if (history.versions.length > maxVersions) {
      history.versions = history.versions.slice(-maxVersions);
    }

    history.currentIndex = history.versions.length - 1;

    phase.history = history;
    phase.draftMarkdown = clean;
    phase.draftUpdatedAt = new Date().toISOString();

    await saveValidatorState(dbName, state);

    return { success: true, versionNumber: history.currentIndex + 1, totalVersions: history.versions.length };
  }

  async function goBack() {
    const state = await ensureState();
    const phase = state.phases[phaseKey];
    const history = phase.history;

    if (!history || history.currentIndex <= 0) return null;
    history.currentIndex -= 1;

    const v = buildVersionView(history);
    if (v) {
      phase.draftMarkdown = v.markdown;
      phase.draftUpdatedAt = new Date().toISOString();
    }

    await saveValidatorState(dbName, state);
    return v;
  }

  async function goForward() {
    const state = await ensureState();
    const phase = state.phases[phaseKey];
    const history = phase.history;

    if (!history || history.currentIndex >= history.versions.length - 1) return null;
    history.currentIndex += 1;

    const v = buildVersionView(history);
    if (v) {
      phase.draftMarkdown = v.markdown;
      phase.draftUpdatedAt = new Date().toISOString();
    }

    await saveValidatorState(dbName, state);
    return v;
  }

  return {
    loadDraft,
    saveDraft,
    saveVersion,
    goBack,
    goForward,
    getCurrentVersion,
    getTimeSince,
  };
}


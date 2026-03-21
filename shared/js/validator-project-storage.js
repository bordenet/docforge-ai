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

	function isIsoAfter(a, b) {
		if (!a || !b) return false;
		try {
			return new Date(a).getTime() > new Date(b).getTime();
		} catch {
			return false;
		}
	}

	function trimHistory(history) {
		if (!history || history.versions.length <= maxVersions) return;
		history.versions = history.versions.slice(-maxVersions);
		history.currentIndex = history.versions.length - 1;
	}

	function maybePushVersion(history, markdown, savedAt) {
		const clean = sanitizeString(markdown || '');
		if (!clean) return;
		const last = history.versions.length ? history.versions[history.versions.length - 1].markdown : null;
		if (last === clean) return;
		history.versions.push({ markdown: clean, savedAt: savedAt || new Date().toISOString() });
	}

  async function ensureState() {
		let state = await getValidatorState(dbName, projectId);

		const project = await getProject(dbName, projectId);
		if (!project) {
			// Hard contract: do not create validatorState for non-existent projects.
			throw new Error('Project not found');
		}
		const seed = getPhaseOutputInternal(project, phaseNumber) || '';
		const now = new Date().toISOString();
		const projectUpdatedAt = project.updatedAt || null;

		let didMutate = false;

		if (!state) {
			const history = createEmptyHistory();
			if (seed) {
				history.versions.push({ markdown: sanitizeString(seed), savedAt: projectUpdatedAt || now });
				history.currentIndex = 0;
			}

			state = {
				projectId,
				schemaVersion: 1,
				phases: {
					[phaseKey]: {
						draftMarkdown: sanitizeString(seed),
						draftUpdatedAt: seed ? now : null,
						history,
					},
				},
			};
			didMutate = true;
		} else {
			if (!state.phases) state.phases = {};
			if (!state.phases[phaseKey]) {
				const history = createEmptyHistory();
				if (seed) {
					history.versions.push({ markdown: sanitizeString(seed), savedAt: projectUpdatedAt || now });
					history.currentIndex = 0;
				}

				state.phases[phaseKey] = {
					draftMarkdown: sanitizeString(seed),
					draftUpdatedAt: seed ? now : null,
					history,
				};
				didMutate = true;
			}
		}

		// If the canonical project output was updated after the last validator draft update,
		// update the draft to match the latest project output so attached-mode always opens
		// with the newest saved Assistant content (while preserving prior drafts in history).
		const phaseState = state.phases?.[phaseKey];
		if (phaseState) {
			const draftUpdatedAt = phaseState.draftUpdatedAt;
			const projectNewerThanDraft = Boolean(projectUpdatedAt && (!draftUpdatedAt || isIsoAfter(projectUpdatedAt, draftUpdatedAt)));
			const cleanSeed = sanitizeString(seed);
			const cleanDraft = sanitizeString(phaseState.draftMarkdown || '');
			if (projectNewerThanDraft && cleanSeed && cleanSeed !== cleanDraft) {
				const history = phaseState.history || createEmptyHistory();

				// Preserve the prior draft (if any) as a version before switching to the new canonical.
				if (cleanDraft) {
					maybePushVersion(history, cleanDraft, draftUpdatedAt || now);
				}
				maybePushVersion(history, cleanSeed, projectUpdatedAt || now);
				trimHistory(history);
				history.currentIndex = history.versions.length - 1;

				phaseState.history = history;
				phaseState.draftMarkdown = cleanSeed;
				phaseState.draftUpdatedAt = now;
				didMutate = true;
			}
		}

		if (didMutate) {
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


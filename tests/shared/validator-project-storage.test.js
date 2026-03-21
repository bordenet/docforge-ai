/**
 * Validator Project Storage (IndexedDB) tests
 * Ensures validator state is project-scoped (not a global singleton)
 */

import {
  saveProject,
  getProject,
  getValidatorState,
  clearAllProjects,
} from '../../shared/js/storage.js';
import { createProjectValidatorStorage } from '../../shared/js/validator-project-storage.js';

const DB = 'one-pager-docforge-db';

describe('Validator Project Storage (project-scoped)', () => {
  beforeEach(async () => {
    await clearAllProjects(DB);
  });

  test('seeds first version from project phase output when no validator state exists', async () => {
    const projectId = 'p1';
    const md = '# Phase 3 Output\n\nHello';

    await saveProject(DB, { id: projectId, title: 'T', phase3_output: md });

    const storage = createProjectValidatorStorage({ dbName: DB, projectId, phaseNumber: 3 });

    const draft = await storage.loadDraft();
    expect(draft.markdown).toBe(md);

    const current = await storage.getCurrentVersion();
    expect(current.versionNumber).toBe(1);
    expect(current.totalVersions).toBe(1);
    expect(current.markdown).toBe(md);
  });

  test('saveDraft persists without creating a new saved version', async () => {
    const projectId = 'p2';
    await saveProject(DB, { id: projectId, title: 'T', phase3_output: '# Seed' });

    const before = await getProject(DB, projectId);

    const storage = createProjectValidatorStorage({ dbName: DB, projectId, phaseNumber: 3 });
    await storage.saveDraft('# Draft Edit');

    const after = await getProject(DB, projectId);
    expect(after.updatedAt).toBe(before.updatedAt);

    const storage2 = createProjectValidatorStorage({ dbName: DB, projectId, phaseNumber: 3 });
    const draft2 = await storage2.loadDraft();
    expect(draft2.markdown).toBe('# Draft Edit');

    const current2 = await storage2.getCurrentVersion();
    expect(current2.totalVersions).toBe(1);
  });

  test('saveVersion appends and caps version history', async () => {
    const projectId = 'p3';
    await saveProject(DB, { id: projectId, title: 'T', phase3_output: '# Seed' });

    const storage = createProjectValidatorStorage({ dbName: DB, projectId, phaseNumber: 3, maxVersions: 2 });

    await storage.saveVersion('# V1');
    await storage.saveVersion('# V2');
    await storage.saveVersion('# V3');

    const current = await storage.getCurrentVersion();
    expect(current.totalVersions).toBe(2);
    expect(current.markdown).toBe('# V3');
  });

  test('does not create validator state for missing project', async () => {
    const projectId = 'does-not-exist';
    const storage = createProjectValidatorStorage({ dbName: DB, projectId, phaseNumber: 3 });

    await expect(storage.loadDraft()).rejects.toThrow('Project not found');
    expect(await getValidatorState(DB, projectId)).toBeNull();
  });
});


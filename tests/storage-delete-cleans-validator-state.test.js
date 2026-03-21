import {
  saveProject,
  deleteProject,
  getProject,
  saveValidatorState,
  getValidatorState,
  clearAllProjects,
} from '../shared/js/storage.js';

describe('Storage: deleteProject cleans validator state', () => {
  const DB = 'one-pager-docforge-db';

  beforeEach(async () => {
    await clearAllProjects(DB);
  });

  test('deleting a project also deletes its validatorState entry', async () => {
    const project = await saveProject(DB, { id: 'p1', title: 'T', currentPhase: 3 });

    await saveValidatorState(DB, {
      projectId: project.id,
      schemaVersion: 1,
      phases: {
        '3': {
          draftMarkdown: '# Draft',
          draftUpdatedAt: new Date().toISOString(),
          history: { versions: [{ markdown: '# V1', savedAt: new Date().toISOString() }], currentIndex: 0 },
        },
      },
    });

    expect(await getValidatorState(DB, project.id)).toBeTruthy();

    await deleteProject(DB, project.id);

    expect(await getProject(DB, project.id)).toBeNull();
    expect(await getValidatorState(DB, project.id)).toBeNull();
  });
});


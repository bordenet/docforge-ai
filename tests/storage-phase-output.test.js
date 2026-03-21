import {
  saveProject,
  getProject,
  clearAllProjects,
  updateProjectPhaseOutput,
} from '../shared/js/storage.js';

describe('Storage: updateProjectPhaseOutput', () => {
  const DB = 'one-pager-docforge-db';

  beforeEach(async () => {
    await clearAllProjects(DB);
  });

  test('updates phases[phase].response and legacy phaseN_output, and marks phase completed', async () => {
    const project = await saveProject(DB, {
      id: 'p1',
      title: 'T',
      currentPhase: 1,
      phases: {},
    });

    const md = '# Updated Phase 3\n\nHello';
    await updateProjectPhaseOutput(DB, project.id, 3, md);

    const updated = await getProject(DB, project.id);
    expect(updated.phases[3].response).toBe(md);
    expect(updated.phases[3].completed).toBe(true);
    expect(updated.phase3_output).toBe(md);
    expect(updated.currentPhase).toBe(3);
  });
});


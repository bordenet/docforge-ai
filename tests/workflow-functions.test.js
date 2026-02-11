/**
 * Workflow Standalone Functions Tests
 * Tests the functional API for project data manipulation
 */

import {
  createProject,
  updateFormData,
  advancePhase,
  isProjectComplete,
  getCurrentPhase,
  updatePhaseResponse,
  getProgress,
  getFinalMarkdown,
  exportFinalDocument,
  getExportFilename,
} from '../shared/js/workflow.js';

describe('createProject', () => {
  it('should create project with name and description', () => {
    const project = createProject('Test Project', 'Test description');
    expect(project.name).toBe('Test Project');
    expect(project.description).toBe('Test description');
  });

  it('should have default phase 1', () => {
    const project = createProject('Test', 'Desc');
    expect(project.currentPhase).toBe(1);
  });

  it('should have phases array', () => {
    const project = createProject('Test', 'Desc');
    expect(project.phases).toBeInstanceOf(Array);
    expect(project.phases.length).toBe(3);
  });

  it('should have empty formData', () => {
    const project = createProject('Test', 'Desc');
    expect(project.formData).toBeDefined();
    expect(typeof project.formData).toBe('object');
  });
});

describe('updateFormData', () => {
  it('should update form data on project', () => {
    const project = createProject('Test', 'Desc');
    updateFormData(project, { title: 'Updated Title' });
    expect(project.formData.title).toBe('Updated Title');
  });

  it('should merge with existing form data', () => {
    const project = createProject('Test', 'Desc');
    project.formData.title = 'Original';
    updateFormData(project, { problem: 'Problem' });
    expect(project.formData.title).toBe('Original');
    expect(project.formData.problem).toBe('Problem');
  });
});

describe('advancePhase (standalone)', () => {
  it('should advance from phase 1 to phase 2', () => {
    const project = createProject('Test', 'Desc');
    advancePhase(project);
    expect(project.currentPhase).toBe(2);
  });

  it('should mark phase as completed', () => {
    const project = createProject('Test', 'Desc');
    advancePhase(project);
    expect(project.phases[0].completed).toBe(true);
  });
});

describe('isProjectComplete', () => {
  it('should return false for new project', () => {
    const project = createProject('Test', 'Desc');
    expect(isProjectComplete(project)).toBe(false);
  });

  it('should return true when all phases completed', () => {
    const project = createProject('Test', 'Desc');
    project.phases.forEach((p) => {
      p.completed = true;
    });
    expect(isProjectComplete(project)).toBe(true);
  });
});

describe('getCurrentPhase (standalone)', () => {
  it('should return phase 1 data by default', () => {
    const project = createProject('Test', 'Desc');
    const phase = getCurrentPhase(project);
    expect(phase.number).toBe(1);
  });
});

describe('updatePhaseResponse', () => {
  it('should update current phase response', () => {
    const project = createProject('Test', 'Desc');
    updatePhaseResponse(project, 'Test response');
    expect(project.phases[0].response).toBe('Test response');
  });
});

describe('getProgress (standalone)', () => {
  it('should return 0 for new project', () => {
    const project = createProject('Test', 'Desc');
    expect(getProgress(project)).toBe(0);
  });

  it('should return 33 when one phase completed', () => {
    const project = createProject('Test', 'Desc');
    project.phases[0].completed = true;
    expect(getProgress(project)).toBe(33);
  });
});

describe('getFinalMarkdown', () => {
  it('should return null for project with no output', () => {
    const project = createProject('Test', 'Desc');
    expect(getFinalMarkdown(project)).toBeNull();
  });

  it('should return phase 3 output when available', () => {
    const project = createProject('Test', 'Desc');
    project.phase3_output = 'Phase 3 content';
    expect(getFinalMarkdown(project)).toBe('Phase 3 content');
  });
});

describe('exportFinalDocument', () => {
  it('should export project as markdown', () => {
    const project = { title: 'Test', phase3_output: 'Final content' };
    const md = exportFinalDocument(project);
    expect(typeof md).toBe('string');
    expect(md).toContain('Final content');
  });
});

describe('getExportFilename', () => {
  it('should generate filename from title', () => {
    const project = { title: 'My Test Project' };
    const filename = getExportFilename(project);
    expect(filename).toMatch(/\.md$/);
    expect(filename).toContain('my-test-project');
  });

  it('should sanitize special characters', () => {
    const project = { title: 'Test: With/Special*Chars!' };
    const filename = getExportFilename(project);
    expect(filename).not.toMatch(/[/:*!]/);
  });
});


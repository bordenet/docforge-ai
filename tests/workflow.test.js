/**
 * Workflow Module Tests
 * Tests the 3-phase workflow engine for DocForgeAI
 */

import { jest } from '@jest/globals';
import {
  Workflow,
  WORKFLOW_CONFIG,
  PHASES,
  getPhaseMetadata,
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

// Mock fetch for prompt template loading
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve('Mock prompt template with {{TITLE}} and {{DESCRIPTION}}'),
    })
  );
});

describe('WORKFLOW_CONFIG', () => {
  it('should have required structure', () => {
    expect(WORKFLOW_CONFIG).toBeDefined();
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toBeInstanceOf(Array);
    expect(WORKFLOW_CONFIG.phases.length).toBe(3);
  });

  it('should have required phase properties', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(typeof phase.name).toBe('string');
      expect(typeof phase.description).toBe('string');
      expect(typeof phase.aiModel).toBe('string');
      expect(typeof phase.icon).toBe('string');
    });
  });

  it('should have phase types generate/critique/synthesize', () => {
    expect(WORKFLOW_CONFIG.phases[0].type).toBe('generate');
    expect(WORKFLOW_CONFIG.phases[1].type).toBe('critique');
    expect(WORKFLOW_CONFIG.phases[2].type).toBe('synthesize');
  });
});

describe('PHASES constant', () => {
  it('should be same as WORKFLOW_CONFIG.phases', () => {
    expect(PHASES).toBe(WORKFLOW_CONFIG.phases);
  });
});

describe('getPhaseMetadata', () => {
  it('should return phase 1 metadata', () => {
    const meta = getPhaseMetadata(1);
    expect(meta.number).toBe(1);
    expect(meta.name).toBe('Generate');
  });

  it('should return phase 2 metadata', () => {
    const meta = getPhaseMetadata(2);
    expect(meta.number).toBe(2);
    expect(meta.name).toBe('Critique');
  });

  it('should return phase 3 metadata', () => {
    const meta = getPhaseMetadata(3);
    expect(meta.number).toBe(3);
    expect(meta.name).toBe('Synthesize');
  });

  it('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(99)).toBeUndefined();
    expect(getPhaseMetadata(0)).toBeUndefined();
  });
});

describe('Workflow class', () => {
  let project;
  let workflow;

  beforeEach(() => {
    project = {
      id: 'test-123',
      title: 'Test Project',
      description: 'Test description',
      phase: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: {},
    };
    workflow = new Workflow(project);
  });

  describe('constructor', () => {
    it('should initialize with project', () => {
      expect(workflow.project).toBe(project);
      expect(workflow.currentPhase).toBe(1);
    });

    it('should default to phase 1 if not set', () => {
      delete project.phase;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle phase 0 as phase 1', () => {
      project.phase = 0;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle negative phase as phase 1', () => {
      project.phase = -1;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should accept optional plugin', () => {
      const plugin = { id: 'test-plugin' };
      const w = new Workflow(project, plugin);
      expect(w.plugin).toBe(plugin);
    });
  });

  describe('getCurrentPhase', () => {
    it('should return current phase config', () => {
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(1);
      expect(phase.name).toBe('Generate');
    });

    it('should return phase 2 config when on phase 2', () => {
      workflow.currentPhase = 2;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(2);
    });

    it('should return phase 3 config when on phase 3', () => {
      workflow.currentPhase = 3;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(3);
    });

    it('should return last phase when past phase 3', () => {
      workflow.currentPhase = 4;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(3);
    });
  });

  describe('getNextPhase', () => {
    it('should return next phase config', () => {
      const next = workflow.getNextPhase();
      expect(next.number).toBe(2);
    });

    it('should return null on last phase', () => {
      workflow.currentPhase = 3;
      expect(workflow.getNextPhase()).toBeNull();
    });

    it('should return null when complete', () => {
      workflow.currentPhase = 4;
      expect(workflow.getNextPhase()).toBeNull();
    });
  });

  describe('isComplete', () => {
    it('should return false when on phase 1', () => {
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return false when on phase 3', () => {
      workflow.currentPhase = 3;
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return true when past phase 3', () => {
      workflow.currentPhase = 4;
      expect(workflow.isComplete()).toBe(true);
    });
  });

  describe('advancePhase', () => {
    it('should advance from phase 1 to phase 2', () => {
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(2);
      expect(project.phase).toBe(2);
    });

    it('should advance from phase 2 to phase 3', () => {
      workflow.currentPhase = 2;
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(3);
    });

    it('should advance from phase 3 to phase 4 (complete)', () => {
      workflow.currentPhase = 3;
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(4);
    });

    it('should NOT advance past phase 4', () => {
      workflow.currentPhase = 4;
      const result = workflow.advancePhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(4);
    });
  });

  describe('previousPhase', () => {
    it('should go back from phase 2 to phase 1', () => {
      workflow.currentPhase = 2;
      const result = workflow.previousPhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(1);
    });

    it('should NOT go before phase 1', () => {
      workflow.currentPhase = 1;
      const result = workflow.previousPhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(1);
    });
  });

  describe('savePhaseOutput', () => {
    it('should save output for phase 1', () => {
      workflow.savePhaseOutput('Phase 1 output');
      expect(project.phase1_output).toBe('Phase 1 output');
    });

    it('should save output for phase 2', () => {
      workflow.currentPhase = 2;
      workflow.savePhaseOutput('Phase 2 output');
      expect(project.phase2_output).toBe('Phase 2 output');
    });

    it('should save output for phase 3', () => {
      workflow.currentPhase = 3;
      workflow.savePhaseOutput('Phase 3 output');
      expect(project.phase3_output).toBe('Phase 3 output');
    });

    it('should update timestamp', () => {
      project.updatedAt = '2020-01-01T00:00:00.000Z';
      workflow.savePhaseOutput('Test output');
      expect(project.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('getPhaseOutput', () => {
    it('should return phase 1 output', () => {
      project.phase1_output = 'Phase 1 content';
      expect(workflow.getPhaseOutput(1)).toBe('Phase 1 content');
    });

    it('should return phase 2 output', () => {
      project.phase2_output = 'Phase 2 content';
      expect(workflow.getPhaseOutput(2)).toBe('Phase 2 content');
    });

    it('should return empty string if no output', () => {
      expect(workflow.getPhaseOutput(1)).toBe('');
      expect(workflow.getPhaseOutput(2)).toBe('');
      expect(workflow.getPhaseOutput(3)).toBe('');
    });
  });

  describe('getProgress', () => {
    it('should return 33% for phase 1', () => {
      expect(workflow.getProgress()).toBe(33);
    });

    it('should return 67% for phase 2', () => {
      workflow.currentPhase = 2;
      expect(workflow.getProgress()).toBe(67);
    });

    it('should return 100% for phase 3', () => {
      workflow.currentPhase = 3;
      expect(workflow.getProgress()).toBe(100);
    });
  });

  describe('exportAsMarkdown', () => {
    it('should return string', () => {
      const md = workflow.exportAsMarkdown();
      expect(typeof md).toBe('string');
    });

    it('should include phase 3 output when available', () => {
      project.phase3_output = 'Final content here';
      const md = workflow.exportAsMarkdown();
      expect(md).toContain('Final content');
    });

    it('should include DocForgeAI attribution', () => {
      const md = workflow.exportAsMarkdown();
      expect(md).toContain('DocForgeAI');
    });

    it('should fall back to phase 1 if no phase 3', () => {
      project.phase1_output = 'Phase 1 content';
      const md = workflow.exportAsMarkdown();
      expect(md).toContain('Phase 1 content');
    });
  });
});

// Standalone function tests
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

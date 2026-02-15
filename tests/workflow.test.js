/**
 * Workflow Class Tests
 * Tests the Workflow class for the 3-phase workflow engine
 * Note: Config tests are in workflow-config.test.js
 * Note: Standalone function tests are in workflow-functions.test.js
 */

import { jest } from '@jest/globals';
import { Workflow } from '../shared/js/workflow.js';

// Mock fetch for prompt template loading
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve('Mock prompt template with {{TITLE}} and {{DESCRIPTION}}'),
    })
  );
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

describe('LLM Orchestration', () => {
  let project;
  let plugin;
  let workflow;

  beforeEach(() => {
    project = {
      id: 'test-123',
      title: 'Test Project',
      description: 'Test description',
      phase: 1,
      formData: { title: 'Test Title', description: 'Test Desc' },
    };
    plugin = { id: 'test-plugin' };
    workflow = new Workflow(project, plugin);
  });

  describe('executePhase', () => {
    it('should generate prompt and call LLM client', async () => {
      const mockClient = {
        generate: jest.fn().mockResolvedValue('Mock LLM response'),
      };

      const result = await workflow.executePhase(mockClient);

      expect(mockClient.generate).toHaveBeenCalledTimes(1);
      expect(result.response).toBe('Mock LLM response');
      expect(result.phase).toBe(1);
    });

    it('should save response to project', async () => {
      const mockClient = {
        generate: jest.fn().mockResolvedValue('Saved response'),
      };

      await workflow.executePhase(mockClient);

      expect(project.phase1_output).toBe('Saved response');
    });

    it('should call onPromptGenerated callback', async () => {
      const mockClient = { generate: jest.fn().mockResolvedValue('Response') };
      const onPromptGenerated = jest.fn();

      await workflow.executePhase(mockClient, { onPromptGenerated });

      expect(onPromptGenerated).toHaveBeenCalledWith(expect.any(String), 1);
    });

    it('should call onResponseReceived callback', async () => {
      const mockClient = { generate: jest.fn().mockResolvedValue('Test response') };
      const onResponseReceived = jest.fn();

      await workflow.executePhase(mockClient, { onResponseReceived });

      expect(onResponseReceived).toHaveBeenCalledWith('Test response', 1);
    });

    it('should execute phase 2 with correct phase number', async () => {
      workflow.currentPhase = 2;
      project.phase1_output = 'Phase 1 output';
      const mockClient = { generate: jest.fn().mockResolvedValue('Phase 2 response') };

      const result = await workflow.executePhase(mockClient);

      expect(mockClient.generate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ phase: 2 })
      );
      expect(result.phase).toBe(2);
    });
  });

  describe('runFullWorkflow', () => {
    it('should execute all 3 phases', async () => {
      // Import the module to mock it
      const llmClientModule = await import('../shared/js/llm-client.js');

      // Set to mock mode for predictable responses
      llmClientModule.setLLMMode('mock');

      const onPhaseComplete = jest.fn();
      const result = await workflow.runFullWorkflow({ onPhaseComplete });

      expect(result.success).toBe(true);
      expect(result.results.length).toBe(3);
      expect(onPhaseComplete).toHaveBeenCalledTimes(3);
    });

    it('should advance through all phases', async () => {
      const llmClientModule = await import('../shared/js/llm-client.js');
      llmClientModule.setLLMMode('mock');

      await workflow.runFullWorkflow();

      expect(workflow.currentPhase).toBe(4); // Past phase 3
      expect(workflow.isComplete()).toBe(true);
    });

    it('should call onPhaseStart for each phase', async () => {
      const llmClientModule = await import('../shared/js/llm-client.js');
      llmClientModule.setLLMMode('mock');

      const onPhaseStart = jest.fn();
      await workflow.runFullWorkflow({ onPhaseStart });

      expect(onPhaseStart).toHaveBeenCalledTimes(3);
      expect(onPhaseStart).toHaveBeenNthCalledWith(1, 1, expect.objectContaining({ name: 'Generate' }));
      expect(onPhaseStart).toHaveBeenNthCalledWith(2, 2, expect.objectContaining({ name: 'Critique' }));
      expect(onPhaseStart).toHaveBeenNthCalledWith(3, 3, expect.objectContaining({ name: 'Synthesize' }));
    });

    it('should save outputs for all phases', async () => {
      const llmClientModule = await import('../shared/js/llm-client.js');
      llmClientModule.setLLMMode('mock');

      await workflow.runFullWorkflow();

      expect(project.phase1_output).toBeTruthy();
      expect(project.phase2_output).toBeTruthy();
      expect(project.phase3_output).toBeTruthy();
    });
  });
});

// Note: Standalone function tests moved to workflow-functions.test.js

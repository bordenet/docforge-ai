/**
 * @jest-environment jsdom
 */

/**
 * Smoke Test - Module Exports and Cross-Module Contracts
 *
 * This test verifies:
 * 1. Additional modules export expected functions
 * 2. Cross-module contracts are maintained
 */

describe('Smoke Test - Module Exports', () => {
  describe('Export Consistency - slop-detection.js', () => {
    test('exports detectAISlop', async () => {
      const slop = await import('../shared/js/slop-detection.js');
      expect(typeof slop.detectAISlop).toBe('function');
    });

    test('exports calculateSlopScore from slop-scoring.js', async () => {
      const slop = await import('../shared/js/slop-scoring.js');
      expect(typeof slop.calculateSlopScore).toBe('function');
    });

    test('exports getSlopPenalty from slop-scoring.js', async () => {
      const slop = await import('../shared/js/slop-scoring.js');
      expect(typeof slop.getSlopPenalty).toBe('function');
    });

    test('exports pattern lists', async () => {
      const slop = await import('../shared/js/slop-detection.js');
      expect(Array.isArray(slop.GENERIC_BOOSTERS)).toBe(true);
      expect(Array.isArray(slop.BUZZWORDS)).toBe(true);
      expect(Array.isArray(slop.FILLER_PHRASES)).toBe(true);
    });
  });

  describe('Export Consistency - prompt-generator.js', () => {
    test('exports generatePrompt', async () => {
      const promptGen = await import('../shared/js/prompt-generator.js');
      expect(typeof promptGen.generatePrompt).toBe('function');
    });

    test('exports fillPromptTemplate', async () => {
      const promptGen = await import('../shared/js/prompt-generator.js');
      expect(typeof promptGen.fillPromptTemplate).toBe('function');
    });
  });

  describe('Export Consistency - projects.js', () => {
    test('exports extractTitleFromMarkdown', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.extractTitleFromMarkdown).toBe('function');
    });

    test('exports updatePhase', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.updatePhase).toBe('function');
    });

    test('exports updateProject', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.updateProject).toBe('function');
    });

    test('exports exportProject', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.exportProject).toBe('function');
    });

    test('exports exportAllProjects', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.exportAllProjects).toBe('function');
    });

    test('exports importProjects', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.importProjects).toBe('function');
    });

    test('exports sanitizeFilename', async () => {
      const projects = await import('../shared/js/projects.js');
      expect(typeof projects.sanitizeFilename).toBe('function');
    });
  });

  describe('Export Consistency - validator.js', () => {
    test('exports validateDocument', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.validateDocument).toBe('function');
    });

    test('exports getGrade', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.getGrade).toBe('function');
    });

    test('exports getScoreColor', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.getScoreColor).toBe('function');
    });

    test('exports getScoreLabel', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.getScoreLabel).toBe('function');
    });

    test('exports detectSections', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.detectSections).toBe('function');
    });

    test('exports analyzeContentQuality', async () => {
      const validator = await import('../shared/js/validator.js');
      expect(typeof validator.analyzeContentQuality).toBe('function');
    });
  });

  describe('Export Consistency - plugin-registry.js', () => {
    test('exports getPlugin', async () => {
      const registry = await import('../shared/js/plugin-registry.js');
      expect(typeof registry.getPlugin).toBe('function');
    });

    test('exports getAllPlugins', async () => {
      const registry = await import('../shared/js/plugin-registry.js');
      expect(typeof registry.getAllPlugins).toBe('function');
    });

    test('exports getDefaultPlugin', async () => {
      const registry = await import('../shared/js/plugin-registry.js');
      expect(typeof registry.getDefaultPlugin).toBe('function');
    });

    test('exports hasPlugin', async () => {
      const registry = await import('../shared/js/plugin-registry.js');
      expect(typeof registry.hasPlugin).toBe('function');
    });
  });

  describe('Export Consistency - import-document.js', () => {
    test('exports convertHtmlToMarkdown', async () => {
      const importDoc = await import('../shared/js/import-document.js');
      expect(typeof importDoc.convertHtmlToMarkdown).toBe('function');
    });

    test('exports extractTitleFromMarkdown', async () => {
      const importDoc = await import('../shared/js/import-document.js');
      expect(typeof importDoc.extractTitleFromMarkdown).toBe('function');
    });

    test('exports normalizeMarkdown', async () => {
      const importDoc = await import('../shared/js/import-document.js');
      expect(typeof importDoc.normalizeMarkdown).toBe('function');
    });
  });

  describe('Export Consistency - import-modal.js', () => {
    test('exports showImportModal', async () => {
      const importModal = await import('../shared/js/import-modal.js');
      expect(typeof importModal.showImportModal).toBe('function');
    });

    test('exports getImportModalHtml', async () => {
      const importModal = await import('../shared/js/import-modal.js');
      expect(typeof importModal.getImportModalHtml).toBe('function');
    });
  });

  describe('Cross-Module Contract - workflow uses storage', () => {
    test('workflow.createProject returns object with id field', async () => {
      const workflow = await import('../shared/js/workflow.js');
      const project = workflow.createProject({ title: 'Test' });
      expect(project.id).toBeDefined();
      expect(typeof project.id).toBe('string');
    });

    test('workflow phases are numbered 1-3', async () => {
      const workflow = await import('../shared/js/workflow.js');
      const phases = workflow.WORKFLOW_CONFIG.phases;
      expect(phases[0].number).toBe(1);
      expect(phases[1].number).toBe(2);
      expect(phases[2].number).toBe(3);
    });
  });

  describe('Cross-Module Contract - Workflow class works with projects', () => {
    test('Workflow can be instantiated with a project', async () => {
      const workflow = await import('../shared/js/workflow.js');
      const project = workflow.createProject({ title: 'Test' });
      const wf = new workflow.Workflow(project);
      expect(wf.getCurrentPhase()).toBeDefined();
      expect(wf.getCurrentPhase().number).toBe(1);
    });

    test('Workflow tracks progress correctly', async () => {
      const workflow = await import('../shared/js/workflow.js');
      const project = workflow.createProject({ title: 'Test' });
      const wf = new workflow.Workflow(project);
      // New project at phase 1 = 33% progress (1/3 phases)
      expect(wf.getProgress()).toBe(33);
    });
  });
});


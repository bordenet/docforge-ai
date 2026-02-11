/**
 * @jest-environment jsdom
 */

/**
 * Smoke Test - Catches module import failures early
 *
 * This test verifies:
 * 1. All JS modules can be imported (catches missing dependencies)
 * 2. All modules export expected functions
 * 3. Cross-module contracts are maintained
 */

describe('Smoke Test - Module Imports', () => {
  describe('Core Module Imports', () => {
    test('storage.js can be imported without errors', async () => {
      await expect(import('../shared/js/storage.js')).resolves.toBeDefined();
    });

    test('workflow.js can be imported without errors', async () => {
      await expect(import('../shared/js/workflow.js')).resolves.toBeDefined();
    });

    test('ui.js can be imported without errors', async () => {
      await expect(import('../shared/js/ui.js')).resolves.toBeDefined();
    });

    test('router.js can be imported without errors', async () => {
      await expect(import('../shared/js/router.js')).resolves.toBeDefined();
    });

    test('views.js can be imported without errors', async () => {
      await expect(import('../shared/js/views.js')).resolves.toBeDefined();
    });

    test('plugin-registry.js can be imported without errors', async () => {
      await expect(import('../shared/js/plugin-registry.js')).resolves.toBeDefined();
    });

    test('diff-view.js can be imported without errors', async () => {
      await expect(import('../shared/js/diff-view.js')).resolves.toBeDefined();
    });

    test('slop-detection.js can be imported without errors', async () => {
      await expect(import('../shared/js/slop-detection.js')).resolves.toBeDefined();
    });

    test('prompt-generator.js can be imported without errors', async () => {
      await expect(import('../shared/js/prompt-generator.js')).resolves.toBeDefined();
    });

    test('form-generator.js can be imported without errors', async () => {
      await expect(import('../shared/js/form-generator.js')).resolves.toBeDefined();
    });

    test('import-document.js can be imported without errors', async () => {
      await expect(import('../shared/js/import-document.js')).resolves.toBeDefined();
    });

    test('demo-data.js can be imported without errors', async () => {
      await expect(import('../shared/js/demo-data.js')).resolves.toBeDefined();
    });
  });

  describe('Export Consistency - storage.js', () => {
    test('exports generateId', async () => {
      const storage = await import('../shared/js/storage.js');
      expect(typeof storage.generateId).toBe('function');
    });

    test('exports saveProject', async () => {
      const storage = await import('../shared/js/storage.js');
      expect(typeof storage.saveProject).toBe('function');
    });

    test('exports getProject', async () => {
      const storage = await import('../shared/js/storage.js');
      expect(typeof storage.getProject).toBe('function');
    });

    test('exports getAllProjects', async () => {
      const storage = await import('../shared/js/storage.js');
      expect(typeof storage.getAllProjects).toBe('function');
    });

    test('exports deleteProject', async () => {
      const storage = await import('../shared/js/storage.js');
      expect(typeof storage.deleteProject).toBe('function');
    });
  });

  describe('Export Consistency - workflow.js', () => {
    test('exports WORKFLOW_CONFIG', async () => {
      const workflow = await import('../shared/js/workflow.js');
      expect(workflow.WORKFLOW_CONFIG).toBeDefined();
      expect(workflow.WORKFLOW_CONFIG.phaseCount).toBe(3);
    });

    test('exports Workflow class', async () => {
      const workflow = await import('../shared/js/workflow.js');
      expect(typeof workflow.Workflow).toBe('function');
    });

    test('exports getPhaseMetadata', async () => {
      const workflow = await import('../shared/js/workflow.js');
      expect(typeof workflow.getPhaseMetadata).toBe('function');
    });

    test('exports createProject', async () => {
      const workflow = await import('../shared/js/workflow.js');
      expect(typeof workflow.createProject).toBe('function');
    });
  });

  describe('Export Consistency - ui.js', () => {
    test('exports showToast', async () => {
      const ui = await import('../shared/js/ui.js');
      expect(typeof ui.showToast).toBe('function');
    });

    test('exports escapeHtml', async () => {
      const ui = await import('../shared/js/ui.js');
      expect(typeof ui.escapeHtml).toBe('function');
    });

    test('exports copyToClipboard', async () => {
      const ui = await import('../shared/js/ui.js');
      expect(typeof ui.copyToClipboard).toBe('function');
    });

    test('exports downloadFile', async () => {
      const ui = await import('../shared/js/ui.js');
      expect(typeof ui.downloadFile).toBe('function');
    });
  });

  describe('Export Consistency - diff-view.js', () => {
    test('exports computeWordDiff', async () => {
      const diffView = await import('../shared/js/diff-view.js');
      expect(typeof diffView.computeWordDiff).toBe('function');
    });

    test('exports renderDiffHtml', async () => {
      const diffView = await import('../shared/js/diff-view.js');
      expect(typeof diffView.renderDiffHtml).toBe('function');
    });

    test('exports getDiffStats', async () => {
      const diffView = await import('../shared/js/diff-view.js');
      expect(typeof diffView.getDiffStats).toBe('function');
    });
  });

  describe('Export Consistency - slop-detection.js', () => {
    test('exports detectAISlop', async () => {
      const slop = await import('../shared/js/slop-detection.js');
      expect(typeof slop.detectAISlop).toBe('function');
    });

    test('exports calculateSlopScore', async () => {
      const slop = await import('../shared/js/slop-detection.js');
      expect(typeof slop.calculateSlopScore).toBe('function');
    });

    test('exports getSlopPenalty', async () => {
      const slop = await import('../shared/js/slop-detection.js');
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

    test('exports showImportModal', async () => {
      const importDoc = await import('../shared/js/import-document.js');
      expect(typeof importDoc.showImportModal).toBe('function');
    });

    test('exports getImportModalHtml', async () => {
      const importDoc = await import('../shared/js/import-document.js');
      expect(typeof importDoc.getImportModalHtml).toBe('function');
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


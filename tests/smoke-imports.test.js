/**
 * @jest-environment jsdom
 */

/**
 * Smoke Test - Module Imports and Core Exports
 *
 * This test verifies:
 * 1. All JS modules can be imported (catches missing dependencies)
 * 2. Core modules export expected functions
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

    test('projects.js can be imported without errors', async () => {
      await expect(import('../shared/js/projects.js')).resolves.toBeDefined();
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
});


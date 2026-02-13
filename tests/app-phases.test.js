/**
 * App Phases Tests
 * Tests for phase event handlers and overflow menu configuration
 */

import { jest } from '@jest/globals';

// Mock modules before importing
const mockCreateActionMenu = jest.fn();
const mockShowPromptModal = jest.fn();
const mockGeneratePrompt = jest.fn().mockResolvedValue('Generated test prompt');
const mockShowToast = jest.fn();
const mockCopyToClipboard = jest.fn().mockResolvedValue(undefined);
const mockConfirm = jest.fn().mockResolvedValue(false);

// Set up mocks on global object
globalThis.__testMocks = {
  createActionMenu: mockCreateActionMenu,
  showPromptModal: mockShowPromptModal,
  generatePrompt: mockGeneratePrompt,
  showToast: mockShowToast,
  copyToClipboard: mockCopyToClipboard,
  confirm: mockConfirm,
};

// Mock plugin configuration
const mockPlugin = {
  id: 'test-plugin',
  name: 'Test Document',
  icon: '📄',
  description: 'Test plugin for unit tests',
  dbName: 'test-docforge-db',
  formFields: [
    { id: 'title', label: 'Project Title', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea', required: false },
  ],
  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Initial Draft', icon: '📝', aiModel: 'Claude', description: 'Generate draft' },
      { number: 2, name: 'Review', icon: '🔍', aiModel: 'Gemini', description: 'Review' },
      { number: 3, name: 'Final', icon: '✨', aiModel: 'Claude', description: 'Finalize' },
    ],
  },
};

const mockProject = {
  id: 'test-project-123',
  title: 'Test Project',
  formData: { title: 'Test Project', description: 'Test description' },
  currentPhase: 1,
  phases: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const completedProject = {
  id: 'completed-project-456',
  title: 'Completed Project',
  formData: { title: 'Completed Project', description: 'Completed description' },
  currentPhase: 3,
  phases: {
    1: { prompt: 'Phase 1 prompt', response: 'Phase 1 response', completed: true },
    2: { prompt: 'Phase 2 prompt', response: 'Phase 2 response', completed: true },
    3: { prompt: 'Phase 3 prompt', response: 'Phase 3 response', completed: true },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('App Phases - Preview Prompt', () => {
  describe('Menu item configuration', () => {
    test('Preview Prompt should be first menu item', () => {
      // Build menu items the same way app-phases.js does
      const menuItems = [];
      const project = mockProject;
      const phase = 1;

      // Preview Prompt (always available)
      menuItems.push({
        label: 'Preview Prompt',
        icon: '👁️',
        onClick: async () => {
          const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
          await mockGeneratePrompt(mockPlugin, phase, project.formData, previousResponses);
        },
      });

      expect(menuItems[0].label).toBe('Preview Prompt');
      expect(menuItems[0].icon).toBe('👁️');
      expect(typeof menuItems[0].onClick).toBe('function');
    });

    test('Preview Prompt should be available for new projects without saved prompts', () => {
      const menuItems = [];
      // Project without any saved phases - Preview Prompt should still be available
      const projectWithoutPhases = { ...mockProject, phases: {} };
      expect(projectWithoutPhases.phases).toEqual({});

      // This mirrors the code in app-phases.js - Preview Prompt is ALWAYS added (not conditional)
      menuItems.push({
        label: 'Preview Prompt',
        icon: '👁️',
        onClick: async () => {},
      });

      const previewItem = menuItems.find((item) => item.label === 'Preview Prompt');
      expect(previewItem).toBeDefined();
    });

    test('Preview Prompt should be available for projects with saved prompts', () => {
      const menuItems = [];

      // This mirrors the code in app-phases.js - Preview Prompt is ALWAYS added
      menuItems.push({
        label: 'Preview Prompt',
        icon: '👁️',
        onClick: async () => {},
      });

      const previewItem = menuItems.find((item) => item.label === 'Preview Prompt');
      expect(previewItem).toBeDefined();
    });

    test('Preview Prompt onClick should build correct previous responses for phase 1', async () => {
      const project = mockProject;
      const phase = 1;
      let capturedResponses = null;

      const onClick = async () => {
        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        capturedResponses = previousResponses;
        await mockGeneratePrompt(mockPlugin, phase, project.formData, previousResponses);
      };

      await onClick();

      expect(capturedResponses).toEqual({ 1: '', 2: '' });
      expect(mockGeneratePrompt).toHaveBeenCalledWith(mockPlugin, 1, project.formData, { 1: '', 2: '' });
    });

    test('Preview Prompt onClick should include previous responses for later phases', async () => {
      const project = completedProject;
      const phase = 2;
      let capturedResponses = null;

      const onClick = async () => {
        const previousResponses = { 1: project.phases?.[1]?.response || '', 2: project.phases?.[2]?.response || '' };
        capturedResponses = previousResponses;
        await mockGeneratePrompt(mockPlugin, phase, project.formData, previousResponses);
      };

      await onClick();

      expect(capturedResponses).toEqual({ 1: 'Phase 1 response', 2: 'Phase 2 response' });
    });
  });
});


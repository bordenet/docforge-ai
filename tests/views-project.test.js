/**
 * Views Project Tests
 * Tests for project view and phase content rendering
 */

import { renderProjectView, renderPhaseContent } from '../shared/js/views.js';

// Mock plugin configuration for testing
const mockPlugin = {
  id: 'test-plugin',
  name: 'Test Document',
  icon: '📄',
  description: 'Test plugin for unit tests',
  dbName: 'test-docforge-db',
  formFields: [
    { id: 'title', label: 'Project Title', type: 'text', required: true, placeholder: 'Enter title' },
    { id: 'description', label: 'Description', type: 'textarea', required: false, rows: 3, placeholder: 'Enter description' },
  ],
  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Initial Draft', icon: '📝', aiModel: 'Claude', description: 'Generate the first draft' },
      { number: 2, name: 'Review', icon: '🔍', aiModel: 'Gemini', description: 'Get improvements from Gemini' },
      { number: 3, name: 'Final Synthesis', icon: '✨', aiModel: 'Claude', description: 'Create final version' },
    ],
  },
};

// Mock project data
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

describe('Views Project Module', () => {
  describe('renderProjectView', () => {
    test('should render project title', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('Test Project');
    });

    test('should render phase tabs', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('Phase 1');
      expect(html).toContain('Phase 2');
      expect(html).toContain('Phase 3');
    });

    test('should render phase tab icons', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('📝');
      expect(html).toContain('🔍');
      expect(html).toContain('✨');
    });

    test('should render back link', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('Back to Test Document Projects');
    });

    test('should mark completed phases with checkmark', () => {
      const html = renderProjectView(mockPlugin, completedProject);
      expect(html).toContain('✓');
    });

    test('should highlight active phase tab', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('border-blue-600');
    });

    test('should render phase content container', () => {
      const html = renderProjectView(mockPlugin, mockProject);
      expect(html).toContain('id="phase-content"');
    });

    test('should use title from formData if project.title is missing', () => {
      const noTitleProject = { ...mockProject, title: undefined };
      const html = renderProjectView(mockPlugin, noTitleProject);
      expect(html).toContain('Test Project');
    });

    test('should show Untitled for project without any title', () => {
      const untitledProject = { ...mockProject, title: undefined, formData: {} };
      const html = renderProjectView(mockPlugin, untitledProject);
      expect(html).toContain('Untitled');
    });
  });

  describe('renderPhaseContent', () => {
    test('should render phase name and description', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('Initial Draft');
      expect(html).toContain('Generate the first draft');
    });

    test('should render AI model badge', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('Use with Claude');
    });

    test('should render Gemini for phase 2', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 2);
      expect(html).toContain('Use with Gemini');
    });

    test('should render copy prompt button', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('copy-prompt-btn');
      expect(html).toContain('Generate & Copy Prompt');
    });

    test('should render response textarea', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('response-textarea');
    });

    test('should render save response button', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('save-response-btn');
    });

    test('should show existing response in textarea', () => {
      const html = renderPhaseContent(mockPlugin, completedProject, 1);
      expect(html).toContain('Phase 1 response');
    });

    test('should show Copy Prompt Again when prompt exists', () => {
      const html = renderPhaseContent(mockPlugin, completedProject, 1);
      expect(html).toContain('Copy Prompt Again');
    });

    test('should render next phase button for completed non-final phases', () => {
      const phaseComplete = {
        ...mockProject,
        phases: { 1: { prompt: 'p', response: 'r', completed: true } },
      };
      const html = renderPhaseContent(mockPlugin, phaseComplete, 1);
      expect(html).toContain('next-phase-btn');
      expect(html).toContain('Next Phase');
    });

    test('should not render next phase button for phase 3', () => {
      const html = renderPhaseContent(mockPlugin, completedProject, 3);
      expect(html).not.toContain('next-phase-btn');
    });

    test('should render completion banner when phase 3 is complete', () => {
      const html = renderPhaseContent(mockPlugin, completedProject, 3);
      expect(html).toContain('Your Test Document is Complete');
      expect(html).toContain('export-final-btn');
      expect(html).toContain('Copy Final Document');
    });

    test('should not render completion banner for incomplete phase 3', () => {
      const incompletePhase3 = {
        ...mockProject,
        phases: { 1: { completed: true }, 2: { completed: true }, 3: { completed: false } },
      };
      const html = renderPhaseContent(mockPlugin, incompletePhase3, 3);
      expect(html).not.toContain('Your Test Document is Complete');
    });

    test('should render Open AI link for Claude', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('href="https://claude.ai"');
      expect(html).toContain('Open Claude');
    });

    test('should render Open AI link for Gemini', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 2);
      expect(html).toContain('href="https://gemini.google.com"');
      expect(html).toContain('Open Gemini');
    });

    test('should disable textarea when no prompt exists', () => {
      const html = renderPhaseContent(mockPlugin, mockProject, 1);
      expect(html).toContain('disabled');
    });

    test('should enable textarea when prompt exists', () => {
      const html = renderPhaseContent(mockPlugin, completedProject, 1);
      // Textarea should NOT have disabled attribute when prompt exists
      const textareaMatch = html.match(/<textarea[^>]*id="response-textarea"[^>]*>/);
      // Check that there's no standalone disabled attribute (not part of class name)
      expect(textareaMatch[0]).not.toMatch(/\sdisabled(?:\s|>)/);
    });
  });
});


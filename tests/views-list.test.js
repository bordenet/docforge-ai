/**
 * Views List Tests
 * Tests for list view rendering and metadata functions
 */

import { getPhaseMetadata, renderListView, renderNewView } from '../shared/js/views.js';

// Mock plugin configuration for testing
const mockPlugin = {
  id: 'test-plugin',
  name: 'Test Document',
  icon: '📄',
  description: 'Test plugin for unit tests',
  dbName: 'test-docforge-db',
  formFields: [
    {
      id: 'title',
      label: 'Project Title',
      type: 'text',
      required: true,
      placeholder: 'Enter title',
    },
    {
      id: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      rows: 3,
      placeholder: 'Enter description',
    },
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

describe('Views List Module', () => {
  describe('getPhaseMetadata', () => {
    test('should return phase metadata for valid phase number', () => {
      const meta = getPhaseMetadata(mockPlugin, 1);
      expect(meta.number).toBe(1);
      expect(meta.name).toBe('Initial Draft');
      expect(meta.icon).toBe('📝');
      expect(meta.aiModel).toBe('Claude');
      expect(meta.description).toBe('Generate the first draft');
    });

    test('should return phase 2 metadata', () => {
      const meta = getPhaseMetadata(mockPlugin, 2);
      expect(meta.name).toBe('Review');
      expect(meta.aiModel).toBe('Gemini');
    });

    test('should return phase 3 metadata', () => {
      const meta = getPhaseMetadata(mockPlugin, 3);
      expect(meta.name).toBe('Final Synthesis');
      expect(meta.icon).toBe('✨');
    });

    test('should return fallback metadata for invalid phase number', () => {
      const meta = getPhaseMetadata(mockPlugin, 99);
      expect(meta.number).toBe(99);
      expect(meta.name).toBe('Phase 99');
      expect(meta.icon).toBe('📝');
    });

    test('should handle plugin without workflow config', () => {
      const barePlugin = { id: 'bare', name: 'Bare' };
      const meta = getPhaseMetadata(barePlugin, 1);
      expect(meta.number).toBe(1);
      expect(meta.name).toBe('Phase 1');
    });
  });

  describe('renderListView', () => {
    test('should render empty state when no projects exist', () => {
      const html = renderListView(mockPlugin, []);
      expect(html).toContain('No projects yet');
      expect(html).toContain('Create Your First Project');
    });

    test('should render new project button', () => {
      const html = renderListView(mockPlugin, []);
      expect(html).toContain('href="#new"');
      expect(html).toContain('New Project');
    });

    test('should render project cards when projects exist', () => {
      const html = renderListView(mockPlugin, [mockProject]);
      expect(html).toContain('Test Project');
      expect(html).toContain('data-project-id="test-project-123"');
    });

    test('should render multiple project cards', () => {
      const html = renderListView(mockPlugin, [mockProject, completedProject]);
      expect(html).toContain('Test Project');
      expect(html).toContain('Completed Project');
    });

    test('should render progress bar in project cards', () => {
      const html = renderListView(mockPlugin, [mockProject]);
      expect(html).toContain('/3 phases complete');
    });

    test('should render delete button on all project cards', () => {
      const html = renderListView(mockPlugin, [mockProject]);
      expect(html).toContain('delete-project-btn');
      expect(html).toContain('title="Delete"');
    });

    test('should render preview button for completed projects', () => {
      const html = renderListView(mockPlugin, [completedProject]);
      expect(html).toContain('preview-project-btn');
    });

    test('should show Updated date', () => {
      const html = renderListView(mockPlugin, [mockProject]);
      expect(html).toContain('Updated');
    });

    test('should use simplified header without plugin name', () => {
      const html = renderListView(mockPlugin, []);
      expect(html).toContain('Your Projects');
    });

    test('should show description snippet if available', () => {
      const html = renderListView(mockPlugin, [mockProject]);
      expect(html).toContain('Test description');
    });
  });

  describe('renderNewView', () => {
    test('should render new project form with simplified header', () => {
      const html = renderNewView(mockPlugin);
      expect(html).toContain('New Project');
    });

    test('should render form fields from plugin config', () => {
      const html = renderNewView(mockPlugin);
      expect(html).toContain('id="title"');
      expect(html).toContain('id="description"');
      expect(html).toContain('Project Title');
    });

    test('should render back link', () => {
      const html = renderNewView(mockPlugin);
      expect(html).toContain('href="#"');
      expect(html).toContain('Back to list');
    });

    test('should render submit button with simplified text', () => {
      const html = renderNewView(mockPlugin);
      expect(html).toContain('Start Workflow');
    });

    test('should pre-fill form with existing data', () => {
      const html = renderNewView(mockPlugin, { title: 'Pre-filled Title' });
      expect(html).toContain('Pre-filled Title');
    });

    test('should render template selector when templates provided', () => {
      const templates = [
        { id: 'blank', name: 'Blank', icon: '📝', description: 'Start fresh' },
        { id: 'example', name: 'Example', icon: '💡', description: 'Use example' },
      ];
      const html = renderNewView(mockPlugin, {}, templates);
      expect(html).toContain('template-selector');
      expect(html).toContain('template-btn');
      expect(html).toContain('Choose a Template');
    });

    test('should not render template selector when no templates', () => {
      const html = renderNewView(mockPlugin, {}, []);
      expect(html).not.toContain('template-selector');
    });

    test('should render import button when templates provided', () => {
      const templates = [{ id: 'blank', name: 'Blank', icon: '📝', description: 'Start fresh' }];
      const html = renderNewView(mockPlugin, {}, templates);
      expect(html).toContain('import-doc-btn');
      expect(html).toContain('Import Existing');
    });

    test('should render edit mode with different title when editingProjectId provided', () => {
      const html = renderNewView(mockPlugin, { title: 'Existing Project' }, [], 'project-123');
      expect(html).toContain('Edit Details');
      expect(html).not.toContain('New Project');
    });

    test('should render Save Changes button in edit mode', () => {
      const html = renderNewView(mockPlugin, {}, [], 'project-123');
      expect(html).toContain('Save Changes');
      expect(html).not.toContain('Start Workflow');
    });

    test('should render Back to Project link in edit mode', () => {
      const html = renderNewView(mockPlugin, {}, [], 'project-123');
      expect(html).toContain('Back to Project');
      expect(html).toContain('#project/project-123');
    });

    test('should not render template selector in edit mode', () => {
      const templates = [{ id: 'blank', name: 'Blank', icon: '📝', description: 'Start fresh' }];
      const html = renderNewView(mockPlugin, {}, templates, 'project-123');
      expect(html).not.toContain('template-selector');
      expect(html).not.toContain('Choose a Template');
    });
  });
});


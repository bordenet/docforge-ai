/**
 * App Module Tests
 *
 * Tests for the main application module.
 * Note: Most app testing is done via E2E tests due to DOM dependencies.
 * These tests verify basic DOM structure and module integration.
 */

import { saveProject, getAllProjects, deleteProject } from '../shared/js/storage.js';
import {
  renderListView,
  renderNewView,
  renderProjectView,
  renderPhaseContent,
} from '../shared/js/views.js';

// Mock plugin for testing
const mockPlugin = {
  id: 'test-plugin',
  name: 'Test Document',
  icon: '📄',
  description: 'Test plugin',
  dbName: 'test-app-db',
  formFields: [
    { id: 'title', label: 'Title', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea', required: false },
  ],
  workflowConfig: {
    phaseCount: 3,
    phases: [
      { number: 1, name: 'Draft', icon: '📝', aiModel: 'Claude', description: 'Create draft' },
      { number: 2, name: 'Review', icon: '🔍', aiModel: 'Gemini', description: 'Review' },
      { number: 3, name: 'Final', icon: '✨', aiModel: 'Claude', description: 'Finalize' },
    ],
  },
};

describe('App Module Integration', () => {
  beforeEach(async () => {
    // Set up minimal DOM structure that the app expects
    document.body.innerHTML = `
      <div id="app-container"></div>
      <span id="header-icon"></span>
      <span id="header-title"></span>
      <select id="doc-type-selector"></select>
      <button id="theme-toggle"></button>
      <span id="storage-info"></span>
      <link id="favicon" href="" />
    `;

    // Clear test database
    const projects = await getAllProjects(mockPlugin.dbName);
    for (const project of projects) {
      await deleteProject(mockPlugin.dbName, project.id);
    }
  });

  describe('DOM Structure', () => {
    test('should have app container element', () => {
      expect(document.getElementById('app-container')).toBeTruthy();
    });

    test('should have header elements', () => {
      expect(document.getElementById('header-icon')).toBeTruthy();
      expect(document.getElementById('header-title')).toBeTruthy();
    });

    test('should have doc type selector', () => {
      expect(document.getElementById('doc-type-selector')).toBeTruthy();
    });

    test('should have theme toggle button', () => {
      expect(document.getElementById('theme-toggle')).toBeTruthy();
    });

    test('should have storage info element', () => {
      expect(document.getElementById('storage-info')).toBeTruthy();
    });
  });

  describe('List View Integration', () => {
    test('should render empty list', async () => {
      const container = document.getElementById('app-container');
      container.innerHTML = renderListView(mockPlugin, []);

      expect(container.innerHTML).toContain('No Test Document projects yet');
    });

    test('should render list with projects', async () => {
      const project = await saveProject(mockPlugin.dbName, {
        title: 'Integration Test Project',
        formData: { title: 'Integration Test Project', description: 'Test' },
        currentPhase: 1,
      });

      const projects = await getAllProjects(mockPlugin.dbName);
      const container = document.getElementById('app-container');
      container.innerHTML = renderListView(mockPlugin, projects);

      expect(container.innerHTML).toContain('Integration Test Project');
      expect(container.innerHTML).toContain(`data-project-id="${project.id}"`);
    });

    test('should render delete button for each project', async () => {
      await saveProject(mockPlugin.dbName, {
        title: 'Delete Test',
        formData: { title: 'Delete Test' },
        currentPhase: 1,
      });

      const projects = await getAllProjects(mockPlugin.dbName);
      const container = document.getElementById('app-container');
      container.innerHTML = renderListView(mockPlugin, projects);

      expect(container.querySelectorAll('.delete-project-btn').length).toBe(1);
    });
  });

  describe('New Project Form Integration', () => {
    test('should render new project form', () => {
      const container = document.getElementById('app-container');
      container.innerHTML = renderNewView(mockPlugin);

      expect(container.querySelector('#title')).toBeTruthy();
      expect(container.querySelector('form')).toBeTruthy();
    });

    test('should render template selector with templates', () => {
      const templates = [{ id: 'blank', name: 'Blank', icon: '📝', description: 'Start fresh' }];
      const container = document.getElementById('app-container');
      container.innerHTML = renderNewView(mockPlugin, {}, templates);

      expect(container.querySelectorAll('.template-btn').length).toBe(1);
    });
  });

  describe('Project View Integration', () => {
    test('should render project view with phase tabs', async () => {
      const project = await saveProject(mockPlugin.dbName, {
        title: 'View Test Project',
        formData: { title: 'View Test Project' },
        currentPhase: 1,
        phases: { 1: { prompt: '', response: '', completed: false } },
      });

      const container = document.getElementById('app-container');
      container.innerHTML = renderProjectView(mockPlugin, project);

      expect(container.querySelectorAll('.phase-tab').length).toBe(3);
    });

    test('should render phase content', async () => {
      const project = await saveProject(mockPlugin.dbName, {
        title: 'Phase Content Test',
        formData: { title: 'Phase Content Test' },
        currentPhase: 1,
        phases: {},
      });

      const container = document.getElementById('app-container');
      container.innerHTML = renderPhaseContent(mockPlugin, project, 1);

      expect(container.querySelector('#copy-prompt-btn')).toBeTruthy();
      expect(container.querySelector('#response-textarea')).toBeTruthy();
      expect(container.querySelector('#save-response-btn')).toBeTruthy();
    });
  });
});

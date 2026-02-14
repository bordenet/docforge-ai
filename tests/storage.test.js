/**
 * Storage Module Tests
 * Tests for the per-plugin IndexedDB storage module
 */

import {
  generateId,
  saveProject,
  getProject,
  getAllProjects,
  deleteProject,
  clearAllProjects,
} from '../shared/js/storage.js';

// Use a unique database name for testing to avoid conflicts
const TEST_DB_NAME = 'docforge-test-storage';

describe('Storage Module', () => {
  // Clean up before each test
  beforeEach(async () => {
    await clearAllProjects(TEST_DB_NAME);
  });

  // Clean up after all tests
  afterAll(async () => {
    await clearAllProjects(TEST_DB_NAME);
  });

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    test('should generate IDs with correct format', () => {
      const id = generateId();
      // Should be timestamp-random format: <timestamp>-<alphanumeric>
      const pattern = /^\d+-[a-z0-9]+$/;
      expect(id).toMatch(pattern);
    });

    test('should generate IDs that can be sorted chronologically', () => {
      const id1 = generateId();
      const id2 = generateId();

      // Extract timestamps
      const ts1 = parseInt(id1.split('-')[0], 10);
      const ts2 = parseInt(id2.split('-')[0], 10);

      expect(ts2).toBeGreaterThanOrEqual(ts1);
    });
  });

  describe('saveProject and getProject', () => {
    test('should save and retrieve a project', async () => {
      const project = {
        id: generateId(),
        title: 'Test Project',
        description: 'Test Description',
        currentPhase: 1,
        formData: { title: 'Form Title' },
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
      expect(retrieved.title).toBe(project.title);
      expect(retrieved.description).toBe(project.description);
      expect(retrieved.formData.title).toBe('Form Title');
    });

    test('should auto-generate ID if not provided', async () => {
      const project = {
        title: 'Project Without ID',
        description: 'Description',
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.id).toBeTruthy();
      expect(typeof saved.id).toBe('string');
    });

    test('should add createdAt timestamp on first save', async () => {
      const project = {
        id: generateId(),
        title: 'New Project',
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.createdAt).toBeTruthy();
      expect(typeof saved.createdAt).toBe('string');
    });

    test('should update updatedAt timestamp on each save', async () => {
      const project = {
        id: generateId(),
        title: 'Test Project',
      };

      const saved1 = await saveProject(TEST_DB_NAME, project);
      const originalUpdatedAt = saved1.updatedAt;

      // Wait a bit and save again
      await new Promise((resolve) => setTimeout(resolve, 10));
      const saved2 = await saveProject(TEST_DB_NAME, { ...project });

      expect(saved2.updatedAt).not.toBe(originalUpdatedAt);
    });

    test('should preserve createdAt on subsequent saves', async () => {
      const project = {
        id: generateId(),
        title: 'Test Project',
      };

      const saved1 = await saveProject(TEST_DB_NAME, project);
      const originalCreatedAt = saved1.createdAt;

      // Save again
      await new Promise((resolve) => setTimeout(resolve, 10));
      const saved2 = await saveProject(TEST_DB_NAME, { ...saved1, title: 'Updated Title' });

      expect(saved2.createdAt).toBe(originalCreatedAt);
    });

    test('should return null for non-existent project', async () => {
      const retrieved = await getProject(TEST_DB_NAME, 'non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await getAllProjects(TEST_DB_NAME);
      expect(Array.isArray(projects)).toBe(true);
      expect(projects).toHaveLength(0);
    });

    test('should return all saved projects', async () => {
      const project1 = { id: generateId(), title: 'Project 1' };
      const project2 = { id: generateId(), title: 'Project 2' };
      const project3 = { id: generateId(), title: 'Project 3' };

      await saveProject(TEST_DB_NAME, project1);
      await saveProject(TEST_DB_NAME, project2);
      await saveProject(TEST_DB_NAME, project3);

      const projects = await getAllProjects(TEST_DB_NAME);
      expect(projects.length).toBe(3);
    });

    test('should sort projects by updatedAt descending (newest first)', async () => {
      const project1 = { id: generateId(), title: 'Old Project' };
      const project2 = { id: generateId(), title: 'New Project' };

      await saveProject(TEST_DB_NAME, project1);

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 50));

      await saveProject(TEST_DB_NAME, project2);

      const projects = await getAllProjects(TEST_DB_NAME);
      const project2Index = projects.findIndex((p) => p.id === project2.id);
      const project1Index = projects.findIndex((p) => p.id === project1.id);

      // Newest (project2) should come first
      expect(project2Index).toBeLessThan(project1Index);
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = {
        id: generateId(),
        title: 'Project to Delete',
      };

      await saveProject(TEST_DB_NAME, project);

      // Verify it exists
      const beforeDelete = await getProject(TEST_DB_NAME, project.id);
      expect(beforeDelete).toBeTruthy();

      // Delete
      await deleteProject(TEST_DB_NAME, project.id);

      // Verify it's gone
      const afterDelete = await getProject(TEST_DB_NAME, project.id);
      expect(afterDelete).toBeNull();
    });

    test('should not throw when deleting non-existent project', async () => {
      await expect(deleteProject(TEST_DB_NAME, 'non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('clearAllProjects', () => {
    test('should clear all projects', async () => {
      // Add some projects
      await saveProject(TEST_DB_NAME, { id: generateId(), title: 'Project 1' });
      await saveProject(TEST_DB_NAME, { id: generateId(), title: 'Project 2' });
      await saveProject(TEST_DB_NAME, { id: generateId(), title: 'Project 3' });

      // Verify they exist
      const beforeClear = await getAllProjects(TEST_DB_NAME);
      expect(beforeClear.length).toBe(3);

      // Clear
      await clearAllProjects(TEST_DB_NAME);

      // Verify they're gone
      const afterClear = await getAllProjects(TEST_DB_NAME);
      expect(afterClear.length).toBe(0);
    });
  });

  describe('Database isolation', () => {
    test('should isolate data between different database names', async () => {
      const DB_1 = 'docforge-test-db1';
      const DB_2 = 'docforge-test-db2';

      // Save to DB_1
      const project1 = { id: generateId(), title: 'Project in DB1' };
      await saveProject(DB_1, project1);

      // Save to DB_2
      const project2 = { id: generateId(), title: 'Project in DB2' };
      await saveProject(DB_2, project2);

      // Check DB_1 only has its project
      const db1Projects = await getAllProjects(DB_1);
      expect(db1Projects.length).toBe(1);
      expect(db1Projects[0].title).toBe('Project in DB1');

      // Check DB_2 only has its project
      const db2Projects = await getAllProjects(DB_2);
      expect(db2Projects.length).toBe(1);
      expect(db2Projects[0].title).toBe('Project in DB2');

      // Clean up
      await clearAllProjects(DB_1);
      await clearAllProjects(DB_2);
    });
  });

  describe('Complex data types', () => {
    test('should preserve nested objects in formData', async () => {
      const project = {
        id: generateId(),
        title: 'Complex Project',
        formData: {
          title: 'Form Title',
          nested: {
            field1: 'value1',
            field2: ['a', 'b', 'c'],
          },
        },
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      expect(retrieved.formData.nested.field1).toBe('value1');
      expect(retrieved.formData.nested.field2).toEqual(['a', 'b', 'c']);
    });

    test('should preserve phase outputs', async () => {
      const project = {
        id: generateId(),
        title: 'Project with Outputs',
        phase1_output: '# Phase 1 Markdown',
        phase2_output: '# Phase 2 Critique',
        phase3_output: '# Phase 3 Final',
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      expect(retrieved.phase1_output).toBe('# Phase 1 Markdown');
      expect(retrieved.phase2_output).toBe('# Phase 2 Critique');
      expect(retrieved.phase3_output).toBe('# Phase 3 Final');
    });
  });

  describe('Title sanitization', () => {
    test('should sanitize corrupted title containing markdown headers', async () => {
      const project = {
        id: generateId(),
        title: '## Problem Statement Current development hardware...',
        formData: { title: 'Clean Title' },
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      // Should use formData.title instead of corrupted title
      expect(retrieved.title).toBe('Clean Title');
    });

    test('should sanitize title that is too long (>100 chars)', async () => {
      const longTitle = 'A'.repeat(150);
      const project = {
        id: generateId(),
        title: longTitle,
        formData: { title: 'Short Title' },
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      // Should use formData.title instead of too-long title
      expect(retrieved.title).toBe('Short Title');
    });

    test('should fallback to Untitled when no valid title available', async () => {
      const project = {
        id: generateId(),
        title: '## Markdown content that is not a title',
        formData: {},
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      expect(retrieved.title).toBe('Untitled');
    });

    test('should preserve valid titles', async () => {
      const project = {
        id: generateId(),
        title: 'Valid Project Title',
        formData: { title: 'Form Title' },
      };

      await saveProject(TEST_DB_NAME, project);
      const retrieved = await getProject(TEST_DB_NAME, project.id);

      // Should keep the original valid title
      expect(retrieved.title).toBe('Valid Project Title');
    });

    test('should sanitize titles in getAllProjects', async () => {
      const project1 = {
        id: generateId(),
        title: '## Corrupted Title 1',
        formData: { title: 'Clean Title 1' },
      };
      const project2 = {
        id: generateId(),
        title: 'Valid Title 2',
        formData: { title: 'Form Title 2' },
      };

      await saveProject(TEST_DB_NAME, project1);
      await saveProject(TEST_DB_NAME, project2);

      const projects = await getAllProjects(TEST_DB_NAME);

      const p1 = projects.find((p) => p.id === project1.id);
      const p2 = projects.find((p) => p.id === project2.id);

      expect(p1.title).toBe('Clean Title 1');
      expect(p2.title).toBe('Valid Title 2');
    });
  });

  describe('Input sanitization', () => {
    test('should remove null bytes from strings', async () => {
      const project = {
        id: generateId(),
        title: 'Test\x00Project',
        formData: { content: 'Hello\x00World' },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.title).toBe('TestProject');
      expect(saved.formData.content).toBe('HelloWorld');
    });

    test('should remove control characters except newlines and tabs', async () => {
      const project = {
        id: generateId(),
        title: 'Test\x07Bell',
        formData: { content: 'Line1\nLine2\tTabbed' },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.title).toBe('TestBell');
      expect(saved.formData.content).toBe('Line1\nLine2\tTabbed');
    });

    test('should truncate overly long titles', async () => {
      const longTitle = 'A'.repeat(300);
      const project = {
        id: generateId(),
        title: longTitle,
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.title.length).toBe(200);
    });

    test('should handle nested objects', async () => {
      const project = {
        id: generateId(),
        title: 'Test',
        formData: {
          nested: {
            deep: 'Value\x00Here',
          },
        },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.formData.nested.deep).toBe('ValueHere');
    });

    test('should handle arrays in form data', async () => {
      const project = {
        id: generateId(),
        title: 'Test',
        formData: {
          tags: ['tag1\x00', 'tag2', 'tag\x003'],
        },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.formData.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    test('should preserve numbers and booleans', async () => {
      const project = {
        id: generateId(),
        title: 'Test',
        currentPhase: 2,
        formData: {
          count: 42,
          active: true,
        },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.currentPhase).toBe(2);
      expect(saved.formData.count).toBe(42);
      expect(saved.formData.active).toBe(true);
    });

    test('should throw error for null project', async () => {
      await expect(saveProject(TEST_DB_NAME, null)).rejects.toThrow('Project must be a non-null object');
    });

    test('should set default title if missing', async () => {
      const project = {
        id: generateId(),
        formData: { content: 'test' },
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.title).toBe('Untitled');
    });

    test('should set default currentPhase if missing or invalid', async () => {
      const project = {
        id: generateId(),
        title: 'Test',
        currentPhase: 'invalid',
      };

      const saved = await saveProject(TEST_DB_NAME, project);

      expect(saved.currentPhase).toBe(1);
    });
  });
});

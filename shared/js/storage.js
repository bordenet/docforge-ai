/**
 * Storage - Per-plugin IndexedDB storage
 * @module storage
 */

import { sanitizeProject } from './storage-sanitization.js';

// Re-export sanitization functions for external use
export { sanitizeFormData, sanitizePhases } from './storage-sanitization.js';

const DB_VERSION = 2;
const STORE_NAME = 'projects';
const VALIDATOR_STORE_NAME = 'validatorState';

/** @type {Map<string, IDBDatabase>} */
const dbCache = new Map();

/**
 * Open or get cached database for a plugin
 * @param {string} dbName - Database name (from plugin config)
 * @returns {Promise<IDBDatabase>}
 */
async function getDB(dbName) {
  if (dbCache.has(dbName)) {
    return dbCache.get(dbName);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      const db = request.result;
      dbCache.set(dbName, db);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }
	      if (!db.objectStoreNames.contains(VALIDATOR_STORE_NAME)) {
	        db.createObjectStore(VALIDATOR_STORE_NAME, { keyPath: 'projectId' });
	      }
    };
  });
}

/**
 * Get validator state for a project
 * @param {string} dbName - Database name
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>}
 */
export async function getValidatorState(dbName, projectId) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(VALIDATOR_STORE_NAME, 'readonly');
    const store = tx.objectStore(VALIDATOR_STORE_NAME);
    const request = store.get(projectId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save validator state for a project
 * @param {string} dbName - Database name
 * @param {Object} state - State object (must include projectId)
 * @returns {Promise<Object>} Saved state
 */
export async function saveValidatorState(dbName, state) {
  if (!state || typeof state !== 'object') {
    throw new Error('state must be an object');
  }
  if (!state.projectId) {
    throw new Error('state.projectId is required');
  }

  const db = await getDB(dbName);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VALIDATOR_STORE_NAME, 'readwrite');
    const store = tx.objectStore(VALIDATOR_STORE_NAME);
    const request = store.put(state);

    request.onsuccess = () => resolve(state);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete validator state for a project
 * @param {string} dbName - Database name
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
export async function deleteValidatorState(dbName, projectId) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(VALIDATOR_STORE_NAME, 'readwrite');
    const store = tx.objectStore(VALIDATOR_STORE_NAME);
    const request = store.delete(projectId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generate a unique project ID
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Save a project
 * @param {string} dbName - Database name
 * @param {Object} project - Project data
 * @returns {Promise<Object>} Saved project
 */
export async function saveProject(dbName, project) {
  const db = await getDB(dbName);
  const now = new Date().toISOString();

  // Sanitize project data before saving
  const sanitized = sanitizeProject(project);

  const projectToSave = {
    ...sanitized,
    id: sanitized.id || generateId(),
    createdAt: sanitized.createdAt || now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(projectToSave);

    request.onsuccess = () => resolve(projectToSave);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get a project by ID
 * @param {string} dbName - Database name
 * @param {string} id - Project ID
 * @returns {Promise<Object|null>}
 */
export async function getProject(dbName, id) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const project = request.result;
      if (project) {
        // Fix corrupted titles that contain markdown content
        if (project.title && (project.title.includes('##') || project.title.length > 100)) {
          project.title = project.formData?.title || 'Untitled';
        }
      }
      resolve(project || null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all projects
 * @param {string} dbName - Database name
 * @returns {Promise<Object[]>}
 */
export async function getAllProjects(dbName) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const projects = request.result || [];
      // Fix corrupted titles that contain markdown content
      projects.forEach((project) => {
        if (project.title && (project.title.includes('##') || project.title.length > 100)) {
          project.title = project.formData?.title || 'Untitled';
        }
      });
      // Sort by updatedAt descending
      projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      resolve(projects);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a project
 * @param {string} dbName - Database name
 * @param {string} id - Project ID
 * @returns {Promise<void>}
 */
export async function deleteProject(dbName, id) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update (or create) a phase response/output for an existing project.
 * Used by the Validator in project-attached mode to write back improvements.
 *
 * NOTE: This intentionally updates the canonical project record (and therefore updatedAt)
 * only on explicit user action.
 *
 * @param {string} dbName - Database name
 * @param {string} projectId - Project ID
 * @param {number} phaseNumber - Phase number (1-3)
 * @param {string} markdown - Phase output markdown
 * @returns {Promise<Object|null>} Updated project or null if not found
 */
export async function updateProjectPhaseOutput(dbName, projectId, phaseNumber, markdown) {
  const project = await getProject(dbName, projectId);
  if (!project) return null;

  const phase = Number(phaseNumber);
  if (![1, 2, 3].includes(phase)) {
    throw new Error('phaseNumber must be 1, 2, or 3');
  }

  if (!project.phases) project.phases = {};
  if (!project.phases[phase]) {
    project.phases[phase] = { prompt: '', response: '', completed: false };
  }

  project.phases[phase].response = markdown;
  project.phases[phase].completed = true;

  // Backward-compatible legacy field (used by older exports and some helpers)
  project[`phase${phase}_output`] = markdown;

  if (!project.currentPhase || project.currentPhase < phase) {
    project.currentPhase = phase;
  }

  return saveProject(dbName, project);
}

/**
 * Clear all projects (for testing)
 * @param {string} dbName - Database name
 * @returns {Promise<void>}
 */
export async function clearAllProjects(dbName) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
	  const tx = db.transaction([STORE_NAME, VALIDATOR_STORE_NAME], 'readwrite');
	  tx.objectStore(STORE_NAME).clear();
	  tx.objectStore(VALIDATOR_STORE_NAME).clear();
	  tx.oncomplete = () => resolve();
	  tx.onerror = () => reject(tx.error);
  });
}

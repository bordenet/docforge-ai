/**
 * Storage - Per-plugin IndexedDB storage
 * @module storage
 */

import { sanitizeProject } from './storage-sanitization.js';

// Re-export sanitization functions for external use
export { sanitizeFormData, sanitizePhases } from './storage-sanitization.js';

const DB_VERSION = 1;
const STORE_NAME = 'projects';

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
    };
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
 * Clear all projects (for testing)
 * @param {string} dbName - Database name
 * @returns {Promise<void>}
 */
export async function clearAllProjects(dbName) {
  const db = await getDB(dbName);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Storage Sanitization - Input sanitization utilities for storage module
 * @module storage-sanitization
 */

/**
 * Maximum allowed length for string fields
 */
export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 500000; // 500KB of text

/**
 * Sanitize a string value
 * @param {*} value - Value to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(value, maxLength = MAX_CONTENT_LENGTH) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Remove null bytes and other control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
}

/**
 * Sanitize form data object
 * @param {Object} formData - Form data to sanitize
 * @returns {Object} Sanitized form data
 */
export function sanitizeFormData(formData) {
  if (!formData || typeof formData !== 'object') return {};

  const sanitized = {};
  for (const [key, value] of Object.entries(formData)) {
    // Only allow string keys
    if (typeof key !== 'string') continue;
    // Sanitize string values, skip objects/arrays
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      // Sanitize arrays of strings (e.g., multi-select fields)
      sanitized[key] = value.map((v) => (typeof v === 'string' ? sanitizeString(v) : v));
    } else if (value !== null && typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeFormData(value);
    } else {
      // Pass through numbers, booleans, etc.
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Sanitize phase response data
 * @param {Object} phases - Phase responses
 * @returns {Object} Sanitized phases
 */
export function sanitizePhases(phases) {
  if (!phases || typeof phases !== 'object') return {};

  const sanitized = {};
  for (const [key, value] of Object.entries(phases)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      // Handle phase objects with response/critique/etc.
      sanitized[key] = {};
      for (const [subKey, subValue] of Object.entries(value)) {
        sanitized[key][subKey] = typeof subValue === 'string' ? sanitizeString(subValue) : subValue;
      }
    }
  }
  return sanitized;
}

/**
 * Recursively sanitize a value based on its type
 * @param {*} value - Value to sanitize
 * @param {string} key - Key name (for special handling)
 * @returns {*} Sanitized value
 */
export function sanitizeValue(value, key = '') {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    // Apply length limits based on field name
    const maxLen = key === 'title' ? MAX_TITLE_LENGTH : MAX_CONTENT_LENGTH;
    return sanitizeString(value, maxLen);
  }

  if (Array.isArray(value)) {
    return value.map((v, i) => sanitizeValue(v, `${key}[${i}]`));
  }

  if (typeof value === 'object') {
    const sanitized = {};
    for (const [k, v] of Object.entries(value)) {
      sanitized[k] = sanitizeValue(v, k);
    }
    return sanitized;
  }

  // Pass through numbers, booleans, etc.
  return value;
}

/**
 * Validate and sanitize a project before saving
 * @param {Object} project - Project to sanitize
 * @returns {Object} Sanitized project
 * @throws {Error} If project is invalid
 */
export function sanitizeProject(project) {
  if (!project || typeof project !== 'object') {
    throw new Error('Project must be a non-null object');
  }

  // Recursively sanitize all values in the project
  const sanitized = sanitizeValue(project);

  // Ensure required fields have defaults
  if (!sanitized.title) {
    sanitized.title = 'Untitled';
  }
  if (typeof sanitized.currentPhase !== 'number') {
    sanitized.currentPhase = 1;
  }

  return sanitized;
}


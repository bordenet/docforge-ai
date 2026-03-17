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
  const cleaned = str
    // Remove null bytes and other control characters (except newlines and tabs)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove invisible Unicode characters that cause non-deterministic validator scoring
    // BOM, zero-width spaces, zero-width joiners, word joiner
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\uFEFF\u200B\u200C\u200D\u2060\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    // Replace non-breaking spaces with regular spaces
    .replace(/\u00A0/g, ' ');
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


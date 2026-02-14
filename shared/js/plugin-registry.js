/**
 * Plugin Registry - Central registry for all document type plugins
 * @module plugin-registry
 */

// Import all plugin configurations
import { onePagerPlugin } from '../../plugins/one-pager/config.js';
import { prdPlugin } from '../../plugins/prd/config.js';
import { adrPlugin } from '../../plugins/adr/config.js';
import { prFaqPlugin } from '../../plugins/pr-faq/config.js';
import { powerStatementPlugin } from '../../plugins/power-statement/config.js';
import { acceptanceCriteriaPlugin } from '../../plugins/acceptance-criteria/config.js';
import { jdPlugin } from '../../plugins/jd/config.js';
import { businessJustificationPlugin } from '../../plugins/business-justification/config.js';
import { strategicProposalPlugin } from '../../plugins/strategic-proposal/config.js';

/**
 * @typedef {Object} FormField
 * @property {string} id - Field ID (used in prompt templates)
 * @property {string} label - Display label
 * @property {'text'|'textarea'|'select'} type - Field type
 * @property {boolean} required - Whether field is required
 * @property {number} [rows] - Rows for textarea
 * @property {string} [placeholder] - Placeholder text
 * @property {string} [helpText] - Help text below field
 * @property {Array<{value: string, label: string}>} [options] - Options for select
 */

/**
 * @typedef {Object} ScoringDimension
 * @property {string} name - Dimension name
 * @property {number} maxPoints - Maximum points for this dimension
 * @property {string} description - What this dimension measures
 */

/**
 * @typedef {Object} DocumentTypePlugin
 * @property {string} id - URL slug (e.g., 'one-pager')
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} dbName - IndexedDB database name
 * @property {FormField[]} formFields - Phase 1 form fields
 * @property {ScoringDimension[]} scoringDimensions - Validator scoring
 * @property {Function} validateDocument - Validation function
 * @property {Object[]} [templates] - Quick-start templates
 */

/** @type {Map<string, DocumentTypePlugin>} */
const registry = new Map();

/**
 * Required plugin fields and their expected types
 * @type {Object.<string, string>}
 */
const REQUIRED_FIELDS = {
  id: 'string',
  name: 'string',
  icon: 'string',
  description: 'string',
  dbName: 'string',
  formFields: 'array',
  scoringDimensions: 'array',
  validateDocument: 'function',
};

/**
 * Validate a plugin configuration object
 * @param {Object} plugin - Plugin object to validate
 * @throws {Error} If plugin is missing required fields or has invalid types
 * @returns {void}
 */
function validatePlugin(plugin) {
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Plugin must be a non-null object');
  }

  const errors = [];

  // Check required fields
  for (const [field, expectedType] of Object.entries(REQUIRED_FIELDS)) {
    const value = plugin[field];

    if (value === undefined || value === null) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    // Type checking
    if (expectedType === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`Field '${field}' must be an array, got ${typeof value}`);
      }
    } else if (expectedType === 'string' && typeof value !== 'string') {
      errors.push(`Field '${field}' must be a string, got ${typeof value}`);
    } else if (expectedType === 'function' && typeof value !== 'function') {
      errors.push(`Field '${field}' must be a function, got ${typeof value}`);
    } else if (expectedType === 'object' && typeof value !== 'object') {
      errors.push(`Field '${field}' must be an object, got ${typeof value}`);
    }
  }

  // Validate id format (URL-safe slug)
  if (plugin.id && !/^[a-z][a-z0-9-]*$/.test(plugin.id)) {
    errors.push(`Plugin ID '${plugin.id}' must be a lowercase URL-safe slug (e.g., 'one-pager')`);
  }

  // Validate dbName format (pattern: {type}-docforge-db)
  if (plugin.dbName && !/^[a-z][a-z0-9-]*-docforge-db$/.test(plugin.dbName)) {
    errors.push(`dbName '${plugin.dbName}' must match pattern '{type}-docforge-db'`);
  }

  // Validate formFields structure
  if (Array.isArray(plugin.formFields)) {
    plugin.formFields.forEach((field, index) => {
      if (!field.id || typeof field.id !== 'string') {
        errors.push(`formFields[${index}]: missing or invalid 'id'`);
      }
      if (!field.label || typeof field.label !== 'string') {
        errors.push(`formFields[${index}]: missing or invalid 'label'`);
      }
      if (!['text', 'textarea', 'select'].includes(field.type)) {
        errors.push(`formFields[${index}]: type must be 'text', 'textarea', or 'select'`);
      }
    });
  }

  // Validate scoringDimensions structure
  if (Array.isArray(plugin.scoringDimensions)) {
    plugin.scoringDimensions.forEach((dim, index) => {
      if (!dim.name || typeof dim.name !== 'string') {
        errors.push(`scoringDimensions[${index}]: missing or invalid 'name'`);
      }
      if (typeof dim.maxPoints !== 'number' || dim.maxPoints <= 0) {
        errors.push(`scoringDimensions[${index}]: maxPoints must be a positive number`);
      }
    });
  }

  if (errors.length > 0) {
    const pluginName = plugin.id || plugin.name || 'unknown';
    throw new Error(`Invalid plugin '${pluginName}':\n  - ${errors.join('\n  - ')}`);
  }
}

// Register all plugins
const plugins = [
  onePagerPlugin,
  prdPlugin,
  adrPlugin,
  prFaqPlugin,
  powerStatementPlugin,
  acceptanceCriteriaPlugin,
  jdPlugin,
  businessJustificationPlugin,
  strategicProposalPlugin,
];

plugins.forEach((plugin) => {
  // Validate plugin contract before registration
  validatePlugin(plugin);

  if (registry.has(plugin.id)) {
    throw new Error(`Duplicate plugin ID: ${plugin.id}`);
  }
  registry.set(plugin.id, plugin);
});

/**
 * Get a plugin by ID
 * @param {string} id - Plugin ID
 * @returns {DocumentTypePlugin|undefined}
 */
export function getPlugin(id) {
  return registry.get(id);
}

/**
 * Get all registered plugins
 * @returns {DocumentTypePlugin[]}
 */
export function getAllPlugins() {
  return Array.from(registry.values());
}

/**
 * Get default plugin (one-pager)
 * @returns {DocumentTypePlugin}
 */
export function getDefaultPlugin() {
  return registry.get('one-pager');
}

/**
 * Check if a plugin exists
 * @param {string} id - Plugin ID
 * @returns {boolean}
 */
export function hasPlugin(id) {
  return registry.has(id);
}

/**
 * Get all plugin IDs
 * @returns {string[]}
 */
export function getPluginIds() {
  return Array.from(registry.keys());
}

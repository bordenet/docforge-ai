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
  strategicProposalPlugin
];

plugins.forEach(plugin => {
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


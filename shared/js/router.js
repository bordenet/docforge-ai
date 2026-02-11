/**
 * Router - URL-based document type selection and navigation
 * @module router
 */

import { getPlugin, getDefaultPlugin, hasPlugin } from './plugin-registry.js';

/**
 * Get the current document type from URL
 * @returns {string} Document type ID
 */
export function getCurrentDocumentType() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');

  if (type && hasPlugin(type)) {
    return type;
  }

  // Default to one-pager
  return 'one-pager';
}

/**
 * Get the current plugin based on URL
 * @returns {import('./plugin-registry.js').DocumentTypePlugin}
 */
export function getCurrentPlugin() {
  const type = getCurrentDocumentType();
  return getPlugin(type) || getDefaultPlugin();
}

/**
 * Get the current view from URL hash
 * @returns {string} Current view ('list', 'new', 'project', 'phase')
 */
export function getCurrentView() {
  const hash = window.location.hash.slice(1);
  if (!hash) return 'list';

  if (hash === 'new') return 'new';
  if (hash.startsWith('project/')) return 'project';
  if (hash.startsWith('phase/')) return 'phase';

  return 'list';
}

/**
 * Get project ID from URL hash
 * @returns {string|null} Project ID or null
 */
export function getProjectIdFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('project/')) {
    return hash.replace('project/', '');
  }
  if (hash.startsWith('phase/')) {
    const parts = hash.split('/');
    return parts[1] || null;
  }
  return null;
}

/**
 * Get phase number from URL hash
 * @returns {number|null} Phase number or null
 */
export function getPhaseFromHash() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('phase/')) {
    const parts = hash.split('/');
    return parseInt(parts[2], 10) || null;
  }
  return null;
}

/**
 * Navigate to a view
 * @param {string} view - View name
 * @param {Object} [params] - Optional parameters
 */
export function navigateTo(view, params = {}) {
  let hash = '';

  switch (view) {
    case 'list':
      hash = '';
      break;
    case 'new':
      hash = 'new';
      break;
    case 'project':
      hash = `project/${params.projectId}`;
      break;
    case 'phase':
      hash = `phase/${params.projectId}/${params.phase}`;
      break;
    default:
      hash = '';
  }

  window.location.hash = hash;
}

/**
 * Build URL for a different document type
 * @param {string} docType - Document type ID
 * @returns {string} URL for that document type
 */
export function getDocTypeUrl(docType) {
  const url = new URL(window.location.href);
  url.searchParams.set('type', docType);
  url.hash = '';
  return url.toString();
}

/**
 * Initialize router - listen for hash changes
 * @param {Function} onRouteChange - Callback when route changes
 */
export function initRouter(onRouteChange) {
  window.addEventListener('hashchange', () => {
    onRouteChange(getCurrentView(), {
      projectId: getProjectIdFromHash(),
      phase: getPhaseFromHash(),
    });
  });

  // Trigger initial route
  onRouteChange(getCurrentView(), {
    projectId: getProjectIdFromHash(),
    phase: getPhaseFromHash(),
  });
}

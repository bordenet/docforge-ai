/**
 * Analytics Module - GoatCounter Integration
 *
 * Privacy-respecting analytics for DocForge-AI.
 * No cookies, no personal data, GDPR-compliant by default.
 *
 * @module analytics
 */

/**
 * Track a custom event in GoatCounter
 * @param {string} eventPath - Event path (e.g., 'tool/assistant', 'phase/1/copy')
 * @param {Object} [data] - Optional additional data
 * @param {string} [data.title] - Custom title for the event
 * @param {string} [data.referrer] - Custom referrer
 */
export function trackEvent(eventPath, data = {}) {
  // GoatCounter uses window.goatcounter.count() for custom events
  if (typeof window !== 'undefined' && window.goatcounter?.count) {
    try {
      window.goatcounter.count({
        path: eventPath,
        title: data.title || eventPath,
        referrer: data.referrer || null,
        event: true, // Marks this as an event, not a pageview
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.debug('[Analytics] Failed to track event:', eventPath, error);
    }
  }
}

/**
 * Track tool usage (Assistant or Validator opened)
 * @param {string} tool - 'assistant' or 'validator'
 * @param {string} [documentType] - Plugin type (e.g., 'prd', 'adr', 'one-pager')
 */
export function trackToolOpen(tool, documentType) {
  const path = documentType ? `tool/${tool}/${documentType}` : `tool/${tool}`;
  trackEvent(path, { title: `${tool} - ${documentType || 'unknown'}` });
}

/**
 * Track phase progression in Assistant
 * @param {number} phase - Phase number (1, 2, or 3)
 * @param {string} action - 'copy' (prompt copied) or 'save' (response saved)
 * @param {string} [documentType] - Plugin type
 */
export function trackPhase(phase, action, documentType) {
  const path = documentType
    ? `phase/${phase}/${action}/${documentType}`
    : `phase/${phase}/${action}`;
  trackEvent(path, { title: `Phase ${phase} ${action}` });
}

/**
 * Track validation action
 * @param {string} action - 'validate', 'save', 'export'
 * @param {string} [documentType] - Plugin type
 * @param {number} [score] - Optional score for context
 */
export function trackValidation(action, documentType, score) {
  const path = documentType
    ? `validate/${action}/${documentType}`
    : `validate/${action}`;
  const title = score !== undefined
    ? `Validate ${action} (score: ${score})`
    : `Validate ${action}`;
  trackEvent(path, { title });
}

/**
 * Track AI powerup usage
 * @param {string} powerup - 'critique' or 'rewrite'
 * @param {string} [documentType] - Plugin type
 */
export function trackPowerup(powerup, documentType) {
  const path = documentType
    ? `powerup/${powerup}/${documentType}`
    : `powerup/${powerup}`;
  trackEvent(path, { title: `Powerup: ${powerup}` });
}

/**
 * Track project actions
 * @param {string} action - 'create', 'delete', 'edit'
 * @param {string} [documentType] - Plugin type
 */
export function trackProject(action, documentType) {
  const path = documentType
    ? `project/${action}/${documentType}`
    : `project/${action}`;
  trackEvent(path, { title: `Project ${action}` });
}

/**
 * Initialize analytics on page load
 * Call this from app entry points after GoatCounter script loads
 */
export function initAnalytics() {
  // GoatCounter auto-tracks pageviews, but we can add custom initialization here
  if (typeof window !== 'undefined') {
    // Track initial tool open based on current path
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const docType = params.get('type') || 'unknown';

    if (path.includes('/assistant/')) {
      trackToolOpen('assistant', docType);
    } else if (path.includes('/validator/')) {
      trackToolOpen('validator', docType);
    }
  }
}


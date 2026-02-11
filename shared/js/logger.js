/**
 * Logger Module - Centralized logging with configurable levels
 * @module logger
 *
 * In production, logging can be disabled by setting:
 *   window.DOCFORGE_LOG_LEVEL = 'none'
 *
 * Log levels: 'debug' | 'info' | 'warn' | 'error' | 'none'
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

/**
 * Get current log level from window config or default to 'warn' in production
 * @returns {string} Current log level
 */
function getLogLevel() {
  if (typeof window !== 'undefined' && window.DOCFORGE_LOG_LEVEL) {
    return window.DOCFORGE_LOG_LEVEL;
  }
  // Default: show warnings and errors only (production-safe)
  return 'warn';
}

/**
 * Check if a message at the given level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} Whether to log
 */
function shouldLog(level) {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Format log message with optional context
 * @param {string} message - Log message
 * @param {string} [context] - Optional context (e.g., module name)
 * @returns {string} Formatted message
 */
function formatMessage(message, context) {
  if (context) {
    return `[${context}] ${message}`;
  }
  return message;
}

/**
 * Logger instance
 */
export const logger = {
  /**
   * Log debug message (development only)
   * @param {string} message - Message to log
   * @param {string} [context] - Optional context
   */
  debug(message, context) {
    if (shouldLog('debug')) {
      console.log(formatMessage(message, context));
    }
  },

  /**
   * Log info message
   * @param {string} message - Message to log
   * @param {string} [context] - Optional context
   */
  info(message, context) {
    if (shouldLog('info')) {
      console.log(formatMessage(message, context));
    }
  },

  /**
   * Log warning message
   * @param {string} message - Message to log
   * @param {string} [context] - Optional context
   */
  warn(message, context) {
    if (shouldLog('warn')) {
      console.warn(formatMessage(message, context));
    }
  },

  /**
   * Log error message
   * @param {string} message - Message to log
   * @param {Error|string} [error] - Optional error object or details
   * @param {string} [context] - Optional context
   */
  error(message, error, context) {
    if (shouldLog('error')) {
      const formatted = formatMessage(message, context);
      if (error) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  },
};

export default logger;


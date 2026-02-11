/**
 * Form Generator - Dynamically generates forms from plugin field definitions
 * @module form-generator
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[char]
  );
}

/**
 * Generate a form field HTML
 * @param {import('./plugin-registry.js').FormField} field - Field definition
 * @param {Object} [existingData] - Existing form data to pre-fill
 * @returns {string} HTML string for the field
 */
export function generateField(field, existingData = {}) {
  const value = existingData[field.id] || '';
  const escapedValue = escapeHtml(value);
  const requiredStar = field.required ? '<span class="text-red-500">*</span>' : '';
  const helpText = field.helpText
    ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">${escapeHtml(field.helpText)}</p>`
    : '';

  let inputHtml = '';

  switch (field.type) {
    case 'text':
      inputHtml = `
        <input
          type="text"
          id="${field.id}"
          name="${field.id}"
          ${field.required ? 'required' : ''}
          value="${escapedValue}"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="${escapeHtml(field.placeholder || '')}"
        >`;
      break;

    case 'textarea':
      inputHtml = `
        <textarea
          id="${field.id}"
          name="${field.id}"
          ${field.required ? 'required' : ''}
          rows="${field.rows || 3}"
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="${escapeHtml(field.placeholder || '')}"
        >${escapedValue}</textarea>`;
      break;

    case 'select': {
      const options = (field.options || [])
        .map(
          (opt) =>
            `<option value="${escapeHtml(opt.value)}" ${value === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
        )
        .join('');
      inputHtml = `
        <select
          id="${field.id}"
          name="${field.id}"
          ${field.required ? 'required' : ''}
          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select...</option>
          ${options}
        </select>`;
      break;
    }

    default:
      inputHtml = `<p class="text-red-500">Unknown field type: ${field.type}</p>`;
  }

  return `
    <div class="mb-4">
      <label for="${field.id}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        ${escapeHtml(field.label)} ${requiredStar}
      </label>
      ${helpText}
      ${inputHtml}
    </div>
  `;
}

/**
 * Generate a complete form from plugin fields
 * @param {import('./plugin-registry.js').FormField[]} fields - Array of field definitions
 * @param {Object} [existingData] - Existing form data to pre-fill
 * @returns {string} HTML string for the form fields
 */
export function generateFormFields(fields, existingData = {}) {
  return fields.map((field) => generateField(field, existingData)).join('\n');
}

/**
 * Extract form data from DOM
 * @param {import('./plugin-registry.js').FormField[]} fields - Array of field definitions
 * @returns {Object} Form data keyed by field ID
 */
export function extractFormData(fields) {
  const data = {};
  fields.forEach((field) => {
    const element = document.getElementById(field.id);
    if (element) {
      data[field.id] = element.value.trim();
    }
  });
  return data;
}

/**
 * Validate form data against field definitions
 * @param {import('./plugin-registry.js').FormField[]} fields - Array of field definitions
 * @param {Object} data - Form data to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateFormData(fields, data) {
  const errors = [];
  fields.forEach((field) => {
    if (field.required && !data[field.id]) {
      errors.push(`${field.label} is required`);
    }
  });
  return { valid: errors.length === 0, errors };
}

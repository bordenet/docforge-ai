/**
 * Form Generator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateField,
  generateFormFields,
  validateFormData
} from '../shared/js/form-generator.js';

describe('Form Generator', () => {

  describe('generateField', () => {
    it('should generate text input field', () => {
      const field = {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true,
        placeholder: 'Enter title'
      };

      const html = generateField(field);

      expect(html).toContain('type="text"');
      expect(html).toContain('id="title"');
      expect(html).toContain('name="title"');
      expect(html).toContain('required');
      expect(html).toContain('Enter title');
      expect(html).toContain('Title');
      expect(html).toContain('text-red-500'); // Required star
    });

    it('should generate textarea field', () => {
      const field = {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        rows: 5,
        placeholder: 'Enter description'
      };

      const html = generateField(field);

      expect(html).toContain('<textarea');
      expect(html).toContain('id="description"');
      expect(html).toContain('rows="5"');
      expect(html).not.toContain('required');
    });

    it('should generate select field with options', () => {
      const field = {
        id: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' }
        ]
      };

      const html = generateField(field);

      expect(html).toContain('<select');
      expect(html).toContain('id="status"');
      expect(html).toContain('value="draft"');
      expect(html).toContain('Draft');
      expect(html).toContain('value="published"');
      expect(html).toContain('Published');
    });

    it('should include help text when provided', () => {
      const field = {
        id: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        helpText: 'Enter any additional notes'
      };

      const html = generateField(field);

      expect(html).toContain('Enter any additional notes');
      expect(html).toContain('text-xs');
    });

    it('should pre-fill with existing data', () => {
      const field = {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true
      };

      const existingData = { title: 'My Project' };
      const html = generateField(field, existingData);

      expect(html).toContain('value="My Project"');
    });

    it('should escape HTML in values', () => {
      const field = {
        id: 'title',
        label: 'Title',
        type: 'text',
        required: true
      };

      const existingData = { title: '<script>alert("xss")</script>' };
      const html = generateField(field, existingData);

      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });
  });

  describe('generateFormFields', () => {
    it('should generate HTML for multiple fields', () => {
      const fields = [
        { id: 'title', label: 'Title', type: 'text', required: true },
        { id: 'description', label: 'Description', type: 'textarea', required: false }
      ];

      const html = generateFormFields(fields);

      expect(html).toContain('id="title"');
      expect(html).toContain('id="description"');
    });

    it('should handle empty fields array', () => {
      const html = generateFormFields([]);
      expect(html).toBe('');
    });
  });

  describe('validateFormData', () => {
    const fields = [
      { id: 'title', label: 'Title', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'textarea', required: false }
    ];

    it('should return valid for complete required fields', () => {
      const data = { title: 'My Project', description: '' };
      const result = validateFormData(fields, data);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing required fields', () => {
      const data = { title: '', description: 'Some text' };
      const result = validateFormData(fields, data);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Title');
    });

    it('should handle multiple missing required fields', () => {
      const multiRequiredFields = [
        { id: 'title', label: 'Title', type: 'text', required: true },
        { id: 'problem', label: 'Problem', type: 'textarea', required: true }
      ];

      const data = { title: '', problem: '' };
      const result = validateFormData(multiRequiredFields, data);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});


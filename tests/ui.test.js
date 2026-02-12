/**
 * UI Module Tests
 * Tests for toast notifications, loading overlays, and utility functions
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  showToast,
  showLoading,
  hideLoading,
  escapeHtml,
  formatDate,
  renderMarkdown,
  copyToClipboard,
  downloadFile,
  createActionMenu,
} from '../shared/js/ui.js';

describe('UI Module', () => {
  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="loading-overlay" class="hidden">
        <span id="loading-text">Loading...</span>
      </div>
    `;
  });

  describe('showToast', () => {
    test('should create a toast element in the container', () => {
      showToast('Test message', 'success');
      const container = document.getElementById('toast-container');
      expect(container.children.length).toBe(1);
    });

    test('should display the correct message', () => {
      showToast('Hello World', 'info');
      const container = document.getElementById('toast-container');
      expect(container.innerHTML).toContain('Hello World');
    });

    test('should apply success styling', () => {
      showToast('Success!', 'success');
      const toast = document.querySelector('#toast-container > div');
      expect(toast.className).toContain('bg-green-600');
    });

    test('should apply error styling', () => {
      showToast('Error!', 'error');
      const toast = document.querySelector('#toast-container > div');
      expect(toast.className).toContain('bg-red-600');
    });

    test('should apply info styling by default', () => {
      showToast('Info');
      const toast = document.querySelector('#toast-container > div');
      expect(toast.className).toContain('bg-blue-600');
    });

    test('should not throw when container is missing', () => {
      document.body.innerHTML = '';
      expect(() => showToast('Test')).not.toThrow();
    });

    test('should escape HTML in message', () => {
      showToast('<script>alert("xss")</script>', 'info');
      const container = document.getElementById('toast-container');
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('showLoading', () => {
    test('should show the loading overlay', () => {
      showLoading();
      const overlay = document.getElementById('loading-overlay');
      expect(overlay.classList.contains('hidden')).toBe(false);
    });

    test('should display custom loading text', () => {
      showLoading('Processing...');
      const text = document.getElementById('loading-text');
      expect(text.textContent).toBe('Processing...');
    });

    test('should use default text when none provided', () => {
      showLoading();
      const text = document.getElementById('loading-text');
      expect(text.textContent).toBe('Loading...');
    });

    test('should not throw when overlay is missing', () => {
      document.body.innerHTML = '';
      expect(() => showLoading()).not.toThrow();
    });
  });

  describe('hideLoading', () => {
    test('should hide the loading overlay', () => {
      const overlay = document.getElementById('loading-overlay');
      overlay.classList.remove('hidden');

      hideLoading();

      expect(overlay.classList.contains('hidden')).toBe(true);
    });

    test('should not throw when overlay is missing', () => {
      document.body.innerHTML = '';
      expect(() => hideLoading()).not.toThrow();
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    test('should return empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    test('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    test('should escape single quotes', () => {
      expect(escapeHtml("It's working")).toBe('It&#039;s working');
    });

    test('should escape multiple special characters', () => {
      expect(escapeHtml('<a href="test?a=1&b=2">')).toBe(
        '&lt;a href=&quot;test?a=1&amp;b=2&quot;&gt;'
      );
    });
  });

  describe('formatDate', () => {
    test('should format a date string', () => {
      const date = '2025-01-15T10:30:00.000Z';
      const result = formatDate(date);
      // Result depends on locale, but should contain key parts
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2025');
    });

    test('should format a Date object', () => {
      const date = new Date('2025-06-20T14:00:00.000Z');
      const result = formatDate(date);
      expect(result).toContain('Jun');
      expect(result).toContain('20');
      expect(result).toContain('2025');
    });

    test('should handle ISO string format', () => {
      const isoDate = new Date().toISOString();
      const result = formatDate(isoDate);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('renderMarkdown', () => {
    test('should return empty string for null/undefined', () => {
      expect(renderMarkdown(null)).toBe('');
      expect(renderMarkdown(undefined)).toBe('');
      expect(renderMarkdown('')).toBe('');
    });

    test('should fallback to escaped text with br tags when marked is not available', () => {
      // In test environment, marked is not defined
      const result = renderMarkdown('Line 1\nLine 2');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('<br>');
    });

    test('should escape HTML in fallback mode', () => {
      const result = renderMarkdown('<script>alert("xss")</script>\nNormal text');
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  describe('copyToClipboard', () => {
    test('should copy text using clipboard API', async () => {
      const writeMock = jest.fn().mockResolvedValue();
      navigator.clipboard.writeText = writeMock;

      const result = await copyToClipboard('test text');

      expect(writeMock).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    test('should fallback to execCommand when clipboard API fails', async () => {
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Not allowed'));
      document.execCommand = jest.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });
  });

  describe('downloadFile', () => {
    test('should create a download link and trigger click', () => {
      const mockUrl = 'blob:test-url';
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl);
      URL.revokeObjectURL = jest.fn();

      // Track link creation
      const originalCreateElement = document.createElement.bind(document);
      let createdLink = null;
      document.createElement = jest.fn((tag) => {
        const el = originalCreateElement(tag);
        if (tag === 'a') {
          createdLink = el;
          el.click = jest.fn();
        }
        return el;
      });

      downloadFile('Test content', 'test-file.txt', 'text/plain');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(createdLink).toBeTruthy();
      expect(createdLink.download).toBe('test-file.txt');
      expect(createdLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });

    test('should use default mime type', () => {
      URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
      URL.revokeObjectURL = jest.fn();

      downloadFile('content', 'file.txt');

      expect(URL.createObjectURL).toHaveBeenCalled();
      // The Blob is created with 'text/plain' by default
      const blobArg = URL.createObjectURL.mock.calls[0][0];
      expect(blobArg.type).toBe('text/plain');
    });
  });

  describe('createActionMenu', () => {
    let triggerElement;

    beforeEach(() => {
      triggerElement = document.createElement('button');
      triggerElement.textContent = '...';
      document.body.appendChild(triggerElement);
    });

    afterEach(() => {
      // Clean up any menus
      document.querySelectorAll('.action-menu').forEach((m) => m.remove());
      triggerElement.remove();
    });

    test('should set ARIA attributes on trigger element', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Test', onClick: () => {} }],
      });

      expect(triggerElement.getAttribute('aria-haspopup')).toBe('menu');
      expect(triggerElement.getAttribute('aria-expanded')).toBe('false');
      expect(triggerElement.getAttribute('aria-controls')).toBeTruthy();
    });

    test('should open menu on trigger click', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Test', onClick: () => {} }],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      expect(menu).toBeTruthy();
      expect(triggerElement.getAttribute('aria-expanded')).toBe('true');
    });

    test('should render menu items with labels', () => {
      createActionMenu({
        triggerElement,
        items: [
          { label: 'Edit', onClick: () => {} },
          { label: 'Delete', onClick: () => {} },
        ],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      expect(menu.innerHTML).toContain('Edit');
      expect(menu.innerHTML).toContain('Delete');
    });

    test('should render menu items with icons', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Edit', icon: '✏️', onClick: () => {} }],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      expect(menu.innerHTML).toContain('✏️');
    });

    test('should render separator items', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Edit', onClick: () => {} }, { separator: true }, { label: 'Delete', onClick: () => {} }],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      expect(menu.querySelector('[role="separator"]')).toBeTruthy();
    });

    test('should apply destructive styling to destructive items', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Delete', destructive: true, onClick: () => {} }],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      const deleteBtn = menu.querySelector('.action-menu-item');
      expect(deleteBtn.className).toContain('text-red-600');
    });

    test('should apply disabled styling to disabled items', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Disabled', disabled: true, onClick: () => {} }],
      });

      triggerElement.click();

      const menu = document.querySelector('.action-menu');
      const disabledBtn = menu.querySelector('.action-menu-item');
      expect(disabledBtn.className).toContain('opacity-50');
      expect(disabledBtn.disabled).toBe(true);
    });

    test('should call onClick when menu item is clicked', () => {
      const mockOnClick = jest.fn();
      createActionMenu({
        triggerElement,
        items: [{ label: 'Test', onClick: mockOnClick }],
      });

      triggerElement.click();
      const menu = document.querySelector('.action-menu');
      const menuItem = menu.querySelector('.action-menu-item');
      menuItem.click();

      expect(mockOnClick).toHaveBeenCalled();
    });

    test('should close menu after item click', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Test', onClick: () => {} }],
      });

      triggerElement.click();
      expect(document.querySelector('.action-menu')).toBeTruthy();

      const menuItem = document.querySelector('.action-menu-item');
      menuItem.click();

      // Menu should have closing class (animating out)
      const menu = document.querySelector('.action-menu');
      expect(menu?.classList.contains('action-menu-closing')).toBeTruthy();
    });

    test('should toggle menu on repeated trigger clicks', () => {
      createActionMenu({
        triggerElement,
        items: [{ label: 'Test', onClick: () => {} }],
      });

      // First click opens
      triggerElement.click();
      expect(document.querySelector('.action-menu')).toBeTruthy();

      // Second click closes (menu should have closing class)
      triggerElement.click();
      const menu = document.querySelector('.action-menu');
      expect(menu?.classList.contains('action-menu-closing')).toBeTruthy();
    });
  });
});

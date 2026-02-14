/**
 * UI Modals Module Tests
 * Tests for confirmation dialogs and prompt modals
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { confirm, showPromptModal } from '../shared/js/ui-modals.js';

describe('UI Modals Module', () => {
  let toastContainer;

  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = '';
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  });

  afterEach(() => {
    // Clean up any modals
    document.querySelectorAll('#confirm-modal, #prompt-modal').forEach((el) => el.remove());
  });

  describe('confirm', () => {
    test('creates a confirm modal in the DOM', async () => {
      // Don't await - we'll interact with it manually
      const promise = confirm('Are you sure?');

      expect(document.getElementById('confirm-modal')).toBeTruthy();

      // Click cancel to resolve
      document.getElementById('confirm-cancel').click();
      const result = await promise;
      expect(result).toBe(false);
    });

    test('returns true when OK is clicked', async () => {
      const promise = confirm('Delete this?', 'Confirm Delete');

      // Click OK
      document.getElementById('confirm-ok').click();
      const result = await promise;
      expect(result).toBe(true);
    });

    test('returns false when Cancel is clicked', async () => {
      const promise = confirm('Delete this?');

      document.getElementById('confirm-cancel').click();
      const result = await promise;
      expect(result).toBe(false);
    });

    test('returns false when clicking outside modal (backdrop)', async () => {
      const promise = confirm('Delete this?');

      // Click on the backdrop (the modal container itself)
      const modal = document.getElementById('confirm-modal');
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      const result = await promise;
      expect(result).toBe(false);
    });

    test('displays the correct message and title', async () => {
      const promise = confirm('This is the message', 'Custom Title');

      const modal = document.getElementById('confirm-modal');
      expect(modal.innerHTML).toContain('This is the message');
      expect(modal.innerHTML).toContain('Custom Title');

      // Clean up
      document.getElementById('confirm-cancel').click();
      await promise;
    });

    test('escapes HTML in message and title', async () => {
      const promise = confirm('<script>alert("xss")</script>', '<b>Title</b>');

      const modal = document.getElementById('confirm-modal');
      expect(modal.innerHTML).not.toContain('<script>');
      expect(modal.innerHTML).toContain('&lt;script&gt;');

      document.getElementById('confirm-cancel').click();
      await promise;
    });

    test('removes existing modal before creating new one', async () => {
      // Create first modal
      const promise1 = confirm('First');
      expect(document.querySelectorAll('#confirm-modal').length).toBe(1);

      // Create second modal while first is open
      const promise2 = confirm('Second');
      expect(document.querySelectorAll('#confirm-modal').length).toBe(1);
      expect(document.getElementById('confirm-modal').innerHTML).toContain('Second');

      // Clean up
      document.getElementById('confirm-cancel').click();
      await Promise.race([promise1, promise2]);
    });

    test('uses default title if not provided', async () => {
      const promise = confirm('Message only');

      const modal = document.getElementById('confirm-modal');
      expect(modal.innerHTML).toContain('Confirm');

      document.getElementById('confirm-cancel').click();
      await promise;
    });
  });

  describe('showPromptModal', () => {
    test('creates a prompt modal in the DOM', () => {
      showPromptModal('Sample prompt text', 'Prompt Title');

      const modal = document.getElementById('prompt-modal');
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain('Sample prompt text');
      expect(modal.innerHTML).toContain('Prompt Title');
    });

    test('uses default title if not provided', () => {
      showPromptModal('Some text');

      const modal = document.getElementById('prompt-modal');
      expect(modal.innerHTML).toContain('Prompt');
    });

    test('escapes HTML in text and title', () => {
      showPromptModal('<script>evil()</script>', '<img onerror="xss">');

      const modal = document.getElementById('prompt-modal');
      expect(modal.innerHTML).not.toContain('<script>');
      expect(modal.innerHTML).toContain('&lt;script&gt;');
    });

    test('closes when X button is clicked', () => {
      showPromptModal('Text');

      document.getElementById('modal-close').click();

      expect(document.getElementById('prompt-modal')).toBeNull();
    });

    test('closes when Close button is clicked', () => {
      showPromptModal('Text');

      document.getElementById('modal-close-btn').click();

      expect(document.getElementById('prompt-modal')).toBeNull();
    });

    test('closes when clicking backdrop', () => {
      showPromptModal('Text');

      const modal = document.getElementById('prompt-modal');
      modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(document.getElementById('prompt-modal')).toBeNull();
    });

    test('does not close when clicking inside modal content', () => {
      showPromptModal('Text');

      // Click on the modal content div (not the backdrop)
      const content = document.querySelector('#prompt-modal > div');
      content.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Modal should still be open
      expect(document.getElementById('prompt-modal')).toBeTruthy();
    });

    test('removes existing prompt modal before creating new one', () => {
      showPromptModal('First');
      expect(document.querySelectorAll('#prompt-modal').length).toBe(1);
      expect(document.getElementById('prompt-modal').innerHTML).toContain('First');

      showPromptModal('Second');
      expect(document.querySelectorAll('#prompt-modal').length).toBe(1);
      expect(document.getElementById('prompt-modal').innerHTML).toContain('Second');
    });

    test('copy button triggers clipboard write', async () => {
      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      showPromptModal('Text to copy');

      // Click copy button
      document.getElementById('modal-copy').click();

      // Wait for async clipboard operation
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockWriteText).toHaveBeenCalledWith('Text to copy');
    });

    test('shows toast after successful copy', async () => {
      // Mock clipboard API
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      });

      showPromptModal('Copy this');

      // Click copy button
      document.getElementById('modal-copy').click();

      // Wait for async operation and toast to appear
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check toast container has a notification
      const toast = toastContainer.querySelector('.notification');
      expect(toast).toBeTruthy();
      expect(toast.textContent).toContain('Copied to clipboard');
    });
  });
});

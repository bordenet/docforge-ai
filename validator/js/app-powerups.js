/**
 * Validator Application - AI Power-ups Module
 * Handles critique, rewrite, and prompt viewing functionality
 * @module validator-app-powerups
 */

import { showToast, copyToClipboard, showPromptModal } from '../../shared/js/ui.js';
import { generateCritiquePrompt, generateRewritePrompt } from '../../shared/js/validator-prompts.js';

// Shared state references (set via init)
let getState = null;
let setPrompt = null;

/**
 * Initialize powerups module with state accessors
 * @param {Function} stateGetter - Function to get current state {plugin, result}
 * @param {Function} promptSetter - Function to set current prompt
 */
export function initPowerups(stateGetter, promptSetter) {
  getState = stateGetter;
  setPrompt = promptSetter;
}

/**
 * Enable a button by removing disabled styles
 * @param {HTMLElement} btn - Button element
 * @param {string} colorClass - Tailwind color classes to apply
 */
export function enableButton(btn, colorClass = 'bg-teal-600 hover:bg-teal-700') {
  if (!btn) return;
  btn.classList.remove('bg-slate-600', 'text-slate-400', 'cursor-not-allowed', 'pointer-events-none');
  btn.classList.add(...colorClass.split(' '), 'text-white');
  btn.disabled = false;
  btn.removeAttribute('aria-disabled');
}

/**
 * Handle critique button click
 */
export function handleCritique() {
  const editor = document.getElementById('editor');
  const content = editor?.value || '';
  const { plugin, result } = getState();

  if (!content || !result) {
    showToast('Add some content first', 'warning');
    return;
  }

  const prompt = generateCritiquePrompt(content, plugin, result);
  setPrompt({ text: prompt, type: 'Critique' });

  enableButton(document.getElementById('btn-view-prompt'));
  enableButton(document.getElementById('btn-open-claude'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('Critique prompt copied! Open Claude.ai and paste.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

/**
 * Handle rewrite button click
 */
export function handleRewrite() {
  const editor = document.getElementById('editor');
  const content = editor?.value || '';
  const { plugin, result } = getState();

  if (!content || !result) {
    showToast('Add some content first', 'warning');
    return;
  }

  const prompt = generateRewritePrompt(content, plugin, result);
  setPrompt({ text: prompt, type: 'Rewrite' });

  enableButton(document.getElementById('btn-view-prompt'));
  enableButton(document.getElementById('btn-open-claude'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('Rewrite prompt copied! Open Claude.ai and paste.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

/**
 * Handle view prompt button click
 * @param {Object} currentPrompt - Current prompt object
 */
export function handleViewPrompt(currentPrompt) {
  if (!currentPrompt?.text) {
    showToast('Copy a prompt first', 'warning');
    return;
  }
  showPromptModal(currentPrompt.text, `${currentPrompt.type} Prompt`);
}


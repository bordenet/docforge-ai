/**
 * Validator Application - LLM Scoring Mode Module
 * Handles LLM scoring toggle and prompt generation
 * @module validator-app-llm-mode
 */

import { showToast, copyToClipboard, showPromptModal } from '../../shared/js/ui.js';
import { generateLLMScoringPrompt } from '../../shared/js/validator-prompts.js';
import { enableButton } from './app-powerups.js';

// Module state
let isLLMMode = false;
let getState = null;
let setPrompt = null;

/**
 * Initialize LLM mode module with state accessors
 * @param {Function} stateGetter - Function to get current state {plugin}
 * @param {Function} promptSetter - Function to set current prompt
 */
export function initLLMMode(stateGetter, promptSetter) {
  getState = stateGetter;
  setPrompt = promptSetter;

  // Initialize from localStorage
  const saved = localStorage.getItem('docforge-scoring-mode');
  if (saved === 'llm') {
    isLLMMode = false;
    toggleScoringMode();
  }
}

/**
 * Toggle between Quick and LLM scoring modes
 */
export function toggleScoringMode() {
  isLLMMode = !isLLMMode;

  const btnToggle = document.getElementById('btn-toggle-mode');
  const toggleKnob = btnToggle?.querySelector('span');
  const modeLabelQuick = document.getElementById('mode-label-quick');
  const modeLabelLLM = document.getElementById('mode-label-llm');
  const quickPanel = document.getElementById('quick-score-panel');
  const llmPanel = document.getElementById('llm-score-panel');

  if (isLLMMode) {
    btnToggle?.classList.remove('bg-slate-500');
    btnToggle?.classList.add('bg-indigo-600');
    if (toggleKnob) toggleKnob.style.transform = 'translateX(24px)';
    btnToggle?.setAttribute('aria-checked', 'true');
    modeLabelQuick?.classList.remove('text-white');
    modeLabelQuick?.classList.add('text-slate-400');
    modeLabelLLM?.classList.remove('text-slate-400');
    modeLabelLLM?.classList.add('text-white');
    quickPanel?.classList.add('hidden');
    llmPanel?.classList.remove('hidden');
  } else {
    btnToggle?.classList.remove('bg-indigo-600');
    btnToggle?.classList.add('bg-slate-500');
    if (toggleKnob) toggleKnob.style.transform = 'translateX(0)';
    btnToggle?.setAttribute('aria-checked', 'false');
    modeLabelQuick?.classList.remove('text-slate-400');
    modeLabelQuick?.classList.add('text-white');
    modeLabelLLM?.classList.remove('text-white');
    modeLabelLLM?.classList.add('text-slate-400');
    quickPanel?.classList.remove('hidden');
    llmPanel?.classList.add('hidden');
  }

  localStorage.setItem('docforge-scoring-mode', isLLMMode ? 'llm' : 'quick');
}

/**
 * Handle copy LLM prompt button click
 */
export function handleCopyLLMPrompt() {
  const editor = document.getElementById('editor');
  const content = editor?.value?.trim() || '';
  if (!content) {
    showToast('Add some content first', 'warning');
    return;
  }

  const { plugin } = getState();
  const prompt = generateLLMScoringPrompt(content, plugin);
  setPrompt({ text: prompt, type: 'LLM Scoring' });

  enableButton(document.getElementById('btn-view-llm-prompt'));
  enableButton(document.getElementById('btn-open-claude-llm'), 'bg-orange-600 hover:bg-orange-700');

  copyToClipboard(prompt).then((success) => {
    if (success) {
      showToast('LLM scoring prompt copied! Paste into Claude.ai.', 'success');
    } else {
      showToast('Prompt ready. Use View Prompt to copy manually.', 'warning');
    }
  });
}

/**
 * Handle view LLM prompt button click
 * @param {Object} currentPrompt - Current prompt object
 */
export function handleViewLLMPrompt(currentPrompt) {
  if (!currentPrompt || currentPrompt.type !== 'LLM Scoring') {
    showToast('Copy the scoring prompt first', 'warning');
    return;
  }
  showPromptModal(currentPrompt.text, 'LLM Scoring Prompt');
}


/**
 * Theme Management Module
 * Handles dark/light mode toggling with persistence
 * @module theme
 */

const THEME_STORAGE_KEY = 'docforge-theme';

/**
 * Toggle between dark and light mode
 * Updates DOM classes, button icons, and persists preference
 */
export function toggleDarkMode() {
  const html = document.documentElement;
  const body = document.body;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    // Switch to light mode
    html.classList.remove('dark');
    body.classList.remove('bg-slate-950', 'text-slate-100');
    body.classList.add('bg-white', 'text-slate-900');
    
    // Update header
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-600', 'border-slate-500');
      header.classList.add('bg-slate-200', 'border-slate-300');
    }
    
    // Update panels
    document.querySelectorAll('.bg-slate-900').forEach(el => {
      el.classList.remove('bg-slate-900');
      el.classList.add('bg-slate-100');
    });
    document.querySelectorAll('.bg-slate-800').forEach(el => {
      el.classList.remove('bg-slate-800');
      el.classList.add('bg-slate-200');
    });
    document.querySelectorAll('.border-slate-800').forEach(el => {
      el.classList.remove('border-slate-800');
      el.classList.add('border-slate-300');
    });
    
    // Update button icon to sun
    updateThemeIcon(false);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  } else {
    // Switch to dark mode
    html.classList.add('dark');
    body.classList.remove('bg-white', 'text-slate-900');
    body.classList.add('bg-slate-950', 'text-slate-100');
    
    // Update header
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-200', 'border-slate-300');
      header.classList.add('bg-slate-600', 'border-slate-500');
    }
    
    // Update panels
    document.querySelectorAll('.bg-slate-100').forEach(el => {
      el.classList.remove('bg-slate-100');
      el.classList.add('bg-slate-900');
    });
    document.querySelectorAll('.bg-slate-200').forEach(el => {
      el.classList.remove('bg-slate-200');
      el.classList.add('bg-slate-800');
    });
    document.querySelectorAll('.border-slate-300').forEach(el => {
      el.classList.remove('border-slate-300');
      el.classList.add('border-slate-800');
    });
    
    // Update button icon to moon
    updateThemeIcon(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }
}

/**
 * Update the theme toggle button icon
 * @param {boolean} isDark - Whether to show moon (dark) or sun (light) icon
 */
function updateThemeIcon(isDark) {
  const darkModeBtn = document.getElementById('btn-dark-mode');
  if (!darkModeBtn) return;
  
  if (isDark) {
    darkModeBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
    </svg>`;
  } else {
    darkModeBtn.innerHTML = `<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
    </svg>`;
  }
}

/**
 * Initialize theme based on saved preference
 * Default is dark mode; only switch to light if explicitly saved
 */
export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  
  // Default is dark mode (as designed), so only switch to light if explicitly set
  if (savedTheme === 'light') {
    // Start in dark (default), then toggle to light
    document.documentElement.classList.add('dark');
    toggleDarkMode();
  }
}

/**
 * Get current theme
 * @returns {'dark' | 'light'} Current theme
 */
export function getCurrentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Check if dark mode is active
 * @returns {boolean} True if dark mode is active
 */
export function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}


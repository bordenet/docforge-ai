/**
 * Theme Management Module
 * Handles dark/light mode toggling with persistence
 * @module theme
 */

const THEME_STORAGE_KEY = 'docforge-theme';

/**
 * Toggle between dark and light mode.
 * Updates DOM classes and persists preference. Icon visibility is
 * handled by CSS (dark: variants on SVG elements in HTML).
 * Updates aria-pressed on any element with that attribute to reflect current state.
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

    // Update header - background AND text colors
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-600', 'border-slate-500');
      header.classList.add('bg-slate-200', 'border-slate-300');
    }

    // Update panel backgrounds
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
    document.querySelectorAll('.border-slate-700').forEach(el => {
      el.classList.remove('border-slate-700');
      el.classList.add('border-slate-400');
    });

    // Update TEXT colors for light mode contrast
    // Skip elements with !text-white (Tailwind important modifier) - they should stay white
    document.querySelectorAll('.text-white').forEach(el => {
      if (el.classList.contains('!text-white')) return;
      el.classList.remove('text-white');
      el.classList.add('text-slate-900');
    });
    document.querySelectorAll('.text-slate-100').forEach(el => {
      el.classList.remove('text-slate-100');
      el.classList.add('text-slate-800');
    });
    document.querySelectorAll('.text-slate-300').forEach(el => {
      // Skip elements using dark: variant (they handle their own theming)
      if (el.classList.contains('dark:text-slate-300')) return;
      el.classList.remove('text-slate-300');
      el.classList.add('text-slate-600');
    });
    document.querySelectorAll('.text-slate-400').forEach(el => {
      el.classList.remove('text-slate-400');
      el.classList.add('text-slate-500');
    });

    // Update placeholder colors
    document.querySelectorAll('.placeholder-slate-500').forEach(el => {
      el.classList.remove('placeholder-slate-500');
      el.classList.add('placeholder-slate-400');
    });

    // Update hover states
    document.querySelectorAll('.hover\\:bg-slate-500').forEach(el => {
      el.classList.remove('hover:bg-slate-500');
      el.classList.add('hover:bg-slate-300');
    });
    document.querySelectorAll('.hover\\:bg-slate-700').forEach(el => {
      el.classList.remove('hover:bg-slate-700');
      el.classList.add('hover:bg-slate-300');
    });

    // Icon switching is handled by CSS (dark: variants in HTML)
    document.querySelectorAll('[aria-pressed]').forEach(el => el.setAttribute('aria-pressed', 'false'));
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
  } else {
    // Switch to dark mode
    html.classList.add('dark');
    body.classList.remove('bg-white', 'text-slate-900');
    body.classList.add('bg-slate-950', 'text-slate-100');

    // Update header - background AND text colors
    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('bg-slate-200', 'border-slate-300');
      header.classList.add('bg-slate-600', 'border-slate-500');
    }

    // Update panel backgrounds
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
    document.querySelectorAll('.border-slate-400').forEach(el => {
      el.classList.remove('border-slate-400');
      el.classList.add('border-slate-700');
    });

    // Update TEXT colors for dark mode contrast
    document.querySelectorAll('.text-slate-900').forEach(el => {
      // Skip the body element as it's handled separately
      if (el !== body) {
        el.classList.remove('text-slate-900');
        el.classList.add('text-white');
      }
    });
    document.querySelectorAll('.text-slate-800').forEach(el => {
      el.classList.remove('text-slate-800');
      el.classList.add('text-slate-100');
    });
    document.querySelectorAll('.text-slate-600').forEach(el => {
      // Skip elements using dark: variant (they handle their own theming)
      if (el.classList.contains('dark:text-slate-300')) return;
      el.classList.remove('text-slate-600');
      el.classList.add('text-slate-300');
    });
    document.querySelectorAll('.text-slate-500').forEach(el => {
      el.classList.remove('text-slate-500');
      el.classList.add('text-slate-400');
    });

    // Update placeholder colors
    document.querySelectorAll('.placeholder-slate-400').forEach(el => {
      el.classList.remove('placeholder-slate-400');
      el.classList.add('placeholder-slate-500');
    });

    // Update hover states
    document.querySelectorAll('.hover\\:bg-slate-300').forEach(el => {
      el.classList.remove('hover:bg-slate-300');
      el.classList.add('hover:bg-slate-500');
    });

    // Icon switching is handled by CSS (dark: variants in HTML)
    document.querySelectorAll('[aria-pressed]').forEach(el => el.setAttribute('aria-pressed', 'true'));
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  }
}

// Note: Icon switching is now handled by CSS using dark: variants in HTML
// Both sun and moon icons are in the HTML, visibility toggled via Tailwind classes

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


/**
 * Theme Module Tests
 * Tests for dark/light mode toggling, persistence, and DOM class mutations
 * Addresses: Bug 1 (Dark Mode Toggle Non-Functional)
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { toggleDarkMode, initTheme, getCurrentTheme, isDarkMode } from '../shared/js/theme.js';

describe('Theme Module', () => {
  beforeEach(() => {
    // Set up DOM structure matching validator/index.html
    document.documentElement.className = 'dark';
    document.body.innerHTML = `
      <header class="bg-slate-600 border-slate-500">
        <button id="btn-dark-mode">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
          </svg>
        </button>
      </header>
      <div class="bg-slate-900 border-slate-800">Panel 1</div>
      <div class="bg-slate-800">Panel 2</div>
    `;
    document.body.className = 'bg-slate-950 text-slate-100';
    
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('toggleDarkMode', () => {
    test('should toggle from dark to light mode', () => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      toggleDarkMode();
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('should toggle from light to dark mode', () => {
      // Start in light mode
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-slate-900';
      
      toggleDarkMode();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('should update body classes when switching to light', () => {
      toggleDarkMode();
      
      expect(document.body.classList.contains('bg-white')).toBe(true);
      expect(document.body.classList.contains('text-slate-900')).toBe(true);
      expect(document.body.classList.contains('bg-slate-950')).toBe(false);
    });

    test('should update body classes when switching to dark', () => {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-slate-900';
      
      toggleDarkMode();
      
      expect(document.body.classList.contains('bg-slate-950')).toBe(true);
      expect(document.body.classList.contains('text-slate-100')).toBe(true);
    });

    test('should save theme to localStorage when toggling to light', () => {
      toggleDarkMode();
      
      expect(localStorage.getItem('docforge-theme')).toBe('light');
    });

    test('should save theme to localStorage when toggling to dark', () => {
      document.documentElement.classList.remove('dark');
      
      toggleDarkMode();
      
      expect(localStorage.getItem('docforge-theme')).toBe('dark');
    });

    test('should update button icon to sun when switching to light', () => {
      toggleDarkMode();
      
      const btn = document.getElementById('btn-dark-mode');
      // Sun icon has the evenodd fill-rule
      expect(btn.innerHTML).toContain('fill-rule="evenodd"');
    });

    test('should update button icon to moon when switching to dark', () => {
      document.documentElement.classList.remove('dark');
      
      toggleDarkMode();
      
      const btn = document.getElementById('btn-dark-mode');
      // Moon icon does NOT have fill-rule
      expect(btn.innerHTML).not.toContain('fill-rule="evenodd"');
      expect(btn.innerHTML).toContain('M17.293 13.293');
    });
  });

  describe('initTheme', () => {
    test('should keep dark mode when no saved preference', () => {
      initTheme();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    test('should switch to light when localStorage has light preference', () => {
      localStorage.setItem('docforge-theme', 'light');
      
      initTheme();
      
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    test('should keep dark when localStorage has dark preference', () => {
      localStorage.setItem('docforge-theme', 'dark');
      
      initTheme();
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('DOM class mutations', () => {
    test('should update header classes when switching to light', () => {
      toggleDarkMode();
      
      const header = document.querySelector('header');
      expect(header.classList.contains('bg-slate-200')).toBe(true);
      expect(header.classList.contains('border-slate-300')).toBe(true);
      expect(header.classList.contains('bg-slate-600')).toBe(false);
    });

    test('should update panel bg-slate-900 to bg-slate-100 in light mode', () => {
      toggleDarkMode();
      
      const panel = document.querySelector('div');
      expect(panel.classList.contains('bg-slate-100')).toBe(true);
      expect(panel.classList.contains('bg-slate-900')).toBe(false);
    });

    test('should update panel bg-slate-800 to bg-slate-200 in light mode', () => {
      toggleDarkMode();
      
      const panels = document.querySelectorAll('div');
      const panel2 = panels[1];
      expect(panel2.classList.contains('bg-slate-200')).toBe(true);
    });

    test('should update border classes when switching to light', () => {
      toggleDarkMode();

      const panel = document.querySelector('.border-slate-300');
      expect(panel).toBeTruthy();
    });
  });

  describe('Text color contrast (Bug fix: light mode readability)', () => {
    beforeEach(() => {
      // Add elements with text colors that need swapping
      document.body.innerHTML = `
        <html class="dark">
          <body class="bg-slate-950 text-slate-100">
            <header class="bg-slate-600 border-slate-500">
              <h1 class="text-white">Title</h1>
              <span class="text-slate-300">Subtitle</span>
            </header>
            <div class="bg-slate-900 border-slate-800">
              <label class="text-white">Label</label>
              <p class="text-slate-300">Help text</p>
              <span class="text-slate-400">Secondary</span>
            </div>
          </body>
        </html>
      `;
      document.documentElement.classList.add('dark');
    });

    test('should swap text-white to text-slate-900 in light mode', () => {
      toggleDarkMode();

      const h1 = document.querySelector('h1');
      expect(h1.classList.contains('text-slate-900')).toBe(true);
      expect(h1.classList.contains('text-white')).toBe(false);
    });

    test('should swap text-slate-300 to text-slate-600 in light mode', () => {
      toggleDarkMode();

      const span = document.querySelector('span');
      expect(span.classList.contains('text-slate-600')).toBe(true);
      expect(span.classList.contains('text-slate-300')).toBe(false);
    });

    test('should swap text-slate-400 to text-slate-500 in light mode', () => {
      toggleDarkMode();

      const secondary = document.querySelectorAll('span')[1];
      expect(secondary.classList.contains('text-slate-500')).toBe(true);
      expect(secondary.classList.contains('text-slate-400')).toBe(false);
    });

    test('should restore text-white when switching back to dark mode', () => {
      toggleDarkMode(); // to light
      toggleDarkMode(); // back to dark

      const h1 = document.querySelector('h1');
      expect(h1.classList.contains('text-white')).toBe(true);
      expect(h1.classList.contains('text-slate-900')).toBe(false);
    });

    test('should restore text-slate-300 when switching back to dark mode', () => {
      toggleDarkMode(); // to light
      toggleDarkMode(); // back to dark

      const span = document.querySelector('span');
      expect(span.classList.contains('text-slate-300')).toBe(true);
      expect(span.classList.contains('text-slate-600')).toBe(false);
    });
  });

  describe('getCurrentTheme', () => {
    test('should return dark when dark mode is active', () => {
      expect(getCurrentTheme()).toBe('dark');
    });

    test('should return light when dark mode is inactive', () => {
      document.documentElement.classList.remove('dark');
      expect(getCurrentTheme()).toBe('light');
    });
  });

  describe('isDarkMode', () => {
    test('should return true when dark mode is active', () => {
      expect(isDarkMode()).toBe(true);
    });

    test('should return false when light mode is active', () => {
      document.documentElement.classList.remove('dark');
      expect(isDarkMode()).toBe(false);
    });
  });
});


/**
 * Opportunity Finder — Dark Mode System
 * Loaded by every page via <script src="js/theme.js">
 * Must be in <head> (before render) to avoid flash of wrong theme
 */

(function() {
  // Apply theme immediately to avoid FOUC
  var saved = localStorage.getItem('of_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
})();

// Full API available after DOM is ready
const Theme = {
  get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('of_theme', theme);
    this._updateButtons();
    this._updateMeta();
  },

  toggle() {
    this.set(this.get() === 'dark' ? 'light' : 'dark');
  },

  isDark() {
    return this.get() === 'dark';
  },

  _updateButtons() {
    const isDark = this.isDark();
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-label', isDark ? 'Passer en mode clair' : 'Passer en mode sombre');
      btn.setAttribute('title',      isDark ? 'Mode clair' : 'Mode sombre');
      const icon = btn.querySelector('.theme-icon');
      if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    });
  },

  _updateMeta() {
    // Update browser theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', this.isDark() ? '#0f172a' : '#ffffff');
  },

  init() {
    // Sync buttons state on page load
    this._updateButtons();
    this._updateMeta();

    // Respect OS preference on first visit (no stored preference)
    if (!localStorage.getItem('of_theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) this.set('dark');
    }

    // Watch OS preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only auto-follow if user hasn't manually set a preference
      if (!localStorage.getItem('of_theme')) {
        this.set(e.matches ? 'dark' : 'light');
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Theme.init();

  // Bind all toggle buttons
  document.addEventListener('click', e => {
    if (e.target.closest('[data-theme-toggle]')) {
      Theme.toggle();
    }
  });
});

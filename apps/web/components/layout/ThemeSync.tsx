'use client';

import { useEffect } from 'react';
import { THEME_STORAGE_KEY } from './ThemeScript';

/**
 * Re-applies the stored / system theme after React mounts. Normally a no-op (ThemeScript already set
 * `.dark` before first paint), but an on-demand 404 is served as Next's `__next_error__` shell and the
 * client then renders <html> from the layout, which drops the class the head script had set.
 * Mounted once in the locale layout.
 */
export default function ThemeSync() {
  useEffect(() => {
    try {
      const root = document.documentElement;
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (root.classList.contains('dark') !== dark) {
        root.classList.toggle('dark', dark);
        root.style.colorScheme = dark ? 'dark' : 'light';
        window.dispatchEvent(new Event('cahan-theme-change')); // ThemeToggle's aria-pressed store
      }
    } catch {
      /* storage blocked: keep what the head script did */
    }
  }, []);
  return null;
}

'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { THEME_STORAGE_KEY } from './ThemeScript';

/**
 * ThemeToggle — light ⇄ dark switch (header, mobile drawer, admin shell).
 * Default = system preference (nothing stored). Clicking stores an explicit 'light' / 'dark' in
 * localStorage (try/catch). `aria-pressed` = dark theme on. Icons swap through CSS (`dark:`), so the
 * server HTML never mismatches; aria-pressed comes from a store with a server snapshot.
 *
 * <ThemeToggle />                 icon button (header)
 * <ThemeToggle withLabel />       icon + small-caps label (mobile drawer)
 */
const EVENT = 'cahan-theme-change';

function isDark() {
  return document.documentElement.classList.contains('dark');
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  window.dispatchEvent(new Event(EVENT));
}

function readStored(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export default function ThemeToggle({ withLabel = false, className }: { withLabel?: boolean; className?: string }) {
  const t = useTranslations('theme');
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  // follow the OS while the visitor has not chosen; sync other tabs
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => {
      const s = readStored();
      if (s !== 'light' && s !== 'dark') apply(mq.matches);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY) return;
      apply(e.newValue === 'dark' || (e.newValue !== 'light' && mq.matches));
    };
    mq.addEventListener('change', onSystem);
    window.addEventListener('storage', onStorage);
    return () => {
      mq.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback(() => {
    const next = !isDark();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      /* storage blocked: the switch still works for this page view */
    }
    apply(next);
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={withLabel ? undefined : t('dark')}
      title={t('toggle')}
      className={cn(
        withLabel ? 'btn btn-outline btn-sm' : 'btn btn-ghost btn-icon btn-sm',
        'text-accent-text',
        className
      )}
    >
      <Moon size={17} strokeWidth={1.6} aria-hidden="true" className="dark:hidden" />
      <Sun size={17} strokeWidth={1.6} aria-hidden="true" className="hidden dark:block" />
      {withLabel && <span>{t('dark')}</span>}
    </button>
  );
}

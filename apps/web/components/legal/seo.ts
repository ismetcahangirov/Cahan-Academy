import type { Metadata } from 'next';
import { LOCALES, localizedPath } from '@/lib/utils';

/**
 * canonical + hreflang alternates for a localized page (paths follow next-intl `as-needed`).
 * pageAlternates('en', '/about') → { canonical: '/en/about', languages: { az: '/about', en: …, ru: …, x-default } }
 */
export function pageAlternates(locale: string, path: string): Metadata['alternates'] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizedPath(l, path)])),
      'x-default': localizedPath('az', path),
    },
  };
}

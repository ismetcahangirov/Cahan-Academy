import type { Metadata } from 'next';
import { LOCALES, localizedPath } from '@/lib/utils';

/**
 * The one canonical + hreflang helper for every page (relative to metadataBase = SITE_URL, so they resolve to the
 * canonical origin). With localePrefix 'as-needed' the az page has no prefix.
 * alternatesFor('en', '/courses') → { canonical: '/en/courses', languages: { az: '/courses', en: …, ru: …, 'x-default': '/courses' } }
 */
export function alternatesFor(locale: string, path: string): Metadata['alternates'] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localizedPath(l, path)])),
      'x-default': localizedPath('az', path),
    },
  };
}

/** First sentence-ish slice of a description for <meta name="description"> (≤ 160 chars). */
export function metaDescription(text?: string | null, max = 160): string | undefined {
  const clean = text?.replace(/\s+/g, ' ').trim();
  if (!clean) return undefined;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).trim()}…`;
}

/**
 * The site OG card (app/[locale]/opengraph-image.tsx) for pages without their own image. A page that sets
 * `openGraph` replaces the parent's object (shallow merge), so the file-based image is lost unless the
 * page lists it: `openGraph: { title, description, type: 'website', locale, images: ogImages(locale) }`.
 * The URL keeps the locale prefix (also /az/): middleware skips opengraph-image, so it answers 200 directly.
 */
export const ogImages = (locale: string) => [
  { url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt: 'Cahan Academy' },
];

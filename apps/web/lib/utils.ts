import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale: string = 'az'): string {
  return new Intl.DateTimeFormat(locale, {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

/**
 * Canonical origin of the public site (no trailing slash). Used for canonical/hreflang URLs,
 * robots.txt, sitemap.xml, JSON-LD and OG images. `cahanacademy.az` (the old hard-coded fallback)
 * does not resolve, so it must never be the default. Set NEXT_PUBLIC_SITE_URL once a custom
 * domain is live; until then Vercel's production URL is used.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://cahan-academy.vercel.app')
).replace(/\/+$/, '');

export const LOCALES = ['az', 'en', 'ru'] as const;
export const DEFAULT_LOCALE = 'az';

/**
 * Public path for a locale with next-intl `localePrefix: 'as-needed'`: the default locale has no
 * prefix (`/az/...` 307-redirects to `/...`), the others do. `path` starts with "/" or is "".
 */
export function localizedPath(locale: string, path = ''): string {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${prefix}${path}` || '/';
}

/** Absolute URL of a localized page on the canonical origin. */
export function absoluteUrl(locale: string, path = ''): string {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

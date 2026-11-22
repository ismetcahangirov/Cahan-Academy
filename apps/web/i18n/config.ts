import { defineRouting } from 'next-intl/routing';

// Locale config only (no navigation helpers), so the edge middleware stays small.
export const routing = defineRouting({
  locales:       ['az', 'en', 'ru'],
  defaultLocale: 'az',
  localePrefix:  'as-needed',
});

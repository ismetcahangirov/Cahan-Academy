import { notFound } from 'next/navigation';

/**
 * Catch-all for unknown paths under a locale (`/en/xyz`, `/nope`): renders the branded, localized
 * `[locale]/not-found.tsx` instead of Next's unstyled root 404.
 */
export default function CatchAllNotFound() {
  notFound();
}

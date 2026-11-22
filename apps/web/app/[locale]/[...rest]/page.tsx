import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const TITLE: Record<string, string> = {
  az: 'Səhifə tapılmadı — Cahan Academy',
  en: 'Page not found — Cahan Academy',
  ru: 'Страница не найдена — Cahan Academy',
};

/** The branded 404 needs a localized <title> (the not-found boundary itself gets no params). */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: TITLE[locale] ?? TITLE.az, robots: { index: false, follow: true } };
}

/**
 * Catch-all for unknown paths under a locale (`/en/xyz`, `/nope`): renders the branded, localized
 * `[locale]/not-found.tsx` instead of Next's unstyled root 404.
 */
export default function CatchAllNotFound() {
  notFound();
}

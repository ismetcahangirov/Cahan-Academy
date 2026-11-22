'use client';

import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandLockup } from '@/components/brand';
import { LaceCorner, OrnateFrame, ScriptTitle, SketchIllustration } from '@/components/ornament';
import { buttonClass } from '@/components/ui/Button';

// Shown for notFound() calls inside /[locale] (unknown course/teacher/blog slug).
// Client component on purpose: a server not-found that calls getLocale() reads headers() and, because
// Next renders the boundary with every page of the segment, turned every route dynamic.
// Copy is inline so it does not depend on message keys (works even if message loading failed).
const COPY = {
  az: { title: 'Səhifə tapılmadı', body: 'Axtardığınız səhifə mövcud deyil və ya köçürülüb.', home: 'Ana səhifə' },
  en: { title: 'Page not found', body: 'The page you are looking for does not exist or has moved.', home: 'Home' },
  ru: { title: 'Страница не найдена', body: 'Страница не существует или была перемещена.', home: 'На главную' },
} as const;

export default function LocaleNotFound() {
  const locale = useLocale();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.az;

  return (
    <main className="paper relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <LaceCorner corner="tl" className="absolute left-0 top-0 w-24 sm:w-36" />
      <LaceCorner corner="br" className="absolute bottom-0 right-0 w-24 sm:w-36" />
      <Link href="/" aria-label={t.home} className="mb-8 text-accent-text">
        <BrandLockup title="" className="h-10 w-auto" />
      </Link>
      <OrnateFrame className="w-full max-w-lg px-6 pb-10 pt-10 text-center sm:px-10">
        <SketchIllustration name="globe" className="mx-auto w-24" />
        <p className="num mt-4 text-[1rem] text-ink-muted" aria-hidden="true">
          404
        </p>
        <ScriptTitle align="center" size="section" as="h1" title={t.title} lead={t.body} className="mt-1" />
        <Link href="/" className={buttonClass({ className: 'mt-8' })}>
          {t.home}
        </Link>
      </OrnateFrame>
    </main>
  );
}

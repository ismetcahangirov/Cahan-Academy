import type { ReactNode } from 'react';
import { BrandLockup } from '@/components/brand';
import { EdelweissCorner, OrnateFrame, ScriptTitle, SketchIllustration } from '@/components/ornament';
import { buttonClass } from '@/components/ui/Button';

// Shown for notFound() inside /[locale] (unknown path or course/teacher/blog slug).
// A not-found boundary gets no params, and Next renders it with EVERY page of the segment: reading the
// locale on the server (getLocale → headers()) made all routes dynamic, and a client component would ship
// its JS with every page. So the copy is rendered in all three languages and `<html lang>` (set by the
// locale layout) shows one of them through CSS (`.i18n-*` in globals.css): static, no JS.
// Copy is inline so it does not depend on message keys (works even if message loading failed).
const COPY = {
  az: { title: 'Səhifə tapılmadı', body: 'Axtardığınız səhifə mövcud deyil və ya köçürülüb.', home: 'Ana səhifə', href: '/' },
  en: { title: 'Page not found', body: 'The page you are looking for does not exist or has moved.', home: 'Home', href: '/en' },
  ru: { title: 'Страница не найдена', body: 'Страница не существует или была перемещена.', home: 'На главную', href: '/ru' },
} as const;
const LOCALES = ['az', 'en', 'ru'] as const;

/** One element per locale; only the one matching <html lang> is displayed. */
function PerLocale({ render }: { render: (l: (typeof LOCALES)[number]) => ReactNode }) {
  return (
    <>
      {LOCALES.map((l) => (
        <span key={l} lang={l} className={`i18n-${l}`}>
          {render(l)}
        </span>
      ))}
    </>
  );
}

export default function LocaleNotFound() {
  return (
    <main className="paper relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <EdelweissCorner corner="tl" priority className="absolute left-0 top-0 w-24 sm:w-32" />
      <EdelweissCorner corner="br" priority delay={260} className="absolute bottom-0 right-0 w-24 sm:w-32" />
      <PerLocale
        render={(l) => (
          <a href={COPY[l].href} aria-label={`Cahan Academy — ${COPY[l].home}`} className="mb-8 block text-accent-text">
            <BrandLockup title="" className="h-10 w-auto" />
          </a>
        )}
      />
      <OrnateFrame className="w-full max-w-lg px-6 pb-10 pt-10 text-center sm:px-10">
        <SketchIllustration name="globe" className="mx-auto w-24" />
        <p className="num mt-4 text-[1rem] text-ink-muted" aria-hidden="true">
          404
        </p>
        <ScriptTitle
          align="center"
          size="section"
          as="h1"
          title={<PerLocale render={(l) => COPY[l].title} />}
          lead={<PerLocale render={(l) => COPY[l].body} />}
          className="mt-1"
        />
        <PerLocale
          render={(l) => (
            <a href={COPY[l].href} className={buttonClass({ className: 'mt-8' })}>
              {COPY[l].home}
            </a>
          )}
        />
      </OrnateFrame>
    </main>
  );
}

import { Fragment, type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import PageBand from '@/components/layout/PageBand';
import { EdelweissGlyph, OrnamentDivider } from '@/components/ornament';
import { Button } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/utils';
import { getContactSettings } from '@/lib/site';

/**
 * LegalDocument — the parchment long-text recipe for /privacy-policy and /terms: wine head band with the
 * "last updated" date → table of contents (sticky column on desktop, a <details> disclosure on phones)
 * → numbered sections on a parchment panel, ornament dividers between them → link to the sibling page.
 * Sections come from messages (`legal.privacy_sections` / `legal.terms_sections`, az/en/ru); `{email}` in a body is
 * the contact e-mail from the admin panel (Site details). JSON-LD
 * uses absoluteUrl() (A-27).
 */
const DOCS = {
  privacy: {
    path: '/privacy-policy',
    title: 'privacy_policy_title',
    lead: 'privacy_lead',
    sections: 'privacy_sections',
    other: { path: '/terms', title: 'terms_of_use_title' },
  },
  terms: {
    path: '/terms',
    title: 'terms_of_use_title',
    lead: 'terms_lead',
    sections: 'terms_sections',
    other: { path: '/privacy-policy', title: 'privacy_policy_title' },
  },
} as const;

/** Date the current texts were last changed (the existing copy says 13 May 2024). */
const LAST_UPDATED = '2024-05-13';
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const EMAIL_RX = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Plain text with e-mail addresses turned into mailto links. */
function withLinks(text: string): ReactNode {
  return text.split(EMAIL_RX).map((part, i) =>
    i % 2 === 1 ? (
      <a key={i} href={`mailto:${part}`} className="link break-words">
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

function TocList({ sections, idPrefix }: { sections: { title: string }[]; idPrefix: string }) {
  return (
    <ol className="mt-3 space-y-1">
      {sections.map((s, i) => (
        <li key={i}>
          <a
            href={`#${idPrefix}-${i + 1}`}
            className="group flex items-baseline gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 text-[1.02rem] leading-snug text-ink hover:bg-surface-2 hover:text-accent-text"
          >
            <span className="time-italic w-7 shrink-0 text-right text-ink-muted">{ROMAN[i] ?? i + 1}</span>
            <span>{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default async function LegalDocument({ kind, locale }: { kind: keyof typeof DOCS; locale: string }) {
  const [t, contact] = await Promise.all([getTranslations({ locale, namespace: 'legal' }), getContactSettings()]);
  const doc = DOCS[kind];
  const sections = t.raw(doc.sections) as { title: string; body: string }[];
  const title = t(doc.title);
  const updated = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${LAST_UPDATED}T12:00:00Z`)
  );
  const idPrefix = kind === 'privacy' ? 'privacy' : 'terms';

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description: t(doc.lead),
          url: absoluteUrl(locale, doc.path),
          inLanguage: locale,
          dateModified: LAST_UPDATED,
        }}
      />

      <PageBand id="legal-title" trail={{ locale, items: [{ name: title, path: doc.path }] }} eyebrow={t('eyebrow')} title={title} lead={t(doc.lead)} waveFill="var(--paper-light)">
        <p className="time-italic mt-5 text-center text-[1.02rem] text-ink-muted">
          {t('last_updated')}: <time dateTime={LAST_UPDATED}>{updated}</time>
        </p>
      </PageBand>

      {/* page body: a white section between the wine head band and the wine footer (dark / light alternate) */}
      <div data-footer-light className="theme-light paper">
        <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10 lg:px-8">
          {/* contents: disclosure on phones/tablets, sticky column on desktop */}
          <details className="card-paper group px-4 py-3 lg:hidden">
            <summary className="sc flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-[0.9rem] text-ink [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <EdelweissGlyph className="h-4 w-4" />
                {t('toc')}
              </span>
              <ChevronDown size={18} strokeWidth={1.6} className="text-accent-text transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <nav aria-label={t('toc')} className="pb-2">
              <TocList sections={sections} idPrefix={idPrefix} />
            </nav>
          </details>
          <nav aria-label={t('toc')} className="card-paper sticky top-24 hidden px-4 py-5 lg:block">
            <p className="sc inline-flex items-center gap-2 px-2 text-[0.9rem] text-ink">
              <EdelweissGlyph className="h-4 w-4" />
              {t('toc')}
            </p>
            <TocList sections={sections} idPrefix={idPrefix} />
          </nav>

          <div className="card-paper px-5 py-9 sm:px-12 sm:py-12">
            {sections.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && <OrnamentDivider className="my-9" />}
                <section id={`${idPrefix}-${i + 1}`} aria-labelledby={`${idPrefix}-${i + 1}-title`} className="scroll-mt-28">
                  <h2 id={`${idPrefix}-${i + 1}-title`} className="flex items-baseline gap-3 text-[1.45rem] font-semibold leading-snug text-ink sm:text-[1.6rem]">
                    <span className="time-italic shrink-0 text-[1.15rem] font-normal text-ink-muted">{ROMAN[i] ?? i + 1}.</span>
                    {s.title}
                  </h2>
                  <p className="mt-3 max-w-[42rem] text-[1.12rem] leading-[1.75] text-ink">{withLinks(s.body.replaceAll('{email}', contact.email))}</p>
                </section>
              </Fragment>
            ))}

            <div className="mt-12 flex flex-col items-start gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="sc text-[0.82rem] text-ink-muted">{t('see_also')}</p>
              <Button as={Link} href={doc.other.path} variant="outline" iconAfter={ArrowRight}>
                {t(doc.other.title)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

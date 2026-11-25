import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getFaqs, type Faq } from '@/lib/api';
import FAQAccordion from '@/components/ui/FAQAccordion';
import { Button } from '@/components/ui';
import PageBand from '@/components/layout/PageBand';
import { alternatesFor, ogImages } from '@/lib/seo';
import { OrnateFrame, ScriptTitle, SketchIllustration } from '@/components/ornament';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 3600; // ISR - every hour

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: alternatesFor(locale, '/faq'),
    openGraph: { title: t('meta_title'), description: t('meta_description'), type: 'website', locale, images: ogImages(locale) },
  };
}

type FaqItem = Pick<Faq, 'id' | 'question' | 'answer'>;

/*
 * Questions come from GET /api/faqs (managed in the CMS). `getFaqs` returns [] when the API fails (it
 * 500s in production at times) — then a short built-in list answers how the site itself works (enrol,
 * prices, teachers, contact), so the page is never empty and nothing about the academy is invented.
 */
export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });

  const fromApi = (await getFaqs()).filter((f) => f?.question && f?.answer);
  const items: FaqItem[] = fromApi.length
    ? fromApi
    : (t.raw('fallback') as { q: string; a: string }[]).map((f, i) => ({
        id: `fallback-${i + 1}`,
        question: { [locale]: f.q },
        answer: { [locale]: f.a },
      }));

  const pick = (rec: Record<string, string>) => rec[locale] || rec.az || Object.values(rec)[0] || '';

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: locale,
          mainEntity: items.map((f) => ({
            '@type': 'Question',
            name: pick(f.question),
            acceptedAnswer: { '@type': 'Answer', text: pick(f.answer) },
          })),
        }}
      />

      <PageBand id="faq-title" trail={{ locale, items: [{ path: '/faq' }] }} eyebrow={t('badge')} title={t('title')} lead={t('description')} waveFill="var(--paper-light)" />

      {/* page body: a white section between the wine head band and the wine footer (dark / light alternate) */}
      <div data-footer-light className="theme-light paper">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12 lg:px-8">
          <div className="min-w-0">
            <FAQAccordion items={items} locale={locale} headingLevel="h2" />
          </div>

          <OrnateFrame
            as="aside"
            paper
            corners="diagonal"
            cornerSize="h-6 w-6"
            aria-labelledby="faq-still-title"
            className="px-6 pb-8 pt-8 text-center lg:sticky lg:top-24"
          >
            <SketchIllustration name="lamp" className="mx-auto w-24" />
            <ScriptTitle
              id="faq-still-title"
              align="center"
              size="card"
              as="h2"
              title={t('still_title')}
              lead={t('still_desc')}
              className="mt-3"
            />
            <Button as={Link} href="/contact" iconAfter={ArrowRight} className="mt-6" block>
              {t('still_cta')}
            </Button>
          </OrnateFrame>
        </div>
      </div>
    </>
  );
}

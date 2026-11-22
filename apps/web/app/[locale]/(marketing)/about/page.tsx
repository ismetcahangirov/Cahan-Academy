import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageBand from '@/components/layout/PageBand';
import { alternatesFor, ogImages } from '@/lib/seo';
import HistorySection from '@/components/sections/about/HistorySection';
import MissionSection from '@/components/sections/about/MissionSection';
import ValuesSection from '@/components/sections/about/ValuesSection';
import TeamSection from '@/components/sections/about/TeamSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_URL, absoluteUrl } from '@/lib/utils';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: team list, 1 d). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 86400;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('about_title'),
    description: t('about_description'),
    alternates: alternatesFor(locale, '/about'),
    openGraph: {
      title: t('about_title'),
      description: t('about_description'),
      type: 'website',
      locale,
      images: ogImages(locale),
    },
  };
}

/*
 * About: wine head band (lace, seal on the join) → history timeline → parchment band with mission /
 * vision + stats → values → team portraits (API, graceful when it fails) → wine testimonials → closing CTA.
 */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: t('badge'),
          url: absoluteUrl(locale, '/about'),
          inLanguage: locale,
          description: t('hero_subtitle'),
          about: {
            '@type': 'EducationalOrganization',
            name: 'Cahan Academy',
            url: absoluteUrl(locale),
            logo: `${SITE_URL}/icon-512.png`,
          },
        }}
      />

      <PageBand id="about-title" trail={{ locale, items: [{ path: '/about' }] }} seal eyebrow={t('badge')} title={t('hero_title')} lead={t('hero_subtitle')} />
      <HistorySection />
      <MissionSection>
        <StatsSection bare />
      </MissionSection>
      <ValuesSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

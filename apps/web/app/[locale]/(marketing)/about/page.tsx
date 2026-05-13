import { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import HistorySection from '@/components/sections/about/HistorySection';
import MissionSection from '@/components/sections/about/MissionSection';
import ValuesSection from '@/components/sections/about/ValuesSection';
import TeamSection from '@/components/sections/about/TeamSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import { motion } from 'framer-motion';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  const locale = await getLocale();

  return {
    title: t('about_title'),
    description: t('about_description'),
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        az: '/az/about',
        en: '/en/about',
        ru: '/ru/about',
      },
    },
    openGraph: {
      title: t('about_title'),
      description: t('about_description'),
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cahan Academy',
    url: 'https://cahan.edu.az',
    logo: 'https://cahan.edu.az/logo.png',
    description: t('hero_subtitle'),
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baku',
      addressCountry: 'AZ',
    },
    sameAs: [
      'https://facebook.com/cahanacademy',
      'https://instagram.com/cahanacademy',
      'https://linkedin.com/company/cahanacademy',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section - Simple & Elegant */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {t('badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero_title')}
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
        </div>
      </section>

      <HistorySection />
      <StatsSection />
      <MissionSection />
      <ValuesSection />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

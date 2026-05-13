import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import HeroSection         from '@/components/sections/HeroSection';
import StatsSection        from '@/components/sections/StatsSection';
import FeaturesSection     from '@/components/sections/FeaturesSection';
import CoursesPreview      from '@/components/sections/CoursesPreview';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection          from '@/components/sections/CTASection';
import JsonLd             from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title:       t('home_title'),
    description: t('home_description'),
    openGraph: {
      title:       t('home_title'),
      description: t('home_description'),
      type:        'website',
      locale,
      images: [{ url: '/og/home-og.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       t('home_title'),
      description: t('home_description'),
      images:      ['/og/home-og.jpg'],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* JSON-LD Organization */}
      <JsonLd
        data={{
          '@context':   'https://schema.org',
          '@type':      'EducationalOrganization',
          name:         'Cahan Academy',
          url:          'https://cahanacademy.az',
          logo:         'https://cahanacademy.az/logo.png',
          description:  'Azərbaycanda peşəkar texnologiya təhsili — proqramlaşdırma, dizayn, marketinq.',
          address: {
            '@type':           'PostalAddress',
            addressLocality:   'Bakı',
            addressCountry:    'AZ',
          },
          contactPoint: {
            '@type':       'ContactPoint',
            telephone:     '+994-50-123-45-67',
            contactType:   'customer service',
          },
          sameAs: [
            'https://facebook.com/cahanacademy',
            'https://instagram.com/cahanacademy',
            'https://linkedin.com/company/cahanacademy',
            'https://youtube.com/@cahanacademy'
          ]
        }}
      />

      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CoursesPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

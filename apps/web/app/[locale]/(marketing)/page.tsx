import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import LearningPath from '@/components/sections/LearningPath';
import CoursesPreview from '@/components/sections/CoursesPreview';
import TeachersPreview from '@/components/sections/TeachersPreview';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import CTASection from '@/components/sections/CTASection';
import JsonLd from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('home_title'),
    description: t('home_description'),
    openGraph: {
      title: t('home_title'),
      description: t('home_description'),
      type: 'website',
      locale,
      images: [{ url: '/og/home-og.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home_title'),
      description: t('home_description'),
      images: ['/og/home-og.jpg'],
    },
  };
}

/*
 * Home = the design showcase (see apps/web/docs/DESIGN.md "Home composition"):
 * wine hero (lace, ribbon, seal) → wave → parchment: stats + strengths → learning-path timeline →
 * parchment courses band (featured card with bookmark) → teachers in arched frames →
 * wine testimonials band → closing invitation → wine footer.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: 'Cahan Academy',
          url: 'https://cahanacademy.az',
          logo: 'https://cahanacademy.az/logo.png',
          description: 'Azərbaycanda peşəkar texnologiya təhsili — proqramlaşdırma, dizayn, marketinq.',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bakı',
            addressCountry: 'AZ',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+994-50-123-45-67',
            contactType: 'customer service',
          },
          sameAs: [
            'https://facebook.com/cahanacademy',
            'https://instagram.com/cahanacademy',
            'https://linkedin.com/company/cahanacademy',
            'https://youtube.com/@cahanacademy',
          ],
        }}
      />

      <HeroSection />
      <FeaturesSection>
        <StatsSection bare />
      </FeaturesSection>
      <LearningPath />
      <CoursesPreview />
      <TeachersPreview />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

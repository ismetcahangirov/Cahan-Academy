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
import { getContactSettings, getTestimonials } from '@/lib/site';
import { alternatesFor, ogImages } from '@/lib/seo';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: courses 1 h, teachers 1 d). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  // OG/Twitter image comes from the file-based app/[locale]/opengraph-image.tsx
  return {
    title: t('home_title'),
    description: t('home_description'),
    alternates: alternatesFor(locale, ''),
    openGraph: {
      title: t('home_title'),
      description: t('home_description'),
      type: 'website',
      locale,
      images: ogImages(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home_title'),
      description: t('home_description'),
    },
  };
}

/*
 * Home = the design showcase (see apps/web/docs/DESIGN.md "Home composition"):
 * wine hero (edelweiss corners) → wave → parchment: stats + strengths → learning-path timeline →
 * parchment courses band (featured card with bookmark) → teachers in arched frames →
 * wine testimonials band → white closing invitation (the letter) → wine footer. Dark and light sections alternate.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [contact, testimonials] = await Promise.all([getContactSettings(), getTestimonials()]);

  return (
    <>
      <HeroSection />
      <FeaturesSection>
        <StatsSection bare />
      </FeaturesSection>
      <LearningPath />
      <CoursesPreview />
      <TeachersPreview />
      <TestimonialsSection items={testimonials} bottomFill="var(--paper-light)" />
      <CTASection contact={contact} />
    </>
  );
}

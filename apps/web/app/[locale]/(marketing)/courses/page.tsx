import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { apiFetch, getCourses } from '@/lib/api';
import { absoluteUrl } from '@/lib/utils';
import type { Course } from '@/types/course';
import JsonLd from '@/components/seo/JsonLd';
import PageBand from '@/components/layout/PageBand';
import { alternatesFor, ogImages } from '@/lib/seo';
import CoursesClientPage, { type Category } from './CoursesClientPage';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: courses + categories, 1 h). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('courses_title'),
    description: t('courses_description'),
    alternates: alternatesFor(locale, '/courses'),
    openGraph: { title: t('courses_title'), description: t('courses_description'), type: 'website', locale, images: ogImages(locale) },
  };
}

const getCategories = () =>
  apiFetch<{ data: Category[] }>('/courses/categories', { tags: ['categories'], revalidate: 3600 })
    .then((res) => (Array.isArray(res.data) ? res.data : []))
    .catch(() => [] as Category[]);

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tp] = await Promise.all([
    getTranslations({ locale, namespace: 'courses' }),
    getTranslations({ locale, namespace: 'coursesPage' }),
  ]);

  // getCourses() resolves to [] when the API is down: the client shows a calm "coming soon" state
  const [courses, categories] = await Promise.all([getCourses(locale), getCategories()]);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t('page_title'),
          url: absoluteUrl(locale, '/courses'),
          itemListElement: courses.slice(0, 50).map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(locale, `/courses/${c.slug}`),
            name: c.title,
          })),
        }}
      />
      <PageBand
        id="courses-title"
        trail={{ locale, items: [{ path: '/courses' }] }}
        eyebrow={tp('eyebrow')}
        title={t('page_title')}
        lead={t('page_subtitle')}
        waveFill="var(--paper-light)"
      />
      {/* page body: a white section between the wine head band and the wine footer (dark / light alternate) */}
      <div data-footer-light className="theme-light paper">
        <CoursesClientPage initialCourses={courses as Course[]} initialCategories={categories} locale={locale} />
      </div>
    </>
  );
}

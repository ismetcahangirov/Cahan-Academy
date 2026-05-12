import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CoursesClientPage from './CoursesClientPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title:       t('courses_title'),
    description: t('courses_description'),
  };
}

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params;

  // Server-side data fetch
  let courses = [];
  let categories = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const [coursesRes, catsRes] = await Promise.all([
      fetch(`${apiUrl}/courses?locale=${locale}`, { next: { revalidate: 60 } }),
      fetch(`${apiUrl}/courses/categories`,         { next: { revalidate: 300 } }),
    ]);
    if (coursesRes.ok)   courses    = (await coursesRes.json()).data   ?? [];
    if (catsRes.ok)      categories = (await catsRes.json()).data      ?? [];
  } catch (_) {
    // API unavailable – render with empty data; client component shows loading state
  }

  return <CoursesClientPage initialCourses={courses} initialCategories={categories} locale={locale} />;
}

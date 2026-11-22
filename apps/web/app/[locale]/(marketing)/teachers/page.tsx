import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getTeachers } from '@/lib/api';
import { absoluteUrl } from '@/lib/utils';
import type { Teacher } from '@/types/teacher';
import JsonLd from '@/components/seo/JsonLd';
import PageBand from '@/components/layout/PageBand';
import { alternatesFor, metaDescription } from '@/lib/seo';
import TeachersClientPage from './TeachersClientPage';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: teachers, 1 d). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, tm] = await Promise.all([
    getTranslations({ locale, namespace: 'teachers' }),
    getTranslations({ locale, namespace: 'meta' }),
  ]);
  const description = metaDescription(t('page_description'));
  return {
    title: tm('teachers_title'),
    description,
    alternates: alternatesFor(locale, '/teachers'),
    openGraph: { title: tm('teachers_title'), description, type: 'website', locale },
  };
}

export default async function TeachersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tp, teachers] = await Promise.all([
    getTranslations({ locale, namespace: 'teachers' }),
    getTranslations({ locale, namespace: 'teachersPage' }),
    getTeachers(locale),
  ]);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: t('page_title'),
          url: absoluteUrl(locale, '/teachers'),
          itemListElement: teachers.slice(0, 50).map((teacher, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: absoluteUrl(locale, `/teachers/${teacher.slug}`),
            name: teacher.name,
          })),
        }}
      />
      <PageBand
        id="teachers-title"
        trail={{ locale, items: [{ path: '/teachers' }] }}
        eyebrow={tp('eyebrow')}
        title={t('page_title')}
        lead={t('page_description')}
      />
      <TeachersClientPage teachers={teachers as Teacher[]} locale={locale} />
    </>
  );
}

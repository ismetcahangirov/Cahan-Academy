import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getTeachers } from '@/lib/api';
import { absoluteUrl } from '@/lib/utils';
import type { Teacher } from '@/types/teacher';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/courses/Breadcrumbs';
import CatalogHead from '@/components/courses/CatalogHead';
import { alternatesFor, metaDescription } from '@/components/courses/seo';
import TeachersClientPage from './TeachersClientPage';

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
  const [t, tp, tcp, tc, teachers] = await Promise.all([
    getTranslations({ locale, namespace: 'teachers' }),
    getTranslations({ locale, namespace: 'teachersPage' }),
    getTranslations({ locale, namespace: 'coursesPage' }),
    getTranslations({ locale, namespace: 'common' }),
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
      <CatalogHead
        breadcrumbs={
          <Breadcrumbs
            locale={locale}
            label={tcp('breadcrumb_label')}
            align="center"
            items={[
              { name: tc('home'), path: '' },
              { name: t('page_title'), path: '/teachers' },
            ]}
          />
        }
        eyebrow={tp('eyebrow')}
        title={t('page_title')}
        lead={t('page_description')}
      />
      <TeachersClientPage teachers={teachers as Teacher[]} locale={locale} />
    </>
  );
}

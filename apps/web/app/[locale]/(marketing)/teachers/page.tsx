import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import TeachersClientPage from './TeachersClientPage';
import { getTeachers } from '@/lib/api';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'teachers' });
  return {
    title: `${t('page_title')} — Cahan Academy`,
    description: t('page_description'),
  };
}

export default async function TeachersPage({ params }: PageProps) {
  const { locale } = await params;
  const teachers = await getTeachers(locale);

  return <TeachersClientPage teachers={teachers as any} locale={locale} />;
}

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import TeachersClientPage from './TeachersClientPage';
import { Teacher } from '@/types/teacher';

interface PageProps {
  params: Promise<{ locale: string }>;
}

async function getTeachers(locale: string): Promise<Teacher[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/teachers?locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
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

  return <TeachersClientPage teachers={teachers} locale={locale} />;
}

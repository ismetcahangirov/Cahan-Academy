import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalDocument from '@/components/legal/LegalDocument';
import { alternatesFor, ogImages } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('terms_title'),
    description: t('terms_description'),
    alternates: alternatesFor(locale, '/terms'),
    openGraph: { title: t('terms_title'), description: t('terms_description'), type: 'website', locale, images: ogImages(locale) },
  };
}

export default async function TermsOfUsePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument kind="terms" locale={locale} />;
}

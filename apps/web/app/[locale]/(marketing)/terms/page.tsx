import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LegalDocument from '@/components/legal/LegalDocument';
import { pageAlternates } from '@/components/legal/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('terms_title'),
    description: t('terms_description'),
    alternates: pageAlternates(locale, '/terms'),
  };
}

export default async function TermsOfUsePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument kind="terms" locale={locale} />;
}

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
    title: t('privacy_title'),
    description: t('privacy_description'),
    alternates: pageAlternates(locale, '/privacy-policy'),
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument kind="privacy" locale={locale} />;
}

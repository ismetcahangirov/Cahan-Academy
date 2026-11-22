import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { AuthProvider } from '@/context/AuthContext';

// The admin area never belongs in a search index.
export const metadata: Metadata = {
  title: 'Cahan Academy Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin root: session provider + the admin message bundle. The `admin` namespace lives in
 * messages/admin/{az,en,ru}.json and is loaded only here (marketing pages never ship it); this nested
 * provider carries just what the admin shell and the shared UI read (admin, common, theme).
 */
export default async function AdminRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = await getMessages();
  const known = ['az', 'en', 'ru'].includes(locale) ? locale : 'az';
  const admin = (await import(`@/messages/admin/${known}.json`)).default;
  const messages = { common: all.common, theme: all.theme, admin };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>{children}</AuthProvider>
    </NextIntlClientProvider>
  );
}

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { SITE_URL } from '@/lib/utils';
import CookieConsent from '@/components/ui/CookieConsent';
import RevealObserver from '@/components/ui/RevealObserver';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  // canonical / hreflang are set per page (lib/utils localizedPath); the layout must not force '/' on every page
  metadataBase: new URL(SITE_URL),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE,
  },
  // same tab icon as the LMS: the transparent mark (SVG first, PNG fallbacks); /favicon.ico (public/) is only for
  // clients that ask for it directly and is the same transparent mark
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#120003',
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    // lang drives the Azerbaijani dotted İ in uppercase small caps. The site is dark-only: `.dark` is static
    // (white sections opt in with .theme-light, see globals.css), so there is no theme script or switch.
    <html lang={locale} className={`${fontVariables} dark`} style={{ colorScheme: 'dark' }}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieConsent />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

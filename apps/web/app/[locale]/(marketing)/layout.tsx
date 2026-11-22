import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Marketing shell: sticky header, <main id="main"> (skip-link target), wine footer.
 * Server component — the header/drawer are the only client islands of the shell.
 * setRequestLocale here too: Next can render a layout before (or without) its page, and the server
 * Footer reads translations — without the locale it would fall back to headers() and make every
 * marketing page dynamic (`Cache-Control: private, no-store`).
 */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}

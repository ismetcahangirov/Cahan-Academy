import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

/**
 * Marketing shell: sticky header, <main id="main"> (skip-link target), wine footer.
 * Server component — the header/drawer are the only client islands of the shell.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
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

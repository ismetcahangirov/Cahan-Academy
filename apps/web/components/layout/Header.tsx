'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { BrandLockup } from '../brand/Brand';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { NAV_LINKS, isActive } from './nav';

/**
 * Site header (marketing pages): sticky, solid page background + hairline (no blur), horizontal
 * BrandLockup, small-caps nav with an underline marker, language menu, theme toggle, enrol CTA.
 * Below lg the nav moves into <MobileMenu> (the theme toggle stays visible in the bar too).
 */
export default function Header() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // the drawer is mounted on first use (keeps ~150 nodes out of the initial hydration),
  // then opened two frames later so the slide-in transition runs
  const [drawerMounted, setDrawerMounted] = useState(false);
  const openMenu = () => {
    if (drawerMounted) {
      setMobileOpen(true);
      return;
    }
    setDrawerMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMobileOpen(true)));
  };

  return (
    <>
      <a
        href="#main"
        className="btn btn-primary btn-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[80]"
      >
        {tc('skip_to_content')}
      </a>
      <header className="site-header sticky top-0 z-40">
        <div className="mx-auto flex h-[var(--header-h)] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-md text-accent-text"
            aria-label={`Cahan Academy — ${tc('home')}`}
          >
            <BrandLockup title="" className="h-8 w-auto sm:h-9" />
          </Link>

          <nav aria-label={tc('main_nav')} className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {i > 0 && <EdelweissGlyph className="mx-0.5 h-2 w-2 text-ornament-soft" />}
                <Link
                  href={link.href}
                  className="nav-link"
                  aria-current={isActive(pathname, link.href) ? 'page' : undefined}
                >
                  {t(link.key)}
                </Link>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/courses" className="btn btn-primary btn-sm ml-1 hidden sm:inline-flex">
              {t('enroll')}
            </Link>
            <button
              type="button"
              onClick={openMenu}
              aria-label={tc('menu_open')}
              aria-expanded={mobileOpen}
              aria-controls={drawerMounted ? 'mobile-menu' : undefined}
              className={cn('btn btn-ghost btn-icon btn-sm text-accent-text lg:hidden')}
            >
              <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {drawerMounted && <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />}
    </>
  );
}

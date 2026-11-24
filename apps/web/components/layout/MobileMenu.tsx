'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { BrandLockup } from '../brand/Brand';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import OrnamentDivider from '../ornament/OrnamentDivider';
import { LaceEdge } from '../ornament/Lace';
import LanguageSwitcher from './LanguageSwitcher';
import { NAV_LINKS, isActive } from './nav';

/**
 * MobileMenu — accessible drawer (role="dialog", aria-modal). Focus moves in on open, Tab/Shift+Tab stay
 * inside, Escape and the backdrop close it, focus returns to the menu button, body scroll is locked.
 * Slides with transform only; hidden (visibility) when closed so nothing inside is focusable.
 * Contents: lockup, nav (active item marked with the edelweiss), theme toggle, languages, CTA.
 */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // close when the route changes (a nav link was followed)
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onCloseRef.current();
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    // after the visibility switch so the button is focusable
    const id = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <div
        className="drawer-backdrop fixed inset-0 z-[55] bg-[var(--overlay)] lg:hidden"
        data-open={open}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={tc('main_nav')}
        data-open={open}
        className="drawer paper fixed inset-y-0 right-0 z-[56] flex w-[min(22rem,88vw)] flex-col border-l border-line shadow-[var(--shadow-lg)] lg:hidden"
      >
        <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-4">
          <BrandLockup title="Cahan Academy" className="h-8 w-auto text-accent-text" />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={tc('menu_close')}
            className="btn btn-ghost btn-icon btn-sm text-accent-text"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={tc('main_nav')} className="custom-scrollbar flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                aria-current={pathname === '/' ? 'page' : undefined}
                className={cn('menu-item min-h-12 text-[1.15rem]', pathname === '/' && 'is-active')}
              >
                {pathname === '/' ? <EdelweissGlyph className="h-4 w-4 text-current" /> : <span className="w-4" />}
                {tc('home')}
              </Link>
            </li>
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn('menu-item min-h-12 text-[1.15rem]', active && 'is-active')}
                  >
                    {active ? <EdelweissGlyph className="h-4 w-4 text-current" /> : <span className="w-4" />}
                    {t(link.key)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <OrnamentDivider draw={false} className="my-6" />

          <div className="space-y-4 px-2">
            <div className="flex items-center justify-between gap-3">
              <span className="sc text-[0.82rem] text-ink-muted">{tc('language')}</span>
              <LanguageSwitcher variant="inline" />
            </div>
          </div>
        </nav>

        <div className="shrink-0 px-4 pb-6 pt-2">
          <Link href="/courses" className="btn btn-primary btn-lg btn-block">
            {t('enroll')}
          </Link>
        </div>
        <LaceEdge direction="up" size={22} className="shrink-0" />
      </div>
    </>
  );
}

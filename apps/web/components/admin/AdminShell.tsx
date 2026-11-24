'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Tags,
  UserCog,
  Users,
  UsersRound,
  X,
  type LucideIcon,
  Building2,
  Quote,
} from 'lucide-react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { BrandLockup, BrandMark } from '@/components/brand';
import { EdelweissGlyph, LaceEdge, OrnamentDivider } from '@/components/ornament';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import { Button, Spinner } from '@/components/ui';
import { FeedbackProvider } from '@/components/ui/Feedback';
import { apiMessage } from './utils';
import { isolateWheel } from '@/lib/scrollIsolation';

/**
 * AdminShell — the CMS frame: wine sidebar (lockup, nav with an edelweiss marker on the active item,
 * user, back-to-site, logout) + a sticky header (menu button < lg, section label, language menu, theme
 * toggle, logout). Below lg the sidebar is a left drawer: focus moves in, Tab stays inside, Escape and the
 * backdrop close it, focus returns to the menu button, body scroll is locked. Also mounts the toast +
 * confirm layer (feedback.tsx) and guards the session (no user -> /login).
 */
const NAV: { key: string; href: string; icon: LucideIcon }[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'leads', href: '/dashboard/leads', icon: Users },
  { key: 'contacts', href: '/dashboard/contacts', icon: MessageSquare },
  { key: 'courses', href: '/dashboard/courses', icon: BookOpen },
  { key: 'teachers', href: '/dashboard/teachers', icon: GraduationCap },
  { key: 'categories', href: '/dashboard/categories', icon: Tags },
  { key: 'team', href: '/dashboard/team', icon: UsersRound },
  { key: 'blog', href: '/dashboard/blog', icon: FileText },
  { key: 'newsletter', href: '/dashboard/newsletter', icon: Mail },
  { key: 'faq', href: '/dashboard/faq', icon: HelpCircle },
  { key: 'testimonials', href: '/dashboard/testimonials', icon: Quote },
  { key: 'site', href: '/dashboard/site', icon: Building2 },
  { key: 'users', href: '/dashboard/users', icon: UserCog },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isActive(pathname: string, href: string) {
  return href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [user, isLoading, router]);

  // close the drawer after navigation and when the viewport grows to the static sidebar
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(asideRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      // wrap at both ends, and pull focus back in if it is anywhere outside the drawer
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && idx <= 0) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (idx === -1 || idx === items.length - 1)) {
        e.preventDefault();
        first.focus();
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    const opener = menuBtnRef.current;
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  // the sidebar and the page scroll independently: a wheel over the sidebar never scrolls the page behind it
  const ready = !isLoading && !!user;
  useEffect(() => {
    const aside = asideRef.current;
    return ready && aside ? isolateWheel(aside) : undefined;
  }, [ready]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  const current = NAV.find((n) => isActive(pathname, n.href));

  return (
    <FeedbackProvider errorMessage={(e) => apiMessage(e, t('common.delete_error'))}>
      <a href="#admin-main" className="btn btn-primary btn-sm sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[80]">
        {tc('skip_to_content')}
      </a>

      <div
        className={cn(
          'fixed inset-0 z-[55] bg-[var(--overlay)] lg:hidden drawer-backdrop'
        )}
        data-open={open}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={asideRef}
        id="admin-sidebar"
        aria-label={t('nav.label')}
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        data-open={open}
        className={cn(
          'theme-wine band-wine fixed inset-y-0 left-0 z-[56] flex w-[min(19rem,86vw)] flex-col border-r border-line text-ink',
          'transition-[transform,visibility] duration-[var(--dur-3)] ease-[var(--ease-silk)]',
          'max-lg:invisible max-lg:-translate-x-full max-lg:data-[open=true]:visible max-lg:data-[open=true]:translate-x-0',
          'lg:w-64'
        )}
      >
        <LaceEdge vertical direction="right" size={18} className="absolute inset-y-0 right-0 z-0 opacity-100" />
        <div className="relative z-[1] flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
          <Link href="/dashboard" className="flex items-center rounded-md text-accent-text" aria-label={`Cahan Academy: ${t('nav.dashboard')}`}>
            <BrandLockup title="" className="h-8 w-auto" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t('nav.menu_close')}
            className="btn btn-ghost btn-icon btn-sm lg:hidden"
          >
            <X size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        <nav aria-label={t('nav.label')} className="custom-scrollbar relative z-[1] flex-1 overflow-y-auto overscroll-contain px-3 py-4 pr-5">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn('menu-item', active && 'is-active')}
                  >
                    {active ? (
                      <EdelweissGlyph className="h-4 w-4 shrink-0 text-current" />
                    ) : (
                      <item.icon size={17} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
                    )}
                    <span className="truncate">{t(`nav.${item.key}`)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative z-[1] border-t border-line px-3 pb-4 pt-3 pr-5">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-accent-soft font-semibold text-accent-text"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[1rem] font-semibold leading-tight">{user.name}</p>
              <p className="truncate text-[0.9rem] leading-tight text-ink-muted">{user.email}</p>
            </div>
          </div>
          <OrnamentDivider draw={false} className="my-2" />
          <Link href="/" className="menu-item">
            <Home size={17} strokeWidth={1.6} aria-hidden="true" />
            {t('nav.back_to_site')}
          </Link>
          <button type="button" onClick={logout} className="menu-item">
            <LogOut size={17} strokeWidth={1.6} aria-hidden="true" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="site-header sticky top-0 z-40">
          <div className="flex h-[var(--header-h)] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t('nav.menu_open')}
              aria-expanded={open}
              aria-controls="admin-sidebar"
              className="btn btn-ghost btn-icon btn-sm text-accent-text lg:hidden"
            >
              <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <BrandMark title="" className="h-7 w-auto text-accent-text lg:hidden" />
            <p className="sc hidden truncate text-[0.95rem] tracking-[0.14em] text-ink-muted lg:block">
              {current ? t(`nav.${current.key}`) : t('nav.dashboard')}
            </p>
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" icon={LogOut} onClick={logout} className="text-accent-text">
                <span className="hidden sm:inline">{t('nav.logout')}</span>
                <span className="sr-only sm:hidden">{t('nav.logout')}</span>
              </Button>
            </div>
          </div>
        </header>

        <main id="admin-main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </FeedbackProvider>
  );
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { LOCALES } from './nav';

/**
 * LanguageSwitcher — small-caps pill that opens a menu of real links (crawlable).
 * Escape / outside click close it and focus returns to the button.
 * variant 'menu' (header) | 'inline' (mobile drawer: three pills side by side).
 */
export default function LanguageSwitcher({ variant = 'menu', className }: { variant?: 'menu' | 'inline'; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  if (variant === 'inline') {
    return (
      <nav aria-label={t('language')} className={cn('flex gap-2', className)}>
        {LOCALES.map((l) => (
          <Link
            key={l.code}
            href={pathname}
            locale={l.code}
            hrefLang={l.code}
            lang={l.code}
            aria-current={l.code === locale ? 'true' : undefined}
            className={cn('btn btn-sm', l.code === locale ? 'btn-primary' : 'btn-outline')}
          >
            <span aria-hidden="true">{l.label}</span>
            <span className="sr-only">{l.name}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t('language')}: ${LOCALES.find((l) => l.code === locale)?.name ?? locale}`}
        className="btn btn-ghost btn-sm gap-1.5 px-2.5 text-accent-text"
      >
        <Languages size={16} strokeWidth={1.6} aria-hidden="true" />
        <span>{locale.toUpperCase()}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.6}
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul id={menuId} className="menu-panel orn-pop absolute right-0 top-full z-50 mt-2 min-w-[11rem]">
          {LOCALES.map((l) => (
            <li key={l.code}>
              <Link
                href={pathname}
                locale={l.code}
                hrefLang={l.code}
                lang={l.code}
                onClick={() => setOpen(false)}
                aria-current={l.code === locale ? 'true' : undefined}
                className={cn('menu-item justify-between', l.code === locale && 'is-active')}
              >
                <span>{l.name}</span>
                {l.code === locale ? (
                  <Check size={15} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <span className="sc text-[0.78rem] text-ink-subtle" aria-hidden="true">
                    {l.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

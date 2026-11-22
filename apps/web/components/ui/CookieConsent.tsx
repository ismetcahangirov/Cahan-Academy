'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import CornerFlourish from '../ornament/CornerFlourish';

/**
 * CookieConsent — framed notice in the bottom corner (bottom sheet on phones). Appears after 1.5s,
 * CSS entrance (transform/opacity), never covers the page before the visitor can read it.
 * Accept stores `cookie_consent=accepted` for a year; decline / close hide it for this visit.
 */
const COOKIE_NAME = 'cookie_consent';
const COOKIE_VALUE = 'accepted';
const COOKIE_EXPIRE_DAYS = 365;

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations('cookie');

  useEffect(() => {
    if (Cookies.get(COOKIE_NAME)) return;
    const timer = window.setTimeout(() => setVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const accept = () => {
    Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: COOKIE_EXPIRE_DAYS, path: '/', sameSite: 'lax' });
    setVisible(false);
  };

  return (
    <section
      role="region"
      aria-labelledby="cookie-title"
      className="orn-rise fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md"
    >
      <div className="card-ornate relative p-5 pr-12 sm:p-6 sm:pr-12">
        <CornerFlourish corner="tl" className="absolute left-2.5 top-2.5 h-5 w-5" />
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label={t('close')}
          className="btn btn-ghost btn-icon btn-sm absolute right-3 top-3"
        >
          <X size={17} strokeWidth={1.6} aria-hidden="true" />
        </button>

        <h2 id="cookie-title" className="flex items-center gap-2 text-[1.2rem] font-semibold text-ink">
          <EdelweissGlyph className="h-4 w-4 text-accent-text" />
          {t('title')}
        </h2>
        <p className="mt-2 text-[1rem] leading-relaxed text-ink-muted">
          {t('description')}{' '}
          <Link href="/privacy-policy" className="link">
            {t('learn_more')}
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={accept} className="btn btn-primary btn-sm">
            {t('accept')}
          </button>
          <button type="button" onClick={() => setVisible(false)} className="btn btn-ghost btn-sm">
            {t('decline')}
          </button>
        </div>
      </div>
    </section>
  );
}

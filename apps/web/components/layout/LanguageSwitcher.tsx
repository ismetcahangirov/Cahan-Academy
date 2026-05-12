'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState } from 'react';

const locales = [
  { code: 'az', label: 'AZ' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
];

export default function LanguageSwitcher() {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/60 hover:bg-primary/5 transition-all text-sm font-medium"
        aria-label="Dil seçimi"
      >
        <Globe size={15} className="text-primary" />
        <span>{locale.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-20 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[80px]">
            {locales.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors ${
                  l.code === locale
                    ? 'text-primary font-semibold bg-primary/5'
                    : 'text-foreground'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

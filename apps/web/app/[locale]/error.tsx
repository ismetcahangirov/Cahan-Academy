'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

// Minimal error boundary for every page under /[locale]. Copy is inline (not in messages/*.json)
// so this file works even if message loading is what failed; page agents may restyle it.
const COPY = {
  az: { title: 'Xəta baş verdi', body: 'Səhifəni yükləmək mümkün olmadı. Bir az sonra yenidən cəhd edin.', retry: 'Yenidən cəhd et' },
  en: { title: 'Something went wrong', body: 'The page could not be loaded. Please try again in a moment.', retry: 'Try again' },
  ru: { title: 'Произошла ошибка', body: 'Не удалось загрузить страницу. Попробуйте ещё раз чуть позже.', retry: 'Повторить' },
} as const;

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.az;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-background text-foreground">
      <h1 className="font-heading text-3xl">{t.title}</h1>
      <p className="text-muted-foreground max-w-md">{t.body}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-6 py-3 rounded-xl border border-border bg-primary text-primary-foreground"
      >
        {t.retry}
      </button>
    </main>
  );
}

'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { RotateCcw } from 'lucide-react';
import { OrnateFrame, ScriptTitle, SketchIllustration } from '@/components/ornament';
import Button from '@/components/ui/Button';

// Error boundary for every page under /[locale]. Copy is inline (not in messages/*.json)
// so this file works even if message loading is what failed.
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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <OrnateFrame paper className="w-full max-w-lg px-6 pb-10 pt-10 text-center sm:px-10">
        <SketchIllustration name="inkwell" className="mx-auto w-20" />
        <ScriptTitle align="center" size="section" as="h1" title={t.title} lead={t.body} className="mt-4" />
        <Button onClick={() => reset()} icon={RotateCcw} className="mt-8">
          {t.retry}
        </Button>
      </OrnateFrame>
    </div>
  );
}

import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';

// Shown for notFound() calls inside /[locale] (unknown course/teacher/blog slug).
// Copy is inline so it does not depend on message keys; page agents may restyle it.
const COPY = {
  az: { title: 'Səhifə tapılmadı', body: 'Axtardığınız səhifə mövcud deyil və ya köçürülüb.', home: 'Ana səhifə' },
  en: { title: 'Page not found', body: 'The page you are looking for does not exist or has moved.', home: 'Home' },
  ru: { title: 'Страница не найдена', body: 'Страница не существует или была перемещена.', home: 'На главную' },
} as const;

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const t = COPY[locale as keyof typeof COPY] ?? COPY.az;

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center bg-background text-foreground">
      <h1 className="font-heading text-3xl">{t.title}</h1>
      <p className="text-muted-foreground max-w-md">{t.body}</p>
      <Link href="/" className="px-6 py-3 rounded-xl border border-border bg-primary text-primary-foreground">
        {t.home}
      </Link>
    </main>
  );
}

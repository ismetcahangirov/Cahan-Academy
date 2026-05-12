import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations('hero');
  
  // Note: setRequestLocale is required for static export/rendering
  // but we are using a dynamic route group here.
  // For simplicity in this step, we just use the translations.

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-6xl font-bold mb-6 text-primary">
        {t('title')}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        {t('subtitle')}
      </p>
      <div className="flex gap-4">
        <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
          {t('cta_primary')}
        </button>
        <button className="border-2 border-secondary text-secondary px-8 py-3 rounded-lg font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all">
          {t('cta_secondary')}
        </button>
      </div>
    </main>
  );
}

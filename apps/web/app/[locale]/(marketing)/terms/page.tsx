import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import JsonLd from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('terms_title'),
    description: t('terms_description'),
  };
}

export default async function TermsOfUsePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('terms_of_use_title'),
    description: t('terms_content').substring(0, 160),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/terms`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="pt-32 pb-20 bg-gray-50 dark:bg-gray-900/50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('terms_of_use_title')}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                <span>{t('last_updated')}:</span>
                <time dateTime="2024-05-13">13 May 2024</time>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
                <p>{t('terms_content')}</p>
                
                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Ümumi şərtlər</h2>
                  <p>Cahan Academy veb-saytından istifadə etməklə siz bütün şərtlərlə razı olduğunuzu təsdiq edirsiniz. Əgər bu şərtlərlə razı deyilsinizsə, xidmətdən istifadəni dayandırın.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Müəllif hüquqları</h2>
                  <p>Veb-saytda yer alan bütün materiallar (mətnlər, videolar, loqolar) Cahan Academy-yə məxsusdur və icazəsiz kopyalanması qadağandır.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. İstifadə qaydaları</h2>
                  <p>İstifadəçilər xidmətlərdən yalnız qanuni məqsədlər üçün istifadə etməli və saytın fəaliyyətinə mane olacaq hərəkətlərdən çəkinməlidirlər.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Dəyişikliklər</h2>
                  <p>Biz istənilən vaxt bu şərtləri dəyişdirmək hüququnu özümüzdə saxlayırıq. Dəyişikliklər saytda dərc edildiyi andan qüvvəyə minir.</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

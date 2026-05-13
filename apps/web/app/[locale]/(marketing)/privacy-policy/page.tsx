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
    title: t('privacy_title'),
    description: t('privacy_description'),
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('privacy_policy_title'),
    description: t('privacy_content').substring(0, 160),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/privacy-policy`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="pt-32 pb-20 bg-gray-50 dark:bg-gray-900/50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('privacy_policy_title')}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
                <span>{t('last_updated')}:</span>
                <time dateTime="2024-05-13">13 May 2024</time>
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
                <p>{t('privacy_content')}</p>
                
                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Məlumatların toplanması</h2>
                  <p>Biz sizin veb-saytımızda qeydiyyatdan keçdiyinizdə, kurslara yazıldığınızda və ya əlaqə formunu doldurduğunuzda təqdim etdiyiniz məlumatları (ad, email, telefon) toplayırıq.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. İstifadə məqsədi</h2>
                  <p>Toplanılan məlumatlar təhsil xidmətlərinin göstərilməsi, sizinlə əlaqə saxlanılması və xidmət keyfiyyətinin artırılması üçün istifadə olunur.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Təhlükəsizlik</h2>
                  <p>Məlumatlarınızın təhlükəsizliyini təmin etmək üçün ən müasir şifrələmə texnologiyalarından və server təhlükəsizlik protokollarından istifadə edirik.</p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Əlaqə</h2>
                  <p>Məxfilik siyasəti ilə bağlı hər hansı sualınız olarsa, bizimlə əlaqə saxlaya bilərsiniz: info@cahanacademy.az</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

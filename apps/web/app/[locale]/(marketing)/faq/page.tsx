import { getTranslations } from 'next-intl/server';
import { getFaqs } from '@/lib/api';
import FAQAccordion from '@/components/ui/FAQAccordion';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';

export const revalidate = 3600; // ISR - Every 1 hour

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
    }
  };
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  let faqs: any[] = [];
  try {
    const data = await getFaqs();
    faqs = data || [];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
  }

  // Schema.org FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f: any) => ({
      "@type": "Question",
      "name": f.question[locale] || f.question['az'],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer[locale] || f.answer['az']
      }
    }))
  };

  return (
    <main className="min-h-screen pt-32 pb-20">
      {/* Schema.org */}
      <JsonLd data={faqSchema} />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase mb-4"
          >
            {t('badge')}
          </MotionDiv>
          <h1 className="font-heading text-4xl md:text-5xl font-black mb-6 leading-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('description')}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <FAQAccordion items={faqs} locale={locale} />
        </div>
      </div>
    </main>
  );
}

// Simple wrapper for motion div since it's a server component
function MotionDiv({ children, initial, animate, className }: any) {
  return <div className={className}>{children}</div>;
}

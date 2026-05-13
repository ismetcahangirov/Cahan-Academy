import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('contact_title'),
    description: t('contact_description'),
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'contact' });

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-secondary" />,
      title: 'Telefon',
      value: '+994 50 123 45 67',
      href: 'tel:+994501234567',
    },
    {
      icon: <Mail className="w-6 h-6 text-secondary" />,
      title: 'Email',
      value: 'info@cahanacademy.az',
      href: 'mailto:info@cahanacademy.az',
    },
    {
      icon: <MapPin className="w-6 h-6 text-secondary" />,
      title: 'Ünvan',
      value: 'Bakı şəhəri, Nizami küç. 12',
      href: 'https://maps.google.com',
    },
  ];

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info Side */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest mb-6">
              <MessageSquare size={14} />
              Bizə Yazın
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              {t('title')}
            </h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-lg">
              Suallarınız var? Bizimlə əlaqə saxlayın, komandamız sizə ən qısa zamanda cavab verəcəkdir.
            </p>

            <div className="space-y-8">
              {contactInfo.map((info, idx) => (
                <a
                  key={idx}
                  href={info.href}
                  className="flex items-center gap-5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-sm">
                    {info.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      {info.title}
                    </div>
                    <div className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {info.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Map Placeholder or Socials */}
            <div className="mt-16 p-8 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-xl font-bold mb-2">İş Saatlarımız</h3>
                 <p className="text-muted-foreground">Bazar ertəsi - Şənbə: 09:00 - 18:00</p>
                 <p className="text-muted-foreground">Bazar: İstirahət günü</p>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-card border border-border p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 relative">
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}

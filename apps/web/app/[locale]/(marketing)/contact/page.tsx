import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Clock, ExternalLink, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm';
import PageBand from '@/components/layout/PageBand';
import { alternatesFor, ogImages } from '@/lib/seo';
import { OrnateFrame, ScriptTitle, SketchIllustration } from '@/components/ornament';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/utils';
import { getContactSettings, pick, telHref } from '@/lib/site';

interface Props {
  params: Promise<{ locale: string }>;
}

/* Phone, e-mail, address and opening hours come from the admin panel (Site details). */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('contact_title'),
    description: t('contact_description'),
    alternates: alternatesFor(locale, '/contact'),
    openGraph: { title: t('contact_title'), description: t('contact_description'), type: 'website', locale, images: ogImages(locale) },
  };
}

function Fact({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface">
        <Icon size={19} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="sc text-[0.8rem] text-ink-muted">{label}</p>
        <div className="mt-0.5 text-[1.1rem] leading-snug text-ink">{children}</div>
      </div>
    </li>
  );
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, contact] = await Promise.all([getTranslations({ locale, namespace: 'contact' }), getContactSettings()]);
  const address = pick(contact.address, locale);
  const hours = pick(contact.hours, locale).split('\n').filter(Boolean);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: t('title'),
          url: absoluteUrl(locale, '/contact'),
          inLanguage: locale,
        }}
      />

      <PageBand id="contact-title" trail={{ locale, items: [{ path: '/contact' }] }} eyebrow={t('eyebrow')} title={t('title')} lead={t('lead')} />

      <div className="mx-auto grid max-w-6xl items-start gap-6 px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:px-8">
        <OrnateFrame as="section" aria-labelledby="contact-form-title" className="px-5 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
          <ScriptTitle id="contact-form-title" size="card" as="h2" title={t('form_title')} subtitle={t('form_hint')} />
          <div className="mt-7">
            <ContactForm />
          </div>
        </OrnateFrame>

        <OrnateFrame
          as="aside"
          paper
          corners="diagonal"
          aria-labelledby="contact-info-title"
          className="relative overflow-hidden px-6 pb-8 pt-9 sm:px-9"
        >
          <ScriptTitle id="contact-info-title" size="card" as="h2" title={t('info_title')} lead={t('info_lead')} />
          <ul className="mt-7 space-y-6">
            <Fact icon={Phone} label={t('phone')}>
              <a href={telHref(contact.phone)} className="num link">
                {contact.phone}
              </a>
            </Fact>
            <Fact icon={Mail} label={t('email')}>
              <a href={`mailto:${contact.email}`} className="link break-words">
                {contact.email}
              </a>
            </Fact>
            <Fact icon={MapPin} label={t('address_label')}>
              <p>{address}</p>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sc mt-1.5 inline-flex items-center gap-1.5 text-[0.82rem] text-accent-text hover:underline"
              >
                {t('map_link')}
                <ExternalLink size={13} strokeWidth={1.8} aria-hidden="true" />
              </a>
            </Fact>
            <Fact icon={Clock} label={t('hours_label')}>
              {hours.map((line, i) => (
                <p key={i} className={i === 0 ? 'time-italic' : 'time-italic text-ink-muted'}>
                  {line}
                </p>
              ))}
            </Fact>
          </ul>
          <SketchIllustration name="inkwell" className="mx-auto mt-9 w-28 sm:w-32" />
        </OrnateFrame>
      </div>
    </>
  );
}

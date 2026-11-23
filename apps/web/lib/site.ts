import { apiFetch } from './api';
import { SITE_URL } from './utils';

/**
 * Site details the owner edits in the admin panel (Site details, Testimonials). Server-side reads go through the
 * Next data cache (5 min, tags `site-settings` / `testimonials`); if the API is unreachable the site renders the
 * fallback below instead of failing.
 */
export type L3 = { az: string; en: string; ru: string };

export interface ContactSettings {
  phone: string;
  email: string;
  address: L3;
  hours: L3;
  social: { instagram: string; facebook: string; youtube: string };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export const FALLBACK_CONTACT: ContactSettings = {
  phone: '+994 50 123 45 67',
  email: 'info@cahanacademy.az',
  address: { az: 'Bakı şəhəri, Nizami küç. 12', en: '12 Nizami St., Baku', ru: 'Баку, ул. Низами, 12' },
  hours: {
    az: 'Bazar ertəsi – Şənbə: 09:00 – 18:00\nBazar: istirahət günü',
    en: 'Monday – Saturday: 09:00 – 18:00\nSunday: closed',
    ru: 'Понедельник – суббота: 09:00 – 18:00\nВоскресенье: выходной',
  },
  social: {
    instagram: 'https://instagram.com/cahanacademy',
    facebook: 'https://facebook.com/cahanacademy',
    youtube: 'https://youtube.com/@cahanacademy',
  },
};

const REVALIDATE = 300;

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const res = await apiFetch<{ data: ContactSettings }>('/settings/contact', { tags: ['site-settings'], revalidate: REVALIDATE });
    return res.data ?? FALLBACK_CONTACT;
  } catch {
    return FALLBACK_CONTACT;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await apiFetch<{ data: Testimonial[] }>('/testimonials', { tags: ['testimonials'], revalidate: REVALIDATE });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

/** The localized value of an az/en/ru field (Azerbaijani when the locale is unknown). */
export const pick = (v: L3, locale: string) => v[locale as keyof L3] || v.az;

/** `tel:` link for a displayed number ("+994 50 123 45 67" → "tel:+994501234567"). */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** Social profile links that are filled in, in a fixed order. */
export const socialLinks = (c: ContactSettings) =>
  (['instagram', 'facebook', 'youtube'] as const).filter((k) => c.social[k]).map((k) => ({ key: k, href: c.social[k] }));

/** The one Organization JSON-LD node of the site (rendered by the marketing layout on every page). */
export const organizationJsonLd = (c: ContactSettings, locale: string) => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Cahan Academy',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: c.email,
  telephone: c.phone,
  address: { '@type': 'PostalAddress', streetAddress: pick(c.address, locale), addressLocality: 'Bakı', addressCountry: 'AZ' },
  contactPoint: { '@type': 'ContactPoint', telephone: c.phone, email: c.email, contactType: 'customer service', availableLanguage: ['az', 'en', 'ru'] },
  sameAs: socialLinks(c).map((s) => s.href),
});

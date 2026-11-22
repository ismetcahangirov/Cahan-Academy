import { useTranslations } from 'next-intl';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { BrandLogo } from '../brand/Brand';
import WaveEdge from '../ornament/WaveEdge';
import WaxSeal from '../ornament/WaxSeal';
import { LaceCorner } from '../ornament/Lace';
import OrnamentDivider from '../ornament/OrnamentDivider';
import FooterNewsletter from './FooterNewsletter';
import { FOOTER_LINKS } from './nav';

/**
 * Footer — deep wine band (.theme-wine) rising from the page in a wave, wax seal on the join,
 * stacked logo, links, contact, newsletter, lace corners. Same look in both themes.
 * `waveFill` = background of the section right above the footer (default the page).
 */
const SOCIAL = [
  {
    href: 'https://instagram.com/cahanacademy',
    label: 'Instagram',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: 'https://facebook.com/cahanacademy',
    label: 'Facebook',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    href: 'https://youtube.com/@cahanacademy',
    label: 'YouTube',
    svg: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02 15.5 12 9.75 8.98z"
        />
      </svg>
    ),
  },
];

export default function Footer({ waveFill = 'var(--page-base)' }: { waveFill?: string }) {
  const t = useTranslations('nav');
  const tf = useTranslations('footer');
  const tn = useTranslations('newsletter');
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto">
      <div className="theme-wine band-wine relative overflow-hidden pb-8 pt-24 sm:pt-28">
        <WaveEdge invert fill={waveFill} className="absolute inset-x-0 -top-px" />
        <LaceCorner corner="bl" className="absolute bottom-0 left-0 w-20 sm:w-36" />
        <LaceCorner corner="br" className="absolute bottom-0 right-0 w-20 sm:w-36" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr]">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <Link href="/" className="rounded-md text-ink" aria-label="Cahan Academy">
                <BrandLogo title="" className="h-32 w-auto" />
              </Link>
              <p className="mt-5 max-w-xs text-[1.02rem] leading-relaxed text-ink-muted">{tf('tagline')}</p>
              <ul className="mt-6 flex gap-2" aria-label={tf('social_label')}>
                {SOCIAL.map(({ href, label, svg }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="btn btn-outline btn-icon btn-sm"
                    >
                      {svg}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-1 lg:col-span-2">
              <nav aria-labelledby="footer-links">
                <h2 id="footer-links" className="sc mb-4 text-[0.85rem] text-ink-muted">
                  {tf('links_title')}
                </h2>
                <ul className="space-y-2.5">
                  {FOOTER_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[1.05rem] text-ink transition-colors hover:text-accent-text hover:underline">
                        {t(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="space-y-8">
                <nav aria-labelledby="footer-legal">
                  <h2 id="footer-legal" className="sc mb-4 text-[0.85rem] text-ink-muted">
                    {tf('legal_title')}
                  </h2>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/privacy-policy" className="text-[1.05rem] text-ink hover:underline">
                        {tf('privacy')}
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-[1.05rem] text-ink hover:underline">
                        {tf('terms')}
                      </Link>
                    </li>
                  </ul>
                </nav>
                <div>
                  <h2 className="sc mb-4 text-[0.85rem] text-ink-muted">{tf('contact_title')}</h2>
                  <ul className="space-y-3 text-[1rem]">
                    <li className="flex items-start gap-2.5 text-ink">
                      <MapPin size={16} strokeWidth={1.6} className="mt-1 shrink-0 text-ornament" aria-hidden="true" />
                      {tf('address')}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone size={16} strokeWidth={1.6} className="shrink-0 text-ornament" aria-hidden="true" />
                      <a href="tel:+994501234567" className="num text-ink hover:underline">
                        +994 50 123 45 67
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Mail size={16} strokeWidth={1.6} className="shrink-0 text-ornament" aria-hidden="true" />
                      <a href="mailto:info@cahanacademy.az" className="break-all text-ink hover:underline">
                        info@cahanacademy.az
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="sc mb-2 text-[0.85rem] text-ink-muted">{tn('title')}</h2>
              <p className="mb-4 text-[1rem] leading-relaxed text-ink-muted">{tf('newsletter_text')}</p>
              <FooterNewsletter />
            </div>
          </div>

          <OrnamentDivider draw={false} className="mt-12" />
          <div className="mt-6 flex flex-col items-center gap-2 px-16 pb-6 text-center sm:px-40">
            <p className="text-[0.95rem] text-ink-muted">
              © <span className="num">{year}</span> Cahan Academy. {tf('rights')}
            </p>
            <p className="sc text-[0.78rem] text-ink-subtle">{tf('made_in')}</p>
          </div>
        </div>
      </div>
      <WaxSeal size={84} className="absolute left-1/2 top-3 z-[2] -translate-x-1/2 sm:top-4" />
    </footer>
  );
}

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin } from 'lucide-react';

const navLinks = [
  { href: '/courses',  key: 'courses'  },
  { href: '/teachers', key: 'teachers' },
  { href: '/blog',     key: 'blog'     },
  { href: '/about',    key: 'about'    },
  { href: '/contact',  key: 'contact'  },
  { href: '/faq',      key: 'faq'      },
];

// Inline SVG brand icons (lucide-react doesn't include brand icons)
const socialLinks = [
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
];


export default function Footer() {
  const t    = useTranslations('nav');
  const tFt  = useTranslations('footer');

  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-heading font-bold text-xl leading-none">C</span>
              </div>
              <span className="font-heading font-bold text-lg tracking-tight">
                Cahan <span className="text-secondary">Academy</span>
              </span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              Peşəkar müəllimlər, praktiki dərslər və sertifikalı proqramlarla karyeranızı irəli aparın.
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map(({ href, label, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary flex items-center justify-center transition-all"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-background/90">Keçidlər</h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as any}
                    className="text-sm text-background/60 hover:text-secondary transition-colors"
                  >
                    {t(link.key as any)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-background/90">Hüquqi</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-background/60 hover:text-secondary transition-colors">
                  {tFt('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-background/60 hover:text-secondary transition-colors">
                  {tFt('terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-background/90">Əlaqə</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-secondary mt-0.5 shrink-0" />
                <span className="text-sm text-background/60">Bakı, Azərbaycan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-secondary shrink-0" />
                <a href="tel:+994501234567" className="text-sm text-background/60 hover:text-secondary transition-colors">
                  +994 50 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-secondary shrink-0" />
                <a href="mailto:info@cahanacademy.az" className="text-sm text-background/60 hover:text-secondary transition-colors">
                  info@cahanacademy.az
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} Cahan Academy. {tFt('rights')}
          </p>
          <p className="text-xs text-background/30">
            Made with ❤️ in Azerbaijan
          </p>
        </div>
      </div>
    </footer>
  );
}

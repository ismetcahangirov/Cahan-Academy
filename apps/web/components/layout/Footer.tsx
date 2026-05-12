import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const navLinks = [
  { href: '/courses',  key: 'courses'  },
  { href: '/teachers', key: 'teachers' },
  { href: '/blog',     key: 'blog'     },
  { href: '/about',    key: 'about'    },
  { href: '/contact',  key: 'contact'  },
  { href: '/faq',      key: 'faq'      },
];

const socialLinks = [
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://facebook.com',  icon: Facebook,  label: 'Facebook'  },
  { href: 'https://youtube.com',   icon: Youtube,   label: 'YouTube'   },
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
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary flex items-center justify-center transition-all"
                >
                  <Icon size={16} />
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

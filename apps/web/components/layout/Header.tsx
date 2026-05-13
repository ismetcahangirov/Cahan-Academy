'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '/courses',  key: 'courses'  },
  { href: '/teachers', key: 'teachers' },
  { href: '/blog',     key: 'blog'     },
  { href: '/about',    key: 'about'    },
  { href: '/contact',  key: 'contact'  },
];

interface HeaderProps {
  onEnroll?: () => void;
}

export default function Header({ onEnroll }: HeaderProps) {
  const t = useTranslations('nav');
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-card/95 backdrop-blur-md shadow-sm border-b border-border/50'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-heading font-bold text-lg leading-none">C</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-lg tracking-tight text-foreground">
                  Cahan <span className="text-primary">Academy</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-all"
                >
                  {t(link.key as any)}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              <button
                onClick={onEnroll}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
              >
                {t('enroll')}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Menunu aç"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onEnroll={onEnroll ?? (() => {})}
      />
    </>
  );
}

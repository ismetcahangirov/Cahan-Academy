'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const navLinks = [
  { href: '/courses',  key: 'courses'  },
  { href: '/teachers', key: 'teachers' },
  { href: '/blog',     key: 'blog'     },
  { href: '/about',    key: 'about'    },
  { href: '/contact',  key: 'contact'  },
];

interface MobileMenuProps {
  isOpen:   boolean;
  onClose:  () => void;
  onEnroll: () => void;
}

export default function MobileMenu({ isOpen, onClose, onEnroll }: MobileMenuProps) {
  const t = useTranslations('nav');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-card shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <span className="font-heading text-xl font-bold text-primary">Cahan Academy</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Menunu bağla"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                >
                  <Link
                    href={link.href as any}
                    onClick={onClose}
                    className="block px-4 py-3.5 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    {t(link.key as any)}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* CTA */}
            <div className="p-6 border-t border-border">
              <button
                onClick={() => { onEnroll(); onClose(); }}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Kursa Yazıl
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

const COOKIE_NAME = 'cookie_consent';
const COOKIE_VALUE = 'accepted';
const COOKIE_EXPIRE_DAYS = 365;

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const t = useTranslations('cookie');
  const locale = useLocale();

  useEffect(() => {
    const consent = Cookies.get(COOKIE_NAME);
    if (!consent) {
      // Bir az gecikmə ilə göstərək ki, səhifə yüklənəndə qəfil çıxmasın
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set(COOKIE_NAME, COOKIE_VALUE, { expires: COOKIE_EXPIRE_DAYS, path: '/' });
    setIsVisible(false);
  };

  const handleDecline = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[100]"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-bordo/5 rounded-full blur-2xl" />
            
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-bordo/10 rounded-xl shrink-0">
                <Cookie className="w-6 h-6 text-bordo" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t('title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {t('description')}{' '}
                  <Link 
                    href={`/${locale}/privacy-policy`}
                    className="text-bordo hover:underline font-medium"
                  >
                    {t('learn_more')}
                  </Link>
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 py-2.5 px-4 bg-bordo hover:bg-bordo-dark text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-bordo/20 active:scale-95"
                  >
                    {t('accept')}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  >
                    {t('decline')}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

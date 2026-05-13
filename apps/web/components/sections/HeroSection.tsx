'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-primary/80" />

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary/15 blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-sm font-medium mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                {t('badge')}
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('title').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-secondary">{t('title').split(' ').slice(-1)}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('subtitle')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30"
              >
                {t('cta_primary')}
                <ArrowRight size={18} />
              </Link>
              <button className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-white/20 text-white rounded-xl font-semibold text-base hover:bg-white/10 active:scale-95 transition-all">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <Play size={12} fill="white" />
                </div>
                  {t('view_video')}
              </button>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div 
            className="flex-1 relative hidden lg:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative w-full aspect-square">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-secondary/20 animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="absolute inset-12 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 rotate-3 group">
                <Image 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
                  alt={t('enroll')}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Floating cards */}
              <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">5K+</div>
                   <div className="text-[10px] text-white/80 font-medium">{t('graduates')}</div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 40C1080 80 720 0 360 40L0 0L0 80Z" fill="var(--background)" />
        </svg>
      </div>
    </section>
  );
}

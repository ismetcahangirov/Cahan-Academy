'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Target, Eye } from 'lucide-react';

export default function MissionSection() {
  const t = useTranslations('about');

  return (
    <section className="py-24 bg-foreground/[0.02] overflow-hidden" id="mission">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            className="order-2 lg:order-1 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl z-10 border-8 border-white dark:border-white/5">
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200"
                alt={t('mission_title')}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              {t('mission_title')}
            </div>
            
            <div className="space-y-12">
              {/* Mission */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Target size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{t('mission_badge')}</h3>
                  <p className="text-foreground/70 leading-relaxed">{t('mission_desc')}</p>
                </div>
              </div>

              {/* Vision */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Eye size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{t('vision_badge')}</h3>
                  <p className="text-foreground/70 leading-relaxed">{t('vision_desc')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

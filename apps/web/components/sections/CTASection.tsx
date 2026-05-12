'use client';

import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function CTASection() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative bg */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/10 translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.span
          className="inline-block text-secondary text-sm font-semibold uppercase tracking-widest mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Daha gec deyil
        </motion.span>

        <motion.h2
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Karyeranıza Bu Gün <br className="hidden sm:block" />
          <span className="text-secondary">Başlayın</span>
        </motion.h2>

        <motion.p
          className="text-white/70 text-lg mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Pulsuz məsləhət üçün bizə yazın. Hansı kursun sizə uyğun olduğunu birlikdə müəyyən edək.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-bold text-base hover:bg-secondary hover:text-foreground active:scale-95 transition-all shadow-lg"
          >
            Müraciət Et
            <ArrowRight size={18} />
          </Link>

          <a
            href="tel:+994501234567"
            className="inline-flex items-center gap-2.5 px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-base hover:bg-white/10 active:scale-95 transition-all"
          >
            <PhoneCall size={18} />
            +994 50 123 45 67
          </a>
        </motion.div>
      </div>
    </section>
  );
}

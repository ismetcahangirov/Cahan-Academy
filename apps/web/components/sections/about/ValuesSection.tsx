'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Zap, GraduationCap } from 'lucide-react';

export default function ValuesSection() {
  const t = useTranslations('about');

  const values = [
    {
      icon: GraduationCap,
      title: t('value_quality_title'),
      desc: t('value_quality_desc'),
      color: 'primary',
    },
    {
      icon: Zap,
      title: t('value_innovation_title'),
      desc: t('value_innovation_desc'),
      color: 'secondary',
    },
    {
      icon: ShieldCheck,
      title: t('value_student_title'),
      desc: t('value_student_desc'),
      color: 'primary',
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-6">{t('values_title')}</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/20 hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${
                value.color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              }`}>
                <value.icon size={32} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{value.title}</h3>
              <p className="text-foreground/60 leading-relaxed">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

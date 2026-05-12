'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Target, Users, BookOpen, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Sertifikatlı Proqramlar',
    description: 'Beynəlxalq standartlara uyğun sertifikatlar ilə karyeranızı gücləndir.',
  },
  {
    icon: Zap,
    title: 'Praktiki Yanaşma',
    description: 'Real layihələr və praktiki tapşırıqlarla öyrən, nəzəriyyə ilə kifayətlənmə.',
  },
  {
    icon: Target,
    title: 'Fərdi Mentorluq',
    description: 'Peşəkar müəllimlər ilə fərdi mentorluq seansları və daimi dəstək.',
  },
  {
    icon: Users,
    title: 'Güclü İcma',
    description: '1200+ tələbə ilə əlaqə qurun, fikir mübadiləsi edin, böyüyün.',
  },
  {
    icon: BookOpen,
    title: 'Çevik Qrafik',
    description: 'Həftəiçi axşam, həftəsonu — sizə uyğun vaxtda öyrənin.',
  },
  {
    icon: Award,
    title: '8 İllik Təcrübə',
    description: 'Azərbaycanda 8 ildən artıq peşəkar təhsil və sertifikatlaşma təcrübəsi.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Niyə Biz?</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mt-3 mb-5">
            Cahan Academy-nin <span className="text-primary">Üstünlükləri</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Adi kurs deyil — karyera dəyişdirən bir təcrübə.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

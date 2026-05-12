'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, BookOpen, GraduationCap, Award } from 'lucide-react';

const stats = [
  { key: 'students',  value: 1200, icon: Users,           suffix: '+' },
  { key: 'teachers',  value: 45,   icon: GraduationCap,   suffix: '+' },
  { key: 'courses',   value: 30,   icon: BookOpen,        suffix: '+' },
  { key: 'years',     value: 8,    icon: Award,           suffix: ''  },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 25);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function StatsSection() {
  const t = useTranslations('stats');

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ key, value, icon: Icon, suffix }, i) => (
            <motion.div
              key={key}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4">
                <Icon size={28} className="text-secondary" />
              </div>
              <div className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
                <Counter target={value} suffix={suffix} />
              </div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wide">
                {t(key as any)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

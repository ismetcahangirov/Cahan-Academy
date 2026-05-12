'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Aysel Məmmədova',
    role: 'Front-end Developer @ Kapital Bank',
    avatar: 'AM',
    text: 'Cahan Academy-dən əvvəl proqramlaşdırma haqqında heç bir bilgim yox idi. Yalnız 6 ayda ilk işimi tapdım. Müəllimlər həmişə əlçatan idi, praktiki tapşırıqlar isə real işdə lazım olan hər şeyi öyrətdi.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Rauf Hüseynov',
    role: 'UI/UX Designer @ Pashabank',
    avatar: 'RH',
    text: 'Dizayn kursunu bitirdikdən sonra portfolio hazırladım və 2 ay içərisində tam zamanlı dizayner kimi işə başladım. Müəllim Nicat müəllim hər dərsi çox peşəkar aparırdı.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Leyla Əliyeva',
    role: 'Digital Marketing Specialist',
    avatar: 'LA',
    text: 'Rəqəmsal marketinq kursunda öyrəndiklərimi dərhal öz biznesimə tətbiq etdim. 3 ay ərzində sosial media hesablarım 10 dəfə böyüdü. Çox tövsiyyə edirəm!',
    rating: 5,
  },
  {
    id: 4,
    name: 'Orxan Quliyev',
    role: 'Back-end Developer @ ABB',
    avatar: 'OQ',
    text: 'Kurs materialları çox strukturlaşdırılmış idi. Hər mövzu üzrə praktiki layihə var idi. İndi tam zamanlı developer kimi işləyirəm. Cahan Academy həyatımı dəyişdi.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const t = testimonials[current];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Tələbə Rəyləri</span>
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mt-3">
            Onlar <span className="text-primary">Danışır</span>
          </h2>
        </motion.div>

        {/* Slider */}
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center"
          >
            <Quote size={48} className="text-primary/20 mx-auto mb-6" />
            <p className="text-foreground/80 text-lg md:text-xl leading-relaxed mb-8 italic">
              "{t.text}"
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(t.rating)].map((_, i) => (
                <span key={i} className="text-secondary text-xl">★</span>
              ))}
            </div>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                {t.avatar}
              </div>
              <div className="text-left">
                <p className="font-heading font-bold">{t.name}</p>
                <p className="text-muted-foreground text-sm">{t.role}</p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? 'w-6 bg-primary' : 'w-2 bg-border'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

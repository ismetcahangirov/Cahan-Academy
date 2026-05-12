'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Clock, Users, Star } from 'lucide-react';
import Image from 'next/image';

const mockCourses = [
  {
    id: 1,
    slug: 'front-end-development',
    title: 'Front-end Proqramlaşdırma',
    category: 'Programming',
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=600',
    duration: '6 ay',
    students: '150+',
    rating: 4.9,
    price: '150 AZN / ay',
  },
  {
    id: 2,
    slug: 'ui-ux-design',
    title: 'UI/UX Dizayn',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600',
    duration: '4 ay',
    students: '80+',
    rating: 4.8,
    price: '120 AZN / ay',
  },
  {
    id: 3,
    slug: 'digital-marketing',
    title: 'Rəqəmsal Marketinq',
    category: 'Marketing',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600',
    duration: '3 ay',
    students: '120+',
    rating: 4.7,
    price: '100 AZN / ay',
  },
];

export default function CoursesPreview() {
  const t = useTranslations('nav');

  return (
    <section className="py-24 bg-accent/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Təlimlərimiz</span>
            <h2 className="font-heading text-4xl font-bold mt-3">Populyar <span className="text-primary">Kurslar</span></h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/courses" 
              className="group inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
            >
              Bütün Kurslara Bax
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCourses.map((course, i) => (
            <motion.div
              key={course.id}
              className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  {course.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-primary" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-primary" />
                    {course.students}
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star size={14} className="text-secondary fill-secondary" />
                    <span className="font-bold text-foreground">{course.rating}</span>
                  </div>
                </div>

                <h3 className="font-heading text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-bold text-primary">{course.price}</span>
                  <Link 
                    href={`/courses/${course.slug}`}
                    className="p-2.5 rounded-xl bg-accent group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

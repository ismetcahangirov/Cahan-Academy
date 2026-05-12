'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Clock, Users, Star, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Course } from '@/types/course';
import { useTranslations } from 'next-intl';

interface CourseCardProps {
  course: Course;
  index?: number;
}

export default function CourseCard({ course, index = 0 }: CourseCardProps) {
  const t = useTranslations('courses');

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return t('level_beginner');
      case 'intermediate': return t('level_intermediate');
      case 'advanced': return t('level_advanced');
      default: return t('level_all');
    }
  };

  return (
    <motion.div
      className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xl">
            {course.category.name}
          </div>
          {course.isPopular && (
            <div className="bg-secondary/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xl">
              {t('filter_popular')}
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <span className="text-white/90 text-xs font-medium bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
             {getLevelLabel(course.level)}
           </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-primary" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={15} className="text-primary" />
            <span>{course.studentsCount} {t('students')}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Star size={15} className="text-secondary fill-secondary" />
            <span className="font-bold text-foreground">{course.rating}</span>
          </div>
        </div>

        <h3 className="font-heading text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>

        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 h-10">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-5 border-t border-border/60">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-tighter text-muted-foreground font-bold">{t('enroll_btn')}</span>
            <span className="font-bold text-lg text-primary tracking-tight">{course.price}</span>
          </div>
          <Link 
            href={`/courses/${course.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-primary hover:text-white transition-all duration-300 font-semibold text-sm group/btn"
          >
            {t('details_btn')}
            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

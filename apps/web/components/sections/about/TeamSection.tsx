import { getTeachers, type Teacher } from '@/lib/api';
import { getLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';

export default async function TeamSection() {
  const t = await getTranslations('about');
  const locale = await getLocale() as 'az' | 'en' | 'ru';
  let teachers: Teacher[] = [];

  try {
    teachers = await getTeachers();
    // Limit to 4 for about page
    teachers = teachers.slice(0, 4);
  } catch (error) {
    console.error('Teachers fetch error:', error);
  }

  return (
    <section className="py-24 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('team_title')}</h2>
            <p className="text-foreground/60 text-lg">{t('team_subtitle')}</p>
          </div>
          <Link
            href="/teachers"
            className="group flex items-center gap-2 text-primary font-bold text-lg hover:gap-3 transition-all"
          >
            {t('all_teachers')}
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="group relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6">
                <Image
                  src={teacher.image || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=600'}
                  alt={teacher.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                {teacher.name}
              </h3>
              <p className="text-foreground/50 font-medium">
                {teacher.position}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

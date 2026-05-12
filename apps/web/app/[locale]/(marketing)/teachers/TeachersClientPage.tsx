'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Users, GraduationCap, Briefcase } from 'lucide-react';
import TeacherCard from '@/components/cards/TeacherCard';
import { Teacher } from '@/types/teacher';

interface TeachersClientPageProps {
  teachers: Teacher[];
  locale: string;
}

export default function TeachersClientPage({ teachers, locale }: TeachersClientPageProps) {
  const t = useTranslations('teachers');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch = 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.position.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [teachers, searchQuery]);

  return (
    <div className="min-h-screen pt-28 pb-20">
      {/* Header Section */}
      <section className="relative mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-left translate-y-[-50%]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Users size={14} />
              <span>{t('badge')}</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              {t('page_title')}
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
              {t('page_description')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground whitespace-nowrap">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-primary" />
              <span><strong className="text-foreground">{teachers.length}</strong> {t('stat_teachers')}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              <span>{t('stat_experts')}</span>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-accent/30 rounded-3xl border border-dashed border-border">
            <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('no_results_title')}</h3>
            <p className="text-muted-foreground">{t('no_results_desc')}</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 text-primary font-bold hover:underline"
            >
              {t('clear_search')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

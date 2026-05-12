'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import CourseCard from '@/components/cards/CourseCard';
import { Course } from '@/types/course';

interface Category {
  id: string;
  name_az: string;
  name_en: string;
  name_ru: string;
  slug: string;
}

interface CoursesClientPageProps {
  initialCourses: Course[];
  initialCategories: Category[];
  locale: string;
}

export default function CoursesClientPage({
  initialCourses,
  initialCategories,
  locale,
}: CoursesClientPageProps) {
  const t = useTranslations('courses');

  const [search, setSearch]       = useState('');
  const [activeCategory, setActiveCat] = useState('all');
  const [popularOnly, setPopular]  = useState(false);
  const [activeLevel, setLevel]    = useState('all');
  const [courses, setCourses]      = useState<Course[]>(initialCourses);
  const [loading, setLoading]      = useState(false);

  // Re-fetch when locale changes (client-side navigation)
  useEffect(() => {
    if (initialCourses.length > 0) return; // already hydrated
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => { setCourses(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  const catNameKey = `name_${locale}` as keyof Category;

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch   = c.title.toLowerCase().includes(search.toLowerCase()) ||
                            c.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || c.category.slug === activeCategory;
      const matchPopular  = !popularOnly || c.isPopular;
      const matchLevel    = activeLevel === 'all' || c.level === activeLevel || c.level === 'all';
      return matchSearch && matchCategory && matchPopular && matchLevel;
    });
  }, [courses, search, activeCategory, popularOnly, activeLevel]);

  const levels = [
    { key: 'all',          label: t('level_all') },
    { key: 'beginner',     label: t('level_beginner') },
    { key: 'intermediate', label: t('level_intermediate') },
    { key: 'advanced',     label: t('level_advanced') },
  ];

  const hasFilters = search || activeCategory !== 'all' || popularOnly || activeLevel !== 'all';

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-secondary/8 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Sparkles size={16} />
              Cahan Academy
            </div>
            <h1 className="font-heading text-5xl sm:text-6xl font-extrabold tracking-tight mb-5">
              {t('page_title')}
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              {t('page_subtitle')}
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-14 pr-14 py-4 rounded-2xl border border-border bg-card/80 backdrop-blur text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-4 mb-12"
        >
          {/* Category Tabs */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold mr-2">
              <SlidersHorizontal size={16} />
            </div>
            <button
              onClick={() => setActiveCat('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'bg-accent text-muted-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {t('filter_all')}
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCat(cat.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat.slug
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-accent text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {(cat[catNameKey] as string) ?? cat.name_az}
              </button>
            ))}
          </div>

          {/* Level + Popular row */}
          <div className="flex items-center gap-3 flex-wrap">
            {levels.map((lv) => (
              <button
                key={lv.key}
                onClick={() => setLevel(lv.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeLevel === lv.key
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                    : 'bg-accent/60 text-muted-foreground hover:bg-secondary/10 hover:text-secondary'
                }`}
              >
                {lv.label}
              </button>
            ))}
            <button
              onClick={() => setPopular((p) => !p)}
              className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                popularOnly
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                  : 'bg-accent/60 text-muted-foreground hover:bg-secondary/10 hover:text-secondary'
              }`}
            >
              <Sparkles size={14} />
              {t('filter_popular')}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setActiveCat('all'); setPopular(false); setLevel('all'); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={15} /> Reset
              </button>
            )}
          </div>
        </motion.div>

        {/* Results count */}
        <motion.p
          layout
          className="text-sm text-muted-foreground mb-8"
        >
          {filtered.length} kurs tapıldı
        </motion.p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[480px] rounded-2xl bg-accent animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 text-muted-foreground"
          >
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-semibold">{t('no_results')}</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </>
  );
}

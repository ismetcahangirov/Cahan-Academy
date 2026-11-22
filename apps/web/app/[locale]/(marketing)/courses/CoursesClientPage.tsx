'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Feather, Search, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import CourseCard from '@/components/cards/CourseCard';
import { Button, EmptyState, Input } from '@/components/ui';
import Reveal from '@/components/ui/Reveal';
import FilterChip from '@/components/courses/FilterChip';
import Pagination from '@/components/courses/Pagination';
import { matches } from '@/components/courses/search';
import type { Course, CourseLevel } from '@/types/course';

/**
 * Course catalogue (client island): search, category / level / popular filters, paginated grid.
 * Data comes from the server page (no client re-fetch, A-24). Filters live in the URL query
 * (?q=&category=&level=&popular=1&page=) via history.replaceState, so a filtered view can be shared
 * and the back button restores it; links like /courses?category=dizayn work too.
 */

/** Shape of GET /api/courses/categories (camelCase columns; A-24: it never had name_az/name_en). */
export interface Category {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  slug: string;
}

interface CoursesClientPageProps {
  initialCourses: Course[];
  initialCategories: Category[];
  locale: string;
}

const PAGE_SIZE = 12;
const CHIPS_COLLAPSED = 8;
const LEVELS: (CourseLevel | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced'];

const categoryName = (cat: Category, locale: string) => {
  const key = `name${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as 'nameAz' | 'nameEn' | 'nameRu';
  return cat[key] || cat.nameAz;
};

export default function CoursesClientPage({ initialCourses, initialCategories, locale }: CoursesClientPageProps) {
  const t = useTranslations('courses');
  const tp = useTranslations('coursesPage');
  const tn = useTranslations('nav');

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState<CourseLevel | 'all'>('all');
  const [popularOnly, setPopularOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showAllChips, setShowAllChips] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useRef(false);

  const courses = initialCourses;

  // URL → state once on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get('q') ?? '');
    setCategory(p.get('category') || 'all');
    const lv = p.get('level') as CourseLevel | null;
    if (lv && LEVELS.includes(lv)) setLevel(lv);
    setPopularOnly(p.get('popular') === '1');
    const pg = Number(p.get('page'));
    if (Number.isInteger(pg) && pg > 1) setPage(pg);
    hydrated.current = true;
  }, []);

  // state → URL (replace, no new history entry per keystroke)
  useEffect(() => {
    if (!hydrated.current) return;
    const p = new URLSearchParams(window.location.search);
    const set = (k: string, v: string | null) => (v ? p.set(k, v) : p.delete(k));
    set('q', query.trim() || null);
    set('category', category !== 'all' ? category : null);
    set('level', level !== 'all' ? level : null);
    set('popular', popularOnly ? '1' : null);
    set('page', page > 1 ? String(page) : null);
    const qs = p.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [query, category, level, popularOnly, page]);

  // Category chips: the categories endpoint (ordered, localized names) plus any category that only
  // appears on a course; only categories that have courses are offered.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of courses) {
      const slug = c.category?.slug;
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    const list = initialCategories
      .filter((cat) => counts.has(cat.slug))
      .map((cat) => ({ slug: cat.slug, name: categoryName(cat, locale), count: counts.get(cat.slug) ?? 0 }));
    const known = new Set(list.map((c) => c.slug));
    for (const c of courses) {
      const slug = c.category?.slug;
      if (slug && !known.has(slug)) {
        known.add(slug);
        list.push({ slug, name: c.category.name || slug, count: counts.get(slug) ?? 0 });
      }
    }
    return list;
  }, [courses, initialCategories, locale]);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (category === 'all' || c.category?.slug === category) &&
          (level === 'all' || c.level === level || c.level === 'all') &&
          (!popularOnly || c.isPopular) &&
          matches(query, [c.title, c.description, c.category?.name, c.teacher?.name], locale)
      ),
    [courses, category, level, popularOnly, query, locale]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = query.trim() !== '' || category !== 'all' || level !== 'all' || popularOnly;
  // the ONE featured card of the view: the first popular course of the unfiltered first page
  const featuredId = !hasFilters && current === 1 ? (visible.find((c) => c.isPopular) ?? visible[0])?.id : undefined;

  const collapsible = chips.length > CHIPS_COLLAPSED + 2;
  const shownChips =
    collapsible && !showAllChips ? chips.filter((c, i) => i < CHIPS_COLLAPSED || c.slug === category) : chips;

  const resetPage = () => setPage(1);
  const resetAll = () => {
    setQuery('');
    setCategory('all');
    setLevel('all');
    setPopularOnly(false);
    setPage(1);
  };
  const goToPage = (next: number) => {
    setPage(next);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ block: 'start' });
      resultsRef.current?.focus({ preventScroll: true });
    });
  };

  // API down / no courses at all: one calm message instead of an empty filter bar
  if (!courses.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        <div className="card-paper">
          <EmptyState
            sketch="books"
            title={tp('unavailable_title')}
            description={tp('unavailable_desc')}
            action={
              <Button as={Link} href="/contact" variant="outline">
                {tn('contact')}
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="course-results" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* Filter panel — overlaps the wave of the head band */}
      <div className="card relative z-[1] -mt-6 p-4 sm:-mt-10 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="course-search" className="sr-only">
              {tp('search_label')}
            </label>
            <Input
              id="course-search"
              type="search"
              icon={Search}
              value={query}
              autoComplete="off"
              enterKeyHint="search"
              placeholder={t('search_placeholder')}
              onChange={(e) => {
                setQuery(e.target.value);
                resetPage();
              }}
              className="pr-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  resetPage();
                }}
                aria-label={tp('search_clear')}
                className="btn btn-ghost btn-icon btn-sm absolute right-1 top-1/2 -translate-y-1/2"
              >
                <X size={16} strokeWidth={1.6} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="sc num whitespace-nowrap text-[0.85rem] text-ink-muted" aria-live="polite">
              {tp('results', { count: filtered.length })}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" icon={X} onClick={resetAll}>
                {tp('reset')}
              </Button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-line-hair pt-5 lg:grid-cols-[7.5rem_1fr] lg:items-start lg:gap-y-4">
          <p id="filter-category" className="sc text-[0.8rem] text-ink-subtle lg:pt-3">
            {tp('filter_category')}
          </p>
          <div role="group" aria-labelledby="filter-category" className="flex flex-wrap items-center gap-2">
            <FilterChip
              pressed={category === 'all'}
              count={courses.length}
              onClick={() => {
                setCategory('all');
                resetPage();
              }}
            >
              {t('filter_all')}
            </FilterChip>
            {shownChips.map((chip) => (
              <FilterChip
                key={chip.slug}
                pressed={category === chip.slug}
                count={chip.count}
                onClick={() => {
                  setCategory(category === chip.slug ? 'all' : chip.slug);
                  resetPage();
                }}
              >
                {chip.name}
              </FilterChip>
            ))}
            {collapsible && (
              <button
                type="button"
                aria-expanded={showAllChips}
                onClick={() => setShowAllChips((v) => !v)}
                className="sc min-h-10 px-2 text-[0.8rem] text-accent-text underline decoration-line-strong underline-offset-4 hover:decoration-current"
              >
                {showAllChips ? tp('show_fewer_categories') : tp('show_all_categories', { count: chips.length })}
              </button>
            )}
          </div>

          <p id="filter-level" className="sc mt-2 text-[0.8rem] text-ink-subtle lg:mt-0 lg:pt-3">
            {tp('filter_level')}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-labelledby="filter-level" className="contents">
              {LEVELS.map((lv) => (
                <FilterChip
                  key={lv}
                  pressed={level === lv}
                  onClick={() => {
                    setLevel(lv);
                    resetPage();
                  }}
                >
                  {t(`level_${lv}`)}
                </FilterChip>
              ))}
            </div>
            <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <FilterChip
              pressed={popularOnly}
              icon={<Feather size={14} strokeWidth={1.6} aria-hidden="true" />}
              onClick={() => {
                setPopularOnly((v) => !v);
                resetPage();
              }}
            >
              {t('filter_popular')}
            </FilterChip>
          </div>
        </div>
      </div>

      <h2 id="course-results" ref={resultsRef} tabIndex={-1} className="sr-only">
        {tp('list_label')}
      </h2>

      {visible.length ? (
        <>
          <Reveal as="ul" stagger className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((course, i) => (
              <li key={course.id}>
                <CourseCard course={course} featured={course.id === featuredId} priority={current === 1 && i === 0} />
              </li>
            ))}
          </Reveal>
          <Pagination page={current} total={pages} onChange={goToPage} className="mt-12" />
        </>
      ) : (
        <div className="card-paper mt-10 sm:mt-12">
          <EmptyState
            sketch="inkwell"
            title={tp('empty_title')}
            description={tp('empty_desc')}
            action={
              <Button variant="outline" onClick={resetAll}>
                {tp('reset')}
              </Button>
            }
          />
        </div>
      )}
    </section>
  );
}

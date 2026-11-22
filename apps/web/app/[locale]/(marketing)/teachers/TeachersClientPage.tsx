'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import TeacherCard from '@/components/cards/TeacherCard';
import { Button, EmptyState, Input } from '@/components/ui';
import Reveal from '@/components/ui/Reveal';
import Pagination from '@/components/courses/Pagination';
import { matches } from '@/components/courses/search';
import { coverSrc } from '@/components/courses/media';
import type { Teacher } from '@/types/teacher';

/**
 * Teacher directory (client island): search by name / position / bio, paginated grid of arched
 * portraits (two columns on phones). The query lives in the URL (?q=&page=). Placeholder portraits
 * (missing / stock / mock images) render as sketches (coverSrc).
 */
interface TeachersClientPageProps {
  teachers: Teacher[];
  locale: string;
}

const PAGE_SIZE = 12;

export default function TeachersClientPage({ teachers, locale }: TeachersClientPageProps) {
  const t = useTranslations('teachers');
  const tp = useTranslations('teachersPage');
  const tn = useTranslations('nav');

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get('q') ?? '');
    const pg = Number(p.get('page'));
    if (Number.isInteger(pg) && pg > 1) setPage(pg);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const p = new URLSearchParams(window.location.search);
    if (query.trim()) p.set('q', query.trim());
    else p.delete('q');
    if (page > 1) p.set('page', String(page));
    else p.delete('page');
    const qs = p.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [query, page]);

  const filtered = useMemo(
    () => teachers.filter((teacher) => matches(query, [teacher.name, teacher.position, teacher.bio], locale)),
    [teachers, query, locale]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ block: 'start' });
      resultsRef.current?.focus({ preventScroll: true });
    });
  };
  const clear = () => {
    setQuery('');
    setPage(1);
  };

  if (!teachers.length) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        <div className="card-paper">
          <EmptyState
            sketch="notebook"
            title={tp('unavailable_title')}
            description={tp('unavailable_desc')}
            action={
              <Button as={Link} href="/courses" variant="outline">
                {tn('courses')}
              </Button>
            }
          />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="teacher-results" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="card relative z-[1] mx-auto -mt-6 flex max-w-3xl flex-col gap-3 p-4 sm:-mt-10 sm:flex-row sm:items-center sm:p-5">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="teacher-search" className="sr-only">
            {tp('search_label')}
          </label>
          <Input
            id="teacher-search"
            type="search"
            icon={Search}
            value={query}
            autoComplete="off"
            enterKeyHint="search"
            placeholder={t('search_placeholder')}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pr-11 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label={t('clear_search')}
              className="btn btn-ghost btn-icon btn-sm absolute right-1 top-1/2 -translate-y-1/2"
            >
              <X size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="sc num whitespace-nowrap text-center text-[0.85rem] text-ink-muted sm:text-right" aria-live="polite">
          {tp('results', { count: filtered.length })}
        </p>
      </div>

      <h2 id="teacher-results" ref={resultsRef} tabIndex={-1} className="sr-only">
        {tp('list_label')}
      </h2>

      {visible.length ? (
        <>
          <Reveal as="ul" stagger className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((teacher) => (
              <li key={teacher.id}>
                <TeacherCard teacher={{ ...teacher, image: coverSrc(teacher.image) }} />
              </li>
            ))}
          </Reveal>
          <Pagination page={current} total={pages} onChange={goToPage} className="mt-12" />
        </>
      ) : (
        <div className="card-paper mx-auto mt-10 max-w-3xl sm:mt-12">
          <EmptyState
            sketch="inkwell"
            title={tp('empty_title')}
            description={t('no_results_desc')}
            action={
              <Button variant="outline" onClick={clear}>
                {t('clear_search')}
              </Button>
            }
          />
        </div>
      )}
    </section>
  );
}

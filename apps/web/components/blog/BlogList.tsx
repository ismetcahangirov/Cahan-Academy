'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import type { BlogPost } from '@/lib/api';
import BlogCard from '@/components/cards/BlogCard';
import { Button, EmptyState, Input, Reveal } from '@/components/ui';
import FeaturedPost from './FeaturedPost';

/**
 * BlogList — search row + latest post as a featured wide card + the rest in a card grid. Searching
 * filters title/excerpt locally (case-insensitive in the page locale) and folds the featured card into
 * the grid. States: API failed / no posts / no matches — each with its own sketch empty state.
 */
export default function BlogList({ posts, failed }: { posts: BlogPost[]; failed: boolean }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const [query, setQuery] = useState('');

  const q = query.trim().toLocaleLowerCase(locale);
  const filtered = useMemo(
    () =>
      q
        ? posts.filter((p) => `${p.title} ${p.excerpt ?? ''}`.toLocaleLowerCase(locale).includes(q))
        : posts,
    [posts, q, locale]
  );

  if (failed || posts.length === 0) {
    return (
      <div className="card-paper mx-auto max-w-2xl">
        <EmptyState
          sketch="inkwell"
          title={failed ? t('error_title') : t('empty_title')}
          description={failed ? t('error_desc') : t('empty_desc')}
        />
      </div>
    );
  }

  const featured = q ? null : filtered[0];
  const rest = q ? filtered : filtered.slice(1);

  return (
    <div>
      <div className="mx-auto flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:items-center" role="search">
        <div className="relative flex-1">
          <Input
            type="search"
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            aria-label={t('search_label')}
            className="pr-11"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={X}
              aria-label={t('clear_search')}
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2"
            />
          )}
        </div>
        <p className="time-italic shrink-0 text-center text-[1rem] text-ink-muted sm:text-right" aria-live="polite">
          {t('results_count', { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card-paper mx-auto mt-10 max-w-2xl">
          <EmptyState
            sketch="inkwell"
            title={t('no_results')}
            description={t('no_results_desc')}
            action={
              <Button variant="outline" icon={X} motif={false} onClick={() => setQuery('')}>
                {t('clear_search')}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          {featured && (
            <div className="mt-10">
              <FeaturedPost post={featured} />
            </div>
          )}
          {rest.length > 0 && (
            <Reveal as="ul" stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.id}>
                  <BlogCard post={post} />
                </li>
              ))}
            </Reveal>
          )}
        </>
      )}
    </div>
  );
}

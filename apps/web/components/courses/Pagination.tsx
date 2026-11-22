'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { buttonClass } from '@/components/ui/Button';

/**
 * Pagination — ghost buttons with lining numerals (`.num`), current page = soft wine fill + aria-current.
 * Phones show prev / "page x of y" / next; from `sm` the page numbers appear (with ellipses past 7 pages).
 * Controlled: <Pagination page={page} total={pages} onChange={setPage} />. Renders nothing for one page.
 */
function pageList(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

export default function Pagination({
  page,
  total,
  onChange,
  className,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  const t = useTranslations('coursesPage');
  if (total <= 1) return null;

  return (
    <nav aria-label={t('pagination_label')} className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={buttonClass({ variant: 'ghost', size: 'sm' })}
      >
        <ChevronLeft size={15} strokeWidth={1.6} aria-hidden="true" />
        <span className="hidden sm:inline">{t('prev')}</span>
        <span className="sr-only sm:hidden">{t('prev')}</span>
      </button>

      <p className="sc num px-2 text-[0.85rem] text-ink-muted sm:hidden" aria-live="polite">
        {t('page_status', { page, total })}
      </p>

      <ul className="hidden items-center gap-1 sm:flex">
        {pageList(page, total).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden="true" className="num px-1 text-ink-subtle">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={t('page', { page: p })}
                className={cn(
                  buttonClass({ variant: 'ghost', size: 'sm', iconOnly: true }),
                  'num text-[1rem]',
                  p === page && 'bg-accent-soft text-accent-text'
                )}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= total}
        className={buttonClass({ variant: 'ghost', size: 'sm' })}
      >
        <span className="hidden sm:inline">{t('next')}</span>
        <span className="sr-only sm:hidden">{t('next')}</span>
        <ChevronRight size={15} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </nav>
  );
}

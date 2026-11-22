import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import SketchIllustration, { type SketchName } from '../ornament/SketchIllustration';
import OrnamentDivider from '../ornament/OrnamentDivider';

/**
 * EmptyState — sketch + one short script line + divider + what to do. Goes INSIDE the card/section that
 * would hold the data (no results, API down, empty admin table), never a whole blank page.
 *
 * <EmptyState sketch="books" title={t('no_results_title')} description={t('no_results_desc')}
 *             action={<Button variant="outline" onClick={clear}>{t('clear_search')}</Button>} />
 */
export default function EmptyState({
  sketch = 'books',
  title,
  description,
  action,
  compact = false,
  className,
}: {
  sketch?: SketchName;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14', className)}>
      <SketchIllustration name={sketch} className={compact ? 'w-24' : 'w-32 sm:w-40'} />
      {title && (
        <p className={cn('font-script text-accent-text dark:text-ink', compact ? 'text-[1.3rem]' : 'text-[1.65rem]')}>{title}</p>
      )}
      {!compact && <OrnamentDivider draw={false} className="-mt-1" />}
      {description && <p className="max-w-md text-[1.02rem] text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

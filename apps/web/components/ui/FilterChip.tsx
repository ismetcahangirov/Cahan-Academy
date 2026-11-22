import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * FilterChip — small-caps toggle pill for list filters (category, level, "popular").
 * Pressed = solid wine (white text), resting = hairline on the surface. 40px tall (tap target).
 * `count` is shown in lining numerals. Toggle semantics via aria-pressed.
 *
 * <FilterChip pressed={cat === slug} onClick={() => setCat(slug)} count={12}>{name}</FilterChip>
 * Candidate for components/ui (promote to shared): blog/admin filters need the same pill.
 */
export default function FilterChip({
  pressed,
  count,
  icon,
  className,
  children,
  ...rest
}: {
  pressed: boolean;
  count?: number;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'sc inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[0.8rem] leading-none',
        'transition-[background-color,border-color,color] duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]',
        pressed
          ? 'border-accent bg-accent text-accent-fg dark:border-line-strong'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
        className
      )}
      {...rest}
    >
      {icon}
      <span className="max-w-[16rem] truncate">{children}</span>
      {typeof count === 'number' && (
        <span className={cn('num font-serif text-[0.85rem] font-normal normal-case tracking-normal', pressed ? 'text-accent-fg' : 'text-ink-muted')}>
          {count}
        </span>
      )}
    </button>
  );
}

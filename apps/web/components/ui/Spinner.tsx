import { cn } from '@/lib/utils';
import { EdelweissGlyph } from '../ornament/Edelweiss';

/**
 * Spinner — hairline ring with a turning arc (transform-only) and, at lg size, a still edelweiss.
 * size 'sm'|'md'|'lg'; color 'accent' | 'onAccent'. Pass `label` when it is the only loading cue.
 */
const SIZES = { sm: 'h-4 w-4', md: 'h-7 w-7', lg: 'h-12 w-12' } as const;
const COLORS = { accent: 'text-accent-text', onAccent: 'text-accent-fg' } as const;

export default function Spinner({
  size = 'lg',
  color = 'accent',
  className,
  label,
}: {
  size?: keyof typeof SIZES;
  color?: keyof typeof COLORS;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('relative inline-flex shrink-0 items-center justify-center', SIZES[size], COLORS[color], className)}
    >
      <svg viewBox="0 0 24 24" fill="none" className="spin absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="1.2 2.4" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {size === 'lg' && <EdelweissGlyph className="h-5 w-5 text-current" />}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton h-4 w-full', className)} />;
}

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import OrnamentDivider from './OrnamentDivider';

/**
 * ScriptTitle — the heading block: title in the title face (Cahan Display; the "script" name is historic),
 * small-caps eyebrow/subtitle, ornament divider, optional actions slot.
 *
 *   <ScriptTitle title={t('title')} subtitle={t('subtitle')} actions={<Button>…</Button>} />
 *   <ScriptTitle align="center" size="section" eyebrow={t('eyebrow')} title={t('title')} />
 * Props: title, subtitle, eyebrow (small caps above), lead (serif paragraph under the divider), actions,
 *        align 'start'|'center', size 'hero'|'page'|'section'|'card', as (default h1 for page/hero else h2),
 *        entity (serif line under the script title), divider (default true), className.
 *
 * Rule: the title face carries a SHORT FIXED phrase (2–4 words). Data — a course, teacher or post name —
 * never goes into it; pass it as `entity` (serif). Only a detail page may use its entity's name
 * as the page title, and then in serif (see DESIGN.md).
 */
// Sized for Cahan Display (x-height 455/1000, wide upright serif): ~0.7x the old calligraphic sizes.
const SIZES = {
  hero: 'text-[2.4rem] leading-[1.06] sm:text-[3.2rem] lg:text-[3.8rem]',
  page: 'text-[2rem] sm:text-[2.75rem]',
  section: 'text-[1.75rem] sm:text-[2.25rem]',
  card: 'text-[1.4rem]',
} as const;

export default function ScriptTitle({
  title,
  subtitle,
  eyebrow,
  lead,
  actions,
  align = 'start',
  size = 'page',
  as,
  divider = true,
  dividerLine = 'taper',
  entity,
  id,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  align?: 'start' | 'center';
  size?: keyof typeof SIZES;
  as?: ElementType;
  divider?: boolean;
  /** Divider line style, see OrnamentDivider `line`. */
  dividerLine?: 'flourish' | 'taper';
  entity?: ReactNode;
  id?: string;
  className?: string;
}) {
  const Tag: ElementType = as || (size === 'page' || size === 'hero' ? 'h1' : 'h2');
  const center = align === 'center';
  return (
    <header className={cn(center && 'text-center', className)}>
      <div className={cn('flex flex-col gap-4', center ? 'items-center' : 'sm:flex-row sm:items-end sm:justify-between')}>
        <div className="min-w-0">
          {eyebrow && <p className="sc mb-2 text-[0.85rem] text-ink-muted">{eyebrow}</p>}
          <Tag id={id} className={cn('script-title break-words pb-1', SIZES[size])}>
            {title}
          </Tag>
          {entity && <p className="mt-0.5 break-words text-[1.25rem] font-semibold leading-snug text-ink">{entity}</p>}
          {subtitle && <p className="sc mt-2 text-[0.9rem] text-ink-muted">{subtitle}</p>}
        </div>
        {actions && (
          <div className={cn('flex flex-wrap items-center gap-2', center ? 'justify-center' : 'sm:justify-end')}>
            {actions}
          </div>
        )}
      </div>
      {divider && <OrnamentDivider align={center ? 'center' : 'start'} line={dividerLine} className="mt-3" />}
      {lead && (
        <p className={cn('mt-4 text-[1.1rem] leading-relaxed text-ink-muted', center && 'mx-auto max-w-2xl')}>{lead}</p>
      )}
    </header>
  );
}

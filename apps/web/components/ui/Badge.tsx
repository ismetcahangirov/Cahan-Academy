import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCheck,
  Circle,
  Clock,
  Feather,
  Hourglass,
  Info,
  Minus,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Badge — small-caps pill for tags, categories, levels and counts.
 * tone: 'default' (muted) | 'accent' (soft wine) | 'solid' (wine fill, e.g. "Populyar" on a cover)
 *
 * <Badge>{course.category.name}</Badge>  <Badge tone="accent">{t('level_beginner')}</Badge>
 */
export function Badge({
  tone = 'default',
  className,
  children,
  ...rest
}: { tone?: 'default' | 'accent' | 'solid'; className?: string; children?: ReactNode } & ComponentPropsWithoutRef<'span'>) {
  return (
    <span className={cn('badge', tone === 'accent' && 'badge-accent', tone === 'solid' && 'badge-solid', className)} {...rest}>
      {children}
    </span>
  );
}

/**
 * StatusPill — status WITHOUT colour semantics: fill pattern + icon + text (admin tables, lead states).
 * status: success | present | late | partial | absent | pending | excused | warning | error | info | neutral
 *
 * <StatusPill status="pending">{t('leads.status_new')}</StatusPill>
 * <StatusDot status="success" label={t('active')} />   (dense grids; always pass a label)
 */
export const STATUS: Record<string, { look: string; icon: LucideIcon }> = {
  success: { look: 'filled', icon: Check },
  present: { look: 'filled', icon: CheckCheck },
  late: { look: 'striped', icon: Clock },
  partial: { look: 'striped', icon: Hourglass },
  absent: { look: 'outline', icon: X },
  pending: { look: 'outline', icon: Circle },
  excused: { look: 'dotted', icon: Feather },
  warning: { look: 'dashed', icon: AlertTriangle },
  error: { look: 'alert', icon: AlertOctagon },
  info: { look: 'muted', icon: Info },
  neutral: { look: 'muted', icon: Minus },
};

export type StatusName = keyof typeof STATUS;

export function StatusPill({
  status = 'neutral',
  icon,
  className,
  children,
}: {
  status?: StatusName;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  const def = STATUS[status] || STATUS.neutral;
  const Icon = icon || def.icon;
  return (
    <span className={cn('status', `status-${def.look}`, className)} data-status={status}>
      <Icon aria-hidden="true" strokeWidth={2} />
      <span>{children}</span>
    </span>
  );
}

const DOT_CLASS: Record<string, string> = {
  filled: 'is-filled',
  striped: 'is-striped',
  outline: '',
  dotted: 'is-dotted',
  dashed: 'is-dashed',
  alert: 'is-filled',
  muted: 'is-muted',
};

export function StatusDot({ status = 'neutral', label, className }: { status?: StatusName; label: string; className?: string }) {
  const def = STATUS[status] || STATUS.neutral;
  return (
    <span className={cn('inline-flex items-center', className)} title={label}>
      <span aria-hidden="true" className={cn('status-dot', DOT_CLASS[def.look])} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Badge;

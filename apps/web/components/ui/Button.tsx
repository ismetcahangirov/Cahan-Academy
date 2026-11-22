import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import Spinner from './Spinner';

/**
 * Button — small-caps label, pill shape. Server-component friendly (no hooks).
 *
 * variant:
 *   'primary'  solid #5C000E (white inside .theme-wine), the main action of a region (one per area)
 *   'outline'  outline pill with the edelweiss motif at the end (secondary CTA, reference style)
 *   'ghost'    quiet text button (toolbar, cancel, icon buttons)
 *   'danger'   destructive: heavy outline + alert icon (meaning carried by icon + weight, not colour)
 * size 'sm'|'md'|'lg'; block; icon (lucide, left); iconAfter (lucide, right); iconOnly (pass aria-label);
 * motif (force/hide the edelweiss; default on for outline); loading; as (e.g. Link from '@/i18n/routing').
 *
 * <Button type="submit" loading={isSubmitting}>{t('send')}</Button>
 * <Button as={Link} href="/courses" variant="outline">{t('all_courses')}</Button>
 * <Button variant="ghost" iconOnly icon={X} aria-label={t('close')} />
 */
type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
  iconOnly?: boolean;
  motif?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

export type ButtonProps<T extends ElementType = 'button'> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

export function buttonClass({
  variant = 'primary',
  size = 'md',
  block = false,
  iconOnly = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconOnly?: boolean;
  className?: string;
} = {}) {
  return cn('btn', `btn-${variant}`, size !== 'md' && `btn-${size}`, block && 'btn-block', iconOnly && 'btn-icon', className);
}

export default function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  block = false,
  icon: Icon,
  iconAfter: IconAfter,
  iconOnly = false,
  motif,
  loading = false,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Comp: ElementType = as || 'button';
  const isButton = Comp === 'button';
  const { disabled, type, ...props } = rest as { disabled?: boolean; type?: string } & Record<string, unknown>;
  const showMotif = motif ?? (variant === 'outline' && !iconOnly && !IconAfter);
  const LeadIcon = variant === 'danger' && !Icon ? AlertTriangle : Icon;
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 19 : 17;

  return (
    <Comp
      type={isButton ? type || 'button' : type}
      disabled={isButton ? disabled || loading : undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, iconOnly, className })}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" color={variant === 'primary' ? 'onAccent' : 'accent'} />
      ) : (
        LeadIcon && <LeadIcon size={iconSize} strokeWidth={1.6} aria-hidden="true" />
      )}
      {!iconOnly && children}
      {IconAfter && !iconOnly && <IconAfter size={iconSize} strokeWidth={1.6} aria-hidden="true" />}
      {showMotif && !loading && <EdelweissGlyph className="btn-motif text-current" />}
    </Comp>
  );
}

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import CornerFlourish from '../ornament/CornerFlourish';

/**
 * Card — the content container. Server-component friendly.
 *
 * variant:
 *   'plain'     thin frame, white / wine-black surface — lists, table wrappers, forms (default)
 *   'ornate'    + inner hairline, inner glow, two corner flourishes — highlights, summaries
 *   'paper'     parchment fill + texture — reading content, forms
 *   'featured'  ornate — the ONE item to notice per view
 * hover: lift on hover (transform only) for clickable cards; as: element/component (e.g. Link).
 *
 * <Card className="p-5">…</Card>
 * <Card variant="featured" hover className="p-6">…</Card>
 * <CardHeader title={course.title} subtitle={course.category.name} actions={…} />
 * For framed panels with four flourishes use <OrnateFrame> (components/ornament).
 */
const VARIANT = {
  plain: 'card',
  ornate: 'card-ornate',
  paper: 'card-paper',
  featured: 'card-ornate',
} as const;

type CardProps<T extends ElementType> = {
  as?: T;
  variant?: keyof typeof VARIANT;
  hover?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export default function Card<T extends ElementType = 'div'>({
  as,
  variant = 'plain',
  hover = false,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Tag: ElementType = as || 'div';
  return (
    <Tag className={cn(VARIANT[variant] || VARIANT.plain, hover && 'card-hover', className)} {...rest}>
      {(variant === 'ornate' || variant === 'featured') && (
        <>
          <CornerFlourish corner="tl" className="absolute left-2.5 top-2.5 z-[1] h-6 w-6" />
          <CornerFlourish corner="br" className="absolute bottom-2.5 right-2.5 z-[1] h-6 w-6" />
        </>
      )}
      {children}
    </Tag>
  );
}

/** Card heading row: serif title + small-caps subtitle + actions. Not script — script is for section titles. */
export function CardHeader({
  title,
  subtitle,
  actions,
  as: H = 'h3',
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <H className="text-[1.25rem] font-semibold leading-snug text-ink">{title}</H>
        {subtitle && <p className="sc mt-0.5 text-[0.8rem] text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

export { Card };

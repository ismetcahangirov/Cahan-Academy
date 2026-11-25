import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import CornerFlourish, { type Corner } from './CornerFlourish';

/**
 * OrnateFrame — panel with thin border, inner hairline, soft inner glow and corner flourishes.
 * Use for hero panels, featured content, teacher portraits, certificates, summaries. For dense list
 * cards prefer <Card> (plain thin frame) — flourishes on every row get noisy.
 *
 * <OrnateFrame className="p-6">…</OrnateFrame>
 * <OrnateFrame corners="diagonal" cornerSize="h-6 w-6" as="section" paper>…</OrnateFrame>
 * <OrnateFrame letter>…</OrnateFrame>  (a sheet of writing paper: laid lines, fold creases, lifted shadow — the CTA letter)
 * Props: as, corners 'all'|'diagonal'|'none', cornerSize (classes), paper (parchment fill), letter (letter paper), className.
 */
const PLACES: Record<Corner, string> = {
  tl: 'left-2.5 top-2.5',
  tr: 'right-2.5 top-2.5',
  bl: 'left-2.5 bottom-2.5',
  br: 'right-2.5 bottom-2.5',
};

type OrnateFrameProps<T extends ElementType> = {
  as?: T;
  corners?: 'all' | 'diagonal' | 'none';
  cornerSize?: string;
  paper?: boolean;
  letter?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export default function OrnateFrame<T extends ElementType = 'div'>({
  as,
  corners = 'all',
  cornerSize = 'h-7 w-7',
  paper = false,
  letter = false,
  className,
  children,
  ...rest
}: OrnateFrameProps<T>) {
  const Tag: ElementType = as || 'div';
  const list: Corner[] = corners === 'all' ? ['tl', 'tr', 'bl', 'br'] : corners === 'diagonal' ? ['tl', 'br'] : [];
  return (
    <Tag className={cn(letter ? 'letter-paper' : paper ? 'card-paper' : 'card-ornate', 'relative', className)} {...rest}>
      {list.map((c) => (
        <CornerFlourish key={c} corner={c} className={cn('absolute z-[1]', PLACES[c], cornerSize)} />
      ))}
      {children}
    </Tag>
  );
}

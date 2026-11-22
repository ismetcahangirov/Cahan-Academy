import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * EdelweissCorner — a small raster cluster of edelweiss blossoms that hugs a corner (same artwork as the
 * dashboard's auth pages, toned to the colour law). It is a CSS background (`--tex-edel-corner`), so the dark
 * variant swaps in under .dark and inside .theme-wine panels without a second request in the other theme.
 *
 * <EdelweissCorner corner="br" className="absolute bottom-0 right-0 w-24" />
 * Decorative only (aria-hidden). Keep it in corners, never behind text or data.
 */
const CORNER_TRANSFORM = {
  tl: undefined,
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1, -1)',
} as const;

export default function EdelweissCorner({
  corner = 'tl',
  className = 'w-24',
  style,
}: {
  corner?: keyof typeof CORNER_TRANSFORM;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('orn-reveal pointer-events-none aspect-square bg-contain bg-no-repeat', className)}
      style={{ backgroundImage: 'var(--tex-edel-corner)', transform: CORNER_TRANSFORM[corner], ...style }}
    />
  );
}

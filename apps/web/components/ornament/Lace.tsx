import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import ThemedImg from './ThemedImg';

/**
 * Lace (raster, toned to the colour law; the dark variant is used under .dark and inside .theme-wine).
 *
 * <LaceEdge />                      horizontal scalloped trim, scallops pointing down (default)
 * <LaceEdge direction="up" />       scallops pointing up (sits on top of a section / above a wave)
 * <LaceEdge vertical />             vertical trim, scallops pointing right
 * <LaceCorner corner="tr" className="absolute right-0 top-0 w-40" />
 * Decorative only (aria-hidden). Keep lace on section edges and corners, never behind text or data.
 * LaceEdge is a small repeating CSS background (8–17 KB); LaceCorner is a lazy <img> pair.
 */
export function LaceEdge({
  direction = 'down',
  vertical = false,
  size = 28,
  className,
  style,
}: {
  direction?: 'down' | 'up' | 'left' | 'right';
  vertical?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(vertical ? 'lace-strip-v' : 'lace-strip', className)}
      style={{
        ...(vertical ? { width: size } : { height: size }),
        ...(direction === 'up' && !vertical ? { transform: 'scaleY(-1)' } : null),
        ...(direction === 'left' && vertical ? { transform: 'scaleX(-1)' } : null),
        ...style,
      }}
    />
  );
}

const CORNER_TRANSFORM = {
  tl: undefined,
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1, -1)',
} as const;

export function LaceCorner({
  corner = 'tl',
  className = 'w-40',
  priority = false,
  onWine = false,
  style,
}: {
  corner?: keyof typeof CORNER_TRANSFORM;
  className?: string;
  priority?: boolean;
  /** on a .theme-wine panel: ship only the dark variant (see ThemedImg) */
  onWine?: boolean;
  style?: CSSProperties;
}) {
  return (
    <ThemedImg
      name="lace-corner"
      width={360}
      height={357}
      priority={priority}
      onWine={onWine}
      className={cn('aspect-[360/357]', className)}
      style={{ transform: CORNER_TRANSFORM[corner], ...style }}
    />
  );
}

export default LaceEdge;

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import ThemedImg from './ThemedImg';

/**
 * EdelweissCorner — a small line-art cluster of edelweiss blossoms that hugs a corner (the same art as the
 * LMS auth pages: edel-corner.webp + -dark, toned to the colour law). It replaces the floral lace corners.
 * The cluster "opens": it unfurls from its own corner (scale + turn + fade, transform/opacity only).
 *
 * <EdelweissCorner corner="tr" priority onWine className="absolute right-0 top-0 w-40" />
 * Props: corner 'tl'|'tr'|'bl'|'br', className (size + position), priority (above the fold: eager image and the
 * bloom plays on load, no JS), onWine (on a .theme-wine panel: only the dark art), delay (ms, load bloom only).
 * Without `priority` the bloom plays when it scrolls into view (the <Reveal> observer; visible without JS).
 */
const CORNER_TRANSFORM = {
  tl: undefined,
  tr: 'scaleX(-1)',
  bl: 'scaleY(-1)',
  br: 'scale(-1, -1)',
} as const;

export default function EdelweissCorner({
  corner = 'tl',
  className = 'w-32',
  priority = false,
  onWine = false,
  delay,
  style,
}: {
  corner?: keyof typeof CORNER_TRANSFORM;
  className?: string;
  priority?: boolean;
  onWine?: boolean;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    // the flip lives on the wrapper, the bloom on the art inside (its origin is the art's own corner)
    <div
      aria-hidden="true"
      className={cn('pointer-events-none', className)}
      style={{ transform: CORNER_TRANSFORM[corner], ...style }}
    >
      <ThemedImg
        name="edel-corner"
        width={320}
        height={305}
        priority={priority}
        onWine={onWine}
        className={cn('aspect-[320/305] origin-top-left', priority ? 'orn-bloom' : 'reveal reveal-bloom')}
        style={delay ? ({ '--bloom-delay': `${delay}ms` } as CSSProperties) : undefined}
      />
    </div>
  );
}

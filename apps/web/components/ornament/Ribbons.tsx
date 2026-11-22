import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import ThemedImg from './ThemedImg';

/**
 * Ribbons (raster satin, toned to the colour law).
 *
 * <BookmarkRibbon />  hangs from the top edge of the ONE featured card in a view like a book's bookmark.
 *                     Parent must be `relative`; default position: top-right. <Card variant="featured"> adds it.
 * <DrapedRibbon />    a bow with long tails draped over a corner (home hero, CTA band, celebratory spots).
 *                     Place absolutely: <DrapedRibbon className="absolute -right-6 -top-4 w-64" />
 */
export function BookmarkRibbon({
  className,
  length = 64,
  width = 16,
}: {
  className?: string;
  length?: number;
  width?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute -top-px right-6 z-[1] bg-no-repeat', className)}
      style={{
        width,
        height: length,
        backgroundImage: 'var(--tex-bookmark)',
        backgroundSize: '100% auto',
        backgroundPosition: 'bottom center',
      }}
    />
  );
}

export function DrapedRibbon({
  className = 'w-64',
  flip = false,
  priority = false,
  style,
}: {
  className?: string;
  flip?: boolean;
  priority?: boolean;
  style?: CSSProperties;
}) {
  return (
    <ThemedImg
      name="draped-ribbon"
      width={720}
      height={486}
      priority={priority}
      className={cn('aspect-[720/486]', className)}
      style={{ transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    />
  );
}

export default BookmarkRibbon;

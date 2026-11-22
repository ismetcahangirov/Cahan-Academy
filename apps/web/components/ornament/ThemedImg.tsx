/* eslint-disable @next/next/no-img-element -- pre-toned lossless WebP ornaments; next/image would only re-encode them */
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * ThemedImg — internal helper for raster ornaments that have a light and a dark (`-dark`) variant.
 * Renders two <img> elements; the hidden one is `display:none`, and with loading="lazy" the browser
 * never downloads it. `dark:` also matches inside `.theme-wine` panels, so the on-dark art is used there.
 * Width/height are intrinsic pixel sizes (reserve the box, no CLS); size the element with classes.
 */
export default function ThemedImg({
  name,
  width,
  height,
  className,
  imgClassName,
  priority = false,
  alt = '',
  style,
}: {
  /** file stem under /ornaments, e.g. "lace-corner" */
  name: string;
  width: number;
  height: number;
  className?: string;
  imgClassName?: string;
  /** above-the-fold art: eager load instead of lazy */
  priority?: boolean;
  alt?: string;
  style?: CSSProperties;
}) {
  const common = {
    width,
    height,
    decoding: 'async' as const,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    draggable: false,
  };
  return (
    <span
      aria-hidden={alt ? undefined : true}
      className={cn('pointer-events-none block select-none', className)}
      style={style}
    >
      <img src={`/ornaments/${name}.webp`} alt={alt} {...common} className={cn('block h-auto w-full dark:hidden', imgClassName)} />
      <img
        src={`/ornaments/${name}-dark.webp`}
        alt={alt}
        {...common}
        className={cn('hidden h-auto w-full dark:block', imgClassName)}
      />
    </span>
  );
}

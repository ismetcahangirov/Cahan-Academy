import type { SVGProps } from 'react';
import { BRAND_SPRITE, BRAND_VIEWBOX, SpriteUse } from '../brand/Brand';
import { cn } from '@/lib/utils';

/**
 * Edelweiss — the brand's primary ornament motif (decorative, aria-hidden).
 *
 * <Edelweiss />       the logo's own line-art flower (crisp from ~24px up): empty states, seals, hero art.
 * <EdelweissGlyph />  a simplified solid glyph for 8–20px: divider centres, bullets, button motif,
 *                     timeline dots. Both use currentColor (default text-ornament).
 */
type Props = SVGProps<SVGSVGElement>;

export function Edelweiss({ className = 'h-8 w-8', ...rest }: Props) {
  return (
    <svg
      viewBox={BRAND_VIEWBOX.edelweiss.join(' ')}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn('text-ornament', className)}
      {...rest}
    >
      <SpriteUse id="edelweiss" />
    </svg>
  );
}

/** Geometry lives in the cached sprite (/brand/sprite.svg#orn-glyph, see scripts/build-brand-sprite.mjs). */
export function EdelweissGlyph({ className = 'h-4 w-4', ...rest }: Props) {
  return (
    <svg
      viewBox="-12 -12 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn('text-ornament', className)}
      {...rest}
    >
      <use href={`${BRAND_SPRITE}#orn-glyph`} x="-12" y="-12" width="24" height="24" />
    </svg>
  );
}

export default Edelweiss;

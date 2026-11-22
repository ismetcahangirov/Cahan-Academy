import type { SVGProps } from 'react';

/*
 * Brand marks drawn from the owner's logo paths (same geometry as the dashboard), served from one cached
 * sprite: public/brand/sprite.svg (generated from brandPaths.ts by scripts/build-brand-sprite.mjs).
 * All are currentColor-driven: wine on light surfaces, white inside .theme-wine / .dark.
 * Size with h-* or w-* classes; the aspect ratio is kept. Never retype "CAHAN ACADEMY" in a font.
 * Server-component friendly; the path data never ships in HTML or JS.
 */
export const BRAND_SPRITE = '/brand/sprite.svg';

/** viewBox of each sprite symbol (must match brandPaths.ts) */
export const BRAND_VIEWBOX = {
  mark: [235.81, 171.48, 666.66, 491.05],
  logo: [174.61, 171.48, 730.77, 737.04],
  lockup: [-4, -4, 1686.26, 491.05],
  edelweiss: [581.75, 216.97, 320.72, 303.64],
} as const;

export type BrandSymbol = keyof typeof BRAND_VIEWBOX;

type BrandProps = Omit<SVGProps<SVGSVGElement>, 'viewBox'> & {
  /** accessible name; pass '' when a visible label or an aria-label on the parent names it */
  title?: string;
};

/** <use> of a sprite symbol, filling the svg's viewBox exactly. */
export function SpriteUse({ id, ...rest }: { id: BrandSymbol } & SVGProps<SVGUseElement>) {
  const [x, y, w, h] = BRAND_VIEWBOX[id];
  return <use href={`${BRAND_SPRITE}#${id}`} x={x} y={y} width={w} height={h} {...rest} />;
}

function BrandSvg({ symbol, title, className, ...rest }: BrandProps & { symbol: BrandSymbol }) {
  return (
    <svg
      viewBox={BRAND_VIEWBOX[symbol].join(' ')}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={className}
      {...rest}
    >
      <SpriteUse id={symbol} />
    </svg>
  );
}

/** Crescent + edelweiss, no text. Favicon, seals, avatars. */
export function BrandMark({ title = 'Cahan Academy', className = 'h-10 w-auto', ...rest }: BrandProps) {
  return <BrandSvg symbol="mark" title={title} className={className} {...rest} />;
}

/** Stacked logo: mark over CAHAN / ACADEMY. Hero, footer, large brand spots. */
export function BrandLogo({ title = 'Cahan Academy', className = 'h-40 w-auto', ...rest }: BrandProps) {
  return <BrandSvg symbol="logo" title={title} className={className} {...rest} />;
}

/** Horizontal lockup: mark left, CAHAN over tracked ACADEMY on the right. Header, compact spots. */
export function BrandLockup({ title = 'Cahan Academy', className = 'h-10 w-auto', ...rest }: BrandProps) {
  return <BrandSvg symbol="lockup" title={title} className={className} {...rest} />;
}

export default BrandLockup;

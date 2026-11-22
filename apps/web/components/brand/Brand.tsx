import type { SVGProps } from 'react';
import { MARK, STACKED, LOCKUP, type BrandGeometry } from './brandPaths';

/*
 * Brand marks drawn from the owner's logo paths (same geometry as the dashboard).
 * All are currentColor-driven: wine on light surfaces, white inside .theme-wine / .dark.
 * Size with h-* or w-* classes; the aspect ratio is kept. Never retype "CAHAN ACADEMY" in a font.
 * Server-component friendly.
 */
type BrandProps = Omit<SVGProps<SVGSVGElement>, 'viewBox'> & {
  /** accessible name; pass '' (or decorative) when a visible text label sits next to it */
  title?: string;
};

function BrandSvg({ data, title, className, ...rest }: BrandProps & { data: BrandGeometry }) {
  return (
    <svg
      viewBox={data.viewBox}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={className}
      {...rest}
    >
      {data.paths.map((p, i) => (
        <path key={i} d={p.d} transform={p.transform} />
      ))}
    </svg>
  );
}

/** Crescent + edelweiss, no text. Favicon, mobile header, seals, avatars. */
export function BrandMark({ title = 'Cahan Academy', className = 'h-10 w-auto', ...rest }: BrandProps) {
  return <BrandSvg data={MARK} title={title} className={className} {...rest} />;
}

/** Stacked logo: mark over CAHAN / ACADEMY. Hero, footer, large brand spots. */
export function BrandLogo({ title = 'Cahan Academy', className = 'h-40 w-auto', ...rest }: BrandProps) {
  return <BrandSvg data={STACKED} title={title} className={className} {...rest} />;
}

/** Horizontal lockup: mark left, CAHAN over tracked ACADEMY on the right. Header, compact spots. */
export function BrandLockup({ title = 'Cahan Academy', className = 'h-10 w-auto', ...rest }: BrandProps) {
  return <BrandSvg data={LOCKUP} title={title} className={className} {...rest} />;
}

export default BrandLockup;

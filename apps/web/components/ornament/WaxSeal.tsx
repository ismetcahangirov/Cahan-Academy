import { BRAND_VIEWBOX, SpriteUse } from '../brand/Brand';
import { cn } from '@/lib/utils';
import ThemedImg from './ThemedImg';

/**
 * WaxSeal — satin-finish wax seal (raster) pressed with the crescent + edelweiss mark (vector).
 * Brand / closing moments: hero, footer, CTA, certificate-like spots. One per view region.
 *
 * <WaxSeal size={72} />
 * Props: size (px), className, title (if it should be announced; decorative by default), priority.
 * The emboss uses two opaque wine tones, so it obeys the colour law on any backdrop.
 */
export default function WaxSeal({
  size = 72,
  className,
  title,
  priority = false,
  onWine = false,
}: {
  size?: number;
  className?: string;
  title?: string;
  priority?: boolean;
  /** on a .theme-wine panel: ship only the dark variant (see ThemedImg) */
  onWine?: boolean;
}) {
  return (
    <div
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={cn('relative inline-block shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <ThemedImg
        name="wax-seal"
        width={311}
        height={320}
        priority={priority}
        onWine={onWine}
        className="absolute inset-0"
        imgClassName="!h-full object-contain"
      />
      <svg
        viewBox={BRAND_VIEWBOX.mark.join(' ')}
        aria-hidden="true"
        focusable="false"
        className="absolute left-1/2 top-1/2 w-[50%] -translate-x-[48%] -translate-y-[52%]"
      >
        {/* highlight edge (light tone, offset down-right) then the pressed mark (deep tone) */}
        <g fill="#C6A6AB" transform="translate(8 8)">
          <SpriteUse id="mark" />
        </g>
        <g fill="#3C0009">
          <SpriteUse id="mark" />
        </g>
      </svg>
    </div>
  );
}

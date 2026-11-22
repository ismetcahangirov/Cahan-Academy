import Image from 'next/image';
import { cn } from '@/lib/utils';
import SketchIllustration, { type SketchName } from '../ornament/SketchIllustration';

/**
 * CoverImage — a user-uploaded photo inside the hairline photo mat (exempt from the colour audit via
 * data-user-image), or — when the image is missing or a stock/placeholder URL — a palette-toned sketch
 * on parchment. Sized by its parent (`aspect-*` on className), so there is no layout shift.
 *
 * <CoverImage src={course.image} alt={course.title} sketch="books" className="aspect-[16/10]" />
 */
const PLACEHOLDER_HOSTS = /(^|\.)(unsplash\.com|example\.com|placehold\.co|via\.placeholder\.com|picsum\.photos)$/i;

export function isRealImage(src?: string | null): src is string {
  if (!src) return false;
  try {
    const u = new URL(src, 'http://local');
    return !PLACEHOLDER_HOSTS.test(u.hostname);
  } catch {
    return false;
  }
}

export default function CoverImage({
  src,
  alt,
  sketch = 'books',
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority = false,
  rounded = 'default',
  className,
  imgClassName,
}: {
  src?: string | null;
  alt: string;
  sketch?: SketchName;
  sizes?: string;
  priority?: boolean;
  rounded?: 'default' | 'arch';
  className?: string;
  imgClassName?: string;
}) {
  const real = isRealImage(src);
  return (
    <div className={cn('photo-frame', rounded === 'arch' && 'rounded-t-[999px]', className)}>
      <div className={cn('photo-inner h-full w-full', rounded === 'arch' && 'rounded-t-[999px]')}>
        {real ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            data-user-image=""
            // only Cloudinary goes through the optimiser (configured host); anything else is served as-is
            unoptimized={!/(^|\.)cloudinary\.com$/i.test(new URL(src, 'http://local').hostname)}
            className={cn('object-cover', imgClassName)}
          />
        ) : (
          <div className="absolute inset-0 p-[12%]">
            <SketchIllustration name={sketch} className="h-full w-full" imgClassName="!h-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}

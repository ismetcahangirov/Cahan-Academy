import { cn } from '@/lib/utils';
import ThemedImg from './ThemedImg';

/**
 * SketchIllustration — engraved pen-and-ink academic objects, toned to the colour law.
 * For empty states, section heads, and as the PLACEHOLDER when a course / teacher / blog image is
 * missing (never behind text or data). Lazy-loaded; the dark variant is used under .dark and .theme-wine.
 *
 * <SketchIllustration name="books" className="w-40" />
 * name: 'books' (generic, courses) | 'inkwell' (writing, blog) | 'globe' (languages, students)
 *       | 'lamp' (study, schedule) | 'cap' (graduation, results) | 'notebook' (notes, lessons)
 */
export const SKETCHES = {
  books: [240, 320],
  inkwell: [250, 360],
  globe: [213, 360],
  lamp: [348, 360],
  cap: [320, 274],
  notebook: [360, 259],
} as const;

export type SketchName = keyof typeof SKETCHES;

export default function SketchIllustration({
  name = 'books',
  className = 'w-40',
  alt = '',
  priority = false,
  imgClassName,
}: {
  name?: SketchName;
  className?: string;
  alt?: string;
  priority?: boolean;
  /** e.g. '!h-full object-contain' to fit a fixed box */
  imgClassName?: string;
}) {
  const key: SketchName = name in SKETCHES ? name : 'books';
  const [w, h] = SKETCHES[key];
  return (
    <ThemedImg
      name={`sketch-${key}`}
      width={w}
      height={h}
      alt={alt}
      priority={priority}
      imgClassName={imgClassName}
      className={cn('inline-block', className)}
    />
  );
}

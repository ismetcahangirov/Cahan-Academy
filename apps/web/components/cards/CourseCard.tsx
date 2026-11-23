import { useTranslations } from 'next-intl';
import { ArrowRight, Clock, Star, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { sketchFor } from '@/lib/media';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import CoverImage from './CoverImage';

/**
 * CourseCard — framed cover (photo, or a sketch chosen from the course's category when the image is
 * missing / stock / mock: CoverImage + sketchFor), category + popular badges, level in small caps, serif
 * title, meta (duration · students · rating), price and a details cue. The whole card is one link target
 * (stretched link), so keyboard users get a single stop. `featured` = ornate frame
 * (ONE per view). Shared: home preview, catalogue, course and teacher detail. Server or client trees.
 *
 * <CourseCard course={c} featured={i === 0} priority={i === 0} headingLevel="h2" />
 */
export interface CourseCardData {
  slug: string;
  title: string;
  description?: string | null;
  price?: string | null;
  duration?: string | null;
  level?: string | null;
  image?: string | null;
  isPopular?: boolean;
  rating?: string | null;
  studentsCount?: string | null;
  category?: { name?: string; slug?: string } | null;
}

export default function CourseCard({
  course,
  featured = false,
  priority = false,
  headingLevel = 'h3',
  className,
}: {
  course: CourseCardData;
  featured?: boolean;
  priority?: boolean;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}) {
  const t = useTranslations('courses');
  const H = headingLevel;
  const level =
    course.level === 'beginner'
      ? t('level_beginner')
      : course.level === 'intermediate'
        ? t('level_intermediate')
        : course.level === 'advanced'
          ? t('level_advanced')
          : t('level_all');

  return (
    <Card as="article" variant={featured ? 'featured' : 'plain'} hover className={cn('group flex h-full flex-col p-3', className)}>
      <div className="relative">
        <CoverImage
          src={course.image}
          alt=""
          sketch={sketchFor(course.category?.slug, course.category?.name, course.title)}
          priority={priority}
          className="aspect-[16/10]"
          imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-3rem)] flex-wrap gap-1.5">
          {course.category?.name && <Badge tone="solid">{course.category.name}</Badge>}
          {course.isPopular && <Badge tone="accent">{t('filter_popular')}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="sc text-[0.8rem] text-ink-muted">{level}</p>
        <H className="mt-1 text-[1.3rem] font-semibold leading-snug text-ink">
          <Link
            href={`/courses/${course.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
          >
            {course.title}
          </Link>
        </H>
        {course.description && (
          <p className="mt-2 line-clamp-2 text-[1rem] leading-relaxed text-ink-muted">{course.description}</p>
        )}

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-ink-muted">
          {course.duration && (
            <li className="flex items-center gap-1.5">
              <Clock size={15} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
              {course.duration}
            </li>
          )}
          {course.studentsCount && (
            <li className="flex items-center gap-1.5">
              <Users size={15} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
              <span className="num">{course.studentsCount}</span> {t('students')}
            </li>
          )}
          {course.rating && (
            <li className="flex items-center gap-1.5">
              <Star size={15} strokeWidth={1.6} className="fill-current text-ornament" aria-hidden="true" />
              <span className="num font-semibold text-ink">{course.rating}</span>
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-hair pt-4">
          <span className="num text-[1.2rem] font-semibold text-accent-text">{course.price ?? ''}</span>
          <span className="sc inline-flex items-center gap-1.5 text-[0.85rem] text-accent-text" aria-hidden="true">
            {t('details_btn')}
            <ArrowRight size={15} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}

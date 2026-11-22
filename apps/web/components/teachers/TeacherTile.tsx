import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import CornerFlourish from '@/components/ornament/CornerFlourish';
import { EdelweissGlyph } from '@/components/ornament/Edelweiss';
import CoverImage from '@/components/cards/CoverImage';
import { coverSrc, sketchFor } from '@/components/courses/media';

/**
 * TeacherTile — the shared TeacherCard (arched, matted portrait; serif name; small-caps position; whole
 * card = one link) for the teacher directory, except that a missing / placeholder / mock portrait becomes
 * a sketch chosen from the teacher's subject (`sketchFor(position)`), so a directory of teachers without
 * photos is not one repeated drawing. Promote to shared: a `sketch` prop on TeacherCard.
 */
export default function TeacherTile({
  teacher,
  className,
}: {
  teacher: { name: string; slug: string; image?: string | null; position?: string | null };
  className?: string;
}) {
  const t = useTranslations('teachers');

  return (
    <article
      className={cn('card-ornate card-hover group relative flex h-full flex-col items-center p-3 pb-5 text-center sm:p-5 sm:pb-6', className)}
    >
      <CornerFlourish corner="bl" className="absolute bottom-2.5 left-2.5 hidden h-6 w-6 sm:block" />
      <CornerFlourish corner="br" className="absolute bottom-2.5 right-2.5 hidden h-6 w-6 sm:block" />

      <CoverImage
        src={coverSrc(teacher.image)}
        alt=""
        sketch={sketchFor(teacher.position, teacher.slug)}
        rounded="arch"
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 45vw"
        className="aspect-[4/5] w-full max-w-[15rem]"
      />

      <EdelweissGlyph className="mt-4 h-4 w-4" />
      <h3 className="mt-2 text-[1.1rem] font-semibold leading-snug text-ink sm:text-[1.3rem]">
        <Link
          href={`/teachers/${teacher.slug}`}
          className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
        >
          {teacher.name}
        </Link>
      </h3>
      {teacher.position && <p className="sc mt-1 text-[0.78rem] text-ink-muted sm:text-[0.82rem]">{teacher.position}</p>}
      <span className="sc mt-auto inline-flex items-center gap-1.5 pt-4 text-[0.85rem] text-accent-text" aria-hidden="true">
        {t('view_profile')}
        <ArrowRight size={15} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}

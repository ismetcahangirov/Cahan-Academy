import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { Teacher } from '@/types/teacher';
import { cn } from '@/lib/utils';
import CornerFlourish from '../ornament/CornerFlourish';
import { EdelweissGlyph } from '../ornament/Edelweiss';
import CoverImage from './CoverImage';

/**
 * TeacherCard — portrait in an arched, hairline-matted frame with corner flourishes, name in serif
 * (data never goes into the script font), position in small caps, profile link. Whole card = one link.
 * Shared component (server or client). `locale` kept for compatibility with existing callers.
 */
interface TeacherCardProps {
  teacher: Pick<Teacher, 'name' | 'slug' | 'image' | 'position'>;
  locale?: string;
  className?: string;
}

export default function TeacherCard({ teacher, className }: TeacherCardProps) {
  const t = useTranslations('teachers');

  return (
    <article className={cn('card-ornate card-hover group relative flex h-full flex-col items-center p-3 pb-5 text-center sm:p-5 sm:pb-6', className)}>
      <CornerFlourish corner="bl" className="absolute bottom-2.5 left-2.5 hidden h-6 w-6 sm:block" />
      <CornerFlourish corner="br" className="absolute bottom-2.5 right-2.5 hidden h-6 w-6 sm:block" />

      <CoverImage
        src={teacher.image}
        alt=""
        sketch="notebook"
        rounded="arch"
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 80vw"
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
      {teacher.position && <p className="sc mt-1 text-[0.82rem] text-ink-muted">{teacher.position}</p>}
      <span className="sc mt-4 inline-flex items-center gap-1.5 text-[0.85rem] text-accent-text" aria-hidden="true">
        {t('view_profile')}
        <ArrowRight size={15} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}

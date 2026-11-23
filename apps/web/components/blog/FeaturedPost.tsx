import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { BlogPost } from '@/lib/api';
import CoverImage from '@/components/cards/CoverImage';
import { sketchFor } from '@/lib/media';
import { EdelweissGlyph } from '@/components/ornament';

/**
 * FeaturedPost — the latest article as a wide card at the top of /blog: framed cover (photo or inkwell
 * sketch, priority — it is the LCP), small-caps label, serif title (data → never script), excerpt,
 * author (the ONE featured item in the view). Whole card = one stretched link.
 */
export default function FeaturedPost({ post }: { post: BlogPost }) {
  const t = useTranslations('blog');
  const locale = useLocale();
  const date = new Date(post.createdAt);
  const formatted = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

  return (
    <article className="card-ornate card-hover group relative grid gap-0 p-3 md:grid-cols-[1.15fr_1fr] md:p-4">
      <CoverImage
        src={post.image}
        alt=""
        sketch={sketchFor(post.slug, post.title)}
        priority
        sizes="(min-width: 1024px) 38rem, (min-width: 768px) 55vw, 100vw"
        className="aspect-[16/10] md:aspect-auto md:min-h-[20rem]"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-col px-3 pb-3 pt-5 md:px-8 md:py-6">
        <p className="sc inline-flex items-center gap-2 text-[0.82rem] text-accent-text">
          <EdelweissGlyph className="h-3.5 w-3.5" />
          {t('latest_label')}
        </p>
        <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight text-ink sm:text-[2rem]">
          <Link
            href={`/blog/${post.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
          >
            {post.title}
          </Link>
        </h2>
        <p className="time-italic mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[1rem] text-ink-muted">
          {formatted && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
              <time dateTime={post.createdAt} suppressHydrationWarning>
                {formatted}
              </time>
            </span>
          )}
          {post.readingTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
              {post.readingTime}
            </span>
          )}
        </p>
        {post.excerpt && <p className="mt-4 line-clamp-4 text-[1.08rem] leading-relaxed text-ink-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-hair pt-5 md:mt-8">
          <span className="sc truncate text-[0.82rem] text-ink-muted">{post.author?.name || 'Cahan Academy'}</span>
          <span className="sc inline-flex shrink-0 items-center gap-1.5 text-[0.85rem] text-accent-text" aria-hidden="true">
            {t('read_more')}
            <ArrowRight size={15} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

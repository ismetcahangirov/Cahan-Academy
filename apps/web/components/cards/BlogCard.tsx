import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type { BlogPost } from '@/types/blog';
import { cn } from '@/lib/utils';
import Card from '../ui/Card';
import CoverImage from './CoverImage';

/**
 * BlogCard — framed cover (photo or inkwell sketch), date · reading time in italic, serif title,
 * excerpt, author in small caps, "read more". Whole card = one link (stretched).
 * Shared component (server or client). `index` kept for compatibility.
 */
interface BlogCardProps {
  post: BlogPost;
  index?: number;
  className?: string;
}

export default function BlogCard({ post, className }: BlogCardProps) {
  const t = useTranslations('blog');
  const locale = useLocale();

  const date = new Date(post.createdAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

  return (
    <Card as="article" hover className={cn('group flex h-full flex-col p-3', className)}>
      <CoverImage
        src={post.image}
        alt=""
        sketch="inkwell"
        className="aspect-[16/10]"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="time-italic flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.98rem] text-ink-muted">
          {formattedDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
              <time dateTime={post.createdAt} suppressHydrationWarning>
                {formattedDate}
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
        <h3 className="mt-2 line-clamp-2 text-[1.3rem] font-semibold leading-snug text-ink">
          <Link
            href={`/blog/${post.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-[1rem] leading-relaxed text-ink-muted">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-hair pt-4">
          <span className="sc truncate text-[0.82rem] text-ink-muted">{post.author?.name || 'Cahan Academy'}</span>
          <span className="sc inline-flex shrink-0 items-center gap-1.5 text-[0.85rem] text-accent-text" aria-hidden="true">
            {t('read_more')}
            <ArrowRight size={15} strokeWidth={1.6} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Card>
  );
}

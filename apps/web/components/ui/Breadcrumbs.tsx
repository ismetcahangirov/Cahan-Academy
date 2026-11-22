import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { absoluteUrl, cn } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';

/**
 * Breadcrumbs — visible small-caps trail + the matching schema.org BreadcrumbList (absolute URLs on the
 * canonical origin, see lib/utils absoluteUrl; A-28). The last item is the current page (no link,
 * aria-current) and is truncated on phones. Server component.
 *
 * <Breadcrumbs locale={locale} label={t('breadcrumb_label')}
 *   items={[{ name: tc('home'), path: '' }, { name: t('page_title'), path: '/courses' }, { name: course.title, path: `/courses/${slug}` }]} />
 * Used for courses and teachers (list + detail). Candidate for components/ui (promote to shared).
 */
export interface Crumb {
  name: string;
  /** locale-less path ('' = home). */
  path: string;
}

export default function Breadcrumbs({
  locale,
  items,
  label,
  align = 'start',
  className,
}: {
  locale: string;
  items: Crumb[];
  label: string;
  align?: 'start' | 'center';
  className?: string;
}) {
  const last = items.length - 1;
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: absoluteUrl(locale, item.path),
          })),
        }}
      />
      <nav aria-label={label} className={cn('min-w-0', className)}>
        <ol
          className={cn(
            'sc flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.8rem] text-ink-muted sm:text-[0.85rem]',
            align === 'center' && 'justify-center'
          )}
        >
          {items.map((item, i) => (
            <li key={item.path || 'home'} className={cn('flex min-w-0 items-center gap-1.5', i === last && 'max-w-full')}>
              {i > 0 && <ChevronRight aria-hidden="true" size={13} strokeWidth={1.6} className="shrink-0 text-ornament" />}
              {i === last ? (
                <span aria-current="page" className="block min-w-0 truncate text-ink">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path || '/'} className="whitespace-nowrap transition-colors hover:text-ink">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

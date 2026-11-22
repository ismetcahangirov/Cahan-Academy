import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, ChevronRight, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getBlogPost, getBlogPosts } from '@/lib/api';
import { SITE_URL, absoluteUrl, cn } from '@/lib/utils';
import BlogCard from '@/components/cards/BlogCard';
import CoverImage, { isRealImage } from '@/components/cards/CoverImage';
import { OrnamentDivider, OrnateFrame, ScriptTitle, WaveEdge, WaxSeal } from '@/components/ornament';
import { Button, Reveal } from '@/components/ui';
import JsonLd from '@/components/seo/JsonLd';
import ShareButton from '@/components/blog/ShareButton';
import { toArticleHtml } from '@/components/blog/data';
import { pageAlternates } from '@/components/legal/seo';
import styles from '@/components/blog/article.module.css';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  try {
    const post = await getBlogPost(slug, locale);
    if (!post) return { title: t('blog_title') };
    return {
      title: `${post.title} — Cahan Academy`,
      description: post.excerpt,
      alternates: pageAlternates(locale, `/blog/${post.slug}`),
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: 'article',
        locale,
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt ?? post.createdAt,
      },
    };
  } catch {
    return { title: t('blog_title') };
  }
}

export async function generateStaticParams() {
  // getBlogPosts never throws (an unreachable API at build time → no pre-rendered posts, ISR fills in)
  const posts = await getBlogPosts({ limit: 100 });
  return ['az', 'en', 'ru'].flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

/*
 * Article: breadcrumb → serif title (data, never script) with small-caps label and italic meta →
 * cover in an ornate frame → long-form body (prose-ornate + article.module.css) → share / back →
 * wax seal → related posts on a parchment band.
 * A-23: getBlogPost returns null only on 404; any other failure throws to the error boundary, so an
 * API blip during ISR keeps the last good page instead of caching a 404.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });

  const post = await getBlogPost(slug, locale);
  if (!post) notFound();

  const related = (await getBlogPosts({ locale, limit: 3, excludeSlug: slug })).filter((p) => p.slug !== slug).slice(0, 3);

  const date = new Date(post.createdAt);
  const formattedDate = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  const url = absoluteUrl(locale, `/blog/${post.slug}`);
  const html = toArticleHtml(post.content);
  const author = post.author?.name || 'Cahan Academy';

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          ...(isRealImage(post.image) ? { image: post.image } : {}),
          datePublished: post.createdAt,
          dateModified: post.updatedAt ?? post.createdAt,
          inLanguage: locale,
          url,
          mainEntityOfPage: url,
          author: post.author?.name
            ? { '@type': 'Person', name: post.author.name }
            : { '@type': 'Organization', name: 'Cahan Academy' },
          publisher: {
            '@type': 'Organization',
            name: 'Cahan Academy',
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512.png` },
          },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('home'), item: absoluteUrl(locale) },
            { '@type': 'ListItem', position: 2, name: t('page_title'), item: absoluteUrl(locale, '/blog') },
            { '@type': 'ListItem', position: 3, name: post.title, item: url },
          ],
        }}
      />

      <article className="pb-20">
        <header className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <nav aria-label={t('breadcrumb_label')}>
            <ol className="sc flex min-w-0 items-center gap-1.5 text-[0.8rem] text-ink-muted">
              <li className="shrink-0">
                <Link href="/" className="hover:text-accent-text">
                  {t('home')}
                </Link>
              </li>
              <li className="inline-flex shrink-0 items-center gap-1.5">
                <ChevronRight size={13} strokeWidth={1.6} className="text-ornament-soft" aria-hidden="true" />
                <Link href="/blog" className="hover:text-accent-text">
                  {t('page_title')}
                </Link>
              </li>
              <li aria-current="page" className="hidden min-w-0 items-center gap-1.5 text-ink sm:inline-flex">
                <ChevronRight size={13} strokeWidth={1.6} className="shrink-0 text-ornament-soft" aria-hidden="true" />
                <span className="truncate">{post.title}</span>
              </li>
            </ol>
          </nav>

          <div className="mt-10 text-center sm:mt-12">
            <p className="sc text-[0.85rem] text-accent-text">{t('article_label')}</p>
            <h1 className="mx-auto mt-3 max-w-3xl text-balance text-[2.1rem] font-semibold leading-[1.15] text-ink sm:text-[2.8rem]">
              {post.title}
            </h1>
            <OrnamentDivider className="mt-5" />
            <dl className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[1rem] text-ink-muted">
              <div>
                <dt className="sr-only">{t('author_label')}</dt>
                <dd className="sc text-[0.85rem] text-ink">{author}</dd>
              </div>
              {formattedDate && (
                <div className="time-italic inline-flex items-center gap-1.5">
                  <dt>
                    <Calendar size={15} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
                    <span className="sr-only">{t('published_on')}</span>
                  </dt>
                  <dd>
                    <time dateTime={post.createdAt}>{formattedDate}</time>
                  </dd>
                </div>
              )}
              {post.readingTime && (
                <div className="time-italic inline-flex items-center gap-1.5">
                  <dt>
                    <Clock size={15} strokeWidth={1.6} className="text-ornament" aria-hidden="true" />
                    <span className="sr-only">{t('reading_time')}</span>
                  </dt>
                  <dd>{post.readingTime}</dd>
                </div>
              )}
            </dl>
          </div>

          <OrnateFrame corners="all" cornerSize="h-6 w-6 sm:h-8 sm:w-8" className="mt-10 p-2.5 sm:p-4">
            <CoverImage
              src={post.image}
              alt={post.title}
              sketch="inkwell"
              priority
              sizes="(min-width: 1024px) 54rem, 100vw"
              className={cn(isRealImage(post.image) ? 'aspect-[16/9]' : 'aspect-[16/7]')}
            />
          </OrnateFrame>
        </header>

        <div className="mx-auto max-w-[44rem] px-4 pt-12 sm:px-6 sm:pt-14">
          {post.excerpt && (
            <p className="mb-8 text-[1.25rem] italic leading-relaxed text-ink-muted">{post.excerpt}</p>
          )}
          {html && (
            <div
              className={cn('prose prose-ornate max-w-none', styles.body)}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          <div className="mt-14 flex flex-col items-center gap-5">
            <WaxSeal size={56} />
            <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Button as={Link} href="/blog" variant="ghost" size="sm" icon={ArrowLeft}>
                {t('back_to_blog')}
              </Button>
              <ShareButton title={post.title} label={t('share')} copiedLabel={t('link_copied')} />
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="cv-auto paper relative pb-28 pt-24">
          <WaveEdge invert fill="var(--page-base)" className="absolute inset-x-0 -top-px" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScriptTitle id="related-title" align="center" size="section" title={t('related_posts')} />
            <Reveal as="ul" stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <BlogCard post={p} />
                </li>
              ))}
            </Reveal>
          </div>
          <WaveEdge fill="var(--page-base)" className="absolute inset-x-0 -bottom-px" />
        </section>
      )}
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import PageBand from '@/components/about/PageBand';
import BlogList from '@/components/blog/BlogList';
import { loadPosts } from '@/components/blog/data';
import { pageAlternates } from '@/components/legal/seo';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl } from '@/lib/utils';

// ISR: static HTML, regenerated in the background at most this often (same window as the
// fetches it renders: posts, 1 min). Explicit, so a page whose build-time fetch failed still revalidates.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('blog_title'),
    description: t('blog_description'),
    alternates: pageAlternates(locale, '/blog'),
    openGraph: { title: t('blog_title'), description: t('blog_description'), type: 'website', locale },
  };
}

/* Blog list: wine head band → search → latest post (featured, bookmark) → card grid; error ≠ empty. */
export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'blog' });
  const { posts, failed } = await loadPosts(locale);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: t('page_title'),
          url: absoluteUrl(locale, '/blog'),
          inLanguage: locale,
          blogPost: posts.slice(0, 10).map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: absoluteUrl(locale, `/blog/${p.slug}`),
            datePublished: p.createdAt,
          })),
        }}
      />
      <PageBand id="blog-title" eyebrow={t('hero_badge')} title={t('page_title')} lead={t('page_subtitle')} />
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <BlogList posts={posts} failed={failed} />
      </div>
    </>
  );
}

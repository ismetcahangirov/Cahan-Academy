import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { 
  Calendar, Clock, User, ArrowLeft, 
  ChevronRight, Share2, BookOpen 
} from 'lucide-react';
import { getBlogPost, getBlogPosts } from '@/lib/api';
import BlogCard from '@/components/cards/BlogCard';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const response = await getBlogPost(slug, locale);
    const post = response.data;
    if (!post) return { title: 'Məqalə tapılmadı' };
    
    return {
      title: `${post.title} — Cahan Academy Blog`,
      description: post.excerpt,
    };
  } catch (error) {
    return { title: 'Blog | Cahan Academy' };
  }
}

export async function generateStaticParams() {
  try {
    const response = await getBlogPosts({ limit: 100 });
    const posts = response.data ?? [];
    const locales = ['az', 'en', 'ru'];
    
    return locales.flatMap((locale) =>
      posts.map((post) => ({
        locale,
        slug: post.slug,
      }))
    );
  } catch (error) {
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  let post;
  try {
    const response = await getBlogPost(slug, locale);
    post = response.data;
  } catch (error) {
    notFound();
  }

  if (!post) notFound();

  // Related posts
  let relatedPosts: any[] = [];
  try {
    const relatedResponse = await getBlogPosts({ locale, limit: 3, excludeSlug: slug });
    relatedPosts = relatedResponse.data ?? [];
  } catch (error) {}

  const formattedDate = new Date(post.createdAt).toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.createdAt,
    dateModified: post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Cahan Academy',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cahan Academy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cahan.academy/logo.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">{t('home') || 'Ana Səhifə'}</Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-primary transition-colors">{t('page_title') || 'Blog'}</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium truncate">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
                <div>
                  <div className="text-foreground font-bold">{post.author?.name || 'Cahan Academy'}</div>
                  <div className="text-[12px]">{t('author_label') || 'Müəllif'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>{formattedDate}</span>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <span>{post.readingTime}</span>
                </div>
              )}
              <button className="ml-auto flex items-center gap-2 text-primary font-bold hover:opacity-80 transition-opacity">
                <Share2 size={18} />
                {t('share') || 'Paylaş'}
              </button>
            </div>
          </header>

          {/* Cover Image */}
          {post.image && (
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary mb-20"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Footer Navigation */}
          <div className="flex items-center justify-between py-10 border-y border-border mb-20">
             <Link href="/blog" className="flex items-center gap-2 text-primary font-bold hover:-translate-x-1 transition-transform">
                <ArrowLeft size={20} />
                {t('back_to_blog') || 'Bütün məqalələrə qayıt'}
             </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="font-heading text-3xl font-bold mb-10 flex items-center gap-3">
                <BookOpen className="text-primary" size={28} />
                {t('related_posts') || 'Oxşar məqalələr'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((rp, i) => (
                  <BlogCard key={rp.id} post={rp} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}

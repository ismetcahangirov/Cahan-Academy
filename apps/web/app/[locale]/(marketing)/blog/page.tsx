import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import BlogClientPage from './BlogClientPage';
import { getBlogPosts } from '@/lib/api';
import { BlogPost } from '@/types/blog';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title:       t('blog_title') || 'Blog | Cahan Academy',
    description: t('blog_description') || 'Cahan Academy blog məqalələri.',
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params;

  let posts: BlogPost[] = [];
  try {
    const response = await getBlogPosts({ locale });
    posts = response.data ?? [];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }

  return <BlogClientPage initialPosts={posts} locale={locale} />;
}

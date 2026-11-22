import { MetadataRoute } from 'next';
import { getCourses, getTeachers, getBlogPosts } from '@/lib/api';
import { absoluteUrl, LOCALES } from '@/lib/utils';

// Rebuilt at most once an hour (the blog fetch below asks for the same window; its 60 s default would win).
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/**
 * One entry per locale, each listing every locale as an hreflang alternate. URLs follow
 * `localePrefix: 'as-needed'` (az has no prefix) so no sitemap URL is a redirect.
 */
function localized(path: string, extra: Omit<Entry, 'url' | 'alternates'>): Entry[] {
  const languages: Record<string, string> = Object.fromEntries(
    LOCALES.map((l) => [l, absoluteUrl(l, path)])
  );
  languages['x-default'] = absoluteUrl('az', path);
  return LOCALES.map((locale) => ({
    url: absoluteUrl(locale, path),
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/courses', '/teachers', '/blog', '/faq', '/about', '/contact'];
  const staticRoutes = staticPages.flatMap((page) =>
    localized(page, { changeFrequency: 'monthly', priority: page === '' ? 1 : 0.8 })
  );

  const [courses, teachers, posts] = await Promise.all([
    getCourses().catch(() => []),
    getTeachers().catch(() => []),
    getBlogPosts({ limit: 100, revalidate: 3600 }).catch(() => []),
  ]);

  const courseRoutes = courses.flatMap((course) =>
    localized(`/courses/${encodeURIComponent(course.slug)}`, { changeFrequency: 'weekly', priority: 0.7 })
  );

  const teacherRoutes = teachers.flatMap((teacher) =>
    localized(`/teachers/${encodeURIComponent(teacher.slug)}`, { changeFrequency: 'monthly', priority: 0.6 })
  );

  const blogRoutes = posts.flatMap((post) =>
    localized(`/blog/${encodeURIComponent(post.slug)}`, {
      changeFrequency: 'weekly',
      priority: 0.6,
      lastModified: post.updatedAt ?? post.createdAt,
    })
  );

  return [...staticRoutes, ...courseRoutes, ...teacherRoutes, ...blogRoutes];
}

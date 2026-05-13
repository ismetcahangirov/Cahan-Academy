import { MetadataRoute } from 'next';
import { getCourses, getTeachers, getBlogPosts } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cahanacademy.az';
  const locales = ['az', 'en', 'ru'];

  // Statik səhifələr
  const staticPages = ['', '/courses', '/teachers', '/blog', '/faq', '/about', '/contact'];
  
  const staticRoutes = staticPages.flatMap((page) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Dinamik Kurslar
  const courses = await getCourses().catch(() => []);
  const courseRoutes = courses.flatMap((course) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/courses/${course.slug}`,
      lastModified: course.createdAt ? new Date(course.createdAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  );

  // Dinamik Müəllimlər
  const teachers = await getTeachers().catch(() => []);
  const teacherRoutes = teachers.flatMap((teacher) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/teachers/${teacher.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  );

  // Dinamik Bloqlar
  const posts = await getBlogPosts().catch(() => []);
  const blogRoutes = posts.flatMap((post) => 
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${post.slug}`,
      lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  );

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...teacherRoutes,
    ...blogRoutes,
  ];
}

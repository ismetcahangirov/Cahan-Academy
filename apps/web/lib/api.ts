const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { tags?: string[]; revalidate?: number }
): Promise<T> {
  const { tags, revalidate, ...init } = options ?? {};

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    next: {
      tags,
      revalidate,
    },
  });

  if (!res.ok) {
    throw new Error(`API xətası: ${res.status} — ${endpoint}`);
  }

  return res.json();
}

// ─── Courses ────────────────────────────────────────────────────────────────
export const getCourses = () =>
  apiFetch<Course[]>('/courses', { tags: ['courses'], revalidate: 3600 });

export const getCourse = (slug: string) =>
  apiFetch<Course>(`/courses/${slug}`, { tags: [`course-${slug}`], revalidate: 3600 });

// ─── Teachers ────────────────────────────────────────────────────────────────
export const getTeachers = () =>
  apiFetch<Teacher[]>('/teachers', { tags: ['teachers'], revalidate: 86400 });

export const getTeacher = (slug: string) =>
  apiFetch<Teacher>(`/teachers/${slug}`, { tags: [`teacher-${slug}`], revalidate: 86400 });

// ─── Blog ────────────────────────────────────────────────────────────────────
export const getBlogPosts = () =>
  apiFetch<BlogPost[]>('/blog', { tags: ['blog'], revalidate: 600 });

export const getBlogPost = (slug: string) =>
  apiFetch<BlogPost>(`/blog/${slug}`, { tags: [`blog-${slug}`], revalidate: 3600 });

// ─── Forms ────────────────────────────────────────────────────────────────────
export const submitContactForm = (data: ContactFormData) =>
  apiFetch<{ success: boolean }>('/contact', {
    method: 'POST',
    body:   JSON.stringify(data),
    cache:  'no-store',
  });

export const submitEnrollForm = (data: EnrollFormData) =>
  apiFetch<{ success: boolean }>('/leads/enroll', {
    method: 'POST',
    body:   JSON.stringify(data),
    cache:  'no-store',
  });

export const subscribeNewsletter = (email: string) =>
  apiFetch<{ success: boolean }>('/newsletter/subscribe', {
    method: 'POST',
    body:   JSON.stringify({ email }),
    cache:  'no-store',
  });

// ─── Types (temporary — will move to @academy/shared-types) ──────────────────
interface Course {
  id: string; slug: string;
  title: Record<'az'|'en'|'ru', string>;
  description: Record<'az'|'en'|'ru', string>;
  duration: string; price: number | null;
  imageUrl: string | null; isActive: boolean; createdAt: string;
}
interface Teacher {
  id: string; slug: string;
  name: string; title: Record<'az'|'en'|'ru', string>;
  bio: Record<'az'|'en'|'ru', string>;
  imageUrl: string | null; socialLinks?: Record<string, string>;
}
interface BlogPost {
  id: string; slug: string;
  title: Record<'az'|'en'|'ru', string>;
  excerpt: Record<'az'|'en'|'ru', string>;
  content: Record<'az'|'en'|'ru', string>;
  coverImageUrl: string | null; publishedAt: string; readingTime: number;
  author: { name: string; imageUrl: string | null };
}
interface ContactFormData { name: string; email: string; phone?: string; subject: string; message: string; }
interface EnrollFormData   { name: string; email: string; phone: string; courseSlug?: string; }

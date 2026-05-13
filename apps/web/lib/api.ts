const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function apiFetch<T>(
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

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const getFaqs = () =>
  apiFetch<{ data: any[] }>('/faqs', { tags: ['faqs'], revalidate: 3600 })
    .then(res => res.data);

// ─── Courses ────────────────────────────────────────────────────────────────
export const getCourses = () =>
  apiFetch<{ data: Course[] }>('/courses', { tags: ['courses'], revalidate: 3600 })
    .then(res => res.data);

export const getCourse = (slug: string) =>
  apiFetch<{ data: Course }>(`/courses/${slug}`, { tags: [`course-${slug}`], revalidate: 3600 })
    .then(res => res.data);

// ─── Teachers ────────────────────────────────────────────────────────────────
export const getTeachers = () =>
  apiFetch<{ data: Teacher[] }>('/teachers', { tags: ['teachers'], revalidate: 86400 })
    .then(res => res.data);

export const getTeacher = (slug: string) =>
  apiFetch<{ data: Teacher }>(`/teachers/${slug}`, { tags: [`teacher-${slug}`], revalidate: 86400 })
    .then(res => res.data);

// ─── Blog ────────────────────────────────────────────────────────────────────
export const getBlogPosts = (params?: { locale?: string; limit?: number; excludeSlug?: string }) => {
  const query = new URLSearchParams();
  if (params?.locale) query.append('locale', params.locale);
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.excludeSlug) query.append('excludeSlug', params.excludeSlug);
  
  return apiFetch<{ data: BlogPost[] }>(`/blog?${query.toString()}`, { 
    tags: ['blog'], 
    revalidate: 600 
  }).then(res => res.data);
};

export const getBlogPost = (slug: string, locale: string = 'az') =>
  apiFetch<{ data: BlogPost }>(`/blog/${slug}?locale=${locale}`, { 
    tags: [`blog-${slug}`], 
    revalidate: 3600 
  }).then(res => res.data);

// ─── Forms ────────────────────────────────────────────────────────────────────
export const submitContactForm = (data: ContactFormData) =>
  apiFetch('/contacts', {
    method: 'POST',
    body:   JSON.stringify(data),
    cache:  'no-store',
  });

export const submitEnrollForm = (data: EnrollFormData) =>
  apiFetch('/leads', {
    method: 'POST',
    body:   JSON.stringify(data),
    cache:  'no-store',
  });

export const subscribeNewsletter = (email: string) =>
  apiFetch('/newsletter/subscribe', {
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
export interface Teacher {
  id: string; 
  slug: string;
  name: string; 
  position: string;
  bio: string;
  image: string | null; 
  socialLinks?: Record<string, string>;
}
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string | null;
  readingTime: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
  } | null;
}
interface ContactFormData { name: string; email: string; subject: string; message: string; }
interface EnrollFormData  { name: string; email: string; phone: string; course: string; }

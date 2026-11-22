const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/** Error carrying the HTTP status and the API's own (already localised) message. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const GET_TIMEOUT_MS = 5000;
// Form submissions wait for the API to send two emails; 5 s used to time out while the record
// had already been saved, so visitors re-submitted and hit the rate limit.
const WRITE_TIMEOUT_MS = 20000;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { tags?: string[]; revalidate?: number }
): Promise<T> {
  const { tags, revalidate, ...init } = options ?? {};
  const isWrite = !!init.method && init.method.toUpperCase() !== 'GET';
  const timeoutMs = isWrite ? WRITE_TIMEOUT_MS : GET_TIMEOUT_MS;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      // Only reads take part in the Next data cache.
      ...(isWrite ? {} : { next: { tags, revalidate } }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Surface the API's validation / rate-limit message instead of "API xətası: 400 — /contacts".
      let message = `API xətası: ${res.status}`;
      try {
        const body = await res.json();
        if (body && typeof body.message === 'string' && body.message) message = body.message;
      } catch {
        // non-JSON error body: keep the generic message
      }
      throw new ApiError(message, res.status, endpoint);
    }

    return (await res.json()) as T;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`API timeout (${timeoutMs}ms)`, 504, endpoint);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

/** True when the API answered 404 (as opposed to being down or erroring). */
export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;

const seg = (value: string) => encodeURIComponent(value);

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export interface Faq {
  id: string;
  /** Keyed by locale (az / en / ru). */
  question: Record<string, string>;
  answer: Record<string, string>;
  order: number;
  isActive: boolean;
}

export const getFaqs = () =>
  apiFetch<{ data: Faq[] }>('/faqs', { tags: ['faqs'], revalidate: 3600 })
    .then((res) => res.data)
    .catch(() => [] as Faq[]);

// ─── Courses ────────────────────────────────────────────────────────────────
export const getCourses = (locale?: string) =>
  apiFetch<{ data: CourseSummary[] }>(`/courses${locale ? `?locale=${seg(locale)}` : ''}`, {
    tags: ['courses'],
    revalidate: 3600,
  })
    .then((res) => res.data)
    .catch(() => [] as CourseSummary[]);

/**
 * Returns null only when the course does not exist (404). Other failures throw, so an API outage
 * during ISR revalidation keeps serving the last good page instead of caching a 404.
 */
export const getCourse = (slug: string, locale?: string) =>
  apiFetch<{ data: CourseSummary }>(`/courses/${seg(slug)}${locale ? `?locale=${seg(locale)}` : ''}`, {
    tags: [`course-${slug}`],
    revalidate: 3600,
  })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return null;
      throw error;
    });

// ─── Teachers ────────────────────────────────────────────────────────────────
export const getTeachers = (locale?: string) =>
  apiFetch<{ data: Teacher[] }>(`/teachers${locale ? `?locale=${seg(locale)}` : ''}`, {
    tags: ['teachers'],
    revalidate: 86400,
  })
    .then((res) => res.data)
    .catch(() => [] as Teacher[]);

/** null on 404 only; see getCourse. */
export const getTeacher = (slug: string, locale?: string) =>
  apiFetch<{ data: TeacherDetail }>(`/teachers/${seg(slug)}${locale ? `?locale=${seg(locale)}` : ''}`, {
    tags: [`teacher-${slug}`],
    revalidate: 86400,
  })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return null;
      throw error;
    });

// ─── Blog ────────────────────────────────────────────────────────────────────
export const getBlogPosts = (params?: { locale?: string; limit?: number; excludeSlug?: string }) => {
  const query = new URLSearchParams();
  if (params?.locale) query.append('locale', params.locale);
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.excludeSlug) query.append('excludeSlug', params.excludeSlug);

  return apiFetch<{ data: BlogPost[] }>(`/blog?${query.toString()}`, {
    tags: ['blog'],
    revalidate: 60,
  })
    .then((res) => res.data)
    .catch(() => [] as BlogPost[]);
};

/** null on 404 only; see getCourse. */
export const getBlogPost = (slug: string, locale: string = 'az') =>
  apiFetch<{ data: BlogPost }>(`/blog/${seg(slug)}?locale=${seg(locale)}`, {
    tags: [`blog-${slug}`],
    revalidate: 60,
  })
    .then((res) => res.data)
    .catch((error) => {
      if (isNotFound(error)) return null;
      throw error;
    });

// ─── Forms ────────────────────────────────────────────────────────────────────
// These throw ApiError with the API's message (validation text, "too many requests", ...),
// which the form components can show as-is.
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

// ─── Types (shapes returned by apps/api controllers) ────────────────────────
export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string | null;
  duration: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  image: string | null;
  isPopular: boolean;
  rating: string | null;
  studentsCount: string | null;
  category: { name?: string; slug?: string };
  teacher: { name?: string; image?: string | null; position?: string };
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
export interface TeacherCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  price: string | null;
  duration: string | null;
  level: string;
  rating: string | null;
  isPopular: boolean;
  category: { id: string; name: string; slug: string };
}
export interface TeacherDetail extends Teacher {
  courses: TeacherCourse[];
}
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string | null;
  readingTime: string | null;
  createdAt: string;
  updatedAt?: string;
  author: {
    id: string;
    name: string;
  } | null;
}
export interface ContactFormData { name: string; email: string; subject: string; message: string; }
export interface EnrollFormData  { name: string; email: string; phone: string; course: string; }

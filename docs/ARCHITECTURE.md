# ARCHITECTURE.md — Texniki Arxitektura

> **Layihə:** Academy Landing Page
> **Stack:** Next.js 15 + TypeScript / Node.js + TypeScript / PostgreSQL (Neon)
> **Son yenilənmə:** 2026

---

## 1. Ümumi Baxış

```
┌──────────────────────────────────────────────────────────────┐
│                        VISITOR                               │
│              Brauzer / Axtarış Mühərriki                    │
└─────────────────────┬────────────────────────────────────────┘
                      │  HTTPS
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  VERCEL EDGE NETWORK                         │
│         CDN + Edge Middleware + Image Optimization           │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              NEXT.JS 15 — App Router (SSR/SSG/ISR)           │
│                    apps/web                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Server      │  │ Client       │  │  API Routes         │ │
│  │ Components  │  │ Components   │  │  (proxy/rewrite)    │ │
│  │ (HTML gen.) │  │ (hydration)  │  │                     │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
└─────────────────────┬────────────────────────────────────────┘
                      │  REST API (JSON)
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              EXPRESS.JS — TypeScript (apps/api)              │
│         Controller → Service → Repository → ORM             │
└─────────────────────┬────────────────────────────────────────┘
                      │  Drizzle ORM + SSL
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              NEON — Serverless PostgreSQL                    │
│              (academy_db — pulsuz tier)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Arxitekturası — Next.js 15

### 2.1 App Router Rendering Strategiyaları

Next.js App Router ilə hər səhifə fərqli render strategiyası alır:

| Səhifə | Strategiya | Səbəb |
|---|---|---|
| `/` Ana səhifə | **SSG** | Dəyişmir, maksimum sürət |
| `/about` | **SSG** | Statik məzmun |
| `/courses` | **ISR** (1 saat) | Tez-tez dəyişmir, cache lazım |
| `/courses/[slug]` | **ISR** (1 saat) | Kurs məzmunu nadir dəyişir |
| `/teachers` | **SSG** | Nadir dəyişir |
| `/teachers/[slug]` | **SSG** | Nadir dəyişir |
| `/blog` | **ISR** (10 dəq) | Yeni yazılar gəlir |
| `/blog/[slug]` | **ISR** (1 saat) | Yazı məzmunu |
| `/contact` | **SSR** | Form + CSRF token |
| `/faq` | **SSG** | Statik |
| `/admin/**` | **Dynamic** | Auth tələb olunur |

```typescript
// SSG nümunəsi — app/[locale]/(marketing)/about/page.tsx
export const revalidate = false; // Həmişə statik

// ISR nümunəsi — app/[locale]/(marketing)/courses/page.tsx
export const revalidate = 3600; // Hər 1 saatda bir yenilə

// SSR nümunəsi — app/[locale]/(marketing)/contact/page.tsx
export const dynamic = 'force-dynamic';
```

---

### 2.2 Qovluq Strukturu — apps/web

```
apps/web/
│
├── app/
│   ├── [locale]/                    ← next-intl locale routing
│   │   │
│   │   ├── (marketing)/             ← Route Group: public səhifələr
│   │   │   ├── layout.tsx           ← Header + Footer + Nav
│   │   │   ├── page.tsx             ← / Ana səhifə
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx         ← Kurslar siyahısı
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     ← Tək kurs
│   │   │   ├── teachers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   └── faq/
│   │   │       └── page.tsx
│   │   │
│   │   └── (admin)/                 ← Route Group: admin panel
│   │       ├── layout.tsx           ← Auth guard layout
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── dashboard/
│   │           ├── page.tsx
│   │           ├── leads/
│   │           │   └── page.tsx
│   │           └── blog/
│   │               └── page.tsx
│   │
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts             ← ISR manual revalidasiya webhook
│   │
│   ├── sitemap.ts                   ← Dinamik sitemap.xml
│   ├── robots.ts                    ← robots.txt
│   ├── not-found.tsx                ← 404 səhifəsi
│   ├── error.tsx                    ← Global xəta səhifəsi
│   └── layout.tsx                   ← Root layout (fonts, providers)
│
├── components/
│   │
│   ├── ui/                          ← Atomik, yenidən istifadə olunan
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Divider.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   └── Modal.tsx
│   │
│   ├── sections/                    ← Səhifə bölmələri (Server Components)
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── CoursesPreview.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── CTASection.tsx
│   │   ├── courses/
│   │   │   ├── CourseGrid.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   └── CourseDetail.tsx
│   │   ├── teachers/
│   │   │   ├── TeacherGrid.tsx
│   │   │   └── TeacherCard.tsx
│   │   └── blog/
│   │       ├── BlogGrid.tsx
│   │       └── BlogCard.tsx
│   │
│   ├── forms/                       ← Client Components ('use client')
│   │   ├── ContactForm.tsx
│   │   ├── EnrollForm.tsx
│   │   └── NewsletterForm.tsx
│   │
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── Navbar.tsx
│       ├── MobileMenu.tsx
│       └── LanguageSwitcher.tsx
│
├── lib/
│   ├── api.ts                       ← API client (fetch wrapper)
│   ├── metadata.ts                  ← generateMetadata helper
│   ├── structured-data.ts           ← JSON-LD schema builder
│   ├── fonts.ts                     ← next/font konfiqurasiyası
│   └── utils.ts                     ← Ümumi yardımçılar
│
├── hooks/
│   ├── useMediaQuery.ts
│   ├── useScrollPosition.ts
│   └── useFormSubmit.ts
│
├── types/
│   ├── course.ts
│   ├── teacher.ts
│   ├── blog.ts
│   └── api.ts
│
├── messages/                        ← i18n
│   ├── az.json
│   ├── en.json
│   └── ru.json
│
├── public/
│   ├── images/
│   ├── fonts/
│   ├── icons/
│   └── og/                          ← Open Graph şəkilləri
│
├── middleware.ts                     ← next-intl + auth middleware
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

### 2.3 Server vs Client Component Strategiyası

```
QAYDA: Mümkün qədər Server Component. Yalnız lazım olduqda 'use client'.
```

**Server Components (default):**
```typescript
// ✅ Server Component — səhifənin əsas hissəsi
// app/[locale]/(marketing)/courses/page.tsx

import { getCourses } from '@/lib/api';
import { CourseGrid } from '@/components/sections/courses/CourseGrid';

export default async function CoursesPage() {
  const courses = await getCourses(); // Server-də fetch — SEO üçün əla

  return (
    <main>
      <CourseGrid courses={courses} />
    </main>
  );
}
```

**Client Components (yalnız interaktivlik üçün):**
```typescript
// ✅ Client Component — yalnız form interaktivliyi üçün
// components/forms/ContactForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ...
}
```

**Server + Client birlikdə:**
```typescript
// Server Component — məlumatı yükləyir
async function CourseDetailPage({ params }) {
  const course = await getCourse(params.slug);

  return (
    <div>
      {/* Server Component — statik məzmun */}
      <CourseInfo course={course} />

      {/* Client Component — qeydiyyat forması */}
      <EnrollForm courseId={course.id} />
    </div>
  );
}
```

---

### 2.4 Data Fetching Patternləri

```typescript
// lib/api.ts — Mərkəzləşdirilmiş API client

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { tags?: string[] }
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: {
      tags:      options?.tags,       // Cache tag — revalidasiya üçün
      revalidate: options?.revalidate, // ISR vaxtı
    },
  });

  if (!res.ok) {
    throw new Error(`API xətası: ${res.status}`);
  }

  return res.json();
}

// İstifadə nümunələri:
export const getCourses = () =>
  apiFetch<Course[]>('/courses', {
    tags:       ['courses'],
    revalidate: 3600,          // 1 saat cache
  });

export const getCourse = (slug: string) =>
  apiFetch<Course>(`/courses/${slug}`, {
    tags:       [`course-${slug}`],
    revalidate: 3600,
  });

export const submitContactForm = (data: ContactFormData) =>
  apiFetch<{ success: boolean }>('/contact', {
    method: 'POST',
    body:   JSON.stringify(data),
    cache:  'no-store',         // Form — cache yoxdur
  });
```

---

### 2.5 Middleware — i18n + Auth

```typescript
// middleware.ts

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales:       ['az', 'en', 'ru'],
  defaultLocale: 'az',
  localePrefix:  'as-needed',  // Default dil üçün prefix olmur
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin panel — JWT yoxlama
  if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
    const token = request.cookies.get('admin_token');

    if (!token) {
      return NextResponse.redirect(new URL('/az/admin/login', request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

## 3. Backend Arxitekturası — Express + TypeScript

### 3.1 Qovluq Strukturu — apps/api

```
apps/api/src/
│
├── config/
│   ├── db.ts              ← Neon PostgreSQL bağlantısı (Drizzle)
│   ├── env.ts             ← Tip-güclü env (Zod ilə parse)
│   └── cors.ts            ← CORS parametrləri
│
├── controllers/           ← HTTP layer — request/response idarəsi
│   ├── contact.controller.ts
│   ├── course.controller.ts
│   ├── teacher.controller.ts
│   ├── blog.controller.ts
│   ├── lead.controller.ts
│   └── auth.controller.ts
│
├── services/              ← Biznes məntiqi
│   ├── contact.service.ts
│   ├── course.service.ts
│   ├── teacher.service.ts
│   ├── blog.service.ts
│   ├── lead.service.ts
│   ├── email.service.ts   ← Nodemailer wrapper
│   └── auth.service.ts
│
├── repositories/          ← Database layer (Drizzle sorğuları)
│   ├── course.repository.ts
│   ├── teacher.repository.ts
│   ├── blog.repository.ts
│   └── lead.repository.ts
│
├── middleware/
│   ├── auth.middleware.ts     ← JWT yoxlama
│   ├── validate.middleware.ts ← Zod validasiya
│   ├── error.middleware.ts    ← Global xəta tutma
│   ├── rateLimit.middleware.ts
│   └── logger.middleware.ts
│
├── routes/
│   ├── index.ts           ← Bütün route-lar birləşdirilir
│   ├── contact.routes.ts
│   ├── courses.routes.ts
│   ├── teachers.routes.ts
│   ├── blog.routes.ts
│   ├── leads.routes.ts
│   └── auth.routes.ts
│
├── schemas/               ← Zod validation schema-lar
│   ├── contact.schema.ts
│   ├── lead.schema.ts
│   └── auth.schema.ts
│
├── types/
│   ├── express.d.ts       ← Express Request type genişlənmə
│   └── index.ts
│
├── utils/
│   ├── apiResponse.ts     ← Standart cavab formatı
│   ├── asyncHandler.ts    ← try/catch wrapper
│   └── AppError.ts        ← Xüsusi xəta sinifi
│
└── app.ts                 ← Express app konfiqurasiyası
    index.ts               ← Entry point (server başladılması)
```

---

### 3.2 Layered Architecture (Qatlı Arxitektura)

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────┐
│           ROUTE LAYER               │
│   express.Router() — URL mapping   │
│   + middleware zənciri              │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         CONTROLLER LAYER            │
│   Request parse → Service çağır    │
│   → Response formatla               │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│          SERVICE LAYER              │
│   Biznes qaydaları                  │
│   Email göndər, validasiya et       │
│   Repository-dən məlumat al        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│        REPOSITORY LAYER             │
│   Drizzle ORM ilə DB sorğuları     │
│   Yalnız CRUD əməliyyatları        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│   NEON POSTGRESQL                   │
│   Serverless + SSL                  │
└─────────────────────────────────────┘
```

### 3.3 Nümunə — Contact forması axını

```typescript
// routes/contact.routes.ts
router.post(
  '/contact',
  contactRateLimit,                    // 1. Rate limit yoxla
  validate(contactSchema),             // 2. Zod validasiya
  contactController.submit             // 3. Controller-ə ötür
);

// controllers/contact.controller.ts
export const submit = asyncHandler(async (req, res) => {
  const data = req.body as ContactFormData;
  const result = await contactService.processSubmission(data);

  return apiResponse.success(res, {
    message: 'Müraciətiniz qəbul edildi',
    data:    result,
    status:  201,
  });
});

// services/contact.service.ts
export async function processSubmission(data: ContactFormData) {
  // 1. Lead-i DB-yə yaz
  const lead = await leadRepository.create({
    name:    data.name,
    email:   data.email,
    phone:   data.phone,
    message: data.message,
    source:  'contact_form',
  });

  // 2. Admin-ə email göndər
  await emailService.sendAdminNotification(lead);

  // 3. İstifadəçiyə təsdiq emaili göndər
  await emailService.sendUserConfirmation(data.email, data.name);

  // 4. Next.js cache-i revalidasiya et (admin panel üçün)
  await revalidateCache(['leads']);

  return { id: lead.id };
}
```

---

### 3.4 Tip-güclü Mühit Dəyişənləri

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  PORT:               z.string().default('5000'),
  NODE_ENV:           z.enum(['development', 'test', 'production']),
  DATABASE_URL:       z.string().url(),
  JWT_SECRET:         z.string().min(32),
  JWT_EXPIRES_IN:     z.string().default('7d'),
  SMTP_HOST:          z.string(),
  SMTP_PORT:          z.coerce.number().default(587),
  SMTP_USER:          z.string().email(),
  SMTP_PASS:          z.string(),
  CLIENT_URL:         z.string().url(),
  ADMIN_EMAIL:        z.string().email(),
  NOTIFICATION_EMAIL: z.string().email(),
  REVALIDATE_SECRET:  z.string().min(16),
});

export type Env = z.infer<typeof envSchema>;

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Mühit dəyişənləri yanlışdır:');
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;
```

---

## 4. Monorepo Strukturu — Turborepo

```
academy-landing/
├── apps/
│   ├── web/         ← Next.js (port 3000)
│   └── api/         ← Express (port 5000)
│
├── packages/
│   ├── shared-types/          ← Ortaq TypeScript tipləri
│   │   └── src/
│   │       ├── course.ts
│   │       ├── teacher.ts
│   │       ├── blog.ts
│   │       └── api-responses.ts
│   │
│   └── shared-utils/          ← Ortaq utility funksiyalar
│       └── src/
│           ├── formatDate.ts
│           ├── slugify.ts
│           └── validators.ts
│
└── turbo.json
```

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Ortaq tip istifadəsi:**
```typescript
// packages/shared-types/src/course.ts
export interface Course {
  id:          string;
  slug:        string;
  title:       Record<'az' | 'en' | 'ru', string>;
  description: Record<'az' | 'en' | 'ru', string>;
  duration:    string;
  price:       number | null;
  imageUrl:    string | null;
  isActive:    boolean;
  createdAt:   string;
}

// apps/web — import:
import type { Course } from '@academy/shared-types';

// apps/api — import:
import type { Course } from '@academy/shared-types';
```

---

## 5. Performans Arxitekturası

### Image Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats:          ['image/avif', 'image/webp'],
    deviceSizes:      [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL:  86400,          // 1 gün cache
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.cahanacademy.az' },
    ],
  },
};
```

```tsx
// Hero şəkli — LCP optimizasiyası
<Image
  src="/images/hero.jpg"
  alt="Cahan Academy"
  priority                    // LCP elementi — preload
  placeholder="blur"
  blurDataURL={blurUrl}
  fill
  sizes="100vw"
/>
```

### Font Optimization

```typescript
// lib/fonts.ts — next/font ilə sıfır layout shift
import { Playfair_Display, Inter } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-heading',
  display:  'swap',
});

export const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-body',
  display:  'swap',
});
```

### Bundle Optimization

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};
```

---

## 6. Cache Strategiyası

```
┌─────────────────────────────────────────────────────────┐
│                  CACHE HİYERARXİYASI                    │
├─────────────────────────────────────────────────────────┤
│ 1. CDN Cache (Vercel Edge)       — 1 gün               │
│    Statik fayllar, şəkillər                             │
├─────────────────────────────────────────────────────────┤
│ 2. Full Page Cache (Next.js)     — SSG/ISR              │
│    Kurslar: 1 saat | Blog: 10 dəq                       │
├─────────────────────────────────────────────────────────┤
│ 3. Data Cache (fetch cache)      — tag əsaslı           │
│    revalidateTag('courses') — admin dəyişdirəndə        │
├─────────────────────────────────────────────────────────┤
│ 4. Router Cache (client-side)    — 30 saniyə            │
│    Naviqasiya prefetch                                  │
└─────────────────────────────────────────────────────────┘
```

**Manual revalidasiya webhook:**

```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'İcazəsiz' }, { status: 401 });
  }

  const { tag } = await request.json();
  revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tag });
}

// Backend-dən çağırış:
// POST /api/revalidate?secret=xxx  { "tag": "courses" }
```

---

## 7. Xəta İdarəsi Arxitekturası

### Frontend

```typescript
// app/error.tsx — Global xəta sərhədi
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error:  Error;
  reset:  () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2>Xəta baş verdi</h2>
        <button onClick={reset}>Yenidən cəhd et</button>
      </div>
    </div>
  );
}

// app/not-found.tsx — 404 SEO-friendly
export default function NotFound() {
  return (
    <div>
      <h1>Səhifə tapılmadı</h1>
      <p>Axtardığınız səhifə mövcud deyil.</p>
    </div>
  );
}
```

### Backend

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public message:    string,
    public statusCode: number,
    public errorCode:  string = 'INTERNAL_ERROR',
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// middleware/error.middleware.ts
export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'Xidmət müvəqqəti əlçatmazdır';

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success:    false,
    message,
    error:      err.errorCode || 'INTERNAL_ERROR',
    statusCode,
  });
};
```

---

## 8. Gələcək Miqyaslanma Planı

| Addım | Texnologiya | Məqsəd |
|---|---|---|
| CMS inteqrasiyası | Sanity / Contentful | Bloq + kurs məzmununu koddan ayır |
| Real-time bildirişlər | Pusher / Ably | Admin-ə ani lead bildirişi |
| Analytics | PostHog (open-source) | İstifadəçi davranış analitikası |
| Search | Algolia / Meilisearch | Kurs axtarışı |
| Media CDN | Cloudinary | Şəkil/video hosting |
| Monitoring | Sentry | Xəta izləmə |

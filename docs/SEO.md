# SEO.md — Axtarış Motoru Optimizasiyası

> **Layihə:** Academy Landing Page
> **Framework:** Next.js 15 App Router
> **Son yenilənmə:** 2026

---

## 1. SEO Strategiyasına Ümumi Baxış

```
┌──────────────────────────────────────────────────────────────┐
│                    SEO QATLARL                               │
├──────────────────────────────────────────────────────────────┤
│ 1. TEXNİKİ SEO                                               │
│    SSR/SSG ilə tam render, sitemap, robots, canonical        │
├──────────────────────────────────────────────────────────────┤
│ 2. ON-PAGE SEO                                               │
│    generateMetadata(), başlıq iyerarxiyası, alt teqləri     │
├──────────────────────────────────────────────────────────────┤
│ 3. STRUKTURLU MƏLUMAT (JSON-LD)                              │
│    Organization, Course, Person, FAQPage, BreadcrumbList     │
├──────────────────────────────────────────────────────────────┤
│ 4. SOSIAL MEDIA (OG + Twitter Cards)                         │
│    Facebook, Twitter/X, LinkedIn paylaşım kartları           │
├──────────────────────────────────────────────────────────────┤
│ 5. PERFORMANS (Core Web Vitals)                              │
│    LCP < 2.5s, CLS < 0.1, FID < 100ms                       │
├──────────────────────────────────────────────────────────────┤
│ 6. BEYNƏLXALQ SEO (hreflang)                                 │
│    az / en / ru — hər dil üçün ayrı URL                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. generateMetadata — Səhifə Metadata

### 2.1 Root Layout — Qlobal Metadata

```typescript
// app/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://cahanacademy.az'),

  // Default — alt səhifələr override edə bilər
  title: {
    default:  'Cahan Academy — Peşəkar Tədris Mərkəzi',
    template: '%s | Cahan Academy',
  },
  description:
    'Bakıda ən yaxşı tədris mərkəzi. Proqramlaşdırma, dizayn, riyaziyyat kursları. ' +
    'Peşəkar müəllimlər, sertifikat proqramları.',

  keywords: [
    'akademiya Bakı',
    'kurslar Bakı',
    'proqramlaşdırma kursları',
    'tədris mərkəzi',
    'Cahan Academy',
    'онлайн курсы Баку',
    'programming courses Baku',
  ],

  authors:   [{ name: 'Cahan Academy', url: 'https://cahanacademy.az' }],
  creator:   'Cahan Academy',
  publisher: 'Cahan Academy',

  // Robots
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  // Open Graph — qlobal fallback
  openGraph: {
    type:        'website',
    locale:      'az_AZ',
    url:         'https://cahanacademy.az',
    siteName:    'Cahan Academy',
    title:       'Cahan Academy — Peşəkar Tədris Mərkəzi',
    description: 'Bakıda ən yaxşı tədris mərkəzi. Proqramlaşdırma, dizayn, riyaziyyat.',
    images: [
      {
        url:    '/og/default.jpg',
        width:  1200,
        height: 630,
        alt:    'Cahan Academy',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card:        'summary_large_image',
    site:        '@cahanacademy',
    creator:     '@cahanacademy',
    title:       'Cahan Academy — Peşəkar Tədris Mərkəzi',
    description: 'Bakıda ən yaxşı tədris mərkəzi.',
    images:      ['/og/default.jpg'],
  },

  // Verification
  verification: {
    google: 'GOOGLE_SEARCH_CONSOLE_TOKEN',
    yandex: 'YANDEX_WEBMASTER_TOKEN',
  },

  // Alternates (hreflang)
  alternates: {
    canonical:  'https://cahanacademy.az',
    languages: {
      'az':    'https://cahanacademy.az',
      'en':    'https://cahanacademy.az/en',
      'ru':    'https://cahanacademy.az/ru',
      'x-default': 'https://cahanacademy.az',
    },
  },
};
```

---

### 2.2 Metadata Helper Funksiyası

```typescript
// lib/metadata.ts

import type { Metadata } from 'next';

interface PageMetaOptions {
  title:           string;
  description:     string;
  slug:            string;
  locale:          'az' | 'en' | 'ru';
  ogImage?:        string;
  noIndex?:        boolean;
  keywords?:       string[];
  publishedTime?:  string;
  modifiedTime?:   string;
  type?:           'website' | 'article';
}

const SITE_URL    = 'https://cahanacademy.az';
const SITE_NAME   = 'Cahan Academy';
const LOCALE_MAP  = { az: 'az_AZ', en: 'en_US', ru: 'ru_RU' };
const LOCALE_PREFIX = { az: '', en: '/en', ru: '/ru' };

export function buildMetadata(opts: PageMetaOptions): Metadata {
  const {
    title, description, slug, locale,
    ogImage = '/og/default.jpg',
    noIndex = false,
    keywords = [],
    publishedTime, modifiedTime,
    type = 'website',
  } = opts;

  const prefix  = LOCALE_PREFIX[locale];
  const pageUrl = `${SITE_URL}${prefix}${slug}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,

    robots: noIndex
      ? { index: false, follow: false }
      : { index: true,  follow: true  },

    alternates: {
      canonical: pageUrl,
      languages: {
        'az': `${SITE_URL}${slug}`,
        'en': `${SITE_URL}/en${slug}`,
        'ru': `${SITE_URL}/ru${slug}`,
        'x-default': `${SITE_URL}${slug}`,
      },
    },

    openGraph: {
      type,
      url:         pageUrl,
      siteName:    SITE_NAME,
      locale:      LOCALE_MAP[locale],
      title:       fullTitle,
      description,
      images: [{
        url:    ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`,
        width:  1200,
        height: 630,
        alt:    title,
      }],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime,
      }),
    },

    twitter: {
      card:        'summary_large_image',
      title:       fullTitle,
      description,
      images:      [ogImage],
    },
  };
}
```

---

### 2.3 Səhifə Metadata Nümunələri

```typescript
// app/[locale]/(marketing)/page.tsx — Ana səhifə
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as 'az' | 'en' | 'ru';

  const titles = {
    az: 'Cahan Academy — Peşəkar Tədris Mərkəzi Bakıda',
    en: 'Cahan Academy — Professional Education Center in Baku',
    ru: 'Cahan Academy — Профессиональный учебный центр в Баку',
  };

  const descriptions = {
    az: 'Bakıda ən yaxşı tədris mərkəzi. Proqramlaşdırma, dizayn, riyaziyyat kursları. Peşəkar müəllimlər, sertifikat proqramları, çevik cədvəl.',
    en: 'Best education center in Baku. Programming, design, mathematics courses. Professional teachers, certification programs, flexible schedule.',
    ru: 'Лучший учебный центр в Баку. Курсы программирования, дизайна, математики. Профессиональные преподаватели, сертификаты.',
  };

  return buildMetadata({
    title:       titles[locale],
    description: descriptions[locale],
    slug:        '/',
    locale,
    ogImage:     '/og/home.jpg',
  });
}

// app/[locale]/(marketing)/courses/[slug]/page.tsx — Tək kurs
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params;
  const course = await getCourse(slug);

  if (!course) return { title: 'Kurs tapılmadı' };

  return buildMetadata({
    title:       course.title[locale],
    description: course.description[locale],
    slug:        `/courses/${slug}`,
    locale,
    ogImage:     course.imageUrl || '/og/course-default.jpg',
    keywords:    [`${course.title[locale]} kursu`, 'kurs Bakı', 'tədris'],
    type:        'website',
  });
}

// app/[locale]/(marketing)/blog/[slug]/page.tsx — Blog yazısı
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params;
  const post = await getBlogPost(slug);

  if (!post) return { title: 'Yazı tapılmadı' };

  return buildMetadata({
    title:         post.title[locale],
    description:   post.excerpt[locale],
    slug:          `/blog/${slug}`,
    locale,
    ogImage:       post.coverImage || '/og/blog-default.jpg',
    type:          'article',
    publishedTime: post.publishedAt,
    modifiedTime:  post.updatedAt,
  });
}
```

---

## 3. Strukturlu Məlumat — JSON-LD (Schema.org)

### 3.1 Organization Schema — Ana Səhifə

```typescript
// lib/structured-data.ts

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type':    'EducationalOrganization',
    '@id':      'https://cahanacademy.az/#organization',
    name:       'Cahan Academy',
    url:        'https://cahanacademy.az',
    logo: {
      '@type':       'ImageObject',
      url:           'https://cahanacademy.az/images/logo.png',
      width:         400,
      height:        400,
    },
    image:      'https://cahanacademy.az/og/home.jpg',
    description:
      'Bakıda peşəkar tədris mərkəzi. Proqramlaşdırma, dizayn, riyaziyyat kursları.',
    address: {
      '@type':           'PostalAddress',
      streetAddress:     'Nizami küçəsi 100',
      addressLocality:   'Bakı',
      addressRegion:     'Bakı',
      postalCode:        'AZ1000',
      addressCountry:    'AZ',
    },
    contactPoint: {
      '@type':       'ContactPoint',
      telephone:     '+994501234567',
      contactType:   'customer service',
      availableLanguage: ['Azerbaijani', 'English', 'Russian'],
    },
    sameAs: [
      'https://www.facebook.com/cahanacademy',
      'https://www.instagram.com/cahanacademy',
      'https://www.linkedin.com/company/cahanacademy',
      'https://www.youtube.com/@cahanacademy',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:    'Kurslar',
      url:     'https://cahanacademy.az/kurslar',
    },
  };
}
```

### 3.2 Course Schema

```typescript
export function courseSchema(course: Course, locale: string) {
  return {
    '@context':    'https://schema.org',
    '@type':       'Course',
    name:          course.title[locale],
    description:   course.description[locale],
    url:           `https://cahanacademy.az/kurslar/${course.slug}`,
    image:         course.imageUrl,
    inLanguage:    locale === 'az' ? 'az' : locale === 'en' ? 'en' : 'ru',
    provider: {
      '@type': 'Organization',
      name:    'Cahan Academy',
      url:     'https://cahanacademy.az',
    },
    offers: course.price
      ? {
          '@type':         'Offer',
          price:           course.price,
          priceCurrency:   'AZN',
          availability:    'https://schema.org/InStock',
          url:             `https://cahanacademy.az/kurslar/${course.slug}`,
        }
      : {
          '@type':         'Offer',
          price:           0,
          priceCurrency:   'AZN',
          availability:    'https://schema.org/InStock',
        },
    hasCourseInstance: {
      '@type':              'CourseInstance',
      courseMode:           'blended',
      courseWorkload:       course.duration,
      instructor: course.teacher
        ? {
            '@type': 'Person',
            name:    course.teacher.name,
            url:     `https://cahanacademy.az/muellimler/${course.teacher.slug}`,
          }
        : undefined,
    },
  };
}
```

### 3.3 Person Schema — Müəllim

```typescript
export function teacherSchema(teacher: Teacher, locale: string) {
  return {
    '@context':   'https://schema.org',
    '@type':      'Person',
    name:         teacher.name,
    description:  teacher.bio[locale],
    image:        teacher.avatarUrl,
    url:          `https://cahanacademy.az/muellimler/${teacher.slug}`,
    jobTitle:     teacher.title[locale],
    worksFor: {
      '@type': 'Organization',
      name:    'Cahan Academy',
      url:     'https://cahanacademy.az',
    },
    sameAs: [
      teacher.linkedinUrl,
      teacher.twitterUrl,
    ].filter(Boolean),
  };
}
```

### 3.4 FAQPage Schema

```typescript
export function faqSchema(faqs: FAQ[], locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type':        'Question',
      name:           faq.question[locale],
      acceptedAnswer: {
        '@type': 'Answer',
        text:    faq.answer[locale],
      },
    })),
  };
}
```

### 3.5 BreadcrumbList Schema

```typescript
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context':        'https://schema.org',
    '@type':           'BreadcrumbList',
    itemListElement:   items.map((item, index) => ({
      '@type':   'ListItem',
      position:  index + 1,
      name:      item.name,
      item:      item.url,
    })),
  };
}
```

### 3.6 JSON-LD Komponenti

```typescript
// components/ui/JsonLd.tsx
// Server Component — client JS olmadan render olunur

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, 0),
      }}
    />
  );
}

// Səhifədə istifadə:
// app/[locale]/(marketing)/page.tsx
export default function HomePage() {
  return (
    <>
      <JsonLd schema={organizationSchema()} />
      <JsonLd schema={breadcrumbSchema([
        { name: 'Ana Səhifə', url: 'https://cahanacademy.az' },
      ])} />
      <main>...</main>
    </>
  );
}
```

---

## 4. Sitemap — Dinamik Generasiya

```typescript
// app/sitemap.ts

import type { MetadataRoute } from 'next';
import { getCourses, getTeachers, getBlogPosts } from '@/lib/api';

const SITE_URL = 'https://cahanacademy.az';
const LOCALES  = ['az', 'en', 'ru'] as const;

type Locale = typeof LOCALES[number];

function localizedUrls(path: string, priority: number, changeFreq: string) {
  return LOCALES.map((locale) => ({
    url:             locale === 'az' ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`,
    lastModified:    new Date(),
    changeFrequency: changeFreq as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [
          l,
          l === 'az' ? `${SITE_URL}${path}` : `${SITE_URL}/${l}${path}`,
        ])
      ),
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, teachers, posts] = await Promise.all([
    getCourses(),
    getTeachers(),
    getBlogPosts(),
  ]);

  // Statik səhifələr
  const staticPages = [
    { path: '/',         priority: 1.0, freq: 'daily'   },
    { path: '/about',    priority: 0.8, freq: 'monthly'  },
    { path: '/courses',  priority: 0.9, freq: 'weekly'   },
    { path: '/teachers', priority: 0.8, freq: 'monthly'  },
    { path: '/blog',     priority: 0.8, freq: 'daily'    },
    { path: '/contact',  priority: 0.7, freq: 'monthly'  },
    { path: '/faq',      priority: 0.6, freq: 'monthly'  },
  ].flatMap(({ path, priority, freq }) =>
    localizedUrls(path, priority, freq)
  );

  // Dinamik kurs səhifələri
  const coursePages = courses.flatMap((course) =>
    localizedUrls(`/courses/${course.slug}`, 0.85, 'weekly')
  );

  // Dinamik müəllim səhifələri
  const teacherPages = teachers.flatMap((teacher) =>
    localizedUrls(`/teachers/${teacher.slug}`, 0.75, 'monthly')
  );

  // Dinamik blog yazıları
  const blogPages = posts.flatMap((post) =>
    LOCALES.map((locale) => ({
      url:             locale === 'az'
        ? `${SITE_URL}/blog/${post.slug}`
        : `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified:    new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority:        0.7,
    }))
  );

  return [...staticPages, ...coursePages, ...teacherPages, ...blogPages];
}
```

---

## 5. Robots.txt

```typescript
// app/robots.ts

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/az/admin/',
          '/en/admin/',
          '/ru/admin/',
        ],
      },
      {
        // Yavaş botları məhdudlaşdır
        userAgent:   ['AhrefsBot', 'SemrushBot'],
        crawlDelay:  10,
        allow:       '/',
        disallow:    ['/admin/', '/api/'],
      },
    ],
    sitemap:  'https://cahanacademy.az/sitemap.xml',
    host:     'https://cahanacademy.az',
  };
}
```

---

## 6. Beynəlxalq SEO — hreflang

### 6.1 next-intl Konfiqurasiyası

```typescript
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

export default withNextIntl({
  // ...
});

// i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));

// middleware.ts — URL prefix strategiyası
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales:        ['az', 'en', 'ru'],
  defaultLocale:  'az',
  localePrefix:   'as-needed',
  // az: cahanacademy.az/kurslar   (prefix yoxdur)
  // en: cahanacademy.az/en/courses
  // ru: cahanacademy.az/ru/kursy
});
```

### 6.2 Hreflang Teqləri

```typescript
// lib/metadata.ts — buildMetadata içindəki alternates:
alternates: {
  canonical: `https://cahanacademy.az${slug}`,
  languages: {
    'az':        `https://cahanacademy.az${slug}`,
    'en':        `https://cahanacademy.az/en${slug}`,
    'ru':        `https://cahanacademy.az/ru${slug}`,
    'x-default': `https://cahanacademy.az${slug}`,
  },
},

// Next.js bunları avtomatik <head>-ə yazır:
// <link rel="alternate" hreflang="az"        href="https://cahanacademy.az/kurslar" />
// <link rel="alternate" hreflang="en"        href="https://cahanacademy.az/en/courses" />
// <link rel="alternate" hreflang="ru"        href="https://cahanacademy.az/ru/kursy" />
// <link rel="alternate" hreflang="x-default" href="https://cahanacademy.az/kurslar" />
```

---

## 7. Open Graph Şəkilləri

### 7.1 OG Şəkli Ölçüləri

| Platforma | Ölçü | Format |
|---|---|---|
| Facebook / LinkedIn | 1200 × 630 px | JPG/PNG |
| Twitter / X | 1200 × 630 px | JPG/PNG |
| WhatsApp | 1200 × 630 px | JPG |
| Telegram | 1200 × 630 px | JPG |

### 7.2 Dinamik OG Şəkil Generasiyası

```typescript
// app/api/og/route.tsx
// Next.js ImageResponse ilə dinamik OG şəkillər

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title       = searchParams.get('title') || 'Cahan Academy';
  const description = searchParams.get('description') || '';
  const type        = searchParams.get('type') || 'default';

  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'flex-end',
          padding:         '60px',
          background:      'linear-gradient(135deg, #1C1C1E 0%, #2D1B2E 100%)',
          fontFamily:      'Georgia, serif',
        }}
      >
        {/* Qızılı dekor xətti */}
        <div
          style={{
            position:   'absolute',
            top:        0,
            left:       0,
            right:      0,
            height:     '6px',
            background: 'linear-gradient(90deg, #C9A84C, #E8D5A3, #C9A84C)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
          <div
            style={{
              color:      '#C9A84C',
              fontSize:   '18px',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            CAHAN ACADEMY
          </div>
        </div>

        {/* Başlıq */}
        <div
          style={{
            color:        '#FAFAF8',
            fontSize:     title.length > 40 ? '42px' : '54px',
            fontWeight:   'bold',
            lineHeight:   1.2,
            marginBottom: '20px',
            maxWidth:     '900px',
          }}
        >
          {title}
        </div>

        {/* Açıqlama */}
        {description && (
          <div
            style={{
              color:     '#9CA3AF',
              fontSize:  '24px',
              maxWidth:  '800px',
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom:   '40px',
            right:    '60px',
            color:    '#C9A84C',
            fontSize: '18px',
          }}
        >
          cahanacademy.az
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  );
}

// Kurs OG URL-i:
// /api/og?title=Python+Kursu&description=Sıfırdan+peşəkara&type=course
// buildMetadata-da:
// ogImage: `/api/og?title=${encodeURIComponent(course.title[locale])}`
```

---

## 8. Başlıq İyerarxiyası

```
QAYDA: Hər səhifədə yalnız bir <h1>. Heç vaxt səviyyə atlamayın.

✅ Düzgün:
  <h1>  Kurslarımız                    → SEO açar sözü
    <h2>  Proqramlaşdırma             → Kateqoriya
      <h3>  Python Başlanğıc          → Alt kateqoriya
      <h3>  Python Orta Səviyyə
    <h2>  Dizayn
      <h3>  UI/UX Dizayn

❌ Yanlış:
  <h1>  Kurslarımız
    <h3>  Python  ← h2 atlandı!
  <h2>  Haqqımızda  ← ikinci h2 səhifənin başlıq rolunu pozur
```

```typescript
// components/sections/home/HeroSection.tsx
// Ana açar söz h1-dədir
<h1 className="font-heading text-5xl lg:text-7xl">
  Gələcəyinizi Bizimlə Qurun
</h1>
<p className="text-xl text-text-secondary">
  Bakıda ən müasir tədris mərkəzi. Peşəkar müəllimlərlə
  proqramlaşdırma, dizayn, riyaziyyat kursları.
</p>
```

---

## 9. Şəkil SEO

```typescript
// ✅ Bütün şəkillərdə məcburi alt atributu
<Image
  src={course.imageUrl}
  alt={`${course.title[locale]} kursu — Cahan Academy`}
  width={600}
  height={400}
/>

// ✅ Dekorativ şəkillərdə boş alt (screen reader atlar)
<Image
  src="/images/decorative-line.svg"
  alt=""
  aria-hidden="true"
  width={200}
  height={4}
/>

// ✅ Şəkil fayl adlandırma qaydaları:
// python-kursu-baki.jpg      ← açar söz daxildir
// muellim-leyla-memmedova.jpg ← şəxs adı daxildir
// cahan-academy-binasi.jpg    ← marka daxildir
// image001.jpg               ← ❌ Yanlış — mənasız ad
```

---

## 10. Canonical URL İdarəsi

```typescript
// Problematik hallar — dublikat məzmun:

// 1. Pagination — yalnız ilk səhifəyə canonical
/blog?page=1  →  canonical: /blog
/blog?page=2  →  canonical: /blog?page=2  (öz canonical-ı)

// 2. UTM parametrləri — canonical-da yoxdur
/contact?utm_source=instagram  →  canonical: /contact

// 3. Trailing slash — hər yerdə eyni
/kurslar/   →  canonical: /kurslar
/kurslar    →  canonical: /kurslar  (eyni)

// next.config.ts-də trailing slash idarəsi:
const nextConfig = {
  trailingSlash: false,  // /kurslar/ → /kurslar redirect
};
```

---

## 11. Core Web Vitals Optimizasiyası

### LCP — Largest Contentful Paint (Hədəf: < 2.5s)

```typescript
// Hero şəklinə priority + preconnect
// app/[locale]/(marketing)/layout.tsx
export default function MarketingLayout({ children }) {
  return (
    <>
      {/* Kritik resursları öncədən yüklə */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://cdn.cahanacademy.az" />
      {children}
    </>
  );
}

// HeroSection.tsx — LCP elementi
<Image
  src="/images/hero-bg.jpg"
  alt="Cahan Academy tədris mərkəzi"
  priority          // ← preload əlavə edir, LCP üçün kritik
  fetchPriority="high"
  fill
  sizes="100vw"
  quality={85}
/>
```

### CLS — Cumulative Layout Shift (Hədəf: < 0.1)

```typescript
// ✅ Şəkillərə həmişə ölçü verin — layout shift olmaz
<Image width={600} height={400} src="..." alt="..." />

// ✅ Font display: swap — font yüklənənə qədər fallback
// lib/fonts.ts-də: display: 'swap'

// ✅ Skeleton loader — məzmun yüklənənə qədər yer tutur
function CourseCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4" />
      <div className="bg-gray-200 h-6 rounded w-3/4 mb-2" />
      <div className="bg-gray-200 h-4 rounded w-1/2" />
    </div>
  );
}

// ✅ Reklam/banner üçün min-height — layout shift önlənir
<div style={{ minHeight: '250px' }}>
  <AdBanner />
</div>
```

### FID / INP — Interactivity (Hədəf: < 100ms)

```typescript
// ✅ Ağır JS-i lazy load et
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr:     false,
});

// ✅ Event handler-ları debounce et
import { useCallback } from 'react';
import { debounce }    from '@/lib/utils';

const handleSearch = useCallback(
  debounce((value: string) => {
    // Axtarış sorğusu
  }, 300),
  []
);
```

---

## 12. SEO Yoxlama Siyahısı

```
TEXNİKİ SEO
  [ ]  HTTPS aktiv
  [ ]  www → non-www (və ya əksinə) redirect
  [ ]  Sitemap: cahanacademy.az/sitemap.xml mövcuddur
  [ ]  Robots: cahanacademy.az/robots.txt mövcuddur
  [ ]  404 xəta səhifəsi mövcuddur və düzgün status qaytarır
  [ ]  Bütün səhifələrdə canonical URL var
  [ ]  Hreflang teqləri düzgün qurulub (az/en/ru)
  [ ]  Mobil uyğun (Mobile-Friendly Test keçir)
  [ ]  Sıxılma (gzip/brotli) aktiv (Vercel avtomatik edir)

ON-PAGE SEO
  [ ]  Hər səhifədə unikal title (50-60 simvol)
  [ ]  Hər səhifədə unikal meta description (150-160 simvol)
  [ ]  Hər səhifədə yalnız bir <h1>
  [ ]  Başlıq iyerarxiyası düzgündür (h1→h2→h3)
  [ ]  Bütün şəkillərdə alt atributu var
  [ ]  Şəkil fayl adları açar söz ehtiva edir
  [ ]  Daxili linklər düzgün anchor text ilə

STRUKTURLU MƏLUMAT
  [ ]  Organization schema ana səhifədədir
  [ ]  Course schema hər kurs səhifəsindədir
  [ ]  Person schema hər müəllim səhifəsindədir
  [ ]  FAQPage schema FAQ səhifəsindədir
  [ ]  BreadcrumbList hər alt səhifədədir
  [ ]  Google Rich Results Test keçir

PERFORMANS
  [ ]  LCP < 2.5s (PageSpeed Insights)
  [ ]  CLS < 0.1
  [ ]  FID < 100ms
  [ ]  Mobil PageSpeed skoru > 85
  [ ]  Desktop PageSpeed skoru > 95

SOSIAL MEDIA
  [ ]  OG şəkilləri 1200×630px
  [ ]  og:title, og:description, og:image bütün səhifələrdə
  [ ]  Twitter Card teqləri mövcuddur
  [ ]  Facebook Sharing Debugger ilə test edilib
```

---

## 13. Google Search Console Qurulumu

```
1. search.google.com/search-console-a daxil ol
2. "URL prefix" seç → https://cahanacademy.az
3. HTML teq yoxlaması:
   next.config.ts → metadata.verification.google = 'TOKEN'
4. Sitemap göndər:
   Sitemaps → https://cahanacademy.az/sitemap.xml
5. URL Inspection ilə əsas səhifələri yoxla
6. Core Web Vitals hesabatını izlə
7. Performance → Queries → açar söz sıralamasını izlə
```

---

## 14. SEO-Friendly URL Strukturu

```
✅ Düzgün URL-lər:
cahanacademy.az/kurslar                    ← Azərbaycanca
cahanacademy.az/en/courses                 ← İngilis
cahanacademy.az/kurslar/python-baslangic   ← açar söz slug
cahanacademy.az/muellimler/leyla-memmedova ← şəxs slug
cahanacademy.az/blog/python-oyrenmek-ucun-resurslar

❌ Yanlış URL-lər:
cahanacademy.az/course?id=123             ← ID əvəzinə slug lazımdır
cahanacademy.az/p/456                     ← Mənasız
cahanacademy.az/Kurslar                   ← Böyük hərf (lowercase istifadə et)
cahanacademy.az/kurslar_siyahisi          ← _ əvəzinə - istifadə et
```

```typescript
// lib/utils.ts — slug generasiyası
export function slugify(text: string): string {
  const azMap: Record<string, string> = {
    ə: 'e', ğ: 'g', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c',
    Ə: 'e', Ğ: 'g', İ: 'i', Ö: 'o', Ü: 'u', Ş: 's', Ç: 'c',
  };

  return text
    .split('')
    .map((char) => azMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// slugify('Python Başlanğıc Kursu') → 'python-baslangic-kursu'
// slugify('Leyla Məmmədova')        → 'leyla-memmedova'
```

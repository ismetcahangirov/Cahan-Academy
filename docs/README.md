# Academy Landing Page — Layihə Sənədləşməsi

> **Versiya:** 1.0.0
> **Status:** Planlaşdırma mərhələsi
> **Son yenilənmə:** 2026
> **Əlaqəli layihə:** [Cahan Academy Dashboard](https://github.com/ismetcahangirov/Cahan-Academy-Dashboard)

---

## Layihə haqqında

Academy Landing Page — tədris müəssisəsi üçün hazırlanmış **yüksək performanslı, SEO-optimallaşdırılmış** ictimai veb-saytdır. Sayt potensial tələbələri cəlb etmək, akademiya haqqında məlumat vermək və müraciət formları vasitəsilə liderləri toplamaq məqsədi daşıyır.

Layihə **Next.js App Router** əsasında qurulmuş, **TypeScript** ilə tam tipləşdirilmiş, **classic & elegant** dizayn konsepsiyasına söykənir.

---

## Texnologiya Yığımı

### Frontend

| Texnologiya | Versiya | Məqsəd |
|---|---|---|
| Next.js | 15+ | Framework (App Router, SSR, SSG, ISR) |
| TypeScript | 5+ | Tip təhlükəsizliyi |
| Tailwind CSS | 4+ | Utility-first styling |
| Framer Motion | 11+ | Animasiyalar |
| React Hook Form | 7+ | Form idarəsi |
| Zod | 3+ | Schema validasiya |
| next-intl | 3+ | Çoxdilli dəstək (AZ, EN, RU) |
| next-seo | 6+ | SEO meta tag idarəsi |
| Lucide React | latest | SVG ikonlar |
| Sharp | 0.33+ | Şəkil optimizasiyası |

### Backend

| Texnologiya | Versiya | Məqsəd |
|---|---|---|
| Node.js | 20+ | Runtime mühit |
| TypeScript | 5+ | Tip təhlükəsizliyi |
| Express.js | 5+ | Web framework |
| Drizzle ORM | 0.30+ | Type-safe ORM |
| PostgreSQL | 16+ | Verilənlər bazası |
| Neon (serverless) | latest | Pulsuz PostgreSQL hosting |
| Zod | 3+ | Request validasiya |
| Nodemailer | 6+ | Email göndərmə |
| Helmet | 8+ | HTTP security headers |
| Jose | 5+ | JWT token idarəsi |

### DevOps & Alətlər

| Texnologiya | Məqsəd |
|---|---|
| Vercel | Frontend hosting (Edge Network) |
| Render | Backend hosting (pulsuz tier) |
| Neon | PostgreSQL serverless (pulsuz tier) |
| GitHub Actions | CI/CD pipeline |
| ESLint + Prettier | Kod keyfiyyəti |
| Husky | Pre-commit hooks |

---

## SEO Arxitekturasına Baxış

```
Google Crawler
      │
      ▼
Next.js (SSR/SSG)
  ├── generateMetadata()     ← Hər səhifəyə unikal meta
  ├── Open Graph tags        ← Sosial media paylaşımı
  ├── JSON-LD (Schema.org)   ← Strukturlu məlumat
  ├── sitemap.xml            ← Avtomatik generasiya
  ├── robots.txt             ← Crawler idarəsi
  └── Core Web Vitals        ← LCP < 2.5s, CLS < 0.1
```

> Ətraflı bax: [`SEO.md`](./SEO.md)

---

## Dizayn Konsepsiyası

**Classic & Elegant** — zaman sınaqından keçmiş akademik estetika.

### Rəng Palitası

```css
/* Əsas */
--color-primary:       #1C1C1E;   /* Dərin qara — başlıqlar */
--color-secondary:     #800020;   /* Bordo — vurğu, CTA */
--color-accent:        #C9A84C;   /* Qızılı — dekorativ elementlər */

/* Neytral */
--color-bg:            #FAFAF8;   /* Krem ağ — arxa fon */
--color-surface:       #FFFFFF;   /* Kart fonu */
--color-border:        #E8E4DC;   /* Incə sərhəd */

/* Mətn */
--color-text-primary:  #1C1C1E;   /* Əsas mətn */
--color-text-secondary:#6B6B6B;   /* Köməkçi mətn */
--color-text-muted:    #9CA3AF;   /* Solğun mətn */
```

### Tipografiya

```css
/* Başlıqlar — serif, klassik görünüş */
--font-heading: 'Playfair Display', Georgia, serif;

/* Mətn — sans-serif, oxunaqlı */
--font-body:    'Inter', system-ui, sans-serif;

/* Monoboşluq — kod nümunələri */
--font-mono:    'JetBrains Mono', monospace;
```

> Ətraflı bax: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

---

## Səhifə Strukturu

```
/                     → Ana səhifə (Hero + Xüsusiyyətlər + Statistika + CTA)
/about                → Haqqımızda (Tarix, Missiya, Komanda)
/courses              → Kurslar siyahısı (SSG + ISR)
/courses/[slug]       → Tək kurs səhifəsi (dinamik, SEO)
/teachers             → Müəllimlər (SSG)
/teachers/[slug]      → Tək müəllim profili (dinamik, SEO)
/contact              → Əlaqə forması
/blog                 → Blog siyahısı (ISR)
/blog/[slug]          → Tək məqalə (dinamik, SEO)
/faq                  → Tez-tez soruşulan suallar
/privacy-policy       → Məxfilik siyasəti
/terms                → İstifadə şərtləri

/admin                → Admin panel giriş (qorunan)
/admin/dashboard      → Müraciətlər, statistika
/admin/leads          → Form müraciətləri idarəsi
/admin/blog           → Blog yazıları idarəsi
```

---

## Layihə Strukturu

```
academy-landing/
│
├── apps/
│   ├── web/                          ← Next.js frontend
│   │   ├── app/
│   │   │   ├── [locale]/             ← next-intl routing
│   │   │   │   ├── (marketing)/      ← Public səhifələr
│   │   │   │   │   ├── page.tsx      ← Ana səhifə
│   │   │   │   │   ├── about/
│   │   │   │   │   ├── courses/
│   │   │   │   │   ├── teachers/
│   │   │   │   │   ├── contact/
│   │   │   │   │   ├── blog/
│   │   │   │   │   └── faq/
│   │   │   │   └── (admin)/          ← Admin panel
│   │   │   │       ├── layout.tsx
│   │   │   │       └── dashboard/
│   │   │   ├── api/                  ← Next.js API routes (proxy)
│   │   │   ├── sitemap.ts            ← Dinamik sitemap
│   │   │   ├── robots.ts             ← robots.txt
│   │   │   └── layout.tsx            ← Root layout
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   ← Bazis komponentlər
│   │   │   ├── sections/             ← Səhifə bölmələri
│   │   │   ├── forms/                ← Form komponentləri
│   │   │   └── layout/               ← Header, Footer, Nav
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                ← API client
│   │   │   ├── utils.ts              ← Yardımçı funksiyalar
│   │   │   └── metadata.ts           ← SEO helper-lər
│   │   │
│   │   ├── messages/                 ← i18n tərcümə faylları
│   │   │   ├── az.json
│   │   │   ├── en.json
│   │   │   └── ru.json
│   │   │
│   │   ├── public/
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── og/                   ← OG şəkilləri
│   │   │
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          ← Express backend
│       ├── src/
│       │   ├── config/
│       │   │   ├── db.ts             ← Neon/PostgreSQL bağlantısı
│       │   │   └── env.ts            ← Tip-güclü env
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/               ← Drizzle schema
│       │   ├── routes/
│       │   ├── services/
│       │   └── utils/
│       ├── drizzle/
│       │   └── migrations/
│       ├── drizzle.config.ts
│       └── package.json
│
├── packages/
│   ├── shared-types/                 ← Frontend + Backend ortaq tiplər
│   └── shared-utils/                 ← Ortaq utility funksiyalar
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── .env.example
├── turbo.json                        ← Turborepo (monorepo idarəsi)
└── package.json
```

---

## Mühit Dəyişənləri

### Frontend (`apps/web/.env.local`)

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# SEO
NEXT_PUBLIC_SITE_NAME=Cahan Academy
NEXT_PUBLIC_SITE_DESCRIPTION=Peşəkar tədris mərkəzi — gələcəyinizi bizimlə qurun

# Analytics (opsional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=az

# Əlaqə
NEXT_PUBLIC_PHONE=+994501234567
NEXT_PUBLIC_EMAIL=info@cahanacademy.az
NEXT_PUBLIC_ADDRESS=Bakı, Azərbaycan
```

### Backend (`apps/api/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# PostgreSQL (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/academy_db?sslmode=require

# JWT (Admin panel üçün)
JWT_SECRET=your_super_secret_jwt_key_min_64_chars
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=academy@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# Sayt
CLIENT_URL=http://localhost:3000

# Email alıcıları
ADMIN_EMAIL=admin@cahanacademy.az
NOTIFICATION_EMAIL=notifications@cahanacademy.az
```

---

## Sürətli Başlanğıc

```bash
# Repo-nu klonla
git clone https://github.com/your-org/academy-landing.git
cd academy-landing

# Asılılıqları quraşdır (monorepo)
npm install

# Mühit dəyişənlərini hazırla
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# Dəyişənləri doldur

# PostgreSQL migration-ları icra et
cd apps/api
npm run db:migrate

# İlk admin yaradıl
npm run db:seed

# Bütün servisleri başlat
cd ../..
npm run dev
# → Web:  http://localhost:3000
# → API:  http://localhost:5000
```

---

## Core Web Vitals Hədəfləri

| Metrika | Hədəf | Əhəmiyyəti |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | İlk məzmun yüklənmə sürəti |
| **FID** (First Input Delay) | < 100ms | İnteraktivlik gecikmə |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Görsel sabitlik |
| **FCP** (First Contentful Paint) | < 1.8s | İlk rəsm vaxtı |
| **TTFB** (Time to First Byte) | < 800ms | Server cavab sürəti |

---

## Sənədlər İndeksi

```
docs/
├── README.md              ← Bu fayl — Layihəyə giriş
├── ARCHITECTURE.md        ← Next.js App Router + Backend arxitekturası
├── SEO.md                 ← SEO strategiyası, metadata, sitemap
├── DATABASE.md            ← PostgreSQL schema, Drizzle ORM, Neon qurulumu
├── API.md                 ← Backend REST API sənədləşməsi
├── AUTH.md                ← Admin panel autentifikasiyası
├── COMPONENTS.md          ← UI komponent kataloqu
├── DESIGN_SYSTEM.md       ← Dizayn sistemi, rənglər, tipografiya
├── DEPLOYMENT.md          ← Vercel + Render + Neon deploy
└── TESTING.md             ← Playwright E2E + Vitest unit testlər
```

---

## Dəstəklənən Dillər

| Dil | Kod | URL prefiksi | Status |
|---|---|---|---|
| Azərbaycan | `az` | `/az/...` (default) | ✅ |
| İngilis | `en` | `/en/...` | ✅ |
| Rus | `ru` | `/ru/...` | ✅ |

> Default dil `/az/` prefiksi olmadan da əlçatandır: `cahanacademy.az/kurslar`

---

## Əlaqə

Layihə ilə bağlı suallar üçün: **dev@cahanacademy.az**

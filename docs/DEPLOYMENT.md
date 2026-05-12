# DEPLOYMENT.md — Deploy Sənədləşməsi

> **Layihə:** Academy Landing Page
> **Frontend:** Vercel (Next.js)
> **Backend:** Render (Express + Node.js)
> **Database:** Neon (PostgreSQL Serverless)
> **Son yenilənmə:** 2026

---

## 1. İnfrastruktur Xəritəsi

```
                         ┌─────────────────────────┐
                         │    CLOUDFLARE DNS        │
                         │   cahanacademy.az        │
                         └────────────┬────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
               ▼                      ▼                      ▼
   ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
   │      VERCEL        │  │      RENDER        │  │      NEON          │
   │  cahanacademy.az   │  │ api.cahanacademy.az│  │  PostgreSQL DB     │
   │                    │  │                    │  │  eu-central-1      │
   │  Next.js 15        │  │  Express + TS      │  │  academy_db        │
   │  Edge Network      │  │  Node.js 20        │  │  Pulsuz tier       │
   │  Pulsuz tier       │  │  Pulsuz tier       │  │                    │
   └────────────────────┘  └────────────────────┘  └────────────────────┘

Axın:
  İstifadəçi → Cloudflare → Vercel (Next.js SSG/SSR)
  Vercel → Render API (REST sorğuları)
  Render API → Neon PostgreSQL
  Render API → Gmail SMTP (email)
```

---

## 2. Neon — Verilənlər Bazası

### 2.1 Qurulum

```bash
# 1. neon.tech-ə daxil ol (GitHub ilə)
# 2. "New Project" → ad: academy-landing
# 3. Database: academy_db
# 4. Region: EU Central (Frankfurt)
# 5. Connection strings alındı

# Bağlantı stringlərini kopyala:
# Direct (development üçün):
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/academy_db?sslmode=require"

# Pooled (production üçün — PgBouncer):
DATABASE_URL_POOL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/academy_db?sslmode=require&pgbouncer=true"
```

### 2.2 Branch Strategiyası

```bash
# Neon CLI quraşdır
npm install -g neonctl

# Login
neonctl auth

# Mövcud branch-ları göstər
neonctl branches list --project-id <project-id>

# Dev branch yarat (main-dən)
neonctl branches create \
  --project-id <project-id> \
  --name dev \
  --parent main

# Preview branch yarat (PR üçün)
neonctl branches create \
  --project-id <project-id> \
  --name preview/pr-42 \
  --parent dev
```

### 2.3 İlk Migration

```bash
cd apps/api

# .env-i doldur
cp .env.example .env
# DATABASE_URL=... əlavə et

# Migration icra et
npm run db:migrate

# Seed məlumat doldur
npm run db:seed

# Admin yarat
ADMIN_EMAIL=admin@cahanacademy.az \
ADMIN_PASSWORD=SecurePass123! \
npm run db:create-admin
```

---

## 3. Render — Backend Deploy

### 3.1 Render Qurulumu

```bash
# 1. render.com-da hesab aç
# 2. "New +" → "Web Service"
# 3. GitHub repo bağla → apps/api qovluğu
# 4. Parametrlər:

Name:           academy-api
Region:         Frankfurt (EU Central)
Branch:         main
Root Directory: apps/api
Runtime:        Node
Build Command:  npm install && npm run build
Start Command:  npm run start:prod
Instance Type:  Free (512 MB RAM)
```

### 3.2 Build Skriptləri

```json
// apps/api/package.json
{
  "scripts": {
    "build":       "tsc --project tsconfig.build.json",
    "start":       "node dist/index.js",
    "start:prod":  "npm run db:migrate && node dist/index.js",
    "dev":         "tsx watch src/index.ts",
    "db:migrate":  "drizzle-kit migrate",
    "db:seed":     "tsx src/scripts/seed.ts",
    "db:create-admin": "tsx src/scripts/create-admin.ts"
  }
}
```

```json
// apps/api/tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir":          "./dist",
    "sourceMap":       false,
    "declaration":     false,
    "removeComments":  true
  },
  "exclude": [
    "node_modules",
    "dist",
    "src/scripts",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### 3.3 Render Mühit Dəyişənləri

```bash
# Render Dashboard → Environment → Add Environment Variable

NODE_ENV=production
PORT=10000

# Database (Neon pooled endpoint)
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.neon.tech/academy_db?sslmode=require&pgbouncer=true

# JWT (node -e "require('crypto').randomBytes(64).toString('hex')" ilə yarat)
JWT_ACCESS_SECRET=<64_char_random_hex>
JWT_REFRESH_SECRET=<64_char_different_random_hex>

# Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=academy@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# URLs
CLIENT_URL=https://cahanacademy.az
ADMIN_EMAIL=admin@cahanacademy.az
NOTIFICATION_EMAIL=notifications@cahanacademy.az

# Cache revalidasiya
REVALIDATE_SECRET=<32_char_random_hex>
```

### 3.4 Render Pulsuz Tier Məhdudiyyətləri

```
❗ Pulsuz Render Web Service:
  → 15 dəqiqə fəaliyyətsizlikdən sonra yatır (cold start ~30s)
  → 750 saat/ay pulsuz
  → 512 MB RAM

Cold start problemini həll etmək üçün:
```

```typescript
// apps/api/src/utils/keepAlive.ts
// Hər 14 dəqiqədə öz-özünə ping at

import https from 'https';

export function startKeepAlive(url: string) {
  if (process.env.NODE_ENV !== 'production') return;

  setInterval(() => {
    https.get(`${url}/api/health`, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Keep-alive xətası:', err.message);
    });
  }, 14 * 60 * 1000); // 14 dəqiqə
}

// apps/api/src/index.ts-də:
// startKeepAlive(process.env.RENDER_EXTERNAL_URL!);
```

> **Alternativ:** Render-in $7/ay Starter planı — heç vaxt yatmır.

---

## 4. Vercel — Frontend Deploy

### 4.1 Vercel Qurulumu

```bash
# 1. vercel.com-da hesab aç (GitHub ilə)
# 2. "Add New Project" → GitHub repo seç
# 3. Parametrlər:

Framework Preset: Next.js
Root Directory:   apps/web
Build Command:    npm run build
Output Directory: .next
Install Command:  npm install
Node.js Version:  20.x
```

### 4.2 Vercel Mühit Dəyişənləri

```bash
# Vercel Dashboard → Settings → Environment Variables

# API
NEXT_PUBLIC_API_URL=https://api.cahanacademy.az/api

# Site
NEXT_PUBLIC_SITE_URL=https://cahanacademy.az
NEXT_PUBLIC_SITE_NAME=Cahan Academy

# Analytics (opsional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# ISR Revalidasiya
REVALIDATE_SECRET=<eyni Render-dakı ilə>

# Lokal (əlavə et):
NEXT_PUBLIC_API_URL=http://localhost:5000/api  → Environment: Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000     → Environment: Development
```

### 4.3 next.config.ts — Production

```typescript
// apps/web/next.config.ts

import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {

  // Şəkil domenləri
  images: {
    formats:          ['image/avif', 'image/webp'],
    deviceSizes:      [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL:  86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.cahanacademy.az',
      },
      {
        protocol: 'https',
        hostname: 'ep-*.neon.tech',  // Neon proksisi (əgər varsa)
      },
    ],
  },

  // Headers — security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff'        },
          { key: 'X-Frame-Options',          value: 'DENY'           },
          { key: 'X-XSS-Protection',         value: '1; mode=block'  },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Statik fayllar — uzun cache
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Redirect-lər
  async redirects() {
    return [
      // Köhnə URL-ləri yeniyə yönləndir
      { source: '/courses', destination: '/kurslar', permanent: false },
    ];
  },

  // Bundle optimallaşdırma
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // TypeScript + ESLint xətaları build-i dayandırsın
  typescript:  { ignoreBuildErrors:  false },
  eslint:      { ignoreDuringBuilds: false },

  // Trailing slash — yoxdur
  trailingSlash: false,

  // Sıxılma
  compress: true,

  // Output (Vercel üçün standart)
  output: 'standalone',
};

export default withNextIntl(nextConfig);
```

### 4.4 Vercel Domain Qurulumu

```bash
# Vercel Dashboard → Settings → Domains

# Əlavə et:
cahanacademy.az         → Production
www.cahanacademy.az     → Redirect → cahanacademy.az
api.cahanacademy.az     → Render backend üçün (ayrıca)

# DNS qeydlərini Cloudflare-ə əlavə et:
Type  | Name | Value
------|------|-------
A     | @    | 76.76.21.21       (Vercel IP)
CNAME | www  | cname.vercel-dns.com
CNAME | api  | academy-api.onrender.com

# SSL — Vercel avtomatik Let's Encrypt sertifikatı verir
```

---

## 5. GitHub Actions — CI/CD

### 5.1 CI Pipeline

```yaml
# .github/workflows/ci.yml

name: CI — Test & Lint

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    name: Lint + TypeScript
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Node.js quraşdır
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Asılılıqları quraşdır
        run: npm ci

      - name: TypeScript yoxla (web)
        run: cd apps/web && npx tsc --noEmit

      - name: TypeScript yoxla (api)
        run: cd apps/api && npx tsc --noEmit

      - name: ESLint (web)
        run: cd apps/web && npx eslint . --ext .ts,.tsx --max-warnings 0

      - name: ESLint (api)
        run: cd apps/api && npx eslint . --ext .ts --max-warnings 0

  build-test:
    name: Build Test
    runs-on: ubuntu-latest
    needs: lint-and-type-check

    env:
      NEXT_PUBLIC_API_URL:  http://localhost:5000/api
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
      DATABASE_URL:         ${{ secrets.DATABASE_URL_TEST }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Frontend build test
        run: cd apps/web && npm run build

      - name: Backend build test
        run: cd apps/api && npm run build
```

### 5.2 Deploy Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy — Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Production Deploy
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      # Vercel — avtomatik main branch-ı deploy edir
      # Render — avtomatik main branch-ı deploy edir
      # Əlavə addım: DB migration icra et

      - name: DB Migration (Render üzərindən)
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
        run: |
          # Render-ə migration skriptini çağır
          curl -X POST \
            "https://api.render.com/v1/services/${RENDER_SERVICE_ID}/jobs" \
            -H "Authorization: Bearer ${RENDER_API_KEY}" \
            -H "Content-Type: application/json" \
            -d '{"startCommand": "npm run db:migrate"}'

      - name: ISR Cache Revalidasiya
        env:
          SITE_URL: https://cahanacademy.az
          REVALIDATE_SECRET: ${{ secrets.REVALIDATE_SECRET }}
        run: |
          # Deploy sonrası əsas cache-ləri sıfırla
          for tag in courses teachers blog faq; do
            curl -X POST \
              "${SITE_URL}/api/revalidate?secret=${REVALIDATE_SECRET}" \
              -H "Content-Type: application/json" \
              -d "{\"tag\": \"${tag}\"}"
          done
```

---

## 6. Mühit Dəyişənləri — Tam Siyahı

### apps/web/.env.example

```env
# === NEXT.JS FRONTEND ===

# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Site
NEXT_PUBLIC_SITE_NAME=Cahan Academy
NEXT_PUBLIC_SITE_DESCRIPTION=Bakıda peşəkar tədris mərkəzi

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=az

# Əlaqə (public)
NEXT_PUBLIC_PHONE=+994501234567
NEXT_PUBLIC_EMAIL=info@cahanacademy.az
NEXT_PUBLIC_ADDRESS=Nizami küçəsi 100, Bakı AZ1000

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# ISR (server-only)
REVALIDATE_SECRET=your_32_char_secret_here
```

### apps/api/.env.example

```env
# === EXPRESS API ===

# Server
PORT=5000
NODE_ENV=development

# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/academy_db?sslmode=require
DATABASE_URL_POOL=postgresql://user:pass@ep-xxx-pooler.neon.tech/academy_db?sslmode=require&pgbouncer=true

# JWT
JWT_ACCESS_SECRET=min_64_char_random_hex_string_for_access_tokens
JWT_REFRESH_SECRET=min_64_char_different_random_hex_for_refresh_tokens

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=academy@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx

# URLs
CLIENT_URL=http://localhost:3000
RENDER_EXTERNAL_URL=https://academy-api.onrender.com

# Email alıcıları
ADMIN_EMAIL=admin@cahanacademy.az
NOTIFICATION_EMAIL=notifications@cahanacademy.az

# ISR Revalidasiya
REVALIDATE_SECRET=your_32_char_secret_here
```

---

## 7. Gmail SMTP Qurulumu

```bash
# Gmail App Password yaratmaq üçün:

# 1. myaccount.google.com → Security
# 2. 2-Step Verification aktiv et (məcburi)
# 3. App Passwords → "Academy API" adı ilə yarat
# 4. 16 simvol şifrəni kopyala: xxxx-xxxx-xxxx-xxxx
# 5. SMTP_PASS=xxxx-xxxx-xxxx-xxxx olaraq əlavə et

# Gmail gündəlik 500 email göndərə bilər (pulsuz).
# Həcm artarsa: Brevo (pulsuz 300/gün) və ya Resend (pulsuz 3000/ay)
```

---

## 8. Deploy Sırası — Addım-addım

```bash
# ╔══════════════════════════════════════════════════╗
# ║           İLK DEPLOY SİRASI                     ║
# ╚══════════════════════════════════════════════════╝

# ADDIM 1 — Neon DB
#─────────────────────────────────────────────────────
□ neon.tech-də hesab aç
□ academy-landing project yarat (eu-central-1)
□ academy_db databazası yarat
□ Connection string-ləri kopyala (direct + pooled)
□ Dev branch yarat

# ADDIM 2 — Lokal hazırlıq
#─────────────────────────────────────────────────────
□ Repo klonla:
  git clone https://github.com/your-org/academy-landing.git
  cd academy-landing

□ Asılılıqları quraşdır:
  npm install

□ .env fayllarını hazırla:
  cp apps/web/.env.example apps/web/.env.local
  cp apps/api/.env.example apps/api/.env
  # Dəyişənləri doldur

□ Migration icra et:
  cd apps/api && npm run db:migrate

□ Seed doldur:
  npm run db:seed

□ Admin yarat:
  ADMIN_EMAIL=admin@cahanacademy.az \
  ADMIN_PASSWORD=SecurePass123! \
  npm run db:create-admin

□ Lokal test:
  cd ../.. && npm run dev
  # → web: http://localhost:3000
  # → api: http://localhost:5000/api/health

# ADDIM 3 — Render (Backend)
#─────────────────────────────────────────────────────
□ render.com-da hesab aç
□ GitHub repo bağla
□ "New Web Service" yarat (parametrlər: yuxarıya bax)
□ Mühit dəyişənlərini əlavə et (bütün .env.example dəyərləri)
□ Deploy gözlə (~3-5 dəqiqə)
□ Health check: https://academy-api.onrender.com/api/health
□ Neon-da migration-ların tətbiq olunduğunu yoxla

# ADDIM 4 — Vercel (Frontend)
#─────────────────────────────────────────────────────
□ vercel.com-da hesab aç
□ GitHub repo import et
□ Root Directory: apps/web
□ Mühit dəyişənlərini əlavə et
□ NEXT_PUBLIC_API_URL=https://academy-api.onrender.com/api
□ Deploy gözlə (~2-3 dəqiqə)
□ Preview URL-ni test et

# ADDIM 5 — Domain
#─────────────────────────────────────────────────────
□ DNS qeydlərini Cloudflare-ə əlavə et (yuxarıya bax)
□ Vercel dashboard-da domain əlavə et
□ SSL sertifikatı avtomatik yaranır (~2-5 dəqiqə)
□ https://cahanacademy.az işləyir

# ADDIM 6 — Yekun yoxlama
#─────────────────────────────────────────────────────
□ https://cahanacademy.az açılır
□ API: https://api.cahanacademy.az/api/health
□ Sitemap: https://cahanacademy.az/sitemap.xml
□ Robots: https://cahanacademy.az/robots.txt
□ Contact form göndərilir, email gəlir
□ Admin panel: https://cahanacademy.az/admin/login
□ PageSpeed Insights skoru yoxla
□ Google Search Console-ə sitemap göndər
```

---

## 9. Yeniləmə (Update) Prosesi

```bash
# Adi kod yeniləmə:
git add .
git commit -m "feat: yeni kurs bölməsi əlavə edildi"
git push origin main
# → GitHub Actions CI işə düşür
# → Render avtomatik deploy edir
# → Vercel avtomatik deploy edir

# DB schema dəyişikliyi:
# 1. Schema-nı yenilə (courses.ts-ə yeni sahə əlavə et)
# 2. Migration yarat:
npm run db:generate

# 3. Migration-ı nəzərdən keçir:
cat drizzle/migrations/xxxx_change.sql

# 4. Dev-də test et:
npm run db:migrate

# 5. Commit et (migration faylı da daxil):
git add drizzle/migrations/
git commit -m "db: courses cədvəlinə video_url sahəsi əlavə edildi"
git push origin main
# → Render deploy zamanı npm run db:migrate avtomatik icra edir

# ISR cache manual sıfırlama:
curl -X POST \
  "https://cahanacademy.az/api/revalidate?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tag": "courses"}'
```

---

## 10. Monitoring & Xəta İzləmə

### 10.1 Pulsuz Alətlər

```bash
# Uptime monitoring — UptimeRobot (pulsuz 50 monitor)
# 1. uptimerobot.com-da hesab aç
# 2. "Add New Monitor":
#    - https://cahanacademy.az          (HTTP, 5 dəq)
#    - https://api.cahanacademy.az/api/health  (HTTP, 5 dəq)
# 3. Email bildiriş qur
# 4. Status page: status.cahanacademy.az

# Xəta izləmə — Sentry (pulsuz 5000 xəta/ay)
npm install @sentry/nextjs @sentry/node

# apps/web/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});

# apps/api/src/utils/sentry.ts
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### 10.2 Performance Monitoring

```bash
# Vercel Analytics — pulsuz (Vercel dashboard-da aktiv et)
# Core Web Vitals avtomatik izlənir

# Google PageSpeed Insights
# https://pagespeed.web.dev/?url=https://cahanacademy.az

# Hər deploy sonrası yoxlama:
# □ Mobile skoru > 85
# □ Desktop skoru > 95
# □ LCP < 2.5s
# □ CLS < 0.1
```

---

## 11. Backup Strategiyası

```bash
# Neon — avtomatik backup
# Pulsuz tier: 7 günlük point-in-time recovery
# Dashboard → Branches → Restore

# Manual backup (həftəlik):
# apps/api/src/scripts/backup.ts

import { exec } from 'child_process';

const BACKUP_DIR  = './backups';
const DB_URL      = process.env.DATABASE_URL!;
const TIMESTAMP   = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_FILE = `${BACKUP_DIR}/backup-${TIMESTAMP}.sql`;

exec(
  `pg_dump "${DB_URL}" > ${BACKUP_FILE}`,
  (err) => {
    if (err) { console.error('Backup xətası:', err); return; }
    console.log(`✅ Backup: ${BACKUP_FILE}`);
  }
);

# GitHub Actions ilə həftəlik backup:
# .github/workflows/backup.yml
# schedule: '0 2 * * 0'  → hər bazar gecəsi 02:00
```

---

## 12. Deploy Yoxlama Siyahısı

```
NEON DATABASE
  [ ]  academy_db yaradılıb
  [ ]  Region: eu-central-1
  [ ]  Migration-lar tətbiq olunub
  [ ]  Seed məlumatlar doldurulub
  [ ]  Admin istifadəçi yaradılıb
  [ ]  Dev branch mövcuddur

RENDER (BACKEND)
  [ ]  Web Service yaradılıb
  [ ]  GitHub repo bağlanıb (apps/api)
  [ ]  Bütün mühit dəyişənləri əlavə edilib
  [ ]  Deploy uğurlu olub
  [ ]  /api/health → 200 qaytarır
  [ ]  CORS: cahanacademy.az-a icazə var
  [ ]  Email göndərmə test edilib

VERCEL (FRONTEND)
  [ ]  Project yaradılıb
  [ ]  Root Directory: apps/web
  [ ]  Bütün mühit dəyişənləri əlavə edilib
  [ ]  Deploy uğurlu olub
  [ ]  Preview URL işləyir
  [ ]  next/image şəkilləri yüklənir

DOMAIN & DNS
  [ ]  Cloudflare-də DNS qeydləri əlavə edilib
  [ ]  SSL sertifikatı yaradılıb (Vercel)
  [ ]  https://cahanacademy.az işləyir
  [ ]  www.cahanacademy.az → redirect
  [ ]  api.cahanacademy.az → Render

CI/CD
  [ ]  GitHub Actions CI keçir
  [ ]  main branch-a push → avtomatik deploy
  [ ]  DB migration avtomatik icra edilir
  [ ]  ISR cache sıfırlanır

SON YOXLAMA
  [ ]  Ana səhifə açılır
  [ ]  Kurslar siyahısı yüklənir
  [ ]  Contact form göndərilir, email gəlir
  [ ]  Admin panel girişi işləyir
  [ ]  Sitemap mövcuddur
  [ ]  Robots.txt mövcuddur
  [ ]  Google Search Console-ə sitemap göndərilib
  [ ]  PageSpeed: Mobile > 85, Desktop > 95
  [ ]  UptimeRobot monitor aktiv
```

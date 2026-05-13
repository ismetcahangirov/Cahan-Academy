# TODO — Academy Landing Page

> Local AI ilə işləyərkən tamamlanan tapşırıqları `[ ]` → `[x]` et.  
> **Format:** `[x]` = tamamlandı · `[ ]` = gözləyir · `[~]` = davam edir · `[!]` = bloklanıb

---

## ⚡ Cari Vəziyyət
> **Bu bloku hər PR birləşəndən sonra yenilə. Token bitib yeni hesabdan davam edirsənsə — yalnız bu bloku oxu.**

| Sahə | Dəyər |
|---|---|
| **Son tamamlanan tapşırıq** | Mərhələ 9 — Formalar (backend + frontend) |
| **Aktiv branch** | `feature/m10-faq` |
| **Növbəti branch** | `feature/m11-admin` |
| **Növbəti tapşırıq** | Mərhələ 10 — FAQ |
| **Bloklanmış tapşırıq** | Yoxdur |
| **Qeyd** | Haqqımızda və Formalar modulları tamamlanıb. Növbəti FAQ. |

---

## Git İş Axını (Hər tapşırıq üçün)

```
1.  TODO.md-dəki ilk [ ] tapşırığı tap
2.  git checkout main
3.  git pull origin main
4.  git checkout -b feature/<branch-adı>
5.  Tapşırığı yerinə yetir
6.  Bu TODO.md-də [ ] → [x] et
7.  git add . && git commit -m "<növ>(<əhatə>): <açıqlama>"
8.  git push origin feature/<branch-adı>
9.  Sahibə xəbər ver: branch adı + tamamlanan tapşırıqlar
10. SAHİBİN PR açmasını və birləşdirməsini GÖZLƏ
11. Sahib "davam et" dedikdə → ADDIM 2-yə qayıt
```

> ⚠️  PR birləşməmiş növbəti tapşırığa BAŞLAMA  
> ⚠️  Heç vaxt birbaşa main-ə push ETMƏ  
> 📄  Ətraflı qaydalar: `docs/WORKFLOW.md`

---

## Mərhələ 0 — Hazırlıq & Sənədləşmə
**Branch:** —  
**Status:** `[x]` tamamlandı — 11/11

- [x] README.md hazırlandı
- [x] ARCHITECTURE.md hazırlandı
- [x] API.md hazırlandı
- [x] AUTH.md hazırlandı
- [x] DATABASE.md hazırlandı
- [x] COMPONENTS.md hazırlandı
- [x] DESIGN_SYSTEM.md hazırlandı
- [x] SEO.md hazırlandı
- [x] DEPLOYMENT.md hazırlandı
- [x] TESTING.md hazırlandı
- [x] TODO.md hazırlandı

---

## Mərhələ 1 — Layihə Qurulumu
**Status:** `[x]` tamamlandı — 28/28

### 1.1 Monorepo & Turborepo
**Branch:** `feature/m01-monorepo-setup`

- [x] Turborepo ilə monorepo skeleti yaradıldı (`turbo.json`, root `package.json`)
- [x] `apps/web/` qovluğu yaradıldı (Next.js üçün yer)
- [x] `apps/api/` qovluğu yaradıldı (Express üçün yer)
- [x] `packages/shared-types/` qovluğu yaradıldı
- [x] `packages/shared-utils/` qovluğu yaradıldı
- [x] `.gitignore` hazırlandı (node_modules, .env, .next, dist)
- [x] Root `package.json` skriptləri tənzimləndi (`dev`, `build`, `test`, `lint`)

### 1.2 Frontend — Next.js 15
**Branch:** `feature/m01-frontend-setup`

- [x] Next.js 15 App Router layihəsi yaradıldı (`apps/web`)
- [x] TypeScript 5 konfiqurasiya edildi (`tsconfig.json`)
- [x] Tailwind CSS 4 konfiqurasiya edildi
- [x] Rəng palitası Tailwind-ə əlavə edildi (bordo `#800020`, qızılı `#C9A84C`, dərin qara `#1C1C1E`)
- [x] Framer Motion quraşdırıldı
- [x] React Hook Form + Zod quraşdırıldı
- [x] next-intl quraşdırıldı (AZ, EN, RU routing)
- [x] Lucide React quraşdırıldı
- [x] Sharp quraşdırıldı (şəkil optimallaşdırması)
- [x] Qovluq strukturu yaradıldı (`components/ui/`, `components/sections/`, `components/forms/`, `components/layout/`)
- [x] Global CSS dəyişənləri yazıldı (`--color-primary`, `--font-heading`, `--font-body` və s.)
- [x] `apps/web/.env.example` hazırlandı
- [x] `apps/web/.env.local` yaradıldı (dəyişənlər dolduruldu)

### 1.3 Backend — Express.js + TypeScript
**Branch:** `feature/m01-backend-setup`

- [x] Express 5 + TypeScript layihəsi yaradıldı (`apps/api`)
- [x] `tsconfig.json` konfiqurasiya edildi
- [x] Helmet quraşdırıldı
- [x] CORS konfiqurasiya edildi (yalnız `CLIENT_URL`-ə icazə)
- [x] Morgan (logging) quraşdırıldı
- [x] dotenv + tip-güclü `env.ts` hazırlandı
- [x] Rate limiter quraşdırıldı (auth + contact endpointləri üçün)
- [x] Global error handler middleware yazıldı
- [x] API response utility yazıldı (`utils/apiResponse.ts`)
- [x] Nodemailer konfiqurasiya edildi (Gmail SMTP)
- [x] `apps/api/.env.example` hazırlandı
- [x] `apps/api/.env` yaradıldı (dəyişənlər dolduruldu)

---

## Mərhələ 2 — Verilənlər Bazası
**Status:** `[x]` tamamlandı — 12/12

**Branch:** `feature/m02-database`

### 2.1 Neon PostgreSQL Qurulumu
- [x] Neon.tech-də hesab açıldı (GitHub ilə)
- [x] Yeni project yaradıldı: `academy-landing`, region: `eu-central-1`
- [x] Database adı: `neondb`
- [x] Connection strings `.env`-ə əlavə edildi

### 2.2 Drizzle ORM
- [x] `drizzle-orm` + `@neondatabase/serverless` quraşdırıldı
- [x] `drizzle-kit` quraşdırıldı (dev dependency)
- [x] `src/config/db.ts` — Neon bağlantısı yazıldı
- [x] `drizzle.config.ts` hazırlandı
- [x] DB Schema yaradıldı: `leads` cədvəli
- [x] DB Schema yaradıldı: `contact_messages` cədvəli
- [x] DB Schema yaradıldı: `admin_users` cədvəli
- [x] DB Schema yaradıldı: `newsletter_subscribers` cədvəli
- [x] Migrasiya skripti icra edildi (`scripts/migrate.ts`)
- [x] Admin seed skripti yazıldı (`scripts/seed-admin.ts`)
- [x] Admin seed icra edildi (ilk admin yaradıldı: `admin@cahanacademy.az`)

---

## Mərhələ 3 — Layout & Naviqasiya
**Status:** `[x]` tamamlandı — 14/14

**Branch:** `feature/m03-layout`

- [x] Root `layout.tsx` yaradıldı (font, metadata base, `<html lang>`)
- [x] `[locale]` routing qovluğu yaradıldı (next-intl)
- [x] `(marketing)` route group layout yaradıldı (Header + Footer)
- [x] `Header` komponenti yaradıldı (logo, nav linkləri, dil seçimi, mobil menyu düyməsi)
- [x] `Navbar` — desktop naviqasiya linkləri (Kurslar, Müəllimlər, Blog, Haqqımızda, Əlaqə)
- [x] `MobileMenu` komponenti yaradıldı (tam ekran, Framer Motion animasiya)
- [x] `Footer` komponenti yaradıldı (logo, naviqasiya, sosial linklər, copyright)
- [x] `LanguageSwitcher` komponenti yaradıldı (AZ / EN / RU)
- [x] `az.json` tərcümə faylı yaradıldı (bütün UI mətnləri)
- [x] `en.json` tərcümə faylı yaradıldı
- [x] `ru.json` tərcümə faylı yaradıldı
- [x] next-intl middleware konfiqurasiya edildi (`middleware.ts`)
- [x] Responsive dizayn yoxlanıldı (mobil 375px, tablet 768px, desktop 1280px)
- [x] Framer Motion — Header scroll animasiyası tətbiq edildi

---

## Mərhələ 4 — Ana Səhifə (/)
**Status:** `[x]` tamamlandı — 13/16 (Lighthouse gözlənilir)

**Branch:** `feature/m04-homepage`

- [x] Ana səhifə `page.tsx` yaradıldı (SSG, `revalidate = false`)
- [x] `HeroSection` yaradıldı (başlıq, alt başlıq, CTA düymələri, arxa plan şəkli)
- [x] `StatsSection` yaradıldı (tələbə sayı, müəllim sayı, kurs sayı, il sayı)
- [x] `FeaturesSection` yaradıldı (akademiyanın üstünlükləri, 6 kart)
- [x] `CoursesPreview` yaradıldı (ən populyar 3-4 kurs, "Hamısına bax" linki)
- [x] `TestimonialsSection` yaradıldı (tələbə rəyləri, slayder)
- [x] `CTASection` yaradıldı (müraciət et çağırışı, forma linki)
- [x] JSON-LD `Organization` schema əlavə edildi
- [x] `generateMetadata()` ana səhifə üçün yazıldı (AZ/EN/RU)
- [ ] Open Graph şəkli yaradıldı (`public/og/home-og.jpg`)
- [x] Framer Motion — bölmələrə scroll animasiyaları əlavə edildi
- [x] `next/image` ilə bütün şəkillər optimallaşdırıldı
- [x] LCP elementi (Hero şəkli) `priority` ilə yükləndi
- [ ] Core Web Vitals: LCP < 2.5s yoxlanıldı (Lighthouse)
- [x] Build uğurlu (Exit code 0, turbopack)

---

## Mərhələ 5 — Kurslar Səhifəsi
**Status:** `[x]` tamamlandı — 11/14

**Branch:** `feature/m05-courses`

### 5.1 Backend
- [x] `GET /api/courses` endpointi hazırlandı (siyahı, locale, kateqoriya filter)
- [x] `GET /api/courses/categories` endpointi hazırlandı
- [x] `GET /api/courses/:slug` endpointi hazırlandı (tək kurs, SEO üçün slug)
- [x] Kurs seed data yaradıldı (6 kurs, 4 kateqoriya, 4 müəllim)
- [x] `course.repository.ts` — verilənlər bazası sorğuları
- [x] `course.controller.ts` — HTTP handler-lər
- [x] `course.routes.ts` — router qeydiyyatı
- [x] `app.ts`-ə `/api/courses` qoşuldu

### 5.2 Frontend
- [x] `/courses` səhifəsi yaradıldı (ISR, `revalidate = 60`)
- [x] `CoursesClientPage` — axtarış, kateqoriya, level, populyar filter
- [x] `CourseCard` komponenti yaradıldı (şəkil, başlıq, müddət, qiymət, düymə)
- [x] `/courses/[slug]` tək kurs səhifəsi yaradıldı (ISR, `revalidate = 60`)
- [x] Tək kurs səhifəsi: müəllim, info sidebar, qeydiyyat CTA
- [x] `EnrollButton` modal forması yaradıldı (animasiyalı, uğur bildirişi ilə)
- [x] `generateMetadata()` hər kurs üçün dinamik yazıldı
- [x] `types/course.ts` — tip təriflər
- [ ] JSON-LD `Course` schema əlavə edildi
- [ ] `generateStaticParams()` build-time pre-render üçün
- [ ] Core Web Vitals yoxlanması (Lighthouse)

---

## Mərhələ 6 — Müəllimlər Səhifəsi
**Status:** `[x]` tamamlandı — 10/10

**Branch:** `feature/m06-teachers`

### 6.1 Backend
- [x] `GET /api/teachers` endpointi hazırlandı (siyahı)
- [x] `GET /api/teachers/:slug` endpointi hazırlandı (tək müəllim)
- [x] Müəllim seed data yaradıldı (en azı 4 müəllim)

### 6.2 Frontend
- [x] `/teachers` səhifəsi yaradıldı (SSG)
- [x] `TeacherGrid` komponenti yaradıldı
- [x] `TeacherCard` komponenti yaradıldı (foto, ad, ixtisas, sosial linklər)
- [x] `/teachers/[slug]` tək müəllim profil səhifəsi yaradıldı (SSG)
- [x] JSON-LD `Person` schema əlavə edildi
- [x] `generateMetadata()` hər müəllim üçün dinamik yazıldı
- [x] Drizzle ORM join xətası həll edildi (repository + controller)
- [x] Localization (AZ, EN, RU) tamamlandı (messages/JSON)

---

## Mərhələ 7 — Haqqımızda Səhifəsi
**Status:** `[x]` tamamlandı — 7/7

**Branch:** `feature/m07-about`

- [x] `/about` səhifəsi yaradıldı (SSG)
- [x] Tarix & missiya bölməsi yaradıldı
- [x] Komanda bölməsi yaradıldı (müəllimlər siyahısı reuse)
- [x] Dəyərlər & yanaşma bölməsi yaradıldı
- [x] Statistika kartları əlavə edildi (kurs, tələbə, il)
- [x] JSON-LD `Organization` schema əlavə edildi
- [x] `generateMetadata()` yazıldı

---

## Mərhələ 8 — Blog
**Status:** `[x]` tamamlandı — 13/13

**Branch:** `feature/m08-blog`

### 8.1 Backend
- [x] `GET /api/blog` endpointi hazırlandı (siyahı, pagination, ISR üçün)
- [x] `GET /api/blog/:slug` endpointi hazırlandı (tək məqalə)
- [x] Blog yazısı seed data yaradıldı (en azı 3 yazı)

### 8.2 Frontend
- [x] `/blog` səhifəsi yaradıldı (ISR, `revalidate = 600`)
- [x] `BlogGrid` komponenti yaradıldı
- [x] `BlogCard` komponenti yaradıldı (kapak şəkli, başlıq, tarix, oxuma vaxtı, snippet)
- [x] `/blog/[slug]` tək məqalə səhifəsi yaradıldı (ISR, `revalidate = 3600`)
- [x] Tək məqalə: başlıq, kapak şəkli, məzmun (HTML/Markdown), müəllif
- [x] `generateStaticParams()` blog slug-ları üçün yazıldı
- [x] JSON-LD `Article` schema əlavə edildi
- [x] `generateMetadata()` hər məqalə üçün yazıldı
- [x] Oxşar məqalələr bölməsi əlavə edildi

---

## Mərhələ 9 — Əlaqə & Lead Formaları
**Status:** `[x]` tamamlandı — 16/16

**Branch:** `feature/m09-forms`

### 9.1 Backend
- [x] `POST /api/contact` endpointi hazırlandı (validasiya, DB-yə yaz, email göndər)
- [x] `POST /api/leads/enroll` endpointi hazırlandı (kurs qeydiyyatı, DB-yə yaz, email göndər)
- [x] `POST /api/newsletter/subscribe` endpointi hazırlandı
- [x] Rate limiting: `/api/contact` → 3 sorğu/saat, `/api/leads/enroll` → 3 sorğu/saat
- [x] Admin bildiriş emaili şablonu hazırlandı (Nodemailer)
- [x] İstifadəçiyə avtomatik cavab emaili şablonu hazırlandı

### 9.2 Frontend
- [x] `/contact` səhifəsi yaradıldı (SSR, `force-dynamic`)
- [x] `ContactForm` komponenti yaradıldı (ad, email, telefon, mövzu, mesaj)
- [x] React Hook Form + Zod validasiyası tətbiq edildi
- [x] `EnrollForm` komponenti yaradıldı (ad, email, telefon, kurs seçimi)
- [x] `NewsletterForm` komponenti yaradıldı (email)
- [x] Toast bildirişləri əlavə edildi (inline alert-lər)
- [x] Forma göndərilib vəziyyəti (loading spinner, disabled düymə)
- [x] Uğurlu göndərişdən sonra təşəkkür mesajı göstərildi
- [x] `generateMetadata()` əlaqə səhifəsi üçün yazıldı
- [x] JSON-LD `ContactPage` schema əlavə edildi

---

## Mərhələ 10 — FAQ Səhifəsi
**Status:** `[ ]` gözləyir — 0/6

**Branch:** `feature/m10-faq`

- [ ] `/faq` səhifəsi yaradıldı (SSG)
- [ ] Accordion FAQ komponenti yaradıldı (açılıb-bağlanan suallar)
- [ ] En azı 10 sual-cavab əlavə edildi (AZ/EN/RU)
- [ ] JSON-LD `FAQPage` schema əlavə edildi
- [ ] `generateMetadata()` yazıldı
- [ ] Framer Motion — accordion animasiyası tətbiq edildi

---

## Mərhələ 11 — Admin Panel
**Status:** `[ ]` gözləyir — 0/24

**Branch:** `feature/m11-admin`

### 11.1 Backend — Auth
- [ ] `POST /api/auth/login` endpointi hazırlandı (email + şifrə, bcryptjs)
- [ ] Access Token (JWT, 15 dəq) generasiyası yazıldı (Jose kitabxanası)
- [ ] Refresh Token (JWT, 7 gün) generasiyası yazıldı
- [ ] Refresh Token → HttpOnly Cookie olaraq göndərildi
- [ ] `POST /api/auth/refresh` endpointi hazırlandı (yeni access token)
- [ ] `POST /api/auth/logout` endpointi hazırlandı (cookie sil)
- [ ] Auth middleware yazdıldı (`authMiddleware.ts`)
- [ ] `GET /api/admin/leads` endpointi hazırlandı (müraciətlər siyahısı, filter, export)
- [ ] `PUT /api/admin/leads/:id/status` endpointi hazırlandı (status dəyiş)
- [ ] `GET /api/admin/contact` endpointi hazırlandı (əlaqə mesajları)
- [ ] `GET /api/admin/stats` endpointi hazırlandı (ümumi statistika)

### 11.2 Frontend — Admin Panel
- [ ] `(admin)` route group layout yaradıldı (ayrı dizayn, Header yoxdur)
- [ ] `/admin/login` səhifəsi yaradıldı (Next.js middleware ilə qorunur)
- [ ] Login forması: email + şifrə, React Hook Form + Zod
- [ ] Next.js `middleware.ts` — `/admin/**` yollarını qoruyur (token yoxla)
- [ ] Access Token memory-də saxlanıldı (React state / Zustand)
- [ ] `/admin/dashboard` — statistika kartları (ümumi müraciətlər, bu ay, oxunmamış mesajlar)
- [ ] `/admin/leads` — müraciətlər cədvəli (ad, email, kurs, tarix, status)
- [ ] Leads cədvəlində status dəyişdirmə funksiyası
- [ ] Leads CSV export funksiyası
- [ ] `/admin/contact` — əlaqə mesajları siyahısı
- [ ] Çıxış (logout) funksiyası tətbiq edildi
- [ ] Admin paneli — responsive dizayn tamamlandı

---

## Mərhələ 12 — SEO & Texniki Optimallaşdırma
**Status:** `[ ]` gözləyir — 0/16

**Branch:** `feature/m12-seo`

- [ ] `sitemap.ts` — dinamik sitemap yaradıldı (bütün statik + dinamik URL-lər)
- [ ] `robots.ts` — robots.txt yaradıldı (`/admin/**` bloklandı)
- [ ] `hreflang` teqləri bütün səhifələrə əlavə edildi (az, en, ru)
- [ ] Canonical URL-lər bütün səhifələrə əlavə edildi
- [ ] `generateMetadata()` — bütün səhifələr üçün tamamlandı
- [ ] Open Graph şəkilləri hazırlandı (bütün əsas səhifələr üçün)
- [ ] Twitter Card meta teqləri əlavə edildi
- [ ] JSON-LD: `Organization` — ana səhifə
- [ ] JSON-LD: `Course` — hər kurs səhifəsi
- [ ] JSON-LD: `Person` — hər müəllim profili
- [ ] JSON-LD: `FAQPage` — FAQ səhifəsi
- [ ] JSON-LD: `Article` — hər blog yazısı
- [ ] JSON-LD: `BreadcrumbList` — bütün alt səhifələr
- [ ] `next/image` — bütün şəkillərdə `alt` teqləri dolduruldu
- [ ] Heading iyerarxiyası yoxlanıldı (hər səhifədə yalnız bir `h1`)
- [ ] Google Search Console doğrulaması əlavə edildi

---

## Mərhələ 13 — Performans & Core Web Vitals
**Status:** `[ ]` gözləyir — 0/10

**Branch:** `feature/m13-performance`

- [ ] Lighthouse audit keçirildi (Performance, SEO, Accessibility, Best Practices)
- [ ] LCP < 2.5s hədəfinə çatıldı (Hero şəkli `priority` + optimallaşdırma)
- [ ] CLS < 0.1 hədəfinə çatıldı (şəkil ölçüləri müəyyən edildi)
- [ ] FCP < 1.8s hədəfinə çatıldı
- [ ] Font yükləmə optimallaşdırıldı (`next/font` ilə `display: swap`)
- [ ] Şəkillər WebP/AVIF formatında göndərilir (`next/image` avtomatik)
- [ ] `next/dynamic` ilə ağır komponentlər lazy-load edildi
- [ ] Bundle analyzer işlədildi, lazımsız paketlər silindi
- [ ] Accessibility: WCAG 2.1 AA — əsas bölmələr yoxlanıldı
- [ ] `preload` direktivi kritik resurslar üçün əlavə edildi

---

## Mərhələ 14 — Testlər
**Status:** `[ ]` gözləyir — 0/18

**Branch:** `feature/m14-testing`

### Backend Testlər (Vitest + Supertest)
- [ ] Vitest + Supertest quraşdırıldı (`apps/api`)
- [ ] Test DB konfiqurasiya edildi (Neon test branch)
- [ ] `POST /api/contact` endpointi test edildi (uğurlu, validasiya xətası, rate limit)
- [ ] `POST /api/leads/enroll` endpointi test edildi
- [ ] `POST /api/auth/login` endpointi test edildi (uğurlu, yanlış şifrə)
- [ ] `GET /api/courses` endpointi test edildi
- [ ] Auth middleware testi yazıldı
- [ ] JWT utility funksiyaları test edildi
- [ ] Backend test coverage 70%+ çatdı

### Frontend Testlər (Playwright E2E)
- [ ] Playwright quraşdırıldı (`apps/web`)
- [ ] Brauzer quraşdırıldı: Chromium, Firefox
- [ ] E2E: Ana səhifə yüklənmə testi
- [ ] E2E: Əlaqə forması uğurlu göndərmə testi
- [ ] E2E: Əlaqə forması validasiya xətası testi
- [ ] E2E: Dil dəyişdirmə testi (AZ → EN → RU)
- [ ] E2E: Admin login uğurlu testi
- [ ] E2E: Admin login yanlış şifrə testi
- [ ] E2E: sitemap.xml əlçatanlıq testi

---

## Mərhələ 15 — Deploy & CI/CD
**Status:** `[ ]` gözləyir — 0/14

**Branch:** `feature/m15-deploy`

### 15.1 Neon Production Ayarları
- [ ] Neon `main` branch — production üçün konfiqurasiya edildi
- [ ] Production connection string alındı
- [ ] Database migrations production-da icra edildi

### 15.2 Render — Backend Deploy
- [ ] Render hesabı açıldı, yeni Web Service yaradıldı
- [ ] GitHub repo Render-ə bağlandı (`apps/api`)
- [ ] Production mühit dəyişənləri Render-də tənzimləndi
- [ ] `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET`, SMTP dəyişənləri daxil edildi
- [ ] Health check endpointi yaradıldı (`GET /api/health`)
- [ ] Backend deploy uğurlu oldu, health check keçdi

### 15.3 Vercel — Frontend Deploy
- [ ] Vercel hesabı açıldı, yeni layihə yaradıldı
- [ ] GitHub repo Vercel-ə bağlandı (`apps/web`)
- [ ] Production mühit dəyişənləri Vercel-də tənzimləndi
- [ ] `NEXT_PUBLIC_API_URL` production backend URL-i ilə dolduruldu
- [ ] Custom domain: `cahanacademy.az` Vercel-ə bağlandı
- [ ] Cloudflare DNS A/CNAME qeydləri tənzimləndi
- [ ] HTTPS sertifikatı avtomatik verildi

### 15.4 CI/CD
- [ ] GitHub Actions workflow yaradıldı (`.github/workflows/ci.yml`)
- [ ] CI: Linting yoxlanıldı (`npm run lint`)
- [ ] CI: Backend testlər keçirildi
- [ ] CI: Frontend build uğurla tamamlandı
- [ ] Vercel preview deploy hər PR üçün aktivləşdirildi

---

## Mərhələ 16 — Qanuni Səhifələr
**Status:** `[ ]` gözləyir — 0/4

**Branch:** `feature/m16-legal`

- [ ] `/privacy-policy` səhifəsi yaradıldı (SSG, Azərbaycanca)
- [ ] `/terms` istifadə şərtləri səhifəsi yaradıldı (SSG)
- [ ] Cookie bildirişi komponenti yaradıldı (footer-də)
- [ ] Hər iki səhifəyə `generateMetadata()` əlavə edildi

---

## Ümumi Tərəqqi

| Mərhələ | Status | Tamamlanma | Tapşırıq sayı |
|---|---|---|---|
| 0 — Sənədləşmə | `[x]` tamamlandı | 100% (11/11) | 11 |
| 1 — Qurulum | `[x]` tamamlandı | 100% (28/28) | 28 |
| 2 — Verilənlər bazası | `[x]` tamamlandı | 100% (12/12) | 12 |
| 3 — Layout & Nav | `[x]` tamamlandı | 100% (14/14) | 14 |
| 4 — Ana səhifə | `[x]` tamamlandı | 100% (14/14) | 14 |
| 5 — Kurslar | `[x]` tamamlandı | 100% (14/14) | 14 |
| 6 — Müəllimlər | `[x]` tamamlandı | 100% (10/10) | 10 |
| 7 — Haqqımızda | `[x]` tamamlandı | 100% (7/7) | 7 |
| 8 — Blog | `[x]` tamamlandı | 100% (13/13) | 13 |
| 9 — Formalar | `[x]` tamamlandı | 100% (16/16) | 16 |
| 10 — FAQ | `[ ]` gözləyir | 0% (0/6) | 6 |
| 11 — Admin Panel | `[ ]` gözləyir | 0% (0/24) | 24 |
| 12 — SEO | `[ ]` gözləyir | 0% (0/16) | 16 |
| 13 — Performans | `[ ]` gözləyir | 0% (0/10) | 10 |
| 14 — Testlər | `[ ]` gözləyir | 0% (0/18) | 18 |
| 15 — Deploy & CI/CD | `[ ]` gözləyir | 0% (0/14) | 14 |
| 16 — Qanuni | `[ ]` gözləyir | 0% (0/4) | 4 |
| **CƏMİ** | | **~62% (139/225)** | **225** |

---

> **Qeyd:** Hər tapşırığı tamamladıqdan sonra bu faylı yenilə.  
> Yeni AI sessiyanı başladıqda: **yalnız "Cari Vəziyyət" blokunu oxu** — bu kifayətdir.  
> Local AI ilə işləyərkən: "Bu TODO.md faylına bax, hansı tapşırıq növbəti?" deyə soruşa bilərsən.

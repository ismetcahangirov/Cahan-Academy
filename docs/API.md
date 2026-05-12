# API.md — REST API Sənədləşməsi

> **Layihə:** Academy Landing Page
> **Base URL:** `https://api.cahanacademy.az/api`
> **Versiya:** v1
> **Format:** JSON
> **Son yenilənmə:** 2026

---

## 1. API Ümumi Məlumatı

### 1.1 Base URL-lər

| Mühit | URL |
|---|---|
| Development | `http://localhost:5000/api` |
| Staging | `https://api-staging.cahanacademy.az/api` |
| Production | `https://api.cahanacademy.az/api` |

### 1.2 Standart Cavab Formatı

```typescript
// Uğurlu cavab
{
  "success":    true,
  "message":    "Əməliyyat uğurla tamamlandı",
  "data":       { ... },
  "statusCode": 200
}

// Siyahı cavabı (pagination)
{
  "success":    true,
  "message":    "Kurslar uğurla alındı",
  "data":       [...],
  "meta": {
    "total": 24,
    "page":  1,
    "pages": 3,
    "limit": 10
  },
  "statusCode": 200
}

// Xəta cavabı
{
  "success":    false,
  "message":    "Validasiya xətası",
  "error":      "VALIDATION_ERROR",
  "details":    { "email": "Düzgün email daxil edin" },
  "statusCode": 422
}
```

### 1.3 HTTP Status Kodları

| Kod | Məna | Nə vaxt |
|---|---|---|
| 200 | OK | Uğurlu GET, PUT |
| 201 | Created | Uğurlu POST (yeni resurs) |
| 204 | No Content | Uğurlu DELETE |
| 400 | Bad Request | Düzgün olmayan sorğu |
| 401 | Unauthorized | Token yoxdur / keçərsizdir |
| 403 | Forbidden | İcazə yoxdur |
| 404 | Not Found | Resurs tapılmadı |
| 409 | Conflict | Artıq mövcuddur (email) |
| 422 | Unprocessable | Validasiya xətası |
| 429 | Too Many Requests | Rate limit aşıldı |
| 500 | Server Error | Daxili server xətası |

### 1.4 Rate Limiting

| Endpoint qrupu | Limit | Müddət |
|---|---|---|
| POST /contact | 3 sorğu | 1 saat (eyni IP) |
| POST /leads/enroll | 3 sorğu | 1 saat (eyni IP) |
| POST /newsletter | 5 sorğu | 1 saat |
| POST /auth/login | 5 sorğu | 15 dəqiqə |
| GET /* (ümumi) | 200 sorğu | 1 dəqiqə |

```typescript
// Rate limit cavab başlıqları:
X-RateLimit-Limit:     3
X-RateLimit-Remaining: 0
X-RateLimit-Reset:     1735000000
Retry-After:           3600
```

---

## 2. Autentifikasiya

Açıq (public) endpointlər token tələb etmir.
Admin endpointləri `Authorization: Bearer <token>` başlığı tələb edir.

```
Public  endpointlər: GET /courses, GET /teachers, POST /contact ...
Protected endpointlər: /admin/* — JWT token tələb olunur
```

> Ətraflı bax: [`AUTH.md`](./AUTH.md)

---

## 3. Kurslar — /courses

### GET /courses
Bütün aktiv kursların siyahısı.

**Sorğu parametrləri:**
```
locale     string   az|en|ru   default: az
featured   boolean  optional   Yalnız featured kurslar
page       integer  optional   default: 1
limit      integer  optional   default: 20, max: 50
```

**Nümunə sorğu:**
```bash
GET /api/courses?locale=az&featured=true
```

**Uğurlu cavab — 200:**
```json
{
  "success": true,
  "message": "Kurslar uğurla alındı",
  "data": [
    {
      "id":          "uuid-here",
      "slug":        "python-baslangic",
      "title":       "Python — Başlanğıcdan Peşəkara",
      "description": "Sıfırdan Python öyrənin...",
      "shortDesc":   "Sıfırdan Python öyrənin",
      "duration":    "3 ay",
      "schedule":    "H-Ç-C, 18:00-20:00",
      "level":       "Başlanğıc",
      "price":       "350.00",
      "imageUrl":    "https://cdn.cahanacademy.az/courses/python.jpg",
      "isFeatured":  true,
      "certificate": true,
      "teacher": {
        "id":        "uuid-here",
        "name":      "Leyla Məmmədova",
        "title":     "Python Mütəxəssisi",
        "avatarUrl": "https://cdn.cahanacademy.az/teachers/leyla.jpg"
      }
    }
  ],
  "statusCode": 200
}
```

---

### GET /courses/:slug
Tək kursun tam məlumatı (müfərdat daxil).

**Nümunə sorğu:**
```bash
GET /api/courses/python-baslangic?locale=az
```

**Uğurlu cavab — 200:**
```json
{
  "success": true,
  "data": {
    "id":          "uuid-here",
    "slug":        "python-baslangic",
    "title":       "Python — Başlanğıcdan Peşəkara",
    "description": "Tam açıqlama mətni...",
    "duration":    "3 ay",
    "schedule":    "H-Ç-C, 18:00-20:00",
    "level":       "Başlanğıc",
    "language":    "Azərbaycan dili",
    "groupSize":   12,
    "price":       "350.00",
    "certificate": true,
    "videoUrl":    null,
    "curriculum": [
      {
        "week":   1,
        "title":  "Python-a Giriş",
        "topics": ["Mühitin qurulması", "Dəyişənlər", "Məlumat tipləri"]
      }
    ],
    "teacher": {
      "id":          "uuid-here",
      "name":        "Leyla Məmmədova",
      "title":       "Python Mütəxəssisi",
      "bio":         "8 il təcrübə...",
      "avatarUrl":   "https://cdn.cahanacademy.az/teachers/leyla.jpg",
      "linkedinUrl": "https://linkedin.com/in/leyla"
    }
  },
  "statusCode": 200
}
```

**Xəta cavabı — 404:**
```json
{
  "success":    false,
  "message":    "Kurs tapılmadı",
  "error":      "NOT_FOUND",
  "statusCode": 404
}
```

---

### GET /courses/slugs
Bütün aktiv kursların slug-ları (Next.js generateStaticParams üçün).

```bash
GET /api/courses/slugs
```

```json
{
  "success": true,
  "data":    ["python-baslangic", "web-development", "ui-ux-dizayn"],
  "statusCode": 200
}
```

---

## 4. Müəllimlər — /teachers

### GET /teachers
```bash
GET /api/teachers?locale=az
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "uuid-here",
      "slug":        "leyla-memmedova",
      "name":        "Leyla Məmmədova",
      "title":       "Python Mütəxəssisi",
      "bio":         "8 il proqramlaşdırma təcrübəsi...",
      "avatarUrl":   "https://cdn.cahanacademy.az/teachers/leyla.jpg",
      "linkedinUrl": "https://linkedin.com/in/leyla",
      "twitterUrl":  null,
      "githubUrl":   "https://github.com/leyla",
      "courses": [
        { "slug": "python-baslangic", "title": "Python — Başlanğıcdan Peşəkara" }
      ]
    }
  ],
  "statusCode": 200
}
```

---

### GET /teachers/:slug
```bash
GET /api/teachers/leyla-memmedova?locale=az
```

---

## 5. Əlaqə Forması — /contact

### POST /contact
İstifadəçi əlaqə formasını göndərir.

**Request Body:**
```json
{
  "name":    "Anar Hüseynov",
  "email":   "anar@example.com",
  "phone":   "+994501234567",
  "message": "Python kursu haqqında məlumat almaq istəyirəm.",
  "locale":  "az"
}
```

**Validasiya Qaydaları:**
```typescript
// src/schemas/contact.schema.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .min(2,  'Ad ən az 2 simvol olmalıdır')
    .max(100, 'Ad 100 simvoldan çox ola bilməz')
    .regex(/^[\p{L}\s'-]+$/u, 'Ad yalnız hərf ehtiva edə bilər'),

  email: z
    .string()
    .email('Düzgün email ünvanı daxil edin')
    .max(255),

  phone: z
    .string()
    .regex(
      /^(\+994|0)(50|51|55|60|70|77|99)\d{7}$/,
      'Düzgün Azərbaycan nömrəsi daxil edin (+994XXXXXXXXX)'
    )
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .min(10,  'Mesaj ən az 10 simvol olmalıdır')
    .max(1000, 'Mesaj 1000 simvoldan çox ola bilməz'),

  locale: z.enum(['az', 'en', 'ru']).default('az'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

**Uğurlu cavab — 201:**
```json
{
  "success":    true,
  "message":    "Müraciətiniz qəbul edildi. 24 saat ərzində sizinlə əlaqə saxlayacağıq.",
  "data": {
    "id":        "uuid-here",
    "createdAt": "2026-01-15T14:30:00Z"
  },
  "statusCode": 201
}
```

**Validasiya xətası — 422:**
```json
{
  "success":    false,
  "message":    "Validasiya xətası",
  "error":      "VALIDATION_ERROR",
  "details": {
    "email":   "Düzgün email ünvanı daxil edin",
    "message": "Mesaj ən az 10 simvol olmalıdır"
  },
  "statusCode": 422
}
```

**Rate limit xətası — 429:**
```json
{
  "success":    false,
  "message":    "Çox sayda müraciət. 1 saat sonra yenidən cəhd edin.",
  "error":      "RATE_LIMIT_EXCEEDED",
  "statusCode": 429
}
```

**Server tərəfindəki davranış:**
```
1. Zod ilə məlumatları doğrula
2. Rate limit yoxla (IP əsaslı)
3. leads cədvəlinə yaz (source: 'contact_form')
4. Admin-ə email bildiriş göndər (Nodemailer)
5. İstifadəçiyə avtomatik cavab emaili göndər
6. Next.js cache-i revalidasiya et ('leads' tag)
7. 201 cavabı qaytar
```

---

## 6. Qeydiyyat Forması — /leads

### POST /leads/enroll
Kurs üçün qeydiyyat müraciəti.

**Request Body:**
```json
{
  "name":       "Anar Hüseynov",
  "email":      "anar@example.com",
  "phone":      "+994501234567",
  "courseId":   "uuid-here",
  "courseName": "Python — Başlanğıcdan Peşəkara",
  "message":    "Bu kursda iştirak etmək istəyirəm.",
  "locale":     "az",
  "utmSource":  "instagram",
  "utmMedium":  "social",
  "referrer":   "https://instagram.com"
}
```

**Validasiya:**
```typescript
export const enrollSchema = z.object({
  name:       z.string().min(2).max(100),
  email:      z.string().email(),
  phone:      z.string().regex(/^(\+994|0)(50|51|55|60|70|77|99)\d{7}$/),
  courseId:   z.string().uuid().optional(),
  courseName: z.string().max(200).optional(),
  message:    z.string().max(500).optional(),
  locale:     z.enum(['az', 'en', 'ru']).default('az'),
  utmSource:  z.string().max(100).optional(),
  utmMedium:  z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  referrer:   z.string().url().optional().or(z.literal('')),
});
```

**Uğurlu cavab — 201:**
```json
{
  "success":    true,
  "message":    "Qeydiyyatınız qəbul edildi!",
  "data":       { "id": "uuid-here" },
  "statusCode": 201
}
```

---

## 7. Newsletter — /newsletter

### POST /newsletter/subscribe
Email abunəliyi.

**Request Body:**
```json
{
  "email":  "anar@example.com",
  "locale": "az"
}
```

**Uğurlu cavab — 201:**
```json
{
  "success":    true,
  "message":    "Abunəliyiniz qəbul edildi. Email ünvanınızı təsdiq edin.",
  "statusCode": 201
}
```

**Artıq mövcuddur — 409:**
```json
{
  "success":    false,
  "message":    "Bu email ünvanı artıq abunədir.",
  "error":      "ALREADY_EXISTS",
  "statusCode": 409
}
```

---

### GET /newsletter/confirm/:token
Email ünvanını təsdiq et.

```bash
GET /api/newsletter/confirm/abc123token
```

**Uğurlu cavab — 200:**
```json
{
  "success":    true,
  "message":    "Email ünvanınız uğurla təsdiqləndi.",
  "statusCode": 200
}
```

---

### POST /newsletter/unsubscribe
Abunəlikdən çıx.

```json
{ "email": "anar@example.com" }
```

---

## 8. Blog — /blog

### GET /blog
```bash
GET /api/blog?locale=az&page=1&limit=9
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": [
    {
      "id":          "uuid-here",
      "slug":        "python-oyrenmek-ucun-resurslar",
      "title":       "Python Öyrənmək Üçün Ən Yaxşı Resurslar",
      "excerpt":     "2026-cı ildə Python öyrənmək üçün...",
      "coverImage":  "https://cdn.cahanacademy.az/blog/python-resurslar.jpg",
      "readTime":    5,
      "publishedAt": "2026-01-10T10:00:00Z",
      "tags":        ["python", "proqramlaşdırma", "öyrənmə"],
      "author": {
        "name":      "Leyla Məmmədova",
        "avatarUrl": "https://cdn.cahanacademy.az/teachers/leyla.jpg"
      }
    }
  ],
  "meta": {
    "total": 18,
    "page":  1,
    "pages": 2,
    "limit": 9
  },
  "statusCode": 200
}
```

---

### GET /blog/:slug
```bash
GET /api/blog/python-oyrenmek-ucun-resurslar?locale=az
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": {
    "id":          "uuid-here",
    "slug":        "python-oyrenmek-ucun-resurslar",
    "title":       "Python Öyrənmək Üçün Ən Yaxşı Resurslar",
    "content":     "<p>2026-cı ildə Python öyrənmək üçün...</p>",
    "coverImage":  "https://cdn.cahanacademy.az/blog/python-resurslar.jpg",
    "coverAlt":    "Python öyrənmə resursları",
    "readTime":    5,
    "publishedAt": "2026-01-10T10:00:00Z",
    "updatedAt":   "2026-01-12T08:00:00Z",
    "tags":        ["python", "proqramlaşdırma"],
    "author": {
      "name":        "Leyla Məmmədova",
      "title":       "Python Mütəxəssisi",
      "avatarUrl":   "https://cdn.cahanacademy.az/teachers/leyla.jpg",
      "linkedinUrl": "https://linkedin.com/in/leyla"
    }
  },
  "statusCode": 200
}
```

---

## 9. FAQ — /faq

### GET /faq
```bash
GET /api/faq?locale=az
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": [
    {
      "id":       "uuid-here",
      "question": "Kurslara qeydiyyat necə keçir?",
      "answer":   "Saytımızdakı müraciət formasını doldurun...",
      "category": "Qeydiyyat"
    },
    {
      "id":       "uuid-here",
      "question": "Sertifikat verirlərmi?",
      "answer":   "Bəli, kursu uğurla bitirən tələbələrə...",
      "category": "Sertifikat"
    }
  ],
  "statusCode": 200
}
```

---

## 10. Admin API — /admin (Qorunan)

> Bütün admin endpointləri `Authorization: Bearer <token>` tələb edir.

### GET /admin/leads
Müraciətlər siyahısı (filterlə).

```bash
GET /api/admin/leads?status=new&source=contact_form&page=1&limit=20
Authorization: Bearer eyJhbGc...
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": [
    {
      "id":        "uuid-here",
      "name":      "Anar Hüseynov",
      "email":     "anar@example.com",
      "phone":     "+994501234567",
      "message":   "Python kursu haqqında...",
      "status":    "new",
      "source":    "contact_form",
      "locale":    "az",
      "courseName": null,
      "notes":     null,
      "createdAt": "2026-01-15T14:30:00Z"
    }
  ],
  "meta": {
    "total": 47,
    "page":  1,
    "pages": 3,
    "limit": 20
  },
  "statusCode": 200
}
```

---

### PATCH /admin/leads/:id/status
Lead statusunu yenilə.

```bash
PATCH /api/admin/leads/uuid-here/status
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "status": "contacted",
  "notes":  "Telefon ilə əlaqə saxlandı, kurs haqqında məlumat verildi."
}
```

**Uğurlu cavab — 200:**
```json
{
  "success":    true,
  "message":    "Status uğurla yeniləndi",
  "data": {
    "id":        "uuid-here",
    "status":    "contacted",
    "notes":     "Telefon ilə əlaqə saxlandı...",
    "updatedAt": "2026-01-15T15:00:00Z"
  },
  "statusCode": 200
}
```

---

### GET /admin/stats
Dashboard statistikası.

```bash
GET /api/admin/stats
Authorization: Bearer eyJhbGc...
```

**Cavab — 200:**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total":     47,
      "new":       12,
      "contacted": 20,
      "enrolled":  13,
      "rejected":  2,
      "today":     3
    },
    "newsletter": {
      "total":     234,
      "confirmed": 198
    },
    "courses": {
      "total":  8,
      "active": 7
    }
  },
  "statusCode": 200
}
```

---

## 11. Express Router İmplementasiyası

```typescript
// src/routes/index.ts

import { Router } from 'express';
import courseRoutes     from './courses.routes';
import teacherRoutes    from './teachers.routes';
import contactRoutes    from './contact.routes';
import leadRoutes       from './leads.routes';
import newsletterRoutes from './newsletter.routes';
import blogRoutes       from './blog.routes';
import faqRoutes        from './faq.routes';
import adminRoutes      from './admin.routes';

const router = Router();

// Public
router.use('/courses',    courseRoutes);
router.use('/teachers',   teacherRoutes);
router.use('/contact',    contactRoutes);
router.use('/leads',      leadRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/blog',       blogRoutes);
router.use('/faq',        faqRoutes);

// Protected
router.use('/admin',      adminRoutes);

// Health check
router.get('/health', (_, res) => {
  res.json({
    success:   true,
    message:   'API işləyir',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
  });
});

export default router;
```

---

## 12. Utility — API Response & Async Handler

```typescript
// src/utils/apiResponse.ts

import type { Response } from 'express';

interface SuccessOptions {
  message?:    string;
  data?:       unknown;
  status?:     number;
  meta?:       Record<string, unknown>;
}

export const apiResponse = {
  success(res: Response, opts: SuccessOptions = {}) {
    const { message = 'Uğurlu', data, status = 200, meta } = opts;
    return res.status(status).json({
      success:    true,
      message,
      ...(data !== undefined && { data }),
      ...(meta  && { meta }),
      statusCode: status,
    });
  },

  error(res: Response, opts: {
    message:    string;
    error?:     string;
    status?:    number;
    details?:   Record<string, string>;
  }) {
    const { message, error = 'ERROR', status = 500, details } = opts;
    return res.status(status).json({
      success:    false,
      message,
      error,
      ...(details && { details }),
      statusCode: status,
    });
  },
};

// src/utils/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
```

---

## 13. Rate Limiting Middleware

```typescript
// src/middleware/rateLimit.middleware.ts

import rateLimit from 'express-rate-limit';

// Contact form — ciddi limit
export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 saat
  max:      3,
  message: {
    success:    false,
    message:    'Çox sayda müraciət. 1 saat sonra yenidən cəhd edin.',
    error:      'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: (req) => req.ip || 'unknown',
});

// Enroll form
export const enrollRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      3,
  message: {
    success:    false,
    message:    'Çox sayda qeydiyyat cəhdi.',
    error:      'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Admin login
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 dəqiqə
  max:      5,
  message: {
    success:    false,
    message:    'Çox sayda giriş cəhdi. 15 dəqiqə sonra yenidən cəhd edin.',
    error:      'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Ümumi API
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 dəqiqə
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
});
```

---

## 14. Email Servisi

```typescript
// src/services/email.service.ts

import nodemailer from 'nodemailer';
import { env }   from '../config/env';
import type { Lead } from '../models/schema';

const transporter = nodemailer.createTransport({
  host:   env.SMTP_HOST,
  port:   env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const emailService = {

  // Admin-ə bildiriş
  async sendAdminNotification(lead: Lead): Promise<void> {
    await transporter.sendMail({
      from:    `"Cahan Academy" <${env.SMTP_USER}>`,
      to:      env.ADMIN_EMAIL,
      subject: `🔔 Yeni Müraciət — ${lead.name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1C1C1E; padding: 24px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 20px;">
              CAHAN ACADEMY — Yeni Müraciət
            </h1>
          </div>
          <div style="padding: 32px; background: #FAFAF8;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B6B6B; width: 120px;">Ad:</td>
                <td style="padding: 8px 0; font-weight: bold;">${lead.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6B6B;">Email:</td>
                <td style="padding: 8px 0;">
                  <a href="mailto:${lead.email}">${lead.email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6B6B;">Telefon:</td>
                <td style="padding: 8px 0;">${lead.phone || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6B6B;">Mənbə:</td>
                <td style="padding: 8px 0;">${lead.source}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B6B6B; vertical-align: top;">Mesaj:</td>
                <td style="padding: 8px 0;">${lead.message || '—'}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 16px; background: #E8E4DC; text-align: center;">
            <a href="https://cahanacademy.az/admin/leads"
               style="color: #800020; text-decoration: none;">
              Admin Panel → Müraciətlər
            </a>
          </div>
        </div>
      `,
    });
  },

  // İstifadəçiyə avtomatik cavab
  async sendUserConfirmation(email: string, name: string): Promise<void> {
    await transporter.sendMail({
      from:    `"Cahan Academy" <${env.SMTP_USER}>`,
      to:      email,
      subject: 'Müraciətiniz qəbul edildi — Cahan Academy',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1C1C1E; padding: 32px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; letter-spacing: 0.1em;">
              CAHAN ACADEMY
            </h1>
          </div>
          <div style="padding: 40px; background: #FAFAF8;">
            <p style="font-size: 18px; color: #1C1C1E;">Hörmətli ${name},</p>
            <p style="color: #6B6B6B; line-height: 1.8;">
              Müraciətiniz uğurla qəbul edildi. Komandamız ən qısa zamanda,
              <strong>24 saat ərzində</strong> sizinlə əlaqə saxlayacaqdır.
            </p>
            <div style="margin: 32px 0; padding: 24px;
                        background: white; border-left: 4px solid #C9A84C;">
              <p style="margin: 0; color: #1C1C1E; font-style: italic;">
                "Hər böyük uğur, kiçik bir addımdan başlayır."
              </p>
            </div>
            <p style="color: #6B6B6B;">
              Suallarınız üçün bizimlə əlaqə saxlaya bilərsiniz:<br/>
              📞 <a href="tel:+994501234567">+994 50 123 45 67</a><br/>
              📧 <a href="mailto:info@cahanacademy.az">info@cahanacademy.az</a>
            </p>
          </div>
          <div style="padding: 20px; background: #1C1C1E; text-align: center;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              © 2026 Cahan Academy. Bütün hüquqlar qorunur.
            </p>
          </div>
        </div>
      `,
    });
  },
};
```

---

## 15. API Yoxlama Siyahısı

```
PUBLIC ENDPOINTLƏRİ
  [ ]  GET /api/health — işləyir
  [ ]  GET /api/courses — kurslar qaytarır
  [ ]  GET /api/courses/:slug — tək kurs qaytarır (mövcud + yox)
  [ ]  GET /api/teachers — müəllimlər qaytarır
  [ ]  GET /api/faq — FAQ-lar qaytarır
  [ ]  GET /api/blog — yazılar qaytarır
  [ ]  POST /api/contact — form göndərilir, email gəlir
  [ ]  POST /api/leads/enroll — qeydiyyat göndərilir
  [ ]  POST /api/newsletter/subscribe — abunəlik işləyir

VALİDASİYA
  [ ]  Boş sahələr — 422 xətası qaytarır
  [ ]  Yanlış email — 422 xətası qaytarır
  [ ]  Yanlış telefon — 422 xətası qaytarır
  [ ]  Çox uzun sahələr — 422 xətası qaytarır

RATE LİMİT
  [ ]  3+ contact sorğusu → 429 xətası
  [ ]  5+ admin login cəhdi → 429 xətası

ADMİN
  [ ]  Token olmadan /admin/* → 401 xətası
  [ ]  Keçərsiz token → 401 xətası
  [ ]  GET /admin/leads — siyahı qaytarır
  [ ]  PATCH /admin/leads/:id/status — status yenilənir
  [ ]  GET /admin/stats — statistika qaytarır

EMAİL
  [ ]  Contact formu → admin emaili gəlir
  [ ]  Contact formu → istifadəçi emaili gəlir
  [ ]  Enroll formu → admin emaili gəlir
  [ ]  Newsletter → təsdiq emaili gəlir
```

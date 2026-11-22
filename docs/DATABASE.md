# DATABASE.md — Verilənlər Bazası

> **Layihə:** Academy Landing Page
> **ORM:** Drizzle ORM
> **DB:** PostgreSQL 16 (Neon Serverless — pulsuz tier)
> **Son yenilənmə:** 2026

---

## 1. Neon PostgreSQL — Pulsuz Qurulum

### 1.1 Neon Niyə?

| Xüsusiyyət | Neon (pulsuz) | Render PostgreSQL | Supabase (pulsuz) |
|---|---|---|---|
| Storage | 0.5 GB | 1 GB | 500 MB |
| Branching | ✅ | ❌ | ❌ |
| Serverless | ✅ (avtomatik sleep) | ❌ | ✅ |
| Connection Pooling | ✅ (PgBouncer) | ❌ | ✅ |
| Cold start | ~100ms | — | ~500ms |
| Vercel inteqrasiya | ✅ birbaşa | Manual | ✅ |

### 1.2 Neon Qurulumu

```bash
# 1. neon.tech-də hesab aç (GitHub ilə giriş)
# 2. Yeni project yarat: "academy-landing"
# 3. Database adı: academy_db
# 4. Region: eu-central-1 (Frankfurt — Bakıya ən yaxın)

# 5. Connection string al:
# postgresql://user:pass@ep-xxx-yyy.eu-central-1.aws.neon.tech/academy_db?sslmode=require

# 6. .env-ə əlavə et:
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/academy_db?sslmode=require"

# Pooling üçün (production-da):
DATABASE_URL_POOL="postgresql://user:pass@ep-xxx-pooler.neon.tech/academy_db?sslmode=require&pgbouncer=true"
```

### 1.3 Neon Branch Strategiyası

```
main branch     → production (cahanacademy.az)
dev branch      → development (localhost)
preview branch  → PR preview (Vercel Preview)

# Yeni branch yarat (Neon dashboard və ya CLI):
npx neonctl branches create --name dev --parent main
```

---

## 2. Drizzle ORM — Qurulum

### 2.1 Paketlər

```bash
cd apps/api

npm install drizzle-orm @neondatabase/serverless
npm install --save-dev drizzle-kit
```

### 2.2 DB Bağlantısı

```typescript
// src/config/db.ts

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle }          from 'drizzle-orm/neon-http';
import * as schema          from '../models/schema';
import { env }              from './env';

// Serverless mühitlər üçün WebSocket fetch
neonConfig.fetchConnectionCache = true;

const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === 'development', // Dev-də SQL logla
});

export type DB = typeof db;

// Tip-güclü transaction
export async function withTransaction<T>(
  fn: (tx: DB) => Promise<T>
): Promise<T> {
  return db.transaction(fn);
}
```

### 2.3 Drizzle Konfiqurasiyası

```typescript
// drizzle.config.ts (apps/api/ kökündə)

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema:    './src/models/schema/index.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose:   true,
  strict:    true,
} satisfies Config;
```

```json
// package.json scripts
{
  "scripts": {
    "db:generate":  "drizzle-kit generate",
    "db:migrate":   "drizzle-kit migrate",
    "db:push":      "drizzle-kit push",
    "db:studio":    "drizzle-kit studio",
    "db:seed":      "tsx src/scripts/seed.ts",
    "db:reset":     "tsx src/scripts/reset.ts"
  }
}
```

---

## 3. Schema — Cədvəl Strukturu

### 3.1 Schema Faylları

```
src/models/schema/
├── index.ts           ← Hamısını export edir
├── courses.ts         ← Kurslar
├── teachers.ts        ← Müəllimlər
├── leads.ts           ← Müraciətlər (contact form)
├── blog.ts            ← Blog yazıları
├── faq.ts             ← Tez-tez soruşulan suallar
├── newsletter.ts      ← Email abunəliyi
├── admins.ts          ← Admin istifadəçilər
└── enums.ts           ← Paylaşılan enum-lar
```

---

### 3.2 Paylaşılan Enum-lar

```typescript
// src/models/schema/enums.ts

import { pgEnum } from 'drizzle-orm/pg-core';

export const leadStatusEnum = pgEnum('lead_status', [
  'new',        // Yeni müraciət
  'contacted',  // Əlaqə saxlanıldı
  'enrolled',   // Qeydiyyatdan keçdi
  'rejected',   // İmtina etdi
]);

export const leadSourceEnum = pgEnum('lead_source', [
  'contact_form',   // Əlaqə forması
  'enroll_form',    // Qeydiyyat forması
  'newsletter',     // Email abunəliyi
  'whatsapp',       // WhatsApp
  'instagram',      // Instagram
  'referral',       // Tövsiyə
  'other',          // Digər
]);

export const courseStatusEnum = pgEnum('course_status', [
  'draft',     // Qaralama
  'active',    // Aktiv
  'archived',  // Arxivləşdirilmiş
]);

export const blogStatusEnum = pgEnum('blog_status', [
  'draft',      // Qaralama
  'published',  // Dərc edilmiş
  'archived',   // Arxiv
]);

export const localeEnum = pgEnum('locale', ['az', 'en', 'ru']);
```

---

### 3.3 Müəllimlər (teachers)

```typescript
// src/models/schema/teachers.ts

import {
  pgTable, uuid, text, boolean,
  timestamp, integer, jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const teachers = pgTable('teachers', {
  id:        uuid('id').primaryKey().defaultRandom(),
  slug:      text('slug').notNull().unique(),

  // Çoxdilli məzmun — JSONB
  name:      text('name').notNull(),
  title:     jsonb('title').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  bio:       jsonb('bio').notNull().$type<Record<'az'|'en'|'ru', string>>(),

  // Media
  avatarUrl: text('avatar_url'),

  // Sosial şəbəkə
  linkedinUrl: text('linkedin_url'),
  twitterUrl:  text('twitter_url'),
  githubUrl:   text('github_url'),

  // Sıralama
  sortOrder: integer('sort_order').default(0),

  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
               .notNull()
               .default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
               .notNull()
               .default(sql`NOW()`),
});

export type Teacher    = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
```

---

### 3.4 Kurslar (courses)

```typescript
// src/models/schema/courses.ts

import {
  pgTable, uuid, text, boolean,
  timestamp, integer, numeric, jsonb,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { teachers }       from './teachers';
import { courseStatusEnum } from './enums';

export const courses = pgTable('courses', {
  id:       uuid('id').primaryKey().defaultRandom(),
  slug:     text('slug').notNull().unique(),

  // Çoxdilli məzmun
  title:       jsonb('title').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  description: jsonb('description').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  shortDesc:   jsonb('short_desc').$type<Record<'az'|'en'|'ru', string>>(),

  // Xüsusiyyətlər
  duration:    text('duration'),             // "3 ay", "48 saat"
  schedule:    text('schedule'),             // "Həftə 3 gün, 18:00-20:00"
  level:       text('level'),                // "Başlanğıc", "Orta", "İrəliləmiş"
  language:    text('language'),             // "Azərbaycan dili"
  groupSize:   integer('group_size'),        // Qrup böyüklüyü
  certificate: boolean('certificate').default(true),

  // Qiymət
  price:       numeric('price', { precision: 10, scale: 2 }),
  priceNote:   jsonb('price_note').$type<Record<'az'|'en'|'ru', string>>(),

  // Media
  imageUrl:    text('image_url'),
  videoUrl:    text('video_url'),

  // Müəllim
  teacherId:   uuid('teacher_id').references(() => teachers.id, {
    onDelete: 'set null',
  }),

  // Sıralama və status
  sortOrder:   integer('sort_order').default(0),
  isFeatured:  boolean('is_featured').default(false),
  status:      courseStatusEnum('status').notNull().default('active'),

  // Proqram (müfrədat)
  curriculum:  jsonb('curriculum').$type<CourseCurriculumItem[]>(),

  createdAt: timestamp('created_at', { withTimezone: true })
               .notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
               .notNull().default(sql`NOW()`),
});

// Müfərdat elementi tipi
export interface CourseCurriculumItem {
  week:   number;
  title:  Record<'az' | 'en' | 'ru', string>;
  topics: Record<'az' | 'en' | 'ru', string[]>;
}

// İlişki
export const coursesRelations = relations(courses, ({ one }) => ({
  teacher: one(teachers, {
    fields:     [courses.teacherId],
    references: [teachers.id],
  }),
}));

export type Course    = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
```

---

### 3.5 Müraciətlər — Leads (leads)

```typescript
// src/models/schema/leads.ts

import {
  pgTable, uuid, text, boolean,
  timestamp, jsonb,
} from 'drizzle-orm/pg-core';
import { sql }    from 'drizzle-orm';
import { courses } from './courses';
import { leadStatusEnum, leadSourceEnum } from './enums';

export const leads = pgTable('leads', {
  id:      uuid('id').primaryKey().defaultRandom(),

  // Əlaqə məlumatları
  name:    text('name').notNull(),
  email:   text('email').notNull(),
  phone:   text('phone'),
  message: text('message'),

  // Maraq göstərdiyi kurs (opsional)
  courseId: uuid('course_id').references(() => courses.id, {
    onDelete: 'set null',
  }),
  courseName: text('course_name'), // Snapshot — kurs silinəndə qalsın

  // Mənbə
  source:  leadSourceEnum('source').notNull().default('contact_form'),
  utmSource:   text('utm_source'),
  utmMedium:   text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  referrer:    text('referrer'),

  // Status
  status:  leadStatusEnum('status').notNull().default('new'),
  notes:   text('notes'),          // Admin qeydi

  // Texniki
  ipAddress:   text('ip_address'),
  userAgent:   text('user_agent'),
  locale:      text('locale').default('az'),

  // Email göndərmə
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  notificationSentAt: timestamp('notification_sent_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true })
               .notNull().default(sql`NOW()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
               .notNull().default(sql`NOW()`),
});

export type Lead    = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
```

---

### 3.6 Blog (blog_posts)

```typescript
// src/models/schema/blog.ts

import {
  pgTable, uuid, text, boolean,
  timestamp, integer, jsonb,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import { teachers }       from './teachers';
import { blogStatusEnum } from './enums';

export const blogPosts = pgTable('blog_posts', {
  id:   uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),

  // Çoxdilli məzmun
  title:     jsonb('title').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  excerpt:   jsonb('excerpt').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  content:   jsonb('content').notNull().$type<Record<'az'|'en'|'ru', string>>(),

  // SEO
  metaTitle:       jsonb('meta_title').$type<Record<'az'|'en'|'ru', string>>(),
  metaDescription: jsonb('meta_description').$type<Record<'az'|'en'|'ru', string>>(),

  // Media
  coverImage:  text('cover_image'),
  coverAlt:    jsonb('cover_alt').$type<Record<'az'|'en'|'ru', string>>(),

  // Metadata
  authorId:    uuid('author_id').references(() => teachers.id, {
    onDelete: 'set null',
  }),
  tags:        jsonb('tags').$type<string[]>().default([]),
  readTime:    integer('read_time'),           // Dəqiqə ilə

  // Status
  status:      blogStatusEnum('status').notNull().default('draft'),
  isFeatured:  boolean('is_featured').default(false),

  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true })
                 .notNull().default(sql`NOW()`),
  updatedAt:   timestamp('updated_at', { withTimezone: true })
                 .notNull().default(sql`NOW()`),
});

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(teachers, {
    fields:     [blogPosts.authorId],
    references: [teachers.id],
  }),
}));

export type BlogPost    = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
```

---

### 3.7 FAQ (faqs)

```typescript
// src/models/schema/faq.ts

import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const faqs = pgTable('faqs', {
  id:        uuid('id').primaryKey().defaultRandom(),

  question:  jsonb('question').notNull().$type<Record<'az'|'en'|'ru', string>>(),
  answer:    jsonb('answer').notNull().$type<Record<'az'|'en'|'ru', string>>(),

  category:  text('category'),                 // "Ümumi", "Qiymət", "Kurslar"
  sortOrder: integer('sort_order').default(0),
  isActive:  integer('is_active').default(1),  // 1=aktiv, 0=deaktiv

  createdAt: timestamp('created_at', { withTimezone: true })
               .notNull().default(sql`NOW()`),
});

export type FAQ    = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;
```

---

### 3.8 Newsletter Abunəliyi (newsletter_subscribers)

```typescript
// src/models/schema/newsletter.ts

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id:            uuid('id').primaryKey().defaultRandom(),
  email:         text('email').notNull().unique(),
  locale:        text('locale').notNull().default('az'),
  isConfirmed:   boolean('is_confirmed').default(false),
  confirmToken:  text('confirm_token').unique(),
  confirmedAt:   timestamp('confirmed_at', { withTimezone: true }),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true })
                   .notNull().default(sql`NOW()`),
});

export type Subscriber    = typeof newsletterSubscribers.$inferSelect;
export type NewSubscriber = typeof newsletterSubscribers.$inferInsert;
```

---

### 3.9 Admin İstifadəçilər (admins)

```typescript
// src/models/schema/admins.ts

import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const admins = pgTable('admins', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name:         text('name').notNull(),
  isActive:     boolean('is_active').notNull().default(true),
  lastLoginAt:  timestamp('last_login_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true })
                  .notNull().default(sql`NOW()`),
});

export type Admin    = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
```

---

### 3.10 Schema Index — Hamısını Export et

```typescript
// src/models/schema/index.ts

export * from './enums';
export * from './teachers';
export * from './courses';
export * from './leads';
export * from './blog';
export * from './faq';
export * from './newsletter';
export * from './admins';
```

---

## 4. Verilənlər Bazası İndeksləri

```typescript
// Migration faylına əlavə olunan indexlər
// drizzle/migrations/0001_add_indexes.sql

-- Axtarış və filter üçün tez-tez istifadə olunan sahələr

-- Leads
CREATE INDEX idx_leads_status    ON leads(status);
CREATE INDEX idx_leads_email     ON leads(email);
CREATE INDEX idx_leads_source    ON leads(source);
CREATE INDEX idx_leads_course_id ON leads(course_id);
CREATE INDEX idx_leads_created   ON leads(created_at DESC);

-- Courses
CREATE INDEX idx_courses_status    ON courses(status);
CREATE INDEX idx_courses_slug      ON courses(slug);
CREATE INDEX idx_courses_teacher   ON courses(teacher_id);
CREATE INDEX idx_courses_featured  ON courses(is_featured) WHERE is_featured = true;

-- Teachers
CREATE INDEX idx_teachers_slug   ON teachers(slug);
CREATE INDEX idx_teachers_active ON teachers(is_active) WHERE is_active = true;

-- Blog
CREATE INDEX idx_blog_status     ON blog_posts(status);
CREATE INDEX idx_blog_slug       ON blog_posts(slug);
CREATE INDEX idx_blog_published  ON blog_posts(published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_blog_featured   ON blog_posts(is_featured)
  WHERE is_featured = true;

-- Newsletter
CREATE INDEX idx_newsletter_email     ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_confirmed ON newsletter_subscribers(is_confirmed);
```

---

## 5. Repository Pattern — DB Sorğuları

### 5.1 Lead Repository

```typescript
// src/repositories/lead.repository.ts

import { db }       from '../config/db';
import { leads }    from '../models/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import type { NewLead, Lead } from '../models/schema';

export const leadRepository = {

  // Yeni lead yarat
  async create(data: NewLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(data)
      .returning();
    return lead;
  },

  // ID ilə tap
  async findById(id: string): Promise<Lead | undefined> {
    return db.query.leads.findFirst({
      where: eq(leads.id, id),
    });
  },

  // Siyahı + filter (admin panel)
  async findAll(opts: {
    status?:  string;
    source?:  string;
    page?:    number;
    limit?:   number;
  } = {}) {
    const { status, source, page = 1, limit = 20 } = opts;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) conditions.push(eq(leads.status, status as any));
    if (source) conditions.push(eq(leads.source, source as any));

    const [rows, [{ count }]] = await Promise.all([
      db
        .select()
        .from(leads)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(leads)
        .where(conditions.length ? and(...conditions) : undefined),
    ]);

    return {
      data:  rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
    };
  },

  // Status yenilə
  async updateStatus(id: string, status: Lead['status'], notes?: string) {
    const [updated] = await db
      .update(leads)
      .set({
        status,
        notes:     notes ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  },

  // Email göndərildi kimi işarələ
  async markNotificationSent(id: string) {
    await db
      .update(leads)
      .set({ notificationSentAt: new Date() })
      .where(eq(leads.id, id));
  },

  // Statistika (dashboard üçün)
  async getStats() {
    const [stats] = await db
      .select({
        total:     sql<number>`count(*)::int`,
        newCount:  sql<number>`count(*) filter (where status = 'new')::int`,
        contacted: sql<number>`count(*) filter (where status = 'contacted')::int`,
        enrolled:  sql<number>`count(*) filter (where status = 'enrolled')::int`,
        today:     sql<number>`count(*) filter (
          where created_at >= current_date
        )::int`,
      })
      .from(leads);
    return stats;
  },
};
```

### 5.2 Course Repository

```typescript
// src/repositories/course.repository.ts

import { db }     from '../config/db';
import { courses } from '../models/schema';
import { eq, and, asc } from 'drizzle-orm';

export const courseRepository = {

  async findAll(locale: string = 'az') {
    return db.query.courses.findMany({
      where:   eq(courses.status, 'active'),
      with:    { teacher: true },
      orderBy: asc(courses.sortOrder),
    });
  },

  async findBySlug(slug: string) {
    return db.query.courses.findFirst({
      where: and(
        eq(courses.slug, slug),
        eq(courses.status, 'active')
      ),
      with: { teacher: true },
    });
  },

  async findFeatured() {
    return db.query.courses.findMany({
      where: and(
        eq(courses.isFeatured, true),
        eq(courses.status, 'active')
      ),
      with:    { teacher: true },
      orderBy: asc(courses.sortOrder),
    });
  },

  async findAllSlugs() {
    return db
      .select({ slug: courses.slug })
      .from(courses)
      .where(eq(courses.status, 'active'));
  },
};
```

---

## 6. Migration İdarəsi

### 6.1 Migration Axını

```bash
# 1. Schema dəyişikliyi et (courses.ts-də yeni sahə əlavə et)

# 2. Migration faylı yarat
npm run db:generate
# → drizzle/migrations/0002_add_video_url.sql yaradılır

# 3. Migration-ı nəzərdən keçir
cat drizzle/migrations/0002_add_video_url.sql

# 4. Migration icra et
npm run db:migrate
# → DB-yə tətbiq olunur

# 5. Studio ilə yoxla
npm run db:studio
# → http://localhost:4983 — vizual DB interfeysi
```

### 6.2 Migration Nümunəsi

```sql
-- drizzle/migrations/0001_initial_schema.sql
-- Drizzle tərəfindən avtomatik generasiya olunur

CREATE TYPE "lead_status" AS ENUM('new','contacted','enrolled','rejected');
CREATE TYPE "lead_source" AS ENUM('contact_form','enroll_form','newsletter','whatsapp','instagram','referral','other');
CREATE TYPE "course_status" AS ENUM('draft','active','archived');
CREATE TYPE "blog_status" AS ENUM('draft','published','archived');

CREATE TABLE IF NOT EXISTS "teachers" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug"        text NOT NULL UNIQUE,
  "name"        text NOT NULL,
  "title"       jsonb NOT NULL,
  "bio"         jsonb NOT NULL,
  "avatar_url"  text,
  "linkedin_url" text,
  "twitter_url"  text,
  "github_url"   text,
  "sort_order"   integer DEFAULT 0,
  "is_active"    boolean DEFAULT true NOT NULL,
  "created_at"   timestamp with time zone DEFAULT NOW() NOT NULL,
  "updated_at"   timestamp with time zone DEFAULT NOW() NOT NULL
);

-- ... (digər cədvəllər)
```

### 6.3 Seed Məlumatlar

```typescript
// src/scripts/seed.ts

import { db }   from '../config/db';
import { teachers, courses, faqs, admins } from '../models/schema';
import bcrypt   from 'bcryptjs';

async function seed() {
  console.log('🌱 Seed başlayır...');

  // 1. Admin yarat
  const [admin] = await db
    .insert(admins)
    .values({
      email:        'admin@cahanacademy.az',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      name:         'Super Admin',
    })
    .onConflictDoNothing()
    .returning();
  console.log('✅ Admin yaradıldı:', admin?.email);

  // 2. Müəllimlər
  const [teacher1] = await db
    .insert(teachers)
    .values({
      slug:   'leyla-memmedova',
      name:   'Leyla Məmmədova',
      title:  { az: 'Python Mütəxəssisi', en: 'Python Expert', ru: 'Специалист Python' },
      bio: {
        az: '8 il proqramlaşdırma təcrübəsi. IELTS 7.5. Google Certified Developer.',
        en: '8 years of programming experience. IELTS 7.5. Google Certified Developer.',
        ru: '8 лет опыта программирования. IELTS 7.5. Google Certified Developer.',
      },
      sortOrder: 1,
    })
    .onConflictDoNothing()
    .returning();

  // 3. Kurslar
  await db
    .insert(courses)
    .values([
      {
        slug:   'python-baslangic',
        title:  {
          az: 'Python — Başlanğıcdan Peşəkara',
          en: 'Python — From Beginner to Professional',
          ru: 'Python — от новичка до профессионала',
        },
        description: {
          az: 'Sıfırdan Python proqramlaşdırma dilini öyrənin. Praktik layihələr, real dünya tapşırıqları.',
          en: 'Learn Python programming from scratch. Practical projects, real-world tasks.',
          ru: 'Изучите Python с нуля. Практические проекты, реальные задачи.',
        },
        shortDesc: {
          az: 'Sıfırdan Python öyrənin',
          en: 'Learn Python from scratch',
          ru: 'Изучите Python с нуля',
        },
        duration:    '3 ay',
        schedule:    'H-Ç-C, 18:00-20:00',
        level:       'Başlanğıc',
        price:       '350.00',
        teacherId:   teacher1?.id,
        isFeatured:  true,
        sortOrder:   1,
      },
    ])
    .onConflictDoNothing();

  // 4. FAQ-lar
  await db
    .insert(faqs)
    .values([
      {
        question: {
          az: 'Kurslara qeydiyyat necə keçir?',
          en: 'How does course enrollment work?',
          ru: 'Как проходит запись на курсы?',
        },
        answer: {
          az: 'Saytımızdakı müraciət formasını doldurun, biz 24 saat ərzində sizinlə əlaqə saxlayacağıq.',
          en: 'Fill out the contact form on our website and we will contact you within 24 hours.',
          ru: 'Заполните форму на нашем сайте, мы свяжемся с вами в течение 24 часов.',
        },
        category:  'Qeydiyyat',
        sortOrder: 1,
      },
    ])
    .onConflictDoNothing();

  console.log('✅ Seed tamamlandı!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed xətası:', err);
  process.exit(1);
});
```

---

## 7. Database Schema Diaqramı

```
┌─────────────────┐       ┌─────────────────────┐
│    teachers     │       │      courses         │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │◄──────│ teacher_id (FK)      │
│ slug (UNIQUE)   │       │ id (PK)              │
│ name            │       │ slug (UNIQUE)        │
│ title (JSONB)   │       │ title (JSONB)        │
│ bio (JSONB)     │       │ description (JSONB)  │
│ avatar_url      │       │ price                │
│ sort_order      │       │ status               │
│ is_active       │       │ is_featured          │
│ created_at      │       │ curriculum (JSONB)   │
└─────────────────┘       │ created_at           │
         ▲                └──────────┬──────────┘
         │                           │
         │                           ▼
┌────────┴────────┐       ┌─────────────────────┐
│   blog_posts    │       │       leads          │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)              │
│ author_id (FK)──┘       │ course_id (FK)───────┘
│ slug (UNIQUE)   │       │ name                 │
│ title (JSONB)   │       │ email                │
│ content (JSONB) │       │ phone                │
│ status          │       │ message              │
│ published_at    │       │ status               │
│ is_featured     │       │ source               │
│ created_at      │       │ utm_source           │
└─────────────────┘       │ created_at           │
                          └─────────────────────┘

┌─────────────────┐       ┌─────────────────────┐
│      faqs       │       │ newsletter_subs      │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │       │ id (PK)              │
│ question (JSONB)│       │ email (UNIQUE)       │
│ answer (JSONB)  │       │ is_confirmed         │
│ category        │       │ confirm_token        │
│ sort_order      │       │ unsubscribed_at      │
└─────────────────┘       └─────────────────────┘

┌─────────────────┐
│     admins      │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ name            │
│ is_active       │
└─────────────────┘
```

---

## 8. Neon Pulsuz Tier Məhdudiyyətləri

| Parametr | Pulsuz Limit | Bizim İstifadəmiz |
|---|---|---|
| Storage | 512 MB | ~50 MB (başlanğıcda) |
| Compute | 191.9 saat/ay | ~100 saat/ay |
| Branches | 10 | 3 (main/dev/preview) |
| Connections (pooled) | 100 | ~20 |
| Region | 1 | eu-central-1 |

> **Qeyd:** Pulsuz tier landing page üçün tamamilə yetərlidir. Trafik artdıqda Neon Launch planı ($19/ay) sərhədsiz compute verir.

---

## 9. Əlaqə Havuzu (Connection Pooling)

```typescript
// Production-da pool bağlantısı istifadə et
// apps/api/src/config/db.ts

import { neon }   from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env }    from './env';

// Serverless mühit üçün HTTP bağlantısı (pool daxili)
const sql = neon(
  env.NODE_ENV === 'production'
    ? env.DATABASE_URL_POOL   // PgBouncer pooler endpoint
    : env.DATABASE_URL        // Development — birbaşa bağlantı
);

export const db = drizzle(sql, { schema });
```

---

## 10. DB Yoxlama Siyahısı

```
QURULUM
  [ ]  Neon hesabı yaradıldı
  [ ]  academy_db databazası yaradıldı
  [ ]  Region: eu-central-1 seçildi
  [ ]  DATABASE_URL .env-ə əlavə edildi
  [ ]  SSL bağlantısı yoxlanıldı (?sslmode=require)
  [ ]  Dev branch yaradıldı

SCHEMA
  [ ]  drizzle-kit generate icra edildi
  [ ]  Migration faylları nəzərdən keçirildi
  [ ]  drizzle-kit migrate icra edildi
  [ ]  Bütün cədvəllər yaradıldı (Neon Dashboard ilə yoxla)
  [ ]  İndekslər tətbiq edildi
  [ ]  Seed məlumatlar dolduruldu

PRODUCTİON
  [ ]  Pooler endpoint konfiqurasiya edildi
  [ ]  Render/production-da DATABASE_URL_POOL əlavə edildi
  [ ]  Neon IP Access yoxlanıldı
  [ ]  Backup strategiyası quruldu (Neon avtomatik edir)
```

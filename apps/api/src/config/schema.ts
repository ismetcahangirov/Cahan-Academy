import { pgTable, text, varchar, timestamp, pgEnum, uuid, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────
export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'enrolled', 'cancelled'
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'unsubscribed'
]);

export const courseLevelEnum = pgEnum('course_level', [
  'beginner', 'intermediate', 'advanced', 'all'
]);

// ─── Leads (kurs qeydiyyatları) ───────────────────────────────────────────────
export const leads = pgTable('leads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  course: varchar('course', { length: 255 }),
  source: varchar('source', { length: 100 }).default('website'),
  status: leadStatusEnum('status').default('new').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Contact Messages ────────────────────────────────────────────────────────
export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  message: text('message').notNull(),
  isRead: text('is_read').default('false').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  isSuperAdmin: boolean('is_super_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Newsletter Subscribers ───────────────────────────────────────────────────
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nameAz: varchar('name_az', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameRu: varchar('name_ru', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Teachers ────────────────────────────────────────────────────────────────
export const teachers = pgTable('teachers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  image: varchar('image', { length: 1000 }),
  bioAz: text('bio_az'),
  bioEn: text('bio_en'),
  bioRu: text('bio_ru'),
  positionAz: varchar('position_az', { length: 255 }),
  positionEn: varchar('position_en', { length: 255 }),
  positionRu: varchar('position_ru', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Courses ─────────────────────────────────────────────────────────────────
export const courses = pgTable('courses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titleAz: varchar('title_az', { length: 255 }).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleRu: varchar('title_ru', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  descriptionAz: text('description_az').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionRu: text('description_ru').notNull(),
  categoryId: text('category_id').references(() => categories.id),
  teacherId: text('teacher_id').references(() => teachers.id),
  price: varchar('price', { length: 100 }),
  duration: varchar('duration', { length: 100 }),
  level: courseLevelEnum('level').default('beginner').notNull(),
  image: varchar('image', { length: 1000 }),
  isPopular: text('is_popular').default('false').notNull(),
  rating: varchar('rating', { length: 10 }).default('5.0'),
  studentsCount: varchar('students_count', { length: 50 }).default('0'),
  syllabusAz: text('syllabus_az'), // JSON string
  syllabusEn: text('syllabus_en'),
  syllabusRu: text('syllabus_ru'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  titleAz: varchar('title_az', { length: 500 }).notNull(),
  titleEn: varchar('title_en', { length: 500 }).notNull(),
  titleRu: varchar('title_ru', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 500 }).notNull().unique(),
  contentAz: text('content_az').notNull(),
  contentEn: text('content_en').notNull(),
  contentRu: text('content_ru').notNull(),
  excerptAz: text('excerpt_az'),
  excerptEn: text('excerpt_en'),
  excerptRu: text('excerpt_ru'),
  image: varchar('image', { length: 1000 }),
  authorId: text('author_id').references(() => adminUsers.id),
  readingTime: varchar('reading_time', { length: 50 }),
  isPublished: text('is_published').default('true').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── FAQs ────────────────────────────────────────────────────────────────────
export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  question: jsonb('question').$type<Record<'az' | 'en' | 'ru', string>>().notNull(),
  answer: jsonb('answer').$type<Record<'az' | 'en' | 'ru', string>>().notNull(),
  order: integer('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Team Members ─────────────────────────────────────────────────────────────
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  positionAz: varchar('position_az', { length: 255 }).notNull(),
  positionEn: varchar('position_en', { length: 255 }).notNull(),
  positionRu: varchar('position_ru', { length: 255 }).notNull(),
  image: varchar('image', { length: 1000 }),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSub = typeof newsletterSubscribers.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

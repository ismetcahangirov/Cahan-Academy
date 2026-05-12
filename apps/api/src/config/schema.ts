import { pgTable, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────
export const leadStatusEnum = pgEnum('lead_status', [
  'new', 'contacted', 'enrolled', 'cancelled'
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active', 'unsubscribed'
]);

// ─── Leads (kurs qeydiyyatları) ───────────────────────────────────────────────
export const leads = pgTable('leads', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      varchar('name',  { length: 255 }).notNull(),
  email:     varchar('email', { length: 255 }).notNull(),
  phone:     varchar('phone', { length: 50 }),
  course:    varchar('course', { length: 255 }),
  source:    varchar('source', { length: 100 }).default('website'),
  status:    leadStatusEnum('status').default('new').notNull(),
  notes:     text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Contact Messages ────────────────────────────────────────────────────────
export const contactMessages = pgTable('contact_messages', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:      varchar('name',    { length: 255 }).notNull(),
  email:     varchar('email',   { length: 255 }).notNull(),
  phone:     varchar('phone',   { length: 50 }),
  subject:   varchar('subject', { length: 500 }).notNull(),
  message:   text('message').notNull(),
  isRead:    text('is_read').default('false').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Admin Users ──────────────────────────────────────────────────────────────
export const adminUsers = pgTable('admin_users', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:        varchar('email',        { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name:         varchar('name',          { length: 255 }),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
});

// ─── Newsletter Subscribers ───────────────────────────────────────────────────
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email:     varchar('email', { length: 255 }).notNull().unique(),
  status:    subscriptionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type Lead                 = typeof leads.$inferSelect;
export type NewLead              = typeof leads.$inferInsert;
export type ContactMessage       = typeof contactMessages.$inferSelect;
export type NewContactMessage    = typeof contactMessages.$inferInsert;
export type AdminUser            = typeof adminUsers.$inferSelect;
export type NewAdminUser         = typeof adminUsers.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSub     = typeof newsletterSubscribers.$inferInsert;

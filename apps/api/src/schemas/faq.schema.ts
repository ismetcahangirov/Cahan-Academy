import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const faqs = pgTable('faqs', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Sual və cavablar JSONB formatında: { az: "...", en: "...", ru: "..." }
  question: jsonb('question').$type<Record<'az' | 'en' | 'ru', string>>().notNull(),
  answer: jsonb('answer').$type<Record<'az' | 'en' | 'ru', string>>().notNull(),
  order: integer('order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type NewFAQ = typeof faqs.$inferInsert;

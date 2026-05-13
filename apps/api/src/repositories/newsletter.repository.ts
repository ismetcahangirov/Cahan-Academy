import { db } from '../config/db.js';
import { newsletterSubscribers, type NewNewsletterSub } from '../config/schema.js';
import { eq } from 'drizzle-orm';

export const subscribe = async (data: NewNewsletterSub) => {
  // Check if already exists
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, data.email))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].status === 'unsubscribed') {
      const result = await db
        .update(newsletterSubscribers)
        .set({ status: 'active' })
        .where(eq(newsletterSubscribers.id, existing[0].id))
        .returning();
      return result[0];
    }
    return existing[0];
  }

  const result = await db.insert(newsletterSubscribers).values(data).returning();
  return result[0];
};

export const getAllSubscribers = async () => {
  return await db.select().from(newsletterSubscribers).orderBy(newsletterSubscribers.createdAt);
};

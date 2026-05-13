import { db } from '../config/db.js';
import { faqs, FAQ, NewFAQ } from '../schemas/faq.schema.js';
import { eq, asc, desc } from 'drizzle-orm';

export class FAQRepository {
  async getAll(onlyActive = true) {
    const query = db.select().from(faqs);
    if (onlyActive) {
      query.where(eq(faqs.isActive, true));
    }
    return await query.orderBy(asc(faqs.order));
  }

  async getById(id: string) {
    const results = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
    return results[0] || null;
  }

  async create(data: NewFAQ) {
    const results = await db.insert(faqs).values(data).returning();
    return results[0];
  }

  async update(id: string, data: Partial<NewFAQ>) {
    const results = await db.update(faqs).set({ ...data, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return results[0];
  }

  async delete(id: string) {
    const results = await db.delete(faqs).where(eq(faqs.id, id)).returning();
    return results[0];
  }

  async updateStatus(id: string, isActive: boolean) {
    const results = await db.update(faqs).set({ isActive, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    return results[0];
  }
}

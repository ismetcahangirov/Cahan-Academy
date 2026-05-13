import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { leads, type NewLead } from '../config/schema.js';

export const createLead = async (data: NewLead) => {
  const result = await db.insert(leads).values(data).returning();
  return result[0];
};

export const getAllLeads = async () => {
  return await db.select().from(leads).orderBy(leads.createdAt);
};

export const updateLeadStatus = async (id: string, status: any) => {
  const result = await db.update(leads)
    .set({ status, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return result[0];
};

export const getLeadById = async (id: string) => {
  const result = await db.select().from(leads).where(eq(leads.id, id));
  return result[0];
};

import { db } from '../config/db.js';
import { leads, type NewLead } from '../config/schema.js';

export const createLead = async (data: NewLead) => {
  const result = await db.insert(leads).values(data).returning();
  return result[0];
};

export const getAllLeads = async () => {
  return await db.select().from(leads);
};

import { db } from '../config/db.js';
import { contactMessages, type NewContactMessage } from '../config/schema.js';

export const createContactMessage = async (data: NewContactMessage) => {
  const result = await db.insert(contactMessages).values(data).returning();
  return result[0];
};

export const getAllContactMessages = async () => {
  return await db.select().from(contactMessages);
};

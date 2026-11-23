import { db } from '../config/db.js';
import { categories, courses, NewCategory } from '../config/schema.js';
import { eq } from 'drizzle-orm';

export const getAllCategories = async () => {
  return await db.select().from(categories);
};

export const getCategoryById = async (id: string) => {
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
};

export const getCategoryBySlug = async (slug: string) => {
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
};

export const createCategory = async (data: NewCategory) => {
  const [newCategory] = await db.insert(categories).values(data).returning();
  return newCategory;
};

export const updateCategory = async (id: string, data: Partial<NewCategory>) => {
  const [updatedCategory] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return updatedCategory;
};

export const categoryHasCourses = async (id: string) => {
  const rows = await db.select({ id: courses.id }).from(courses).where(eq(courses.categoryId, id)).limit(1);
  return rows.length > 0;
};

export const deleteCategory = async (id: string) => {
  const [deletedCategory] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();
  return deletedCategory;
};

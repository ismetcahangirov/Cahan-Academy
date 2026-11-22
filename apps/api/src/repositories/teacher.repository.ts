import { db } from '../config/db.js';
import { teachers, courses, categories, NewTeacher } from '../config/schema.js';
import { eq } from 'drizzle-orm';

export const getAllTeachers = async () => {
  return await db.select().from(teachers);
};

export const getTeacherById = async (id: string) => {
  const result = await db.select().from(teachers).where(eq(teachers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
};

export const getTeacherBySlug = async (slug: string) => {
  const teacher = await db
    .select()
    .from(teachers)
    .where(eq(teachers.slug, slug))
    .limit(1);

  if (teacher.length === 0) return null;

  const teacherCourses = await db
    .select({
      course: courses,
      category: categories,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.teacherId, teacher[0].id));

  return {
    ...teacher[0],
    courses: teacherCourses,
  };
};

export const createTeacher = async (data: NewTeacher) => {
  const [newTeacher] = await db.insert(teachers).values(data).returning();
  return newTeacher;
};

export const updateTeacher = async (id: string, data: Partial<NewTeacher>) => {
  const [updatedTeacher] = await db
    .update(teachers)
    .set(data)
    .where(eq(teachers.id, id))
    .returning();
  return updatedTeacher;
};

export const deleteTeacher = async (id: string) => {
  const [deletedTeacher] = await db
    .delete(teachers)
    .where(eq(teachers.id, id))
    .returning();
  return deletedTeacher;
};

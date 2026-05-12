import { db } from '../config/db.js';
import { teachers, courses, categories } from '../config/schema.js';
import { eq } from 'drizzle-orm';

export const getAllTeachers = async () => {
  return await db.select().from(teachers);
};

export const getTeacherBySlug = async (slug: string) => {
  const teacher = await db
    .select()
    .from(teachers)
    .where(eq(teachers.slug, slug))
    .limit(1);

  if (teacher.length === 0) return null;

  // Fetch courses taught by this teacher with categories
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

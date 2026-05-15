import { db } from '../config/db.js';
import { courses, categories, teachers, NewCourse } from '../config/schema.js';
import { eq, desc } from 'drizzle-orm';

export interface CourseRow {
  id: string;
  title_az: string;
  title_en: string;
  title_ru: string;
  slug: string;
  description_az: string;
  description_en: string;
  description_ru: string;
  category_id: string | null;
  teacher_id: string | null;
  price: string | null;
  duration: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  image: string | null;
  is_popular: string;
  rating: string | null;
  students_count: string | null;
  created_at: Date;
  // Joined
  category_az?: string;
  category_en?: string;
  category_ru?: string;
  category_slug?: string;
  teacher_name?: string;
  teacher_image?: string;
  teacher_position_az?: string;
  teacher_position_en?: string;
  teacher_position_ru?: string;
  teacher_bio_az?: string;
  teacher_bio_en?: string;
  teacher_bio_ru?: string;
  syllabus_az?: string | null;
  syllabus_en?: string | null;
  syllabus_ru?: string | null;
}

function mapToCourseRow(record: any): CourseRow {
  const c = record.course;
  const cat = record.category;
  const t = record.teacher;

  return {
    id: c.id,
    title_az: c.titleAz,
    title_en: c.titleEn,
    title_ru: c.titleRu,
    slug: c.slug,
    description_az: c.descriptionAz,
    description_en: c.descriptionEn,
    description_ru: c.descriptionRu,
    category_id: c.categoryId,
    teacher_id: c.teacherId,
    price: c.price,
    duration: c.duration,
    level: c.level as any,
    image: c.image,
    is_popular: c.isPopular,
    rating: c.rating,
    students_count: c.studentsCount,
    syllabus_az: c.syllabusAz,
    syllabus_en: c.syllabusEn,
    syllabus_ru: c.syllabusRu,
    created_at: c.createdAt,
    
    category_az: cat?.nameAz,
    category_en: cat?.nameEn,
    category_ru: cat?.nameRu,
    category_slug: cat?.slug,
    
    teacher_name: t?.name,
    teacher_image: t?.image,
    teacher_position_az: t?.positionAz,
    teacher_position_en: t?.positionEn,
    teacher_position_ru: t?.positionRu,
    teacher_bio_az: t?.bioAz,
    teacher_bio_en: t?.bioEn,
    teacher_bio_ru: t?.bioRu,
  };
}

export async function getAllCourses(locale = 'az'): Promise<CourseRow[]> {
  const results = await db
    .select({
      course: courses,
      category: categories,
      teacher: teachers,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .orderBy(desc(courses.isPopular), desc(courses.createdAt));

  return results.map(mapToCourseRow);
}

export async function getCourseBySlug(slug: string): Promise<CourseRow | null> {
  const results = await db
    .select({
      course: courses,
      category: categories,
      teacher: teachers,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .where(eq(courses.slug, slug))
    .limit(1);

  if (results.length === 0) return null;
  return mapToCourseRow(results[0]);
}

export async function getCoursesByCategory(categorySlug: string): Promise<CourseRow[]> {
  const results = await db
    .select({
      course: courses,
      category: categories,
      teacher: teachers,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(teachers, eq(courses.teacherId, teachers.id))
    .where(eq(categories.slug, categorySlug))
    .orderBy(desc(courses.createdAt));

  return results.map(mapToCourseRow);
}

export async function getAllCategories() {
  return await db.select().from(categories).orderBy(categories.nameAz);
}

// Admin CRUD operations
export async function createCourse(data: NewCourse) {
  const [newCourse] = await db.insert(courses).values(data).returning();
  return newCourse;
}

export async function updateCourse(id: string, data: Partial<NewCourse>) {
  const [updatedCourse] = await db
    .update(courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courses.id, id))
    .returning();
  return updatedCourse;
}

export async function deleteCourse(id: string) {
  const [deletedCourse] = await db
    .delete(courses)
    .where(eq(courses.id, id))
    .returning();
  return deletedCourse;
}

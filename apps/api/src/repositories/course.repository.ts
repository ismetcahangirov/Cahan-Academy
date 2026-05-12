import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

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
}

export async function getAllCourses(locale = 'az'): Promise<CourseRow[]> {
  const rows = await sql`
    SELECT
      c.*,
      cat.name_az  AS category_az,
      cat.name_en  AS category_en,
      cat.name_ru  AS category_ru,
      cat.slug     AS category_slug,
      t.name       AS teacher_name,
      t.image      AS teacher_image,
      t.position_az AS teacher_position_az,
      t.position_en AS teacher_position_en,
      t.position_ru AS teacher_position_ru
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN teachers t ON c.teacher_id = t.id
    ORDER BY c.is_popular DESC, c.created_at DESC
  `;
  return rows as CourseRow[];
}

export async function getCourseBySlug(slug: string): Promise<CourseRow | null> {
  const rows = await sql`
    SELECT
      c.*,
      cat.name_az  AS category_az,
      cat.name_en  AS category_en,
      cat.name_ru  AS category_ru,
      cat.slug     AS category_slug,
      t.name       AS teacher_name,
      t.image      AS teacher_image,
      t.bio_az     AS teacher_bio_az,
      t.bio_en     AS teacher_bio_en,
      t.bio_ru     AS teacher_bio_ru,
      t.position_az AS teacher_position_az,
      t.position_en AS teacher_position_en,
      t.position_ru AS teacher_position_ru
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN teachers t ON c.teacher_id = t.id
    WHERE c.slug = ${slug}
    LIMIT 1
  `;
  return (rows[0] as CourseRow) ?? null;
}

export async function getCoursesByCategory(categorySlug: string): Promise<CourseRow[]> {
  const rows = await sql`
    SELECT
      c.*,
      cat.name_az  AS category_az,
      cat.name_en  AS category_en,
      cat.name_ru  AS category_ru,
      cat.slug     AS category_slug,
      t.name       AS teacher_name,
      t.image      AS teacher_image
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN teachers t ON c.teacher_id = t.id
    WHERE cat.slug = ${categorySlug}
    ORDER BY c.created_at DESC
  `;
  return rows as CourseRow[];
}

export async function getAllCategories() {
  return await sql`SELECT * FROM categories ORDER BY name_az`;
}

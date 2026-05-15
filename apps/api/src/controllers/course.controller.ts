import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse }  from '../utils/apiResponse.js';
import {
  getAllCourses,
  getCourseBySlug,
  getCoursesByCategory,
  getAllCategories,
} from '../repositories/course.repository.js';

// GET /api/courses?locale=az&category=web-development
export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const locale   = (req.query.locale   as string) ?? 'az';
  const category = (req.query.category as string) ?? '';

  const courses = category
    ? await getCoursesByCategory(category)
    : await getAllCourses(locale);

  const titleKey       = `title_${locale}` as const;
  const descriptionKey = `description_${locale}` as const;
  const categoryKey    = `category_${locale}` as const;
  const positionKey    = `teacher_position_${locale}` as const;

  const shaped = courses.map((c: any) => ({
    id:           c.id,
    slug:         c.slug,
    title:        c[titleKey]       ?? c.title_az,
    description:  c[descriptionKey] ?? c.description_az,
    price:        c.price,
    duration:     c.duration,
    level:        c.level,
    image:        c.image,
    isPopular:    c.is_popular === 'true',
    rating:       c.rating,
    studentsCount: c.students_count,
    category: {
      name:    c[categoryKey] ?? c.category_az,
      slug:    c.category_slug,
    },
    teacher: {
      name:     c.teacher_name,
      image:    c.teacher_image,
      position: c[positionKey] ?? c.teacher_position_az,
    },
  }));

  return apiResponse.success(res, { data: shaped });
});

// GET /api/courses/categories
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await getAllCategories();
  return apiResponse.success(res, { data: categories });
});

export const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const slug   = req.params.slug as string;
  const locale = (req.query.locale as string) ?? 'az';

  const course = await getCourseBySlug(slug);
  if (!course) {
    return apiResponse.error(res, { message: 'Kurs tapılmadı', status: 404 });
  }

  const titleKey       = `title_${locale}` as const;
  const descriptionKey = `description_${locale}` as const;
  const categoryKey    = `category_${locale}` as const;
  const positionKey    = `teacher_position_${locale}` as const;
  const bioKey         = `teacher_bio_${locale}` as const;

  const c: any = course;
  return apiResponse.success(res, {
    data: {
      id:           c.id,
      slug:         c.slug,
      title:        c[titleKey]       ?? c.title_az,
      description:  c[descriptionKey] ?? c.description_az,
      price:        c.price,
      duration:     c.duration,
      level:        c.level,
      image:        c.image,
      isPopular:    c.is_popular === 'true' || c.is_popular === true,
      rating:       c.rating,
      studentsCount: c.students_count,
      syllabus:     c[`syllabus_${locale}`] ?? c.syllabus_az,
      category: {
        name: c[categoryKey] ?? c.category_az,
        slug: c.category_slug,
      },
      teacher: {
        name:     c.teacher_name,
        image:    c.teacher_image,
        bio:      c[bioKey] ?? c.teacher_bio_az,
        position: c[positionKey] ?? c.teacher_position_az,
      },
    },
  });
});

// Admin methods
export const listCoursesAdmin = asyncHandler(async (req: Request, res: Response) => {
  // Returns raw unshaped data for admin form
  const courses = await getAllCourses('az'); // We just get all
  return apiResponse.success(res, { data: courses });
});

import { createCourse, updateCourse, deleteCourse } from '../repositories/course.repository.js';

export const createCourseAdmin = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const newCourse = await createCourse(data);
  return apiResponse.success(res, { data: newCourse, message: 'Kurs uğurla yaradıldı' }, 201);
});

export const updateCourseAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await updateCourse(id, data);
  if (!updated) {
    return apiResponse.error(res, { message: 'Kurs tapılmadı', status: 404 });
  }
  return apiResponse.success(res, { data: updated, message: 'Kurs uğurla yeniləndi' });
});

export const deleteCourseAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await deleteCourse(id);
  if (!deleted) {
    return apiResponse.error(res, { message: 'Kurs tapılmadı', status: 404 });
  }
  return apiResponse.success(res, { data: deleted, message: 'Kurs uğurla silindi' });
});

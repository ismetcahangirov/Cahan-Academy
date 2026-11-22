import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  getAllTeachers,
  getTeacherById,
  getTeacherBySlug,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../repositories/teacher.repository.js';
import { TeacherSchema } from '../schemas/form.schema.js';
import { param } from '../utils/sanitize.js';

/**
 * Drizzle returns camelCase columns (bioAz, titleEn, nameRu...). The old code looked up
 * snake_case keys (`bio_en`), which never exist, so en/ru always fell back to Azerbaijani.
 */
const localeSuffix = (value: unknown): 'Az' | 'En' | 'Ru' => {
  const l = String(value ?? 'az').toLowerCase();
  return l === 'en' ? 'En' : l === 'ru' ? 'Ru' : 'Az';
};

// GET /api/teachers?locale=az
export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const suffix = localeSuffix(req.query.locale);
  const teachers = await getAllTeachers();

  const shaped = teachers.map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    image: t.image,
    bio: t[`bio${suffix}`] || t.bioAz,
    position: t[`position${suffix}`] || t.positionAz,
  }));

  return apiResponse.success(res, { data: shaped });
});

// GET /api/teachers/:slug?locale=az
export const getTeacher = asyncHandler(async (req: Request, res: Response) => {
  const slug = param(req, 'slug');
  const suffix = localeSuffix(req.query.locale);

  const teacher = await getTeacherBySlug(slug);
  if (!teacher) {
    return apiResponse.error(res, { message: 'Müəllim tapılmadı', status: 404 });
  }

  const t: any = teacher;
  return apiResponse.success(res, {
    data: {
      id: t.id,
      name: t.name,
      slug: t.slug,
      image: t.image,
      bio: t[`bio${suffix}`] || t.bioAz,
      position: t[`position${suffix}`] || t.positionAz,
      courses: t.courses.map((item: any) => {
        const c = item.course;
        const cat = item.category;

        return {
          id: c.id,
          slug: c.slug,
          title: c[`title${suffix}`] || c.titleAz,
          description: c[`description${suffix}`] || c.descriptionAz,
          image: c.image,
          price: c.price,
          duration: c.duration,
          level: c.level,
          rating: c.rating,
          isPopular: c.isPopular === 'true' || c.isPopular === true,
          category: cat ? {
            id: cat.id,
            name: cat[`name${suffix}`] || cat.nameAz,
            slug: cat.slug,
          } : {
            id: 'default',
            name: 'General',
            slug: 'general'
          },
        };
      }),
    },
  });
});

// GET /api/teachers/admin/list — raw data for admin
export const listTeachersAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const teachers = await getAllTeachers();
  return apiResponse.success(res, { data: teachers });
});

// POST /api/teachers/admin
export const createTeacherAdmin = asyncHandler(async (req: Request, res: Response) => {
  const validated = TeacherSchema.parse(req.body);
  const newTeacher = await createTeacher(validated);
  return apiResponse.success(res, { data: newTeacher, message: 'Müəllim uğurla yaradıldı', status: 201 });
});

// PUT /api/teachers/admin/:id
export const updateTeacherAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req, 'id');
  const validated = TeacherSchema.parse(req.body);
  const existing = await getTeacherById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Müəllim tapılmadı', status: 404 });
  }
  const updated = await updateTeacher(id, validated);
  return apiResponse.success(res, { data: updated, message: 'Müəllim uğurla yeniləndi' });
});

// DELETE /api/teachers/admin/:id
export const deleteTeacherAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = param(req, 'id');
  const existing = await getTeacherById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Müəllim tapılmadı', status: 404 });
  }
  const deleted = await deleteTeacher(id);
  return apiResponse.success(res, { data: deleted, message: 'Müəllim uğurla silindi' });
});

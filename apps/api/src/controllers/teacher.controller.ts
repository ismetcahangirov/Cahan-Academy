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

// GET /api/teachers?locale=az
export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const locale = (req.query.locale as string) ?? 'az';
  const teachers = await getAllTeachers();

  const bioKey = `bio_${locale}` as const;
  const positionKey = `position_${locale}` as const;

  const shaped = teachers.map((t: any) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    image: t.image,
    bio: t[bioKey] ?? t.bioAz,
    position: t[positionKey] ?? t.positionAz,
  }));

  return apiResponse.success(res, { data: shaped });
});

// GET /api/teachers/:slug?locale=az
export const getTeacher = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const locale = (req.query.locale as string) ?? 'az';

  const teacher = await getTeacherBySlug(slug);
  if (!teacher) {
    return apiResponse.error(res, { message: 'Müəllim tapılmadı', status: 404 });
  }

  const bioKey = `bio_${locale}` as const;
  const positionKey = `position_${locale}` as const;

  const titleKey = `title_${locale}` as const;
  const descriptionKey = `description_${locale}` as const;

  const t: any = teacher;
  return apiResponse.success(res, {
    data: {
      id: t.id,
      name: t.name,
      slug: t.slug,
      image: t.image,
      bio: t[bioKey] ?? t.bioAz,
      position: t[positionKey] ?? t.positionAz,
      courses: t.courses.map((item: any) => {
        const c = item.course;
        const cat = item.category;
        const catNameKey = `name${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as any;

        return {
          id: c.id,
          slug: c.slug,
          title: c[titleKey] ?? c.titleAz,
          description: c[descriptionKey] ?? c.descriptionAz,
          image: c.image,
          price: c.price,
          duration: c.duration,
          level: c.level,
          rating: c.rating,
          isPopular: c.isPopular,
          category: cat ? {
            id: cat.id,
            name: cat[catNameKey] ?? cat.nameAz,
            slug: cat.slug,
          } : {
            id: 'default',
            name: 'Genel',
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
  const { id } = req.params;
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
  const { id } = req.params;
  const existing = await getTeacherById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Müəllim tapılmadı', status: 404 });
  }
  const deleted = await deleteTeacher(id);
  return apiResponse.success(res, { data: deleted, message: 'Müəllim uğurla silindi' });
});

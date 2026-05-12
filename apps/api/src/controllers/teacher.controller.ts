import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { getAllTeachers, getTeacherBySlug } from '../repositories/teacher.repository.js';

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

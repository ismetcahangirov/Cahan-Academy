import { Request, Response } from 'express';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../config/db.js';
import { testimonials } from '../config/schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { param } from '../utils/sanitize.js';

export const TestimonialSchema = z.object({
  name: z.string().trim().min(2, 'Ad ən azı 2 simvol olmalıdır').max(255),
  role: z.string().trim().max(255).default(''),
  text: z.string().trim().min(10, 'Rəy ən azı 10 simvol olmalıdır').max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const isMissingTable = (err: unknown) =>
  (err as { code?: string })?.code === '42P01' || (err as { cause?: { code?: string } })?.cause?.code === '42P01';

// GET /api/testimonials (public: visible ones, in order)
export const listTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const data = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isActive, true))
      .orderBy(asc(testimonials.order), asc(testimonials.createdAt));
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    return apiResponse.success(res, { data });
  } catch (err) {
    if (isMissingTable(err)) return apiResponse.success(res, { data: [] });
    throw err;
  }
});

// GET /api/testimonials/admin/all
export const listAllTestimonials = asyncHandler(async (_req: Request, res: Response) => {
  const data = await db.select().from(testimonials).orderBy(asc(testimonials.order), asc(testimonials.createdAt));
  return apiResponse.success(res, { data });
});

// POST /api/testimonials/admin
export const createTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const values = TestimonialSchema.parse(req.body);
  const [row] = await db.insert(testimonials).values(values).returning();
  return apiResponse.success(res, { data: row, message: 'Rəy əlavə olundu', status: 201 });
});

// PUT /api/testimonials/admin/:id
export const updateTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const values = TestimonialSchema.parse(req.body);
  const [row] = await db
    .update(testimonials)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(testimonials.id, param(req, 'id')))
    .returning();
  if (!row) return apiResponse.error(res, { message: 'Rəy tapılmadı', status: 404 });
  return apiResponse.success(res, { data: row, message: 'Rəy yeniləndi' });
});

// PUT /api/testimonials/admin/:id/status
export const setTestimonialStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
  const [row] = await db
    .update(testimonials)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(testimonials.id, param(req, 'id')))
    .returning();
  if (!row) return apiResponse.error(res, { message: 'Rəy tapılmadı', status: 404 });
  return apiResponse.success(res, { data: row });
});

// DELETE /api/testimonials/admin/:id
export const deleteTestimonial = asyncHandler(async (req: Request, res: Response) => {
  const [row] = await db.delete(testimonials).where(eq(testimonials.id, param(req, 'id'))).returning();
  if (!row) return apiResponse.error(res, { message: 'Rəy tapılmadı', status: 404 });
  return apiResponse.success(res, { data: row, message: 'Rəy silindi' });
});

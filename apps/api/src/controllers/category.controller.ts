import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../repositories/category.repository.js';
import { CategorySchema } from '../schemas/form.schema.js';

// GET /api/categories
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const all = await getAllCategories();
  return apiResponse.success(res, { data: all });
});

// POST /api/categories/admin
export const createCategoryAdmin = asyncHandler(async (req: Request, res: Response) => {
  const validated = CategorySchema.parse(req.body);
  const newCategory = await createCategory(validated);
  return apiResponse.success(res, { data: newCategory, message: 'Kateqoriya uğurla yaradıldı', status: 201 });
});

// PUT /api/categories/admin/:id
export const updateCategoryAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validated = CategorySchema.parse(req.body);
  const existing = await getCategoryById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Kateqoriya tapılmadı', status: 404 });
  }
  const updated = await updateCategory(id, validated);
  return apiResponse.success(res, { data: updated, message: 'Kateqoriya uğurla yeniləndi' });
});

// DELETE /api/categories/admin/:id
export const deleteCategoryAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await getCategoryById(id);
  if (!existing) {
    return apiResponse.error(res, { message: 'Kateqoriya tapılmadı', status: 404 });
  }
  const deleted = await deleteCategory(id);
  return apiResponse.success(res, { data: deleted, message: 'Kateqoriya uğurla silindi' });
});

import { Router } from 'express';
import {
  listCategories,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
} from '../controllers/category.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', listCategories);

// Admin
router.post('/admin', authMiddleware, createCategoryAdmin);
router.put('/admin/:id', authMiddleware, updateCategoryAdmin);
router.delete('/admin/:id', authMiddleware, deleteCategoryAdmin);

export default router;

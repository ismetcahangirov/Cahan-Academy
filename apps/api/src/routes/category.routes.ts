import { Router } from 'express';
import {
  listCategories,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
} from '../controllers/category.controller.js';
import { adminOrService } from '../middleware/service.middleware.js';

const router = Router();

// Public
router.get('/', listCategories);

// Admin (landing admin JWT) or the LMS server (X-Service-Token)
router.post('/admin', adminOrService, createCategoryAdmin);
router.put('/admin/:id', adminOrService, updateCategoryAdmin);
router.delete('/admin/:id', adminOrService, deleteCategoryAdmin);

export default router;

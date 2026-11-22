import { Router } from 'express';
import {
  listCourses,
  getCourse,
  listCategories,
  listCoursesAdmin,
  createCourseAdmin,
  updateCourseAdmin,
  deleteCourseAdmin,
} from '../controllers/course.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// --- Public Routes ---
// GET /api/courses               — bütün kurslar
// GET /api/courses?category=slug — kateqoriyaya görə filterlə
// GET /api/courses?locale=en     — dil seçimi
router.get('/', listCourses);

// GET /api/courses/categories
router.get('/categories', listCategories);

// GET /api/courses/:slug
router.get('/:slug', getCourse);


// --- Admin Routes ---
router.get('/admin/list', authMiddleware, listCoursesAdmin);
router.post('/admin', authMiddleware, createCourseAdmin);
router.put('/admin/:id', authMiddleware, updateCourseAdmin);
router.delete('/admin/:id', authMiddleware, deleteCourseAdmin);

export default router;

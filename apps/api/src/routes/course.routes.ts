import { Router } from 'express';
import {
  listCourses,
  getCourse,
  listCategories,
} from '../controllers/course.controller.js';

const router = Router();

// GET /api/courses               — bütün kurslar
// GET /api/courses?category=slug — kateqoriyaya görə filterlə
// GET /api/courses?locale=en     — dil seçimi
router.get('/', listCourses);

// GET /api/courses/categories
router.get('/categories', listCategories);

// GET /api/courses/:slug
router.get('/:slug', getCourse);

export default router;

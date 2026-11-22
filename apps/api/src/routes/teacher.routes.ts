import { Router } from 'express';
import {
  listTeachers,
  getTeacher,
  listTeachersAdmin,
  createTeacherAdmin,
  updateTeacherAdmin,
  deleteTeacherAdmin,
} from '../controllers/teacher.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Admin routes (before :slug to avoid slug matching "admin")
router.get('/admin/list', authMiddleware, listTeachersAdmin);
router.post('/admin', authMiddleware, createTeacherAdmin);
router.put('/admin/:id', authMiddleware, updateTeacherAdmin);
router.delete('/admin/:id', authMiddleware, deleteTeacherAdmin);

// Public routes
router.get('/', listTeachers);
router.get('/:slug', getTeacher);

export default router;

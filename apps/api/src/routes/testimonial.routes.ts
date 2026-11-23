import { Router } from 'express';
import {
  listTestimonials,
  listAllTestimonials,
  createTestimonial,
  updateTestimonial,
  setTestimonialStatus,
  deleteTestimonial,
} from '../controllers/testimonial.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', listTestimonials);

// Admin
router.get('/admin/all', authMiddleware, listAllTestimonials);
router.post('/admin', authMiddleware, createTestimonial);
router.put('/admin/:id', authMiddleware, updateTestimonial);
router.put('/admin/:id/status', authMiddleware, setTestimonialStatus);
router.delete('/admin/:id', authMiddleware, deleteTestimonial);

export default router;

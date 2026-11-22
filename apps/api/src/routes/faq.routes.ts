import { Router } from 'express';
import { getFaqs, getAdminFaqs, createFaq, updateFaq, deleteFaq, updateFaqStatus } from '../controllers/faq.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getFaqs);

// Admin routes (protected)
router.get('/admin/all', authMiddleware, getAdminFaqs);
router.post('/admin', authMiddleware, createFaq);
router.put('/admin/:id', authMiddleware, updateFaq);
router.delete('/admin/:id', authMiddleware, deleteFaq);
router.put('/admin/:id/status', authMiddleware, updateFaqStatus);

export default router;

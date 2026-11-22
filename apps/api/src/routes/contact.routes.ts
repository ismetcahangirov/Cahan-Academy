import { Router } from 'express';
import { contactLimiter } from '../middleware/rateLimit.middleware.js';
import { createContactMessage, getMessages, markAsRead } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.post('/', contactLimiter, createContactMessage);

// Admin
router.get('/', authMiddleware, getMessages);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;

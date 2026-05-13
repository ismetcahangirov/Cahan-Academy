import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createContactMessage, getMessages, markAsRead } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Çox sayda mesaj göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/', contactLimiter, createContactMessage);

// Admin
router.get('/', authMiddleware, getMessages);
router.patch('/:id/read', authMiddleware, markAsRead);

export default router;

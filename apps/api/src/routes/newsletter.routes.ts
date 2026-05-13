import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { subscribe, getSubscribers } from '../controllers/newsletter.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Çox sayda cəhd edildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/subscribe', newsletterLimiter, subscribe);

// Admin
router.get('/', authMiddleware, getSubscribers);

export default router;

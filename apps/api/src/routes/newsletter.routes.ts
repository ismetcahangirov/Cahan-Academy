import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { subscribe } from '../controllers/newsletter.controller.js';

const router = Router();

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Newsletter can be a bit higher
  message: { error: 'Çox sayda cəhd edildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/subscribe', newsletterLimiter, subscribe);

export default router;

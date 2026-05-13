import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createContactMessage } from '../controllers/contact.controller.js';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Çox sayda mesaj göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactLimiter, createContactMessage);

export default router;

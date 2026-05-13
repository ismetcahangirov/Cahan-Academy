import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createLead } from '../controllers/lead.controller.js';

const router = Router();

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Çox sayda müraciət göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', leadLimiter, createLead);

export default router;

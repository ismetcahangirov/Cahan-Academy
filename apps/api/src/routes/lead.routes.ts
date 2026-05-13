import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createLead, getLeads, updateStatus, exportLeadsCSV } from '../controllers/lead.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Çox sayda müraciət göndərildi. Zəhmət olmasa bir saat sonra yenidən cəhd edin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/', leadLimiter, createLead);

// Admin
router.get('/', authMiddleware, getLeads);
router.get('/export', authMiddleware, exportLeadsCSV);
router.patch('/:id/status', authMiddleware, updateStatus);

export default router;

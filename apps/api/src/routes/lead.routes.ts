import { Router } from 'express';
import { leadLimiter } from '../middleware/rateLimit.middleware.js';
import { createLead, getLeads, updateStatus, exportLeadsCSV } from '../controllers/lead.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.post('/', leadLimiter, createLead);

// Admin
router.get('/', authMiddleware, getLeads);
router.get('/export', authMiddleware, exportLeadsCSV);
router.patch('/:id/status', authMiddleware, updateStatus);

export default router;

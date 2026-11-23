import { Router } from 'express';
import { getContactSettings, updateContactSettings } from '../controllers/siteSettings.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/contact', getContactSettings);

// Admin
router.put('/admin/contact', authMiddleware, updateContactSettings);

export default router;

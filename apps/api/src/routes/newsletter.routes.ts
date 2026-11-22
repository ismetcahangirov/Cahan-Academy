import { Router } from 'express';
import { newsletterLimiter } from '../middleware/rateLimit.middleware.js';
import { subscribe, getSubscribers } from '../controllers/newsletter.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.post('/subscribe', newsletterLimiter, subscribe);

// Admin
router.get('/', authMiddleware, getSubscribers);

export default router;

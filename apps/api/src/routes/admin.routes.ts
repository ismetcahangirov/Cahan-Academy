import { Router } from 'express';
import { getStats } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', authMiddleware, getStats);

export default router;

import { Router } from 'express';
import { login, refresh, logout } from '../controllers/auth.controller.js';
import { loginLimiter, refreshLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);

export default router;

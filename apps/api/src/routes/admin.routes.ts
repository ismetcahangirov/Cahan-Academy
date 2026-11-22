import { Router } from 'express';
import { getStats, getAllAdmins, createAdmin, deleteAdmin, updateProfile, changePassword } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', authMiddleware, getStats);

// User Management Routes
router.get('/users', authMiddleware, getAllAdmins);
router.post('/users', authMiddleware, createAdmin);
router.delete('/users/:id', authMiddleware, deleteAdmin);

// Settings Routes
router.put('/profile', authMiddleware, updateProfile);
router.put('/profile/password', authMiddleware, changePassword);

export default router;

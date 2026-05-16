import { Router } from 'express';
import {
  listTeamMembers,
  createTeamMemberAdmin,
  updateTeamMemberAdmin,
  deleteTeamMemberAdmin,
} from '../controllers/teamMember.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', listTeamMembers);

// Admin
router.post('/admin', authMiddleware, createTeamMemberAdmin);
router.put('/admin/:id', authMiddleware, updateTeamMemberAdmin);
router.delete('/admin/:id', authMiddleware, deleteTeamMemberAdmin);

export default router;

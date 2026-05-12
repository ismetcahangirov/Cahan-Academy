import { Router } from 'express';
import { listPosts, getPost } from '../controllers/post.controller.js';

const router = Router();

// Public routes
// GET /api/blog?locale=az&excludeSlug=...&limit=10
router.get('/', listPosts);

// GET /api/blog/:slug?locale=az
router.get('/:slug', getPost);

export default router;

import { Router } from 'express';
import { listPosts, getPost, listAllPostsAdmin, createPost, updatePost, deletePost } from '../controllers/post.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', listPosts);
router.get('/:slug', getPost);

// Admin routes
router.get('/admin/list', authMiddleware, listAllPostsAdmin);
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

export default router;

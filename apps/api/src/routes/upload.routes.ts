import { Router } from 'express';
import { generateSignature } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

// Images are uploaded straight from the browser to Cloudinary (signed upload widget).
// The old multer disk upload (POST /api/upload) was removed: Vercel functions have a read-only
// filesystem, it accepted SVG by extension only, and nothing in the web app called it.
const router = Router();

router.post('/signature', authMiddleware, generateSignature);

export default router;

import { Router } from 'express';
import { listTeachers, getTeacher } from '../controllers/teacher.controller.js';

const router = Router();

router.get('/', listTeachers);
router.get('/:slug', getTeacher);

export default router;

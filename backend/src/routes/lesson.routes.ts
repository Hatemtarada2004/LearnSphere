import { Router } from 'express';
import {
  getLessonById,
  updateLesson,
  deleteLesson,
  markLessonComplete,
} from '../controllers/lesson.controller';
import { protect, restrictTo, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', optionalAuth, getLessonById);

router.use(protect);

router.put('/:id', restrictTo('admin'), updateLesson);
router.delete('/:id', restrictTo('admin'), deleteLesson);
router.post('/:id/complete', markLessonComplete);

export default router;

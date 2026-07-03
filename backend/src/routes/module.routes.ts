import { Router } from 'express';
import {
  updateModule,
  deleteModule,
} from '../controllers/module.controller';
import {
  getLessonsByModule,
  createLesson,
} from '../controllers/lesson.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createLessonValidator } from '../validators/course.validator';

const router = Router();

router.use(protect);

router.put('/:id', restrictTo('admin'), updateModule);
router.delete('/:id', restrictTo('admin'), deleteModule);

router.get('/:moduleId/lessons', getLessonsByModule);
router.post('/:moduleId/lessons', restrictTo('admin'), createLessonValidator, validate, createLesson);

export default router;

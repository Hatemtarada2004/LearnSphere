import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  getFeaturedCourses,
  getCoursesByCategory,
  createReview,
} from '../controllers/course.controller';
import {
  getModulesByCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '../controllers/module.controller';
import {
  getLessonsByModule,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lesson.controller';
import { protect, restrictTo, optionalAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createCourseValidator,
  updateCourseValidator,
  createModuleValidator,
  createLessonValidator,
  courseQueryValidator,
  reviewValidator,
} from '../validators/course.validator';

const router = Router();

router.get('/featured', getFeaturedCourses);
router.get('/categories', getCoursesByCategory);
router.get('/', optionalAuth, courseQueryValidator, validate, getCourses);
router.get('/:id', optionalAuth, getCourseById);

router.use(protect);

router.post('/', restrictTo('admin'), createCourseValidator, validate, createCourse);
router.put('/:id', restrictTo('admin'), updateCourseValidator, validate, updateCourse);
router.delete('/:id', restrictTo('admin'), deleteCourse);
router.post('/:id/publish', restrictTo('admin'), togglePublish);
router.post('/:courseId/reviews', reviewValidator, validate, createReview);

// Module sub-routes
router.get('/:courseId/modules', getModulesByCourse);
router.post('/:courseId/modules', restrictTo('admin'), createModuleValidator, validate, createModule);
router.put('/:courseId/modules/reorder', restrictTo('admin'), reorderModules);

// Lesson sub-routes under modules
router.get('/modules/:moduleId/lessons', getLessonsByModule);
router.post('/modules/:moduleId/lessons', restrictTo('admin'), createLessonValidator, validate, createLesson);

export default router;

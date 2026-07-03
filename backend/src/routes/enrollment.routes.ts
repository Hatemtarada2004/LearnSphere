import { Router } from 'express';
import {
  getMyEnrollments,
  getEnrollmentByCourse,
  getEnrollmentDetails,
  getAllEnrollments,
  freeEnroll,
} from '../controllers/enrollment.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/free/:courseId', freeEnroll);
router.get('/my', getMyEnrollments);
router.get('/my/:courseId', getEnrollmentByCourse);
router.get('/my/:courseId/details', getEnrollmentDetails);

router.get('/', restrictTo('admin'), getAllEnrollments);

export default router;

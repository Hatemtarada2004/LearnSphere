import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getAllPayments,
} from '../controllers/payment.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

router.post(
  '/create-order',
  [body('courseId').notEmpty().withMessage('Course ID is required')],
  validate,
  createOrder
);

router.post(
  '/verify',
  [
    body('razorpayOrderId').notEmpty(),
    body('razorpayPaymentId').notEmpty(),
    body('razorpaySignature').notEmpty(),
  ],
  validate,
  verifyPayment
);

router.get('/history', getPaymentHistory);
router.get('/all', restrictTo('admin'), getAllPayments);

export default router;

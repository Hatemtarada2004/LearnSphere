import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  toggleWishlist,
  getWishlist,
} from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put(
  '/profile',
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('avatar').optional().trim().isURL().withMessage('Invalid avatar URL'),
  ],
  validate,
  updateProfile
);

router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must have at least 8 characters with uppercase, lowercase and number'),
  ],
  validate,
  changePassword
);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:courseId', toggleWishlist);

export default router;

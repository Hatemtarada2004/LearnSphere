import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  deleteUser,
  updateUserRole,
  getRecentActivity,
} from '../controllers/admin.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.get('/activity', getRecentActivity);

export default router;

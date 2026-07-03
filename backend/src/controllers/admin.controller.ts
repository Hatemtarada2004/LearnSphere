import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { Payment } from '../models/Payment.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers';

export const getDashboardStats = asyncWrapper(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    revenueResult,
    recentUsers,
    recentEnrollments,
    monthlyRevenue,
    topCourses,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Enrollment.countDocuments({ paymentStatus: 'completed' }),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt avatar'),
    Enrollment.find({ paymentStatus: 'completed' })
      .sort({ enrollmentDate: -1 })
      .limit(5)
      .populate('student', 'firstName lastName email avatar')
      .populate('course', 'title thumbnail'),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
    Course.find({ isPublished: true })
      .sort({ totalStudents: -1 })
      .limit(5)
      .select('title thumbnail totalStudents rating price'),
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  ApiResponse.success(res, {
    stats: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue,
    },
    recentUsers,
    recentEnrollments,
    monthlyRevenue: monthlyRevenue.reverse(),
    topCourses,
  });
});

export const getUsers = asyncWrapper(async (req: Request, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { search, role } = req.query;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { firstName: { $regex: String(search), $options: 'i' } },
      { lastName: { $regex: String(search), $options: 'i' } },
      { email: { $regex: String(search), $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, users, generatePaginationMeta(page, limit, total));
});

export const deleteUser = asyncWrapper(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role === 'admin') {
    throw ApiError.forbidden('Cannot delete admin user');
  }

  await user.deleteOne();

  ApiResponse.noContent(res, 'User deleted successfully');
});

export const updateUserRole = asyncWrapper(async (req: Request, res: Response) => {
  const { role } = req.body;

  if (!['student', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) throw ApiError.notFound('User not found');

  ApiResponse.success(res, { user }, 'User role updated');
});

export const getRecentActivity = asyncWrapper(async (_req: Request, res: Response) => {
  const [recentEnrollments, recentPayments, recentUsers] = await Promise.all([
    Enrollment.find({ paymentStatus: 'completed' })
      .sort({ enrollmentDate: -1 })
      .limit(10)
      .populate('student', 'firstName lastName avatar')
      .populate('course', 'title'),
    Payment.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName')
      .populate('course', 'title'),
    User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email avatar createdAt'),
  ]);

  const activity = [
    ...recentEnrollments.map((e) => ({
      type: 'enrollment',
      message: `enrolled in a course`,
      user: e.student,
      course: e.course,
      createdAt: e.enrollmentDate,
    })),
    ...recentPayments.map((p) => ({
      type: 'payment',
      message: `made a payment of ₹${p.amount}`,
      user: p.user,
      course: p.course,
      amount: p.amount,
      createdAt: p.createdAt,
    })),
    ...recentUsers.map((u) => ({
      type: 'registration',
      message: `joined LearnSphere`,
      user: { _id: u._id, firstName: u.firstName, lastName: u.lastName, avatar: u.avatar },
      createdAt: u.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  ApiResponse.success(res, { activity });
});

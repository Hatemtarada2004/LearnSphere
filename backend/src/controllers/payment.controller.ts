import { Response } from 'express';
import crypto from 'crypto';
import { razorpayInstance } from '../config/razorpay';
import { Payment } from '../models/Payment.model';
import { Course } from '../models/Course.model';
import { Enrollment } from '../models/Enrollment.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendEnrollmentConfirmationEmail } from '../services/email.service';
import { env } from '../config/env';
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers';

export const createOrder = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (!course.isPublished) throw ApiError.badRequest('Course is not available');

  const existingEnrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
  });

  if (existingEnrollment) {
    throw ApiError.conflict('You are already enrolled in this course');
  }

  const amountInPaise = Math.round(course.price * 100);

  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      courseId: course._id.toString(),
      userId: req.user!._id.toString(),
    },
  });

  const payment = await Payment.create({
    user: req.user!._id,
    course: courseId,
    amount: course.price,
    currency: 'INR',
    razorpayOrderId: razorpayOrder.id,
    status: 'created',
  });

  ApiResponse.created(res, {
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID,
    course: {
      title: course.title,
      thumbnail: course.thumbnail,
      price: course.price,
    },
    payment: { _id: payment._id },
  });
});

export const verifyPayment = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw ApiError.badRequest('Payment verification failed: Invalid signature');
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      razorpaySignature,
      status: 'paid',
    },
    { new: true }
  ).populate('course', 'title thumbnail');

  if (!payment) {
    throw ApiError.notFound('Payment record not found');
  }

  const existingEnrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: payment.course,
    paymentStatus: 'completed',
  });

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: req.user!._id, course: payment.course },
    {
      student: req.user!._id,
      course: payment.course,
      paymentStatus: 'completed',
      enrollmentDate: new Date(),
    },
    { upsert: true, new: true }
  );

  // Only increment the student count for genuinely new enrollments
  if (!existingEnrollment) {
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { totalStudents: 1 },
    });
  }

  const course = payment.course as unknown as { title: string; _id: string };
  const courseUrl = `${env.CLIENT_URL}/learn/${course._id}`;

  try {
    await sendEnrollmentConfirmationEmail(
      req.user!.email,
      req.user!.firstName,
      course.title,
      courseUrl
    );
  } catch {
    console.error('Failed to send enrollment email');
  }

  ApiResponse.success(res, {
    enrollment,
    payment,
  }, 'Payment verified and enrollment confirmed');
});

export const getPaymentHistory = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const filter = { user: req.user!._id };

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('course', 'title thumbnail price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, payments, generatePaginationMeta(page, limit, total));
});

export const getAllPayments = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { status } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, payments, generatePaginationMeta(page, limit, total));
});

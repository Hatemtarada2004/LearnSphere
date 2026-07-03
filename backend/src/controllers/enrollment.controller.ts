import { Response } from 'express';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { AuthRequest } from '../middlewares/auth.middleware';
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers';

export const getMyEnrollments = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const filter = {
    student: req.user!._id,
    paymentStatus: 'completed',
  };

  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate({
        path: 'course',
        select: 'title thumbnail category level duration totalStudents rating createdBy',
        populate: { path: 'createdBy', select: 'firstName lastName' },
      })
      .populate('lastLesson', 'title module')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);

  ApiResponse.paginated(
    res,
    enrollments,
    generatePaginationMeta(page, limit, total)
  );
});

export const getEnrollmentByCourse = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  const enrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
  })
    .populate('lastLesson', 'title module order')
    .populate('course', 'title thumbnail');

  if (!enrollment) {
    throw ApiError.notFound('Enrollment not found');
  }

  ApiResponse.success(res, { enrollment });
});

export const getEnrollmentDetails = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  const enrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
  });

  if (!enrollment) throw ApiError.notFound('Enrollment not found');

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const modules = await Module.find({ course: courseId }).sort({ order: 1 });
  const moduleIds = modules.map((m) => m._id);
  const lessons = await Lesson.find({ module: { $in: moduleIds } }).sort({ order: 1 });

  const completedSet = new Set(
    enrollment.completedLessons.map((id) => id.toString())
  );

  const curriculum = modules.map((mod) => ({
    ...mod.toObject(),
    lessons: lessons
      .filter((l) => l.module.toString() === mod._id.toString())
      .map((l) => ({
        ...l.toObject(),
        isCompleted: completedSet.has(l._id.toString()),
      })),
  }));

  ApiResponse.success(res, {
    enrollment,
    curriculum,
    course: {
      title: course.title,
      thumbnail: course.thumbnail,
    },
  });
});

export const freeEnroll = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (!course.isPublished) throw ApiError.badRequest('Course is not available');
  if (course.price > 0) throw ApiError.badRequest('This course requires payment');

  const existingEnrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
  });

  if (existingEnrollment) {
    throw ApiError.conflict('You are already enrolled in this course');
  }

  const enrollment = await Enrollment.create({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
    enrollmentDate: new Date(),
  });

  await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

  ApiResponse.created(res, { enrollment }, 'Enrolled successfully');
});

export const getAllEnrollments = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);

  const [enrollments, total] = await Promise.all([
    Enrollment.find({ paymentStatus: 'completed' })
      .populate('student', 'firstName lastName email')
      .populate('course', 'title price')
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments({ paymentStatus: 'completed' }),
  ]);

  ApiResponse.paginated(res, enrollments, generatePaginationMeta(page, limit, total));
});

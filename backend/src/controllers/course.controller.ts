import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { Course } from '../models/Course.model';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { Enrollment } from '../models/Enrollment.model';
import { Review } from '../models/Review.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { generatePaginationMeta, parsePaginationParams } from '../utils/helpers';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getCourses = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { page, limit, skip } = parsePaginationParams(req.query);
  const { category, level, search, minPrice, maxPrice, sort } = req.query;

  // Admins can see all courses; everyone else sees only published ones
  const filter: Record<string, unknown> = req.user?.role === 'admin' ? {} : { isPublished: true };

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.$gte = parseFloat(String(minPrice));
    if (maxPrice) priceFilter.$lte = parseFloat(String(maxPrice));
    filter.price = priceFilter;
  }
  if (search) {
    filter.$text = { $search: String(search) };
  }

  let sortOptions: Record<string, SortOrder> = { createdAt: -1 };
  switch (sort) {
    case 'price-asc': sortOptions = { price: 1 }; break;
    case 'price-desc': sortOptions = { price: -1 }; break;
    case 'rating': sortOptions = { rating: -1 }; break;
    case 'popular': sortOptions = { totalStudents: -1 }; break;
    case 'oldest': sortOptions = { createdAt: 1 }; break;
  }

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .select('-description -requirements -whatYouLearn')
      .populate('createdBy', 'firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, courses, generatePaginationMeta(page, limit, total));
});

export const getCourseById = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const course = await Course.findById(req.params.id)
    .populate('createdBy', 'firstName lastName avatar bio');

  if (!course) throw ApiError.notFound('Course not found');

  if (!course.isPublished && req.user?.role !== 'admin') {
    throw ApiError.notFound('Course not found');
  }

  const modules = await Module.find({ course: course._id }).sort({ order: 1 });
  const moduleIds = modules.map((m) => m._id);

  const lessons = await Lesson.find({ module: { $in: moduleIds } })
    .select('module title duration order isFree videoUrl')
    .sort({ order: 1 });

  const isAdmin = req.user?.role === 'admin';
  let enrollment = null;
  if (req.user) {
    enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
      paymentStatus: 'completed',
    }).select('progress lastLesson completedLessons');
  }

  const isEnrolled = !!enrollment;
  const lessonsByModule = modules.map((mod) => ({
    ...mod.toObject(),
    lessons: lessons
      .filter((l) => l.module.toString() === mod._id.toString())
      .map((l) => ({
        ...l.toObject(),
        videoUrl: l.isFree || isAdmin || isEnrolled ? l.videoUrl : undefined,
      })),
  }));

  const reviews = await Review.find({ course: course._id })
    .populate('user', 'firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(10);

  ApiResponse.success(res, {
    course,
    curriculum: lessonsByModule,
    enrollment,
    reviews,
  });
});

export const createCourse = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const course = await Course.create({
    ...req.body,
    createdBy: req.user!._id,
  });

  ApiResponse.created(res, { course }, 'Course created successfully');
});

export const updateCourse = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!course) throw ApiError.notFound('Course not found');

  ApiResponse.success(res, { course }, 'Course updated successfully');
});

export const deleteCourse = asyncWrapper(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  const modules = await Module.find({ course: course._id });
  const moduleIds = modules.map((m) => m._id);

  await Promise.all([
    Lesson.deleteMany({ module: { $in: moduleIds } }),
    Module.deleteMany({ course: course._id }),
    Enrollment.deleteMany({ course: course._id }),
    Review.deleteMany({ course: course._id }),
    course.deleteOne(),
  ]);

  ApiResponse.noContent(res, 'Course deleted successfully');
});

export const togglePublish = asyncWrapper(async (req: Request, res: Response) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');

  course.isPublished = !course.isPublished;
  await course.save({ validateBeforeSave: false });

  ApiResponse.success(
    res,
    { isPublished: course.isPublished },
    `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`
  );
});

export const getFeaturedCourses = asyncWrapper(async (_req: Request, res: Response) => {
  const courses = await Course.find({ isPublished: true })
    .select('-description -requirements -whatYouLearn')
    .populate('createdBy', 'firstName lastName avatar')
    .sort({ rating: -1, totalStudents: -1 })
    .limit(8)
    .lean();

  ApiResponse.success(res, { courses });
});

export const getCoursesByCategory = asyncWrapper(async (_req: Request, res: Response) => {
  const categories = await Course.aggregate([
    { $match: { isPublished: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  ApiResponse.success(res, { categories });
});

export const createReview = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: courseId,
    paymentStatus: 'completed',
  });

  if (!enrollment) {
    throw ApiError.forbidden('You must enroll in this course to leave a review');
  }

  const existingReview = await Review.findOne({
    user: req.user!._id,
    course: courseId,
  });

  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this course');
  }

  const review = await Review.create({
    user: req.user!._id,
    course: courseId,
    rating,
    comment,
  });

  const populated = await review.populate('user', 'firstName lastName avatar');

  ApiResponse.created(res, { review: populated }, 'Review submitted successfully');
});

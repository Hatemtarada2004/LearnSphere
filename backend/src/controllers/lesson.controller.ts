import { Request, Response } from 'express';
import { Lesson } from '../models/Lesson.model';
import { Module } from '../models/Module.model';
import { Enrollment } from '../models/Enrollment.model';
import { Course } from '../models/Course.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getLessonsByModule = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;

  const module = await Module.findById(moduleId);
  if (!module) throw ApiError.notFound('Module not found');

  let lessons;

  if (req.user?.role === 'admin') {
    lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
  } else {
    const enrollment = req.user
      ? await Enrollment.findOne({
          student: req.user._id,
          course: module.course,
          paymentStatus: 'completed',
        })
      : null;

    if (enrollment) {
      lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
    } else {
      lessons = await Lesson.find({ module: moduleId })
        .select('title duration order isFree')
        .sort({ order: 1 });
    }
  }

  ApiResponse.success(res, { lessons });
});

export const getLessonById = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const lesson = await Lesson.findById(req.params.id).populate({
    path: 'module',
    select: 'course title',
  });

  if (!lesson) throw ApiError.notFound('Lesson not found');

  const module = lesson.module as unknown as { course: string; title: string };

  if (!lesson.isFree && req.user?.role !== 'admin') {
    const enrollment = req.user
      ? await Enrollment.findOne({
          student: req.user._id,
          course: module.course,
          paymentStatus: 'completed',
        })
      : null;

    if (!enrollment) {
      throw ApiError.forbidden('Enroll in this course to access this lesson');
    }
  }

  ApiResponse.success(res, { lesson });
});

export const createLesson = asyncWrapper(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const module = await Module.findById(moduleId);
  if (!module) throw ApiError.notFound('Module not found');

  const lesson = await Lesson.create({
    ...req.body,
    module: moduleId,
  });

  // Update course total duration
  await updateCourseDuration(module.course.toString());

  ApiResponse.created(res, { lesson }, 'Lesson created successfully');
});

export const updateLesson = asyncWrapper(async (req: Request, res: Response) => {
  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  ).populate('module', 'course');

  if (!lesson) throw ApiError.notFound('Lesson not found');

  const module = lesson.module as unknown as { course: string };
  await updateCourseDuration(module.course.toString());

  ApiResponse.success(res, { lesson }, 'Lesson updated successfully');
});

export const deleteLesson = asyncWrapper(async (req: Request, res: Response) => {
  const lesson = await Lesson.findById(req.params.id).populate('module', 'course');
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const module = lesson.module as unknown as { course: string };
  await lesson.deleteOne();
  await updateCourseDuration(module.course.toString());

  ApiResponse.noContent(res, 'Lesson deleted successfully');
});

export const markLessonComplete = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const lessonId = req.params.id;

  const lesson = await Lesson.findById(lessonId).populate('module', 'course');
  if (!lesson) throw ApiError.notFound('Lesson not found');

  const module = lesson.module as unknown as { course: string };

  const enrollment = await Enrollment.findOne({
    student: req.user!._id,
    course: module.course,
    paymentStatus: 'completed',
  });

  if (!enrollment) {
    throw ApiError.forbidden('You must be enrolled to track progress');
  }

  const lessonObjectId = lesson._id;
  const alreadyCompleted = enrollment.completedLessons.some(
    (id) => id.toString() === lessonObjectId.toString()
  );

  if (!alreadyCompleted) {
    enrollment.completedLessons.push(lessonObjectId);
  }

  enrollment.lastLesson = lessonObjectId;

  // Calculate progress
  const totalLessons = await Lesson.countDocuments({
    module: { $in: await Module.find({ course: module.course }).distinct('_id') },
  });

  enrollment.progress =
    totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

  if (enrollment.progress === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  await enrollment.save();

  ApiResponse.success(res, {
    progress: enrollment.progress,
    completedLessons: enrollment.completedLessons,
    completedAt: enrollment.completedAt,
  });
});

async function updateCourseDuration(courseId: string): Promise<void> {
  const modules = await Module.find({ course: courseId }).distinct('_id');
  const result = await Lesson.aggregate([
    { $match: { module: { $in: modules } } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' } } },
  ]);

  const totalDuration = result[0]?.totalDuration || 0;
  await Course.findByIdAndUpdate(courseId, { duration: totalDuration });
}

import { Request, Response } from 'express';
import { Module } from '../models/Module.model';
import { Lesson } from '../models/Lesson.model';
import { Course } from '../models/Course.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';

export const getModulesByCourse = asyncWrapper(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const modules = await Module.find({ course: courseId }).sort({ order: 1 });

  ApiResponse.success(res, { modules });
});

export const createModule = asyncWrapper(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const module = await Module.create({
    ...req.body,
    course: courseId,
  });

  ApiResponse.created(res, { module }, 'Module created successfully');
});

export const updateModule = asyncWrapper(async (req: Request, res: Response) => {
  const module = await Module.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!module) throw ApiError.notFound('Module not found');

  ApiResponse.success(res, { module }, 'Module updated successfully');
});

export const deleteModule = asyncWrapper(async (req: Request, res: Response) => {
  const module = await Module.findById(req.params.id);
  if (!module) throw ApiError.notFound('Module not found');

  const courseId = module.course.toString();
  await Lesson.deleteMany({ module: module._id });
  await module.deleteOne();

  // Recalculate total course duration now that lessons are gone
  const remainingModules = await Module.find({ course: courseId }).distinct('_id');
  const result = await Lesson.aggregate([
    { $match: { module: { $in: remainingModules } } },
    { $group: { _id: null, totalDuration: { $sum: '$duration' } } },
  ]);
  await Course.findByIdAndUpdate(courseId, {
    duration: result[0]?.totalDuration || 0,
  });

  ApiResponse.noContent(res, 'Module deleted successfully');
});

export const reorderModules = asyncWrapper(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { order } = req.body as { order: { id: string; order: number }[] };

  await Promise.all(
    order.map(({ id, order: orderIndex }) =>
      Module.findByIdAndUpdate(id, { order: orderIndex })
    )
  );

  const modules = await Module.find({ course: courseId }).sort({ order: 1 });
  ApiResponse.success(res, { modules }, 'Modules reordered successfully');
});

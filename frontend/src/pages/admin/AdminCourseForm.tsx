import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import { Course, CourseCategory, CourseLevel } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../utils';

const courseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  shortDescription: z.string().min(10).max(300),
  description: z.string().min(20).max(5000),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0),
  category: z.string().min(1, 'Category is required') as z.ZodType<CourseCategory>,
  level: z.string().min(1, 'Level is required') as z.ZodType<CourseLevel>,
  thumbnail: z.string().optional(),
  language: z.string().default('English'),
});

type CourseForm = z.infer<typeof courseSchema>;

interface Props {
  course: Course | null;
  onClose: () => void;
}

const CATEGORIES: { value: CourseCategory; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'finance', label: 'Finance' },
  { value: 'language', label: 'Language' },
  { value: 'other', label: 'Other' },
];

const LEVELS: { value: CourseLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const AdminCourseForm: React.FC<Props> = ({ course, onClose }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ? {
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description,
      price: course.price,
      category: course.category,
      level: course.level,
      thumbnail: course.thumbnail,
      language: course.language,
    } : {
      language: 'English',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CourseForm) =>
      course
        ? courseService.updateCourse(course._id, data)
        : courseService.createCourse(data),
    onSuccess: () => {
      toast.success(course ? 'Course updated!' : 'Course created!');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      onClose();
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={course ? 'Edit Course' : 'Create New Course'}
      size="xl"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Input
          label="Course Title"
          placeholder="Enter a compelling course title..."
          error={errors.title?.message}
          required
          {...register('title')}
        />

        <Input
          label="Short Description"
          placeholder="A brief summary (shown on course cards)"
          error={errors.shortDescription?.message}
          required
          {...register('shortDescription')}
        />

        <div>
          <label className="label">Description <span className="text-red-500">*</span></label>
          <textarea
            {...register('description')}
            rows={5}
            placeholder="Detailed course description, what students will learn, etc."
            className="input resize-none"
          />
          {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Price (₹) <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              min={0}
              placeholder="0"
              className="input"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1.5 text-xs text-red-500">{errors.price.message}</p>}
          </div>

          <div>
            <label className="label">Category <span className="text-red-500">*</span></label>
            <select className="input" {...register('category')}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-red-500">{errors.category.message}</p>}
          </div>

          <div>
            <label className="label">Level <span className="text-red-500">*</span></label>
            <select className="input" {...register('level')}>
              <option value="">Select level</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            {errors.level && <p className="mt-1.5 text-xs text-red-500">{errors.level.message}</p>}
          </div>
        </div>

        <Input
          label="Thumbnail URL"
          type="url"
          placeholder="https://example.com/thumbnail.jpg"
          error={errors.thumbnail?.message}
          {...register('thumbnail')}
        />

        <Input
          label="Language"
          placeholder="English"
          {...register('language')}
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

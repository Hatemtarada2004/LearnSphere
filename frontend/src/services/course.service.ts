import api from './api';
import { Course, CourseFilters, CourseDetailResponse, ApiResponse, PaginatedResponse, Review } from '../types';

export const courseService = {
  getCourses: async (filters: CourseFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    });
    const res = await api.get<PaginatedResponse<Course>>(`/courses?${params}`);
    return res.data;
  },

  getCourseById: async (id: string) => {
    const res = await api.get<ApiResponse<CourseDetailResponse>>(`/courses/${id}`);
    return res.data.data;
  },

  getFeaturedCourses: async () => {
    const res = await api.get<ApiResponse<{ courses: Course[] }>>('/courses/featured');
    return res.data.data.courses;
  },

  getCoursesByCategory: async () => {
    const res = await api.get<ApiResponse<{ categories: { _id: string; count: number }[] }>>(
      '/courses/categories'
    );
    return res.data.data.categories;
  },

  createCourse: async (data: Partial<Course>) => {
    const res = await api.post<ApiResponse<{ course: Course }>>('/courses', data);
    return res.data.data.course;
  },

  updateCourse: async (id: string, data: Partial<Course>) => {
    const res = await api.put<ApiResponse<{ course: Course }>>(`/courses/${id}`, data);
    return res.data.data.course;
  },

  deleteCourse: async (id: string) => {
    await api.delete(`/courses/${id}`);
  },

  togglePublish: async (id: string) => {
    const res = await api.post<ApiResponse<{ isPublished: boolean }>>(`/courses/${id}/publish`);
    return res.data.data;
  },

  createReview: async (courseId: string, data: { rating: number; comment: string }) => {
    const res = await api.post<ApiResponse<{ review: Review }>>(`/courses/${courseId}/reviews`, data);
    return res.data.data.review;
  },
};

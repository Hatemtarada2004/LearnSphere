import api from './api';
import { Enrollment, ApiResponse, PaginatedResponse } from '../types';

interface EnrollmentDetails {
  enrollment: Enrollment;
  curriculum: {
    _id: string;
    title: string;
    order: number;
    lessons: { _id: string; title: string; duration: number; isCompleted: boolean; order: number }[];
  }[];
  course: { title: string; thumbnail: string };
}

export const enrollmentService = {
  getMyEnrollments: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );
    const res = await api.get<PaginatedResponse<Enrollment>>(`/enrollments/my?${query}`);
    return res.data;
  },

  getEnrollmentByCourse: async (courseId: string) => {
    const res = await api.get<ApiResponse<{ enrollment: Enrollment }>>(`/enrollments/my/${courseId}`);
    return res.data.data.enrollment;
  },

  getEnrollmentDetails: async (courseId: string) => {
    const res = await api.get<ApiResponse<EnrollmentDetails>>(`/enrollments/my/${courseId}/details`);
    return res.data.data;
  },

  freeEnroll: async (courseId: string) => {
    const res = await api.post<ApiResponse<{ enrollment: Enrollment }>>(`/enrollments/free/${courseId}`);
    return res.data.data.enrollment;
  },
};

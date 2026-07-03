import api from './api';
import { Lesson, ApiResponse } from '../types';

export const lessonService = {
  getLessonsByModule: async (moduleId: string) => {
    const res = await api.get<ApiResponse<{ lessons: Lesson[] }>>(`/modules/${moduleId}/lessons`);
    return res.data.data.lessons;
  },

  getLessonById: async (id: string) => {
    const res = await api.get<ApiResponse<{ lesson: Lesson }>>(`/lessons/${id}`);
    return res.data.data.lesson;
  },

  createLesson: async (moduleId: string, data: Partial<Lesson>) => {
    const res = await api.post<ApiResponse<{ lesson: Lesson }>>(`/modules/${moduleId}/lessons`, data);
    return res.data.data.lesson;
  },

  updateLesson: async (id: string, data: Partial<Lesson>) => {
    const res = await api.put<ApiResponse<{ lesson: Lesson }>>(`/lessons/${id}`, data);
    return res.data.data.lesson;
  },

  deleteLesson: async (id: string) => {
    await api.delete(`/lessons/${id}`);
  },

  markComplete: async (id: string) => {
    const res = await api.post<ApiResponse<{ progress: number; completedLessons: string[] }>>(
      `/lessons/${id}/complete`
    );
    return res.data.data;
  },
};

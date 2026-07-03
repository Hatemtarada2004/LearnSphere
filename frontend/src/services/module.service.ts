import api from './api';
import { Module, ApiResponse } from '../types';

export const moduleService = {
  getModulesByCourse: async (courseId: string) => {
    const res = await api.get<ApiResponse<{ modules: Module[] }>>(`/courses/${courseId}/modules`);
    return res.data.data.modules;
  },

  createModule: async (courseId: string, data: Partial<Module>) => {
    const res = await api.post<ApiResponse<{ module: Module }>>(`/courses/${courseId}/modules`, data);
    return res.data.data.module;
  },

  updateModule: async (id: string, data: Partial<Module>) => {
    const res = await api.put<ApiResponse<{ module: Module }>>(`/modules/${id}`, data);
    return res.data.data.module;
  },

  deleteModule: async (id: string) => {
    await api.delete(`/modules/${id}`);
  },

  reorderModules: async (courseId: string, order: { id: string; order: number }[]) => {
    const res = await api.put<ApiResponse<{ modules: Module[] }>>(
      `/courses/${courseId}/modules/reorder`,
      { order }
    );
    return res.data.data.modules;
  },
};

import api from './api';
import { User, ApiResponse, PaginatedResponse } from '../types';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

interface DashboardData {
  stats: AdminStats;
  recentUsers: User[];
  recentEnrollments: unknown[];
  monthlyRevenue: { _id: { year: number; month: number }; revenue: number; count: number }[];
  topCourses: unknown[];
}

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<DashboardData>>('/admin/stats');
    return res.data.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)])
    );
    const res = await api.get<PaginatedResponse<User>>(`/admin/users?${query}`);
    return res.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  updateUserRole: async (id: string, role: 'student' | 'admin') => {
    const res = await api.put<ApiResponse<{ user: User }>>(`/admin/users/${id}/role`, { role });
    return res.data.data.user;
  },

  getRecentActivity: async () => {
    const res = await api.get<ApiResponse<{ activity: unknown[] }>>('/admin/activity');
    return res.data.data.activity;
  },
};

import api from './api';
import { User, RegisterData, ApiResponse } from '../types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  refreshToken: async () => {
    const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh-token');
    return res.data.data.accessToken;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return res.data.message;
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const res = await api.post<ApiResponse<null>>(`/auth/reset-password/${token}`, {
      password,
      confirmPassword,
    });
    return res.data.message;
  },

  verifyEmail: async (token: string) => {
    const res = await api.get<ApiResponse<null>>(`/auth/verify-email/${token}`);
    return res.data.message;
  },
};

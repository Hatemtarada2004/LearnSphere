import api from './api';
import { User, Course, ApiResponse } from '../types';

export const userService = {
  getProfile: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/users/profile');
    return res.data.data.user;
  },

  updateProfile: async (data: Partial<Pick<User, 'firstName' | 'lastName' | 'bio' | 'avatar'>>) => {
    const res = await api.put<ApiResponse<{ user: User }>>('/users/profile', data);
    return res.data.data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put<ApiResponse<null>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data.message;
  },

  toggleWishlist: async (courseId: string) => {
    const res = await api.post<ApiResponse<{ wishlist: string[]; action: 'added' | 'removed' }>>(
      `/users/wishlist/${courseId}`
    );
    return res.data.data;
  },

  getWishlist: async () => {
    const res = await api.get<ApiResponse<{ wishlist: Course[] }>>('/users/wishlist');
    return res.data.data.wishlist;
  },
};

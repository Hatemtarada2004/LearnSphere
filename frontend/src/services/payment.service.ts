import api from './api';
import { Payment, ApiResponse, PaginatedResponse, RazorpayOrderData } from '../types';

export const paymentService = {
  createOrder: async (courseId: string) => {
    const res = await api.post<ApiResponse<RazorpayOrderData>>('/payments/create-order', { courseId });
    return res.data.data;
  },

  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const res = await api.post<ApiResponse<{ enrollment: unknown; payment: Payment }>>(
      '/payments/verify',
      data
    );
    return res.data.data;
  },

  getPaymentHistory: async (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    );
    const res = await api.get<PaginatedResponse<Payment>>(`/payments/history?${query}`);
    return res.data;
  },

  getAllPayments: async (params?: { page?: number; limit?: number; status?: string }) => {
    const query = new URLSearchParams(
      Object.entries(params || {}).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
    );
    const res = await api.get<PaginatedResponse<Payment>>(`/payments/all?${query}`);
    return res.data;
  },
};

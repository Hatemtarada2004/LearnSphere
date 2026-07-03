import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  static noContent(res: Response, message = 'Deleted successfully') {
    return res.status(200).json({
      success: true,
      message,
      data: null,
    });
  }

  static error(res: Response, message: string, statusCode = 500, errors?: unknown[]) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || [],
    });
  }
}

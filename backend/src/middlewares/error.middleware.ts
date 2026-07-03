import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error = err;

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    error = ApiError.notFound(`Resource not found`);
  }

  // Mongoose duplicate key
  if ((err as { code?: number }).code === 11000) {
    const field = Object.keys(
      (err as unknown as { keyValue: Record<string, unknown> }).keyValue
    )[0];
    error = ApiError.conflict(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    );
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Validation failed', messages);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors || [],
      ...(env.isDev() && { stack: error.stack }),
    });
    return;
  }

  // Unhandled errors
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: env.isProd() ? 'Internal server error' : err.message,
    errors: [],
    ...(env.isDev() && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errors: [],
  });
};

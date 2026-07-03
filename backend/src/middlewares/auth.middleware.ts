import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { asyncWrapper } from '../utils/asyncWrapper';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const protect = asyncWrapper(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    req.user = user;
    next();
  }
);

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
};

export const optionalAuth = asyncWrapper(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        const user = await User.findById(decoded.id);
        if (user) req.user = user;
      } catch {
        // Token invalid or expired — proceed as unauthenticated
      }
    }

    next();
  }
);

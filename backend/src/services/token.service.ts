import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser } from '../models/User.model';

interface TokenPayload {
  id: string;
  role: string;
}

export const generateAccessToken = (user: IUser): string => {
  const options: SignOptions = { expiresIn: 900 }; // 15 minutes in seconds
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    options
  );
};

export const generateRefreshToken = (user: IUser): string => {
  const options: SignOptions = { expiresIn: 604800 }; // 7 days in seconds
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    env.JWT_REFRESH_SECRET,
    options
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
};

export const generateTokenPair = (user: IUser) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

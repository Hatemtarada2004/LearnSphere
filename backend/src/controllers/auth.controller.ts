import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { generateTokenPair, verifyRefreshToken } from '../services/token.service';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd(),
  sameSite: 'strict' as const,
};

export const register = asyncWrapper(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = new User({ firstName, lastName, email, password });
  const verificationToken = user.createVerificationToken();
  await user.save();

  const verificationUrl = `${env.CLIENT_URL}/verify-email/${verificationToken}`;

  try {
    await sendWelcomeEmail(email, firstName, verificationUrl);
  } catch {
    console.error('Failed to send welcome email');
  }

  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const userResponse = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isVerified: user.isVerified,
  };

  ApiResponse.created(res, { user: userResponse, accessToken }, 'Account created successfully');
});

export const login = asyncWrapper(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(
    res,
    {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
    },
    'Logged in successfully'
  );
});

export const logout = asyncWrapper(async (req: AuthRequest, res: Response) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: undefined });
  }

  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  ApiResponse.success(res, null, 'Logged out successfully');
});

export const refreshToken = asyncWrapper(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    throw ApiError.unauthorized('Refresh token required');
  }

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ApiResponse.success(res, { accessToken }, 'Token refreshed successfully');
});

export const verifyEmail = asyncWrapper(async (req: Request, res: Response) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, null, 'Email verified successfully');
});

export const forgotPassword = asyncWrapper(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether email exists
    ApiResponse.success(res, null, 'If that email exists, a reset link has been sent');
    return;
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(email, user.firstName, resetUrl);
    ApiResponse.success(res, null, 'Password reset email sent');
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('Failed to send email. Please try again.');
  }
});

export const resetPassword = asyncWrapper(async (req: Request, res: Response) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  ApiResponse.success(res, null, 'Password reset successful. Please log in.');
});

export const getMe = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate('wishlist', 'title thumbnail price rating');

  ApiResponse.success(res, { user }, 'User retrieved successfully');
});

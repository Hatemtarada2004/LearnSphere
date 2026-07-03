import { Response } from 'express';
import { User } from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncWrapper } from '../utils/asyncWrapper';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate(
    'wishlist',
    'title thumbnail price rating category level'
  );

  ApiResponse.success(res, { user });
});

export const updateProfile = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const allowedFields = ['firstName', 'lastName', 'bio', 'avatar'];
  const updates: Record<string, string> = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

export const changePassword = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!._id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, null, 'Password changed successfully');
});

export const toggleWishlist = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  const user = await User.findById(req.user!._id);
  if (!user) throw ApiError.notFound('User not found');

  const wishlistIds = user.wishlist.map((id) => id.toString());
  const index = wishlistIds.indexOf(courseId);

  let action: 'added' | 'removed';
  if (index === -1) {
    user.wishlist.push(courseId as unknown as typeof user.wishlist[0]);
    action = 'added';
  } else {
    user.wishlist.splice(index, 1);
    action = 'removed';
  }

  await user.save({ validateBeforeSave: false });

  ApiResponse.success(
    res,
    { wishlist: user.wishlist, action },
    `Course ${action} ${action === 'added' ? 'to' : 'from'} wishlist`
  );
});

export const getWishlist = asyncWrapper(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).populate({
    path: 'wishlist',
    select: 'title thumbnail price rating category level totalStudents duration createdBy',
    populate: { path: 'createdBy', select: 'firstName lastName avatar' },
  });

  ApiResponse.success(res, { wishlist: user?.wishlist || [] });
});

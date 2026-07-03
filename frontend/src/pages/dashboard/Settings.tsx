import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { extractApiError } from '../../utils';

const profileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
  avatar: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Must be at least 8 characters')
      .regex(/[A-Z]/, 'Need one uppercase letter')
      .regex(/[a-z]/, 'Need one lowercase letter')
      .regex(/[0-9]/, 'Need one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const profileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  const passwordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(currentPassword, newPassword),
    onSuccess: (message) => {
      toast.success(message);
      resetPassword();
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your profile and security settings</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
        </div>

        {/* Avatar Preview */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatar={user.avatar}
            size="xl"
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 mt-1">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              error={profileErrors.firstName?.message}
              {...registerProfile('firstName')}
            />
            <Input
              label="Last name"
              error={profileErrors.lastName?.message}
              {...registerProfile('lastName')}
            />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea
              {...registerProfile('bio')}
              rows={3}
              placeholder="Tell us about yourself..."
              className="input resize-none"
            />
            {profileErrors.bio && <p className="mt-1.5 text-xs text-red-500">{profileErrors.bio.message}</p>}
          </div>

          <Input
            label="Avatar URL"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            error={profileErrors.avatar?.message}
            leftIcon={<Camera className="h-4 w-4" />}
            hint="Paste a URL to an image (JPG, PNG, WebP)"
            {...registerProfile('avatar')}
          />

          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={profileMutation.isPending}
          >
            Save Changes
          </Button>
        </form>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
        </div>

        <form
          onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}
          className="space-y-4"
        >
          <Input
            label="Current password"
            type={showCurrentPw ? 'text' : 'password'}
            error={passwordErrors.currentPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="text-gray-400 hover:text-gray-600">
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...registerPassword('currentPassword')}
          />

          <Input
            label="New password"
            type={showNewPw ? 'text' : 'password'}
            error={passwordErrors.newPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="text-gray-400 hover:text-gray-600">
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            {...registerPassword('newPassword')}
          />

          <Input
            label="Confirm new password"
            type={showNewPw ? 'text' : 'password'}
            error={passwordErrors.confirmPassword?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            {...registerPassword('confirmPassword')}
          />

          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={passwordMutation.isPending}
          >
            Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

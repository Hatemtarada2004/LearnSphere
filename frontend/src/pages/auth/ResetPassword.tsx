import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../utils';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    if (!token) return;
    setIsLoading(true);
    try {
      await authService.resetPassword(token, data.password, data.confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {success ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Password Reset!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your password has been successfully reset. Redirecting you to the login page...
            </p>
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-semibold">
              Go to login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Set new password</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Create a strong, unique password for your account.
              </p>
            </div>

            <div className="card p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  error={errors.password?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                  {...register('password')}
                />

                <Input
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                  {...register('confirmPassword')}
                />

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Reset Password
                </Button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

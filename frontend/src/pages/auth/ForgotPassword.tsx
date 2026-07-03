import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../utils';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type Form = z.infer<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSentEmail(data.email);
      setSent(true);
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
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Check your email</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              We've sent a password reset link to:
            </p>
            <p className="font-semibold text-gray-900 dark:text-white mb-6">{sentEmail}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              The link will expire in 10 minutes. Didn't receive it?{' '}
              <button
                onClick={() => setSent(false)}
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Send again
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Forgot password?</h1>
              <p className="text-gray-500 dark:text-gray-400">
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <div className="card p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                  {...register('email')}
                />

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

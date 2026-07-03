import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const loggedInUser = await login(data.email, data.password);
      toast.success('Welcome back!');
      // Send admin straight to admin panel unless an explicit redirect was requested
      const defaultRedirect = loggedInUser.role === 'admin' ? '/admin' : '/dashboard';
      navigate(redirect === '/dashboard' ? defaultRedirect : redirect);
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-violet-600 to-purple-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0tMTIgMTJ2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptMTIgMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative text-white max-w-md"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">LearnSphere</span>
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">
            Welcome back to your learning journey
          </h2>
          <p className="text-white/70 text-lg">
            Continue from where you left off. Your courses, progress, and certificates are waiting for you.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: '50K+', label: 'Students' },
              { value: '500+', label: 'Courses' },
              { value: '4.8★', label: 'Rating' },
              { value: '200+', label: 'Certificates' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-2xl font-black">{value}</div>
                <div className="text-white/60 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LearnSphere</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Sign in</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              error={errors.password?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign in to LearnSphere
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

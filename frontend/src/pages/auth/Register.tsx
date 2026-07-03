import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { extractApiError } from '../../utils';

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(50)
      .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(50)
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const BENEFITS = [
  'Access 500+ expert-led courses',
  'Learn at your own pace',
  'Earn industry certificates',
  'Lifetime access to purchased courses',
];

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColor = [
    '',
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-emerald-500',
    'bg-green-500',
  ];

  const strength = password ? passwordStrength() : 0;

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Welcome to LearnSphere!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(extractApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-600 via-primary-600 to-cyan-600 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bS0xMiAxMnY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0xMiAwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')]" />
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
            Join 50,000+ learners worldwide
          </h2>
          <p className="text-white/70 text-lg mb-10">
            Start your learning journey today with unlimited access to expert courses.
          </p>
          <div className="space-y-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LearnSphere</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                error={errors.firstName?.message}
                leftIcon={<User className="h-4 w-4" />}
                required
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                error={errors.lastName?.message}
                leftIcon={<User className="h-4 w-4" />}
                required
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor[strength] : 'bg-gray-200 dark:bg-gray-700'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strengthLabel[strength]} password</p>
                </div>
              )}
            </div>

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
              Create Free Account
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            By registering, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
